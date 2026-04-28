import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../pages/service/auth.service';

const AUTH_FREE_ENDPOINTS = [
	'/api/v1/auth/login',
	'/api/v1/auth/refresh',
	'/api/v1/auth/logout',
	'/api/v1/auth/logout-all'
];
const REFRESH_RETRY_HEADER = 'x-refresh-retried';

function isAuthFreeRequest(url: string): boolean {
	return AUTH_FREE_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

function isApiRequest(url: string): boolean {
	return url.includes('/api/v1/');
}

function isAdminRole(codeRole: string): boolean {
	return String(codeRole ?? '').toUpperCase().includes('ADMIN');
}

function isManagerRole(codeRole: string): boolean {
	return String(codeRole ?? '').toUpperCase().includes('MANAGER');
}

function getScopedLocationId(): number | null {
	const parsed = Number(localStorage.getItem('locationId'));
	if (Number.isFinite(parsed) && parsed > 0) {
		return parsed;
	}

	const locationIdsRaw = localStorage.getItem('locationIds');
	if (!locationIdsRaw) {
		return null;
	}

	try {
		const locationIds = JSON.parse(locationIdsRaw);
		if (!Array.isArray(locationIds)) {
			return null;
		}

		const firstValid = locationIds
			.map((id) => Number(id))
			.find((id) => Number.isFinite(id) && id > 0);

		return firstValid ?? null;
	} catch {
		return null;
	}
}

function shouldForceBranchScope(url: string): boolean {
	return url.includes('/api/v1/contract');
}

function isPlainObject(value: unknown): value is Record<string, any> {
	if (!value || typeof value !== 'object') {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}

function applyLocationScopeToParams(req: Parameters<HttpInterceptorFn>[0], locationId: number) {
	let params = req.params;
	let hasChanged = false;
	const forceBranchScope = shouldForceBranchScope(req.url);

	const shouldScopeQuery =
		req.method === 'GET'
		|| req.url.includes('/search')
		|| params.has('page')
		|| params.has('size')
		|| params.has('locationId')
		|| params.has('branchId')
		|| params.has('filterRequest');

	if (!shouldScopeQuery) {
		return { params, hasChanged };
	}

	const scopedLocation = String(locationId);
	if (params.get('locationId') !== scopedLocation) {
		params = params.set('locationId', scopedLocation);
		hasChanged = true;
	}

	if ((forceBranchScope || params.has('branchId')) && params.get('branchId') !== scopedLocation) {
		params = params.set('branchId', scopedLocation);
		hasChanged = true;
	}

	const filterRequestRaw = params.get('filterRequest');
	if (filterRequestRaw) {
		try {
			const parsedFilter = JSON.parse(filterRequestRaw);
			if (isPlainObject(parsedFilter)) {
				const scopedFilter: Record<string, any> = { ...parsedFilter, locationId };
				if (forceBranchScope || Object.prototype.hasOwnProperty.call(parsedFilter, 'branchId')) {
					scopedFilter['branchId'] = locationId;
				}

				const nextFilterRaw = JSON.stringify(scopedFilter);
				if (nextFilterRaw !== filterRequestRaw) {
					params = params.set('filterRequest', nextFilterRaw);
					hasChanged = true;
				}
			}
		} catch {
			// Ignore invalid filterRequest payload.
		}
	}

	return { params, hasChanged };
}

function applyLocationScopeToBody(req: Parameters<HttpInterceptorFn>[0], locationId: number) {
	const body = req.body;
	if (!isPlainObject(body) || body instanceof FormData) {
		return { body, hasChanged: false };
	}

	let hasChanged = false;
	const scopedBody: Record<string, any> = { ...body };

	if (Object.prototype.hasOwnProperty.call(scopedBody, 'locationId') && scopedBody['locationId'] !== locationId) {
		scopedBody['locationId'] = locationId;
		hasChanged = true;
	}

	if (Object.prototype.hasOwnProperty.call(scopedBody, 'branchId') && scopedBody['branchId'] !== locationId) {
		scopedBody['branchId'] = locationId;
		hasChanged = true;
	}

	if (Object.prototype.hasOwnProperty.call(scopedBody, 'locationIds')) {
		const locationIds = scopedBody['locationIds'];
		if (Array.isArray(locationIds) && (locationIds.length !== 1 || Number(locationIds[0]) !== locationId)) {
			scopedBody['locationIds'] = [locationId];
			hasChanged = true;
		}
	}

	if (Object.prototype.hasOwnProperty.call(scopedBody, 'customerRequest') && isPlainObject(scopedBody['customerRequest'])) {
		const customerRequest = { ...scopedBody['customerRequest'] };
		if (Object.prototype.hasOwnProperty.call(customerRequest, 'locationId') && customerRequest['locationId'] !== locationId) {
			customerRequest['locationId'] = locationId;
			scopedBody['customerRequest'] = customerRequest;
			hasChanged = true;
		}
	}

	if (Object.prototype.hasOwnProperty.call(scopedBody, 'filterRequest')) {
		const filterRequest = scopedBody['filterRequest'];

		if (typeof filterRequest === 'string') {
			try {
				const parsedFilter = JSON.parse(filterRequest);
				if (isPlainObject(parsedFilter)) {
					const scopedFilter: Record<string, any> = { ...parsedFilter, locationId };
					if (Object.prototype.hasOwnProperty.call(parsedFilter, 'branchId')) {
						scopedFilter['branchId'] = locationId;
					}
					const scopedFilterRaw = JSON.stringify(scopedFilter);
					if (scopedFilterRaw !== filterRequest) {
						scopedBody['filterRequest'] = scopedFilterRaw;
						hasChanged = true;
					}
				}
			} catch {
				// Ignore invalid filterRequest payload.
			}
		} else if (isPlainObject(filterRequest)) {
			const scopedFilter: Record<string, any> = { ...filterRequest, locationId };
			if (Object.prototype.hasOwnProperty.call(filterRequest, 'branchId')) {
				scopedFilter['branchId'] = locationId;
			}
			scopedBody['filterRequest'] = scopedFilter;
			hasChanged = true;
		}
	}

	return { body: scopedBody, hasChanged };
}

function applyBranchScope(req: Parameters<HttpInterceptorFn>[0]): Parameters<HttpInterceptorFn>[0] {
	if (!isApiRequest(req.url) || isAuthFreeRequest(req.url)) {
		return req;
	}

	const codeRole = localStorage.getItem('codeRole') ?? '';
	if (isAdminRole(codeRole) || isManagerRole(codeRole)) {
		return req;
	}

	const locationId = getScopedLocationId();
	if (!locationId) {
		return req;
	}

	const scopedParamsResult = applyLocationScopeToParams(req, locationId);
	const scopedBodyResult = applyLocationScopeToBody(req, locationId);

	if (!scopedParamsResult.hasChanged && !scopedBodyResult.hasChanged) {
		return req;
	}

	return req.clone({
		params: scopedParamsResult.params,
		body: scopedBodyResult.body,
	});
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const router = inject(Router);
	const authService = inject(AuthService);
	const token = authService.getAccessToken();
	const tokenType = authService.getTokenType();

	const requestWithAuth = token && !isAuthFreeRequest(req.url) && !req.headers.has('Authorization')
		? req.clone({ setHeaders: { Authorization: `${tokenType} ${token}` } })
		: req;

	const request = applyBranchScope(requestWithAuth);

	const redirectToLogin = () => {
		authService.clearAuth();
		if (router.url !== '/auth/login') {
			void router.navigate(['/auth/login']);
		}
	};

	return next(request).pipe(
		catchError((error: HttpErrorResponse) => {
			if (error.status !== 401) {
				return throwError(() => error);
			}

			if (request.headers.has(REFRESH_RETRY_HEADER) || isAuthFreeRequest(request.url)) {
				redirectToLogin();
				return throwError(() => error);
			}

			const refreshToken = authService.getRefreshToken();
			if (!refreshToken) {
				redirectToLogin();
				return throwError(() => error);
			}

			return authService.refreshAccessToken().pipe(
				switchMap((refreshData) => {
					const newAccessToken = refreshData?.accessToken || authService.getAccessToken();
					if (!newAccessToken) {
						redirectToLogin();
						return throwError(() => error);
					}

					const retriedRequest = request.clone({
						setHeaders: {
							Authorization: `${authService.getTokenType()} ${newAccessToken}`,
							[REFRESH_RETRY_HEADER]: '1'
						}
					});

					return next(retriedRequest);
				}),
				catchError((refreshError) => {
					redirectToLogin();
					return throwError(() => refreshError);
				})
			);
		})
	);
};
