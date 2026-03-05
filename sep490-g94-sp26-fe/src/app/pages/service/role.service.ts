import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Role {
    id?: any;
    code?: string;
    name?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface RoleSearchParams {
    code?: string;
    name?: string;
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
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private baseUrl = 'http://localhost:8080/api/v1/role';

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    searchRoles(params: RoleSearchParams = {}): Observable<ApiResponse<PageResponse<Role>>> {
        let httpParams = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'updatedAt,DESC');

        if (params.code) httpParams = httpParams.set('code', params.code);
        if (params.name) httpParams = httpParams.set('name', params.name);
        if (params.status) httpParams = httpParams.set('status', params.status);

        return this.http.get<ApiResponse<PageResponse<Role>>>(`${this.baseUrl}/search`, {
            headers: this.getHeaders(),
            params: httpParams
        });
    }

    createRole(role: {
        code: string;
        name: string;
    }): Observable<ApiResponse<Role>> {
        return this.http.post<ApiResponse<Role>>(`${this.baseUrl}/create`, role, {
            headers: this.getHeaders()
        });
    }

    updateRole(id: any, role: {
        code?: string;
        name?: string;
    }): Observable<ApiResponse<Role>> {
        return this.http.put<ApiResponse<Role>>(`${this.baseUrl}/update`, role, {
            headers: this.getHeaders(),
            params: new HttpParams().set('roleId', id)
        });
    }

    changeStatus(id: any): Observable<ApiResponse<Role>> {
        return this.http.patch<ApiResponse<Role>>(`${this.baseUrl}/${id}/change-status`, {}, {
            headers: this.getHeaders()
        });
    }
}