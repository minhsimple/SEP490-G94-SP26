import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:8080/api/v1';

export interface Payment {
    id?: number;
    code?: string;               // TT-260323-1129
    invoiceId?: number;
    invoiceCode?: string;        // INV-260323-4612
    customerId?: number;
    customerName?: string;
    paymentDate?: string;
    round?: string | number;     // Đợt 1, deposit, ...
    method?: string;             // BANK_TRANSFER | CASH | ...
    methodNote?: string;         // ghi chú phương thức (hy345534)
    status?: string;             // 'SUCCESS' | 'PENDING' | 'CANCELLED'
    amount?: number;
    note?: string;
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
export class PaymentService {
    private get headers(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    constructor(private http: HttpClient) {}

    searchPayments(params: {
        page?: number;
        size?: number;
        keyword?: string;
        status?: string;
        sort?: string;
    }): Observable<PageResponse<Payment>> {
        let p = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'paymentDate,DESC');
        if (params.keyword) p = p.set('keyword', params.keyword);
        if (params.status)  p = p.set('status',  params.status);
        return this.http.get<PageResponse<Payment>>(
            `${BASE}/payments`, { headers: this.headers, params: p }
        );
    }

    deletePayment(id: number): Observable<SingleResponse<any>> {
        return this.http.delete<SingleResponse<any>>(
            `${BASE}/payments/${id}`, { headers: this.headers }
        );
    }
}