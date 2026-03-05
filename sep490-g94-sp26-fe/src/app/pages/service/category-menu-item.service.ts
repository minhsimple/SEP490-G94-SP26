import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CategoryMenuItem {
    id?: number;
    name?: string;
    description?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    menuItemCount?: number;
}

export interface CategoryMenuItemSearchParams {
    name?: string;
    description?: string;
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

@Injectable({ providedIn: 'root' })
export class CategoryMenuItemService {
    private baseUrl = 'http://localhost:8080/api/v1/category-menu-item';

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    search(params: CategoryMenuItemSearchParams = {}): Observable<ApiResponse<PageResponse<CategoryMenuItem>>> {
        let httpParams = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'updatedAt,DESC');
        if (params.name)        httpParams = httpParams.set('name', params.name);
        if (params.description) httpParams = httpParams.set('description', params.description);
        if (params.status)      httpParams = httpParams.set('status', params.status);
        return this.http.get<ApiResponse<PageResponse<CategoryMenuItem>>>(`${this.baseUrl}/search`, {
            headers: this.getHeaders(),
            params: httpParams
        });
    }

    getById(id: number): Observable<ApiResponse<CategoryMenuItem>> {
        return this.http.get<ApiResponse<CategoryMenuItem>>(`${this.baseUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    create(payload: { name: string; description?: string }): Observable<ApiResponse<CategoryMenuItem>> {
        return this.http.post<ApiResponse<CategoryMenuItem>>(`${this.baseUrl}/create`, payload, {
            headers: this.getHeaders()
        });
    }

    update(id: number, payload: { name?: string; description?: string }): Observable<ApiResponse<CategoryMenuItem>> {
        return this.http.put<ApiResponse<CategoryMenuItem>>(`${this.baseUrl}/update`, payload, {
            headers: this.getHeaders(),
            params: new HttpParams().set('id', id)
        });
    }

    changeStatus(id: number): Observable<ApiResponse<CategoryMenuItem>> {
        return this.http.put<ApiResponse<CategoryMenuItem>>(`${this.baseUrl}/${id}/change-status`, {}, {
            headers: this.getHeaders()
        });
    }
}