import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:8080/api/v1';

export interface Payment {
    id?: number;
    code?: string;               // TT-260323-1129
    contractId?: number;
    invoiceId?: number;
    invoiceCode?: string;        // INV-260323-4612
    customerId?: number;
    customerName?: string;
    paymentDate?: string;
    paidAt?: string;
    createdAt?: string;
    updatedAt?: string;
    round?: string | number;     // Đợt 1, deposit, ...
    method?: string;             // BANK_TRANSFER | CASH | ...
    methodNote?: string;         // ghi chú phương thức (hy345534)
    status?: string;             // 'SUCCESS' | 'PENDING' | 'CANCELLED'
    paymentState?: string;
    amount?: number;
    referenceNo?: string;
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

export interface CreatePaymentPayload {
    contractId: number;
    amount: number;
    method: string;
    paymentState?: string;
    referenceNo?: string;
    note?: string;
}

export interface UpdatePaymentPayload {
    contractId: number;
    amount: number;
    method: string;
    paymentState?: string;
    referenceNo?: string;
    note?: string;
}

export interface PayOSCreatePaymentPayload {
    description: string;
    returnUrl: string;
    cancelUrl: string;
    paymentId: number;
}

export interface PayOSCheckoutResponse {
    orderCode?: number;
    checkoutUrl?: string;
    paymentLinkId?: string;
    qrCode?: string;
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
        paymentState?: string;
        method?: string;
        sort?: string;
    }): Observable<PageResponse<Payment>> {
        let p = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'updatedAt,DESC');
        if (params.keyword) p = p.set('keyword', params.keyword);
        if (params.paymentState) p = p.set('paymentState', params.paymentState);
        if (params.method)  p = p.set('method',  params.method);

        const endpoint = params.paymentState ? `${BASE}/payments/filter` : `${BASE}/payments`;
        return this.http.get<PageResponse<Payment>>(
            endpoint, { headers: this.headers, params: p }
        );
    }

    deletePayment(id: number): Observable<SingleResponse<any>> {
        return this.http.delete<SingleResponse<any>>(
            `${BASE}/payments/${id}`, { headers: this.headers }
        );
    }

    getById(id: number): Observable<SingleResponse<Payment>> {
        return this.http.get<SingleResponse<Payment>>(
            `${BASE}/payments/${id}`, { headers: this.headers }
        );
    }

    createPayment(payload: CreatePaymentPayload): Observable<SingleResponse<Payment>> {
        return this.http.post<SingleResponse<Payment>>(
            `${BASE}/payments/create`, payload, { headers: this.headers }
        );
    }

    updatePayment(id: number, payload: UpdatePaymentPayload): Observable<SingleResponse<Payment>> {
        return this.http.put<SingleResponse<Payment>>(
            `${BASE}/payments/${id}`, payload, { headers: this.headers }
        );
    }

    createPayOSPaymentLink(payload: PayOSCreatePaymentPayload): Observable<SingleResponse<PayOSCheckoutResponse>> {
        return this.http.post<SingleResponse<PayOSCheckoutResponse>>(
            'http://localhost:8080/api/payos/payment/payos/create', payload, { headers: this.headers }
        );
    }

    getPaymentsByContract(contractId: number, page = 0, size = 50): Observable<PageResponse<Payment>> {
        const params = new HttpParams()
            .set('page', page)
            .set('size', size)
            .set('sort', 'id,ASC');

        return this.http.get<PageResponse<Payment>>(
            `${BASE}/payments/contract/${contractId}`,
            { headers: this.headers, params }
        );
    }
}