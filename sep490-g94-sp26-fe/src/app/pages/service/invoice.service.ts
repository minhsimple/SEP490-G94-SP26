import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:8080/api/v1';

export interface InvoiceService {
    id?: number;
    name?: string;
    quantity?: number;
    unitPrice?: number;
    totalPrice?: number;
}

export interface InvoiceSetMenu {
    id?: number;
    name?: string;
    quantity?: number;
    pricePerTable?: number;
    tableCount?: number;
    totalPrice?: number;
}

export interface Payment {
    id?: number;
    code?: string;
    paymentDate?: string;
    round?: number;              // đợt
    method?: string;             // phương thức
    status?: string;
    amount?: number;
    note?: string;
}

export interface Invoice {
    id?: number;
    code?: string;               // INV-260323-2648
    contractNo?: string;         // HD-260323-6045
    contractId?: number;
    customerId?: number;
    customerName?: string;
    customerPhone?: string;
    bookingDate?: string;        // ngày tiệc
    dueDate?: string;            // hạn
    createdAt?: string;
    hallId?: number;
    hallName?: string;
    tableCount?: number;
    pricePerTable?: number;
    hallTotal?: number;

    setMenus?: InvoiceSetMenu[];
    setMenuTotal?: number;

    services?: InvoiceService[];
    serviceTotal?: number;

    subTotal?: number;           // tạm tính
    tax?: number;
    totalAmount?: number;        // tổng cộng
    paidAmount?: number;
    remainingAmount?: number;

    status?: string;             // 'UNPAID' | 'PARTIAL' | 'PAID'
    payments?: Payment[];
}

export interface PageResponse<T> {
    code: number;
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
    data: T;
}

@Injectable()
export class InvoiceService {
    private get headers(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
    }

    constructor(private http: HttpClient) {}

    searchInvoices(params: {
        page?: number;
        size?: number;
        keyword?: string;
        status?: string;
        sort?: string;
    }): Observable<PageResponse<Invoice>> {
        let p = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'createdAt,DESC');
        if (params.keyword) p = p.set('keyword', params.keyword);
        if (params.status)  p = p.set('status',  params.status);
        return this.http.get<PageResponse<Invoice>>(`${BASE}/invoices`, { headers: this.headers, params: p });
    }

    getById(id: number): Observable<SingleResponse<Invoice>> {
        return this.http.get<SingleResponse<Invoice>>(`${BASE}/invoices/${id}`, { headers: this.headers });
    }

    deleteInvoice(id: number): Observable<SingleResponse<any>> {
        return this.http.delete<SingleResponse<any>>(`${BASE}/invoices/${id}`, { headers: this.headers });
    }

    addPayment(invoiceId: number, payload: {
        amount: number;
        method: string;
        note?: string;
        paymentDate?: string;
    }): Observable<SingleResponse<Payment>> {
        return this.http.post<SingleResponse<Payment>>(
            `${BASE}/invoices/${invoiceId}/payments`, payload, { headers: this.headers }
        );
    }

    deletePayment(invoiceId: number, paymentId: number): Observable<SingleResponse<any>> {
        return this.http.delete<SingleResponse<any>>(
            `${BASE}/invoices/${invoiceId}/payments/${paymentId}`, { headers: this.headers }
        );
    }
}