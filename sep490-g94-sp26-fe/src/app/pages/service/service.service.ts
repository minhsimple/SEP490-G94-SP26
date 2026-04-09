import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Service {
    id?: any;
    code?: string;
    name?: string;
    description?: string;
    video_key?: string;
    videoUrl?: string;
    imageUrl?: string;
    thumbnailUrl?: string;
    imageUrls?: {
        originalUrl?: string;
        thumbnailUrl?: string;
        mediumUrl?: string;
        largeUrl?: string;
    };
    mediaAssets?: Array<{
        type?: string;
        mediaType?: string;
        url?: string;
        originalUrl?: string;
        thumbnailUrl?: string;
        mediumUrl?: string;
        largeUrl?: string;
        videoUrl?: string;
    }>;
    unit?: string;
    basePrice?: number;
    locationId?: number;
    locationName?: string;
    location?: { id: number; name: string };
    category?: string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface ServiceSearchParams {
    code?: string;
    name?: string;
    description?: string;
    unit?: string;
    lowerBoundItemPrice?: number;
    upperBoundItemPrice?: number;
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

@Injectable({ providedIn: 'root' })
export class ServiceService {
    private baseUrl = 'http://localhost:8080/api/v1/service';

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    searchServices(params: ServiceSearchParams = {}): Observable<ApiResponse<PageResponse<Service>>> {
        let httpParams = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'updatedAt,DESC');

        if (params.code) httpParams = httpParams.set('code', params.code);
        if (params.name) httpParams = httpParams.set('name', params.name);
        if (params.description) httpParams = httpParams.set('description', params.description);
        if (params.unit) httpParams = httpParams.set('unit', params.unit);
        if (params.lowerBoundItemPrice != null) httpParams = httpParams.set('lowerBoundItemPrice', params.lowerBoundItemPrice);
        if (params.upperBoundItemPrice != null) httpParams = httpParams.set('upperBoundItemPrice', params.upperBoundItemPrice);
        if (params.locationId) httpParams = httpParams.set('locationId', params.locationId);

        return this.http.get<ApiResponse<PageResponse<Service>>>(`${this.baseUrl}/search`, {
            headers: this.getHeaders(),
            params: httpParams
        });
    }

    getServiceById(id: any): Observable<ApiResponse<Service>> {
        return this.http.get<ApiResponse<Service>>(`${this.baseUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    createService(service: {
        code?: string;
        name: string;
        description?: string;
        unit?: string;
        basePrice?: number;
        locationId?: number;
    }, videoFile: File): Observable<ApiResponse<Service>> {
        const formData = new FormData();
        formData.append(
            'serviceRequest',
            new Blob([JSON.stringify(service)], { type: 'application/json' })
        );
        formData.append('videoFile', videoFile);

        return this.http.post<ApiResponse<Service>>(`${this.baseUrl}/create`, formData, {
            headers: this.getAuthHeaders()
        });
    }

    updateService(id: any, service: {
        code?: string;
        name?: string;
        description?: string;
        unit?: string;
        basePrice?: number;
        locationId?: number;
    }, videoFile?: File): Observable<ApiResponse<Service>> {
        const formData = new FormData();
        formData.append(
            'serviceRequest',
            new Blob([JSON.stringify(service)], { type: 'application/json' })
        );
        if (videoFile) {
            formData.append('videoFile', videoFile);
        }

        return this.http.put<ApiResponse<Service>>(`${this.baseUrl}/update`, formData, {
            headers: this.getAuthHeaders(),
            params: new HttpParams().set('serviceId', id)
        });
    }

    changeStatus(id: any): Observable<ApiResponse<Service>> {
        return this.http.put<ApiResponse<Service>>(`${this.baseUrl}/${id}/change-status`, {}, {
            headers: this.getHeaders()
        });
    }
}