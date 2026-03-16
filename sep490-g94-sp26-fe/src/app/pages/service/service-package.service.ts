import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ServiceResponse {
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    status?: string;
    packageId?: number;
    serviceId: number;
    qty: number;
}

export interface ServicePackage {
    id: number;
    code?: string;
    name: string;
    description?: string;
    basePrice?: number;
    locationId?: number;
    locationName?: string;
    status?: string;
    serviceResponseList?: ServiceResponse[];
}

export interface ServicePackageSearchParams {
    code?: string;
    name?: string;
    description?: string;
    locationId?: number;
    lowerBoundBasePrice?: number;
    upperBoundBasePrice?: number;
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
    page: number;
}

@Injectable({ providedIn: 'root' })
export class ServicePackageService {
    private baseUrl = 'http://localhost:8080/api/v1/service-package';

    constructor(private http: HttpClient) { }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    /**
     * Search service packages with pagination and filters
     * POST /api/v1/service-package/search
     */
    searchServicePackages(params: ServicePackageSearchParams = {}): Observable<ApiResponse<PageResponse<ServicePackage>>> {
    const filterRequest: any = {
        code: params.code,
        name: params.name,
        description: params.description,
        locationId: params.locationId,
        lowerBoundBasePrice: params.lowerBoundBasePrice,
        upperBoundBasePrice: params.upperBoundBasePrice,
        status: params.status
    };

    // Remove undefined values
    Object.keys(filterRequest).forEach(key => 
        filterRequest[key] === undefined && delete filterRequest[key]
    );

    let httpParams = new HttpParams()
        .set('page', params.page ?? 0)
        .set('size', params.size ?? 20)
        .set('sort', params.sort ?? 'updatedAt,DESC');

    if (params.locationId !== undefined) {
        httpParams = httpParams.set('locationId', params.locationId);
    }
        
    if (Object.keys(filterRequest).length > 0) {
        httpParams = httpParams.set('filterRequest', JSON.stringify(filterRequest));
    }

    return this.http.get<any>(   
        `${this.baseUrl}/search`,
        {
            headers: this.getHeaders(),
            params: httpParams
        }
    ).pipe(
        map(response => {
            // Normalize backend response: ServiceResponseList -> serviceResponseList
            if (response.data && response.data.content) {
                response.data.content = response.data.content.map((item: any) => ({
                    ...item,
                    serviceResponseList: item.ServiceResponseList || item.serviceResponseList || []
                }));
            }
            return response as ApiResponse<PageResponse<ServicePackage>>;
        })
    );
}
    /**
     * Get service package by ID
     * GET /api/v1/service-package/{servicePackageId}
     */
    getById(servicePackageId: number): Observable<ApiResponse<ServicePackage>> {
        return this.http.get<any>(
            `${this.baseUrl}/${servicePackageId}`,
            { headers: this.getHeaders() }
        ).pipe(
            map(response => {
                // Normalize backend response: ServiceResponseList -> serviceResponseList
                if (response.data) {
                    response.data = {
                        ...response.data,
                        serviceResponseList: response.data.ServiceResponseList || response.data.serviceResponseList || []
                    };
                }
                return response as ApiResponse<ServicePackage>;
            })
        );
    }

    /**
     * Create new service package
     * POST /api/v1/service-package/create
     */
    createServicePackage(payload: {
        code?: string;
        name: string;
        description?: string;
        locationId?: number;
        serviceList: { serviceId: number; qty: number }[];
    }): Observable<ApiResponse<ServicePackage>> {
        return this.http.post<ApiResponse<ServicePackage>>(
            `${this.baseUrl}/create`,
            payload,
            { headers: this.getHeaders() }
        );
    }

    /**
     * Update service package
     * PUT /api/v1/service-package/update?servicePackageId={id}
     */
    updateServicePackage(id: number, payload: {
        code?: string;
        name: string;
        description?: string;
        locationId?: number;
        serviceList: { serviceId: number; qty: number }[];
    }): Observable<ApiResponse<ServicePackage>> {
        return this.http.put<ApiResponse<ServicePackage>>(
            `${this.baseUrl}/update`,
            payload,
            { 
                headers: this.getHeaders(),
                params: new HttpParams().set('servicePackageId', id)
            }
        );
    }

    /**
     * Change service package status (active/inactive)
     * POST /api/v1/service-package/{servicePackageId}/change-status
     */
    changeStatus(servicePackageId: number): Observable<ApiResponse<ServicePackage>> {
        return this.http.put<ApiResponse<ServicePackage>>(
            `${this.baseUrl}/${servicePackageId}/change-status`,
            {},
            { headers: this.getHeaders() }
        );
    }
}
