import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MenuItem {
    id?: any;
    code?: string;
    name?: string;
    description?: string;
    unitPrice?: any;
    unit?: string;
    categoryMenuItem?: { id: number; name: string };
    locationId?: number;
    locationName?: string;
    location?: { id: number; name: string };
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface MenuItemSearchParams {
    code?: string;
    name?: string;
    description?: string;
    locationId?: number;
    upperBoundUnitPrice?: number;
    lowerBoundUnitPrice?: number;
    status?: string;
    categoryMenuItemsId?: number;
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
export class MenuItemService {
    private baseUrl = 'http://localhost:8080/api/v1/menu-item';
    private categoryUrl = 'http://localhost:8080/api/v1/category-menu-item';
    private locationUrl = 'http://localhost:8080/api/v1/location';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    search(params: MenuItemSearchParams = {}): Observable<ApiResponse<PageResponse<MenuItem>>> {
        let httpParams = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'updatedAt,DESC');

        if (params.code) httpParams = httpParams.set('code', params.code);
        if (params.name) httpParams = httpParams.set('name', params.name);
        if (params.description) httpParams = httpParams.set('description', params.description);
        if (params.locationId != null) httpParams = httpParams.set('locationId', params.locationId);
        if (params.lowerBoundUnitPrice != null) httpParams = httpParams.set('lowerBoundUnitPrice', params.lowerBoundUnitPrice);
        if (params.upperBoundUnitPrice != null) httpParams = httpParams.set('upperBoundUnitPrice', params.upperBoundUnitPrice);
        if (params.status) httpParams = httpParams.set('status', params.status);
        if (params.categoryMenuItemsId != null) httpParams = httpParams.set('categoryMenuItemsId', params.categoryMenuItemsId);

        return this.http.get<ApiResponse<PageResponse<MenuItem>>>(`${this.baseUrl}/search`, {
            headers: this.getHeaders(),
            params: httpParams
        });
    }

    getById(id: any): Observable<ApiResponse<MenuItem>> {
        return this.http.get<ApiResponse<MenuItem>>(`${this.baseUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    create(payload: {
        code?: string;
        name: string;
        categoryMenuItemsId: number;
        locationId: number;
        unitPrice: number;
        unit?: string;
        description?: string;
    }, imageFile: File): Observable<ApiResponse<MenuItem>> {
        const formData = new FormData();
        formData.append('menuItemRequest', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        formData.append('imageFile', imageFile);

        const token = localStorage.getItem('accessToken');
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.http.post<ApiResponse<MenuItem>>(`${this.baseUrl}/create`, formData, {
            headers
        });
    }

    update(id: any, payload: {
        code?: string;
        name?: string;
        categoryMenuItemsId?: number;
        locationId?: number;
        unitPrice?: number;
        unit?: string;
        description?: string;
    }, imageFile?: File): Observable<ApiResponse<MenuItem>> {
        const formData = new FormData();
        formData.append('menuItemRequest', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }

        const token = localStorage.getItem('accessToken');
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.http.put<ApiResponse<MenuItem>>(`${this.baseUrl}/update`, formData, {
            headers,
            params: new HttpParams().set('menuItemId', id)
        });
    }

    changeStatus(id: any): Observable<ApiResponse<MenuItem>> {
        return this.http.put<ApiResponse<MenuItem>>(`${this.baseUrl}/${id}/change-status`, {}, {
            headers: this.getHeaders()
        });
    }

    getCategories(): Observable<ApiResponse<PageResponse<any>>> {
        const params = new HttpParams()
            .set('page', 0)
            .set('size', 100)
            .set('sort', 'updatedAt,DESC');
        return this.http.get<ApiResponse<PageResponse<any>>>(`${this.categoryUrl}/search`, {
            headers: this.getHeaders(),
            params
        });
    }

    getLocations(): Observable<ApiResponse<PageResponse<any>>> {
        const params = new HttpParams()
            .set('page', 0)
            .set('size', 100)
            .set('sort', 'updatedAt,DESC');
        return this.http.get<ApiResponse<PageResponse<any>>>(`${this.locationUrl}/search`, {
            headers: this.getHeaders(),
            params
        });
    }
}