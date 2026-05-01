import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:8080/api/v1';

// ─── Request ───
export interface AdminDashBoardRequest {
    locationIds?: number[];
    fromDate: string;   // yyyy-MM-dd
    toDate: string;     // yyyy-MM-dd
}

// ─── Response blocks ───
export interface DashFinancial {
    totalRevenue: number;
    expectedRevenue: number;
    collectionRate: number;
}

export interface DashBusiness {
    newContracts: number;
    expiringContracts: number;
    liquidatedContracts: number;
}

export interface DashOperation {
    totalIncidents: number;
}

export interface DashCustomer {
    newCustomers: number;
    totalActiveResidents: number;
}

export interface DashSummary {
    financial: DashFinancial;
    business: DashBusiness;
    operation: DashOperation;
    customer: DashCustomer;
}

export interface DashCenter {
    centerId: number;
    centerName: string;
    financial: DashFinancial;
    business: DashBusiness;
    operation: DashOperation;
    customer: DashCustomer;
}

export interface AdminDashBoardResponse {
    period: string;
    summary: DashSummary;
    centers: DashCenter[];
}

export interface ApiResponse<T> {
    code: number;
    data: T;
}

// ─── Service ───
@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    searchDashboard(request: AdminDashBoardRequest): Observable<ApiResponse<AdminDashBoardResponse>> {
        return this.http.post<ApiResponse<AdminDashBoardResponse>>(
            `${BASE}/dashboard/search`,
            request,
            { headers: this.getHeaders() }
        );
    }
}
