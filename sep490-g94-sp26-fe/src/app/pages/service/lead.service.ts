import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Lead {
    id?: any;
    fullName?: string;
    phone?: string;
    email?: string;
    source?: string;
    notes?: string;
    address?: string;
    state?: string;
    locationId?: number;
    assignedSalesId?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface LeadSearchParams {
    fullName?: string;
    phone?: string;
    email?: string;
    source?: string;
    notes?: string;
    address?: string;
    assignedSalesId?: number;
    state?: string;
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
export class LeadService {
    private baseUrl = 'http://localhost:8080/api/v1/lead';

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    searchLeads(params: LeadSearchParams = {}): Observable<ApiResponse<PageResponse<Lead>>> {
        let httpParams = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'updatedAt,DESC');

        if (params.fullName) httpParams = httpParams.set('fullName', params.fullName);
        if (params.phone) httpParams = httpParams.set('phone', params.phone);
        if (params.email) httpParams = httpParams.set('email', params.email);
        if (params.source) httpParams = httpParams.set('source', params.source);
        if (params.notes) httpParams = httpParams.set('notes', params.notes);
        if (params.assignedSalesId) httpParams = httpParams.set('assignedSalesId', params.assignedSalesId);
        if (params.state) httpParams = httpParams.set('state', params.state);
        if (params.locationId) httpParams = httpParams.set('locationId', params.locationId);

        return this.http.get<ApiResponse<PageResponse<Lead>>>(`${this.baseUrl}/search`, {
            headers: this.getHeaders(),
            params: httpParams
        });
    }

    getLeadById(id: any): Observable<ApiResponse<Lead>> {
        return this.http.get<ApiResponse<Lead>>(`${this.baseUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    createLead(lead: {
        fullName: string;
        phone?: string;
        email?: string;
        source?: string;
        address?: string;
        notes?: string;
        state?: string;
        locationId?: number;
    }): Observable<ApiResponse<Lead>> {
        return this.http.post<ApiResponse<Lead>>(`${this.baseUrl}/create`, lead, {
            headers: this.getHeaders()
        });
    }

    updateLead(id: any, lead: {
        fullName?: string;
        phone?: string;
        email?: string;
        source?: string;
        address?: string;
        notes?: string;
        state?: string;
        locationId?: number;
        assignedSalesId?: number;
        salesId?: number;
    }): Observable<ApiResponse<Lead>> {
        return this.http.put<ApiResponse<Lead>>(`${this.baseUrl}/update`, lead, {
            headers: this.getHeaders(),
            params: new HttpParams().set('leadId', id)
        });
    }

    changeStatus(id: any): Observable<ApiResponse<Lead>> {
        return this.http.patch<ApiResponse<Lead>>(`${this.baseUrl}/${id}/change-status`, {}, {
            headers: this.getHeaders()
        });
    }

    assignToSales(id: any): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${id}/assign-to-sales`, {}, {
            headers: this.getHeaders()
        });
    }
}