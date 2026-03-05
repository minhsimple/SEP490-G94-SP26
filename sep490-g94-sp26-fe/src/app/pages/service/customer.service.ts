import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Customer {
    id?: any;
    fullName?: string;
    citizenIdNumber?: string;
    phone?: string;
    email?: string;
    taxCode?: string;
    address?: string;
    notes?: string;
    locationId?: number;
    locationName?: string;
    location?: { id: number; name: string };
    status?: 'active' | 'inactive';
    password?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CustomerSearchParams {
    fullName?: string;
    citizenIdNumber?: string;
    phone?: string;
    email?: string;
    taxCode?: string;
    address?: string;
    notes?: string;
    locationId?: number;
    status?: 'active' | 'inactive';
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
export class CustomerService {
    private baseUrl = 'http://localhost:8080/api/v1/customer';

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    searchCustomers(params: CustomerSearchParams = {}): Observable<ApiResponse<PageResponse<Customer>>> {
        let httpParams = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'updatedAt,DESC');

        if (params.fullName) httpParams = httpParams.set('fullName', params.fullName);
        if (params.citizenIdNumber) httpParams = httpParams.set('citizenIdNumber', params.citizenIdNumber);
        if (params.phone) httpParams = httpParams.set('phone', params.phone);
        if (params.email) httpParams = httpParams.set('email', params.email);
        if (params.taxCode) httpParams = httpParams.set('taxCode', params.taxCode);
        if (params.address) httpParams = httpParams.set('address', params.address);
        if (params.notes) httpParams = httpParams.set('notes', params.notes);
        if (params.locationId != null) httpParams = httpParams.set('locationId', params.locationId);
        if (params.status) httpParams = httpParams.set('status', params.status);

        return this.http.get<ApiResponse<PageResponse<Customer>>>(`${this.baseUrl}/search`, {
            headers: this.getHeaders(),
            params: httpParams
        });
    }

    getCustomerById(id: any): Observable<ApiResponse<Customer>> {
        return this.http.get<ApiResponse<Customer>>(`${this.baseUrl}/${id}`, {
            headers: this.getHeaders()
        });
    }

    createCustomer(customer: {
        fullName: string;
        citizenIdNumber?: string;
        phone?: string;
        email?: string;
        taxCode?: string;
        address?: string;
        notes?: string;
        locationId?: number;
        password: string;
    }): Observable<ApiResponse<Customer>> {
        return this.http.post<ApiResponse<Customer>>(`${this.baseUrl}/create`, customer, {
            headers: this.getHeaders()
        });
    }

    updateCustomer(id: any, customer: {
        fullName?: string;
        citizenIdNumber?: string;
        phone?: string;
        email?: string;
        taxCode?: string;
        address?: string;
        notes?: string;
        locationId?: number;
    }): Observable<ApiResponse<Customer>> {
        return this.http.put<ApiResponse<Customer>>(`${this.baseUrl}/update`, customer, {
            headers: this.getHeaders(),
            params: new HttpParams().set('customerId', id)
        });
    }

    changeStatus(id: any): Observable<ApiResponse<Customer>> {
        return this.http.put<ApiResponse<Customer>>(`${this.baseUrl}/${id}/change-status`, {}, {
            headers: this.getHeaders()
        });
    }
    searchLocations(page = 0, size = 20): Observable<ApiResponse<PageResponse<Location>>> {
    const params = new HttpParams()
        .set('page', page)
        .set('size', size)
        .set('sort', 'updatedAt,DESC');

    return this.http.get<ApiResponse<PageResponse<Location>>>(`http://localhost:8080/api/v1/location/search`, {
        headers: this.getHeaders(),
        params
    });
}

}