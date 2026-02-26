import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Location {
    id?: any;
    code?: string;
    name?: string;
    address?: string;
    notes?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface LocationSearchParams {
    code?: string;
    name?: string;
    address?: string;
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
export class LocationService {
    private baseUrl = 'http://localhost:8080/api/v1/location';

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    searchLocations(params: LocationSearchParams = {}): Observable<ApiResponse<PageResponse<Location>>> {
        let httpParams = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'updatedAt,DESC');

        if (params.code) httpParams = httpParams.set('code', params.code);
        if (params.name) httpParams = httpParams.set('name', params.name);
        if (params.address) httpParams = httpParams.set('address', params.address);
        if (params.status) httpParams = httpParams.set('status', params.status);

        return this.http.get<ApiResponse<PageResponse<Location>>>(`${this.baseUrl}/search`, {
            headers: this.getHeaders(),
            params: httpParams
        });
    }

    createLocation(location: {
        code: string;
        name: string;
        address?: string;
        notes?: string;
    }): Observable<ApiResponse<Location>> {
        return this.http.post<ApiResponse<Location>>(`${this.baseUrl}/create`, location, {
            headers: this.getHeaders()
        });
    }

    updateLocation(id: any, location: {
        code?: string;
        name?: string;
        address?: string;
        notes?: string;
    }): Observable<ApiResponse<Location>> {
        return this.http.put<ApiResponse<Location>>(`${this.baseUrl}/update`, location, {
            headers: this.getHeaders(),
            params: new HttpParams().set('locationId', id)
        });
    }

    changeStatus(id: any): Observable<ApiResponse<Location>> {
        return this.http.patch<ApiResponse<Location>>(`${this.baseUrl}/${id}/change-status`, {}, {
            headers: this.getHeaders()
        });
    }
}