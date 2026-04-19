import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../pages/service/auth.service';

const AUTH_FREE_ENDPOINTS = ['/api/v1/auth/login', '/api/v1/auth/refresh'];

function isAuthFreeRequest(url: string): boolean {
	return AUTH_FREE_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
	const router = inject(Router);
	const authService = inject(AuthService);
	const token = authService.getAccessToken();
	const tokenType = authService.getTokenType();

	const request = token && !isAuthFreeRequest(req.url)
		? req.clone({ setHeaders: { Authorization: `${tokenType} ${token}` } })
		: req;

	return next(request).pipe(
		catchError((error: HttpErrorResponse) => {
			if (error.status === 401 && !isAuthFreeRequest(request.url)) {
				authService.clearAuth();

				if (router.url !== '/auth/login') {
					void router.navigate(['/auth/login']);
				}
			}

			return throwError(() => error);
		})
	);
};
