import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
    id?: any;
    email?: string;
    fullName?: string;
    phone?: string;
    role?: string;
    roleId?: number;
    locationId?: number;
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
    number: number;
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

        return this.http.get<ApiResponse<PageResponse<User>>>(`${this.baseUrl}/search`, {
            headers: this.getHeaders(),
            params: httpParams
        });
    }

    createUser(user: {
        email: string;
        fullName: string;
        phone?: string;
        roleId: number;
        locationId?: number;
        password: string;
    }): Observable<ApiResponse<User>> {
        return this.http.post<ApiResponse<User>>(`${this.baseUrl}/create`, user, {
            headers: this.getHeaders()
        });
    }

    updateUser(id: any, user: {
        email?: string;
        fullName?: string;
        phone?: string;
        roleId?: number;
        locationId?: number;
        password?: string;
    }): Observable<ApiResponse<User>> {
        return this.http.put<ApiResponse<User>>(`${this.baseUrl}/${id}/update`, user, {
            headers: this.getHeaders()
        });
    }

    changeStatus(id: any): Observable<ApiResponse<User>> {
        return this.http.patch<ApiResponse<User>>(`${this.baseUrl}/${id}/change-status`, {}, {
            headers: this.getHeaders()
        });
    }
}