import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:8080/api/v1';

export interface InvoiceLineService {
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

export interface InvoiceDataMenuItem {
    id?: number;
    code?: string;
    name?: string;
    price?: number;
    unit?: string;
    quantity?: number;
    category_name?: string;
}

export interface InvoiceDataPayload {
    hall_invoice?: {
        id?: number;
        code?: string;
        name?: string;
        price?: number;
    };
    set_menu_invoice?: {
        id?: number;
        code?: string;
        name?: string;
        price?: number;
        menu_items?: InvoiceDataMenuItem[];
    };
    service_package_invoice?: {
        id?: number;
        code?: string;
        name?: string;
        price?: number;
        services?: Array<{
            id?: number;
            code?: string;
            name?: string;
            price?: number;
            unit?: string;
        }>;
    };
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
    expectedTables?: number;
    invoiceState?: string;
    status?: string;
    data?: InvoiceDataPayload;

    hall?: {
        id?: number;
        code?: string;
        name?: string;
        locationId?: number;
        locationName?: string;
        capacity?: number;
        notes?: string;
        status?: string;
        basePrice?: number;
    };

    servicesPackage?: {
        name?: string;
        basePrice?: number;
    };

    setMenu?: {
        id?: number;
        code?: string;
        name?: string;
        description?: string;
        location?: { id?: number; name?: string };
        setPrice?: number;
        status?: string;
        menuItemsByCategory?: Record<string, {
            id?: number;
            code?: string;
            name?: string;
            unitPrice?: number;
            unit?: string;
            description?: string;
            quantity?: number;
        }[]>;
    };

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

    services?: InvoiceLineService[];
    serviceTotal?: number;

    subTotal?: number;           // tạm tính
    tax?: number;
    totalAmount?: number;        // tổng cộng
    paidAmount?: number;
    remainingAmount?: number;

    payments?: Payment[];
}

export interface InvoiceSearchParams {
    page?: number;
    size?: number;
    contractId?: number;
    invoiceState?: string;
    lowerBoundTotalAmount?: number;
    upperBoundTotalAmount?: number;
    status?: string;
    sort?: string;
}

export interface PageResponse<T> {
    code: number;
    message?: string;
    data: {
        content: T[];
        totalElements: number;
        totalPages: number;
        size: number;
        number: number;
        page?: number;
    };
}

export interface SingleResponse<T> {
    code: number;
    message?: string;
    data: T;
}

@Injectable()
export class InvoiceService {
    private get headers(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({ 'Content-Type': 'application/json', Authorization: `Bearer ${token}` });
    }

    constructor(private http: HttpClient) {}

    searchInvoices(params: InvoiceSearchParams = {}): Observable<PageResponse<Invoice>> {
        let p = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'id,DESC');

        if (params.contractId) p = p.set('contractId', params.contractId);
        if (params.invoiceState) p = p.set('invoiceState', params.invoiceState);
        if (params.lowerBoundTotalAmount !== undefined && params.lowerBoundTotalAmount !== null) {
            p = p.set('lowerBoundTotalAmount', params.lowerBoundTotalAmount);
        }
        if (params.upperBoundTotalAmount !== undefined && params.upperBoundTotalAmount !== null) {
            p = p.set('upperBoundTotalAmount', params.upperBoundTotalAmount);
        }
        if (params.status) p = p.set('status', params.status);

        return this.http.get<PageResponse<Invoice>>(`${BASE}/invoice/search`, {
            headers: this.headers,
            params: p
        });
    }

    getById(id: number): Observable<SingleResponse<Invoice>> {
        return this.http.get<SingleResponse<Invoice>>(`${BASE}/invoice/${id}`, { headers: this.headers });
    }

    getDataById(id: number): Observable<SingleResponse<InvoiceDataPayload>> {
        return this.http.get<SingleResponse<InvoiceDataPayload>>(`${BASE}/invoice/data/${id}`, { headers: this.headers });
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