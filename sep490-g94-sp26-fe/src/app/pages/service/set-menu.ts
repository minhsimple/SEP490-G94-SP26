import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MenuItem {
    id?: number;
    code?: string;
    name?: string;
    unitPrice?: number;
    description?: string;
    quantity?: number;
}

export interface SetMenu {
    id?: any;
    code?: string;
    name?: string;
    description?: string;
    locationId?: number;
    locationName?: string;
    location?: { id: number; name: string };
    status?: string;
    setPrice?: number;
    menuItems?: MenuItem[];
    menuItemsByCategory?: { [category: string]: MenuItem[] };
    imageUrls?: {
        originalUrl?: string;
        thumbnailUrl?: string;
        mediumUrl?: string;
        largeUrl?: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface SetMenuSearchParams {
    code?: string;
    name?: string;
    description?: string;
    locationId?: number;
    lowerBoundSetPrice?: number;
    upperBoundSetPrice?: number;
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
export class SetMenuService {
    private baseUrl = 'http://localhost:8080/api/v1/set-menu';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    searchSetMenus(params: SetMenuSearchParams = {}): Observable<ApiResponse<PageResponse<SetMenu>>> {
        let httpParams = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'updatedAt,DESC');

        if (params.code) httpParams = httpParams.set('code', params.code);
        if (params.name) httpParams = httpParams.set('name', params.name);
        if (params.description) httpParams = httpParams.set('description', params.description);
        if (params.locationId) httpParams = httpParams.set('locationId', params.locationId);
        if (params.lowerBoundSetPrice != null) httpParams = httpParams.set('lowerBoundSetPrice', params.lowerBoundSetPrice);
        if (params.upperBoundSetPrice != null) httpParams = httpParams.set('upperBoundSetPrice', params.upperBoundSetPrice);
        if (params.status) httpParams = httpParams.set('status', params.status);

        return this.http.get<ApiResponse<PageResponse<SetMenu>>>(`${this.baseUrl}/search`, {
            headers: this.getHeaders(),
            params: httpParams
        });
    }

    getById(id: any): Observable<ApiResponse<SetMenu>> {
        return this.http.get<ApiResponse<SetMenu>>(`${this.baseUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    createSetMenu(payload: {
        code?: string;
        name: string;
        description?: string;
        locationId: number;
        menuItems?: MenuItem[];
    }, imageFile?: File): Observable<ApiResponse<SetMenu>> {
        const formData = new FormData();
        formData.append('setMenuRequest', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }

        const token = localStorage.getItem('accessToken');
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.http.post<ApiResponse<SetMenu>>(`${this.baseUrl}/create`, formData, { headers });
    }

    updateSetMenu(id: any, payload: {
        code?: string;
        name?: string;
        description?: string;
        locationId?: number;
        menuItems?: MenuItem[];
    }, imageFile?: File): Observable<ApiResponse<SetMenu>> {
        const formData = new FormData();
        formData.append('setMenuRequest', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        if (imageFile) {
            formData.append('imageFile', imageFile);
        }

        const token = localStorage.getItem('accessToken');
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        return this.http.put<ApiResponse<SetMenu>>(`${this.baseUrl}/update`, formData, {
            headers,
            params: new HttpParams().set('setMenuId', id)
        });
    }

    changeStatus(id: any): Observable<ApiResponse<SetMenu>> {
        return this.http.put<ApiResponse<SetMenu>>(`${this.baseUrl}/${id}/change-status`, {}, {
            headers: this.getHeaders()
        });
    }
}