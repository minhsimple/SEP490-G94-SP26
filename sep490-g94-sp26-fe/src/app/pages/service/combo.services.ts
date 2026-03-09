import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ServiceItem {
    id: number;
    name: string;
    description?: string;
    basePrice: number;
    unit?: string;
    locationId?: number;
    locationName?: string;
    status?: string;
    code?: string;
}

export interface Combo {
    id: number;
    code?: string;
    name: string;
    description?: string;
    imageUrl?: string;
    locationId?: number;
    locationName?: string;
    totalPrice?: number;
    serviceCount?: number;
    status?: string;
    services?: ServiceItem[];
}

export interface PageResponse<T> {
    code: number;
    message: string;
    data: {
        content: T[];
        totalElements: number;
        totalPages: number;
        size: number;
        number: number;
    };
}

export interface SingleResponse<T> {
    code: number;
    message: string;
    data: T;
}

@Injectable()
export class ComboService {
    private readonly BASE = '/api/service-combos';

    constructor(private http: HttpClient) {}

    searchCombos(params: {
        page?: number;
        size?: number;
        name?: string;
        locationId?: number | null;
    }): Observable<PageResponse<Combo>> {
        let p = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20);
        if (params.name) p = p.set('name', params.name);
        if (params.locationId) p = p.set('locationId', params.locationId);
        return this.http.get<PageResponse<Combo>>(this.BASE, { params: p });
    }

    getComboById(id: number): Observable<SingleResponse<Combo>> {
        return this.http.get<SingleResponse<Combo>>(`${this.BASE}/${id}`);
    }

    createCombo(payload: {
        code: string;
        name: string;
        description?: string;
        imageUrl?: string;
        locationId?: number;
        serviceIds: number[];
    }): Observable<SingleResponse<Combo>> {
        return this.http.post<SingleResponse<Combo>>(this.BASE, payload);
    }

    updateCombo(id: number, payload: {
        code?: string;
        name: string;
        description?: string;
        imageUrl?: string;
        locationId?: number;
        serviceIds: number[];
    }): Observable<SingleResponse<Combo>> {
        return this.http.put<SingleResponse<Combo>>(`${this.BASE}/${id}`, payload);
    }

    deleteCombo(id: number): Observable<SingleResponse<any>> {
        return this.http.delete<SingleResponse<any>>(`${this.BASE}/${id}`);
    }

    changeStatus(id: number): Observable<SingleResponse<any>> {
        return this.http.patch<SingleResponse<any>>(`${this.BASE}/${id}/status`, {});
    }

    searchServices(params: {
        page?: number;
        size?: number;
        name?: string;
        locationId?: number | null;
    }): Observable<PageResponse<ServiceItem>> {
        let p = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 100);
        if (params.name) p = p.set('name', params.name);
        if (params.locationId) p = p.set('locationId', params.locationId);
        return this.http.get<PageResponse<ServiceItem>>('/api/services', { params: p });
    }
}