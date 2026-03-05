import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Hall {
    id?: any;
    code?: string;
    name?: string;
    locationId?: number;
    locationName?: string;
    capacity?: number;
    minTable?: number;
    maxTable?: number;
    notes?: string;
    description?: string;
    imageUrl?: string;
    images?: string[];
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface HallSearchParams {
    code?: string;
    name?: string;
    locationId?: number;
    minCapacity?: number;
    maxCapacity?: number;
    notes?: string;
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
export class HallService {
    private baseUrl = 'http://localhost:8080/api/v1/hall';

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    searchHalls(params: HallSearchParams = {}): Observable<ApiResponse<PageResponse<Hall>>> {
        let httpParams = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'updatedAt,DESC');

        if (params.code) httpParams = httpParams.set('code', params.code);
        if (params.name) httpParams = httpParams.set('name', params.name);
        if (params.locationId) httpParams = httpParams.set('locationId', params.locationId);
        if (params.minCapacity) httpParams = httpParams.set('minCapacity', params.minCapacity);
        if (params.maxCapacity) httpParams = httpParams.set('maxCapacity', params.maxCapacity);
        if (params.notes) httpParams = httpParams.set('notes', params.notes);

        return this.http.get<ApiResponse<PageResponse<Hall>>>(`${this.baseUrl}/search`, {
            headers: this.getHeaders(),
            params: httpParams
        });
    }

    getHallById(id: any): Observable<ApiResponse<Hall>> {
        return this.http.get<ApiResponse<Hall>>(`${this.baseUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    createHall(hall: {
        code: string;
        name: string;
        locationId: number;
        capacity: number;
        notes?: string;
    }): Observable<ApiResponse<Hall>> {
        return this.http.post<ApiResponse<Hall>>(`${this.baseUrl}/create`, hall, {
            headers: this.getHeaders()
        });
    }

    updateHall(id: any, hall: {
        code?: string;
        name?: string;
        locationId?: number;
        capacity?: number;
        notes?: string;
    }): Observable<ApiResponse<Hall>> {
        return this.http.put<ApiResponse<Hall>>(`${this.baseUrl}/update`, hall, {
            headers: this.getHeaders(),
            params: new HttpParams().set('hallId', id)
        });
    }

    changeStatus(id: any): Observable<ApiResponse<Hall>> {
        return this.http.patch<ApiResponse<Hall>>(`${this.baseUrl}/${id}/change-status`, {}, {
            headers: this.getHeaders()
        });
    }
}