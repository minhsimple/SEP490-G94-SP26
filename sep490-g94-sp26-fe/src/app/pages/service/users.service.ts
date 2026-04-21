import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface User {
    id?: any;
    email?: string;
    fullName?: string;
    phone?: string;
    role?: string;
    roleId?: number;
    locationId?: number;
    locationIds?: number[];
    roleCode?: string;
    status?: string;
    password?: string;
    createdDate?: string;
}

export interface UserSearchParams {
    email?: string;
    fullName?: string;
    phone?: string;
    roleId?: number;
    locationId?: number;
    status?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number?: number;
    page?: number;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private baseUrl = 'http://localhost:8080/api/v1/user';

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    private normalizeLocationIds(locationIds: unknown, locationId?: unknown): number[] {
        const idsFromArray = Array.isArray(locationIds)
            ? locationIds
                .map((id) => Number(id))
                .filter((id) => Number.isFinite(id) && id > 0)
            : [];

        if (idsFromArray.length > 0) {
            return Array.from(new Set(idsFromArray));
        }

        const singleId = Number(locationId);
        return Number.isFinite(singleId) && singleId > 0 ? [singleId] : [];
    }

    private normalizeUser(raw: User | any): User {
        const normalizedLocationIds = this.normalizeLocationIds(raw?.locationIds, raw?.locationId);

        return {
            ...raw,
            roleId: Number(raw?.roleId ?? raw?.role_id) || undefined,
            locationIds: normalizedLocationIds,
            locationId: normalizedLocationIds[0],
            status: typeof raw?.status === 'string' ? raw.status.toLowerCase() : raw?.status,
        };
    }

    private toUserRequestPayload(user: {
        email?: string;
        fullName?: string;
        phone?: string;
        roleId?: number;
        locationId?: number;
        locationIds?: number[];
        password?: string;
    }) {
        const locationIds = this.normalizeLocationIds(user.locationIds, user.locationId);

        return {
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            roleId: user.roleId,
            locationIds,
            password: user.password,
        };
    }

    searchUsers(params: UserSearchParams = {}): Observable<ApiResponse<PageResponse<User>>> {
        let httpParams = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'updatedAt,DESC');

        if (params.email) httpParams = httpParams.set('email', params.email);
        if (params.fullName) httpParams = httpParams.set('fullName', params.fullName);
        if (params.phone) httpParams = httpParams.set('phone', params.phone);
        if (params.roleId) httpParams = httpParams.set('roleId', params.roleId);
        if (params.locationId) httpParams = httpParams.set('locationId', params.locationId);
        if (params.status) httpParams = httpParams.set('status', params.status);

        return this.http.get<ApiResponse<PageResponse<User>>>(`${this.baseUrl}/search`, {
            headers: this.getHeaders(),
            params: httpParams
        }).pipe(
            map((response) => ({
                ...response,
                data: {
                    ...response.data,
                    number: response.data?.number ?? response.data?.page,
                    content: (response.data?.content ?? []).map((user) => this.normalizeUser(user)),
                }
            }))
        );
    }

    createUser(user: {
        email: string;
        fullName: string;
        phone?: string;
        roleId: number;
        locationId?: number;
        locationIds?: number[];
        password: string;
    }): Observable<ApiResponse<User>> {
        const payload = this.toUserRequestPayload(user);
        return this.http.post<ApiResponse<User>>(`${this.baseUrl}/create`, payload, {
            headers: this.getHeaders()
        }).pipe(
            map((response) => ({
                ...response,
                data: this.normalizeUser(response.data),
            }))
        );
    }

    updateUser(id: any, user: {
        email?: string;
        fullName?: string;
        phone?: string;
        roleId?: number;
        locationId?: number;
        locationIds?: number[];
        password?: string;
    }): Observable<ApiResponse<User>> {
        const payload = this.toUserRequestPayload(user);
        return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${id}/update`, payload, {
            headers: this.getHeaders()
        }).pipe(
            map((response) => ({
                ...response,
                data: this.normalizeUser(response.data),
            }))
        );
    }

    changeStatus(id: any): Observable<ApiResponse<User>> {
        return this.http.patch<ApiResponse<User>>(`${this.baseUrl}/${id}/change-status`, {}, {
            headers: this.getHeaders()
        }).pipe(
            map((response) => ({
                ...response,
                data: this.normalizeUser(response.data),
            }))
        );
    }

    getUser(id: any): Observable<ApiResponse<User>> {
        return this.http.get<ApiResponse<User>>(`${this.baseUrl}/${id}`, {
            headers: this.getHeaders()
        }).pipe(
            map((response) => ({
                ...response,
                data: this.normalizeUser(response.data),
            }))
        );
    }
}