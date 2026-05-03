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

export interface SaleDashBoardRequest {
    fromDate: string;   // yyyy-MM-dd
    toDate: string;     // yyyy-MM-dd
}

export interface AccountantDashBoardRequest {
    fromDate: string;   // yyyy-MM-dd
    toDate: string;     // yyyy-MM-dd
    locationIds?: number[];
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

export interface SaleDashBoardResponse {
    customersInChargeCount: number;
    totalContracts: number;
    activeContracts: number;
    filteredContractsCount: number;
    participatedContractsCount: number;
    totalContractValue: number;
    filteredRevenue: number;
    averageContractValue: number;
    totalCollectedAmount: number;
    remainingAmountToCollect: number;
    canceledCount: number;
    liquidatedCount: number;
    activeCount: number;
}

export interface AccountantDashBoardResponse {
    fromDate: string;
    toDate: string;
    locationId: number;
    locationName: string;
    cashFlow: {
        totalExpectedRevenue: number;
        totalCollectedAmount: number;
        totalOutstandingDebt: number;
        totalRefundedAmount: number;
    };
    invoice: {
        totalUnpaid: number;
        totalPartiallyPaid: number;
        totalPaid: number;
    };
    pendingAction: {
        pendingPaymentsCount: number;
        pendingPaymentsAmount: number;
    };
    paymentMethod: {
        totalCash: number;
        totalBankTransfer: number;
    };
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

    searchSaleDashboard(request: SaleDashBoardRequest): Observable<ApiResponse<SaleDashBoardResponse>> {
        return this.http.post<ApiResponse<SaleDashBoardResponse>>(
            `${BASE}/dashboard/search-sale`,
            request,
            { headers: this.getHeaders() }
        );
    }

    searchAccountantDashboard(request: AccountantDashBoardRequest): Observable<ApiResponse<AccountantDashBoardResponse[]>> {
        return this.http.post<ApiResponse<AccountantDashBoardResponse[]>>(
            `${BASE}/dashboard/search-accountant`,
            request,
            { headers: this.getHeaders() }
        );
    }
}
