import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:8080/api/v1';

@Injectable()
export class BookingService {
    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken') ?? '';
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    searchBookings(params: {
        page?: number;
        size?: number;
        bookingNo?: string;
        customerId?: number;
        hallId?: number;
        bookingDateFrom?: string;
        bookingDateTo?: string;
        bookingTime?: string;
        bookingState?: string;
        salesId?: number;
        brideName?: string;
        groomName?: string;
        status?: string;
        tableCountMin?: number;
        tableCountMax?: number;
        sort?: string;
    }): Observable<any> {
        let p = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'updatedAt,DESC');

        if (params.bookingNo)       p = p.set('bookingNo',       params.bookingNo);
        if (params.customerId)      p = p.set('customerId',      params.customerId);
        if (params.hallId)          p = p.set('hallId',          params.hallId);
        if (params.bookingDateFrom) p = p.set('bookingDateFrom', params.bookingDateFrom);
        if (params.bookingDateTo)   p = p.set('bookingDateTo',   params.bookingDateTo);
        if (params.bookingTime)     p = p.set('bookingTime',     params.bookingTime);
        if (params.bookingState)    p = p.set('bookingState',    params.bookingState);
        if (params.salesId)         p = p.set('salesId',         params.salesId);
        if (params.brideName)       p = p.set('brideName',       params.brideName);
        if (params.groomName)       p = p.set('groomName',       params.groomName);
        if (params.status)          p = p.set('status',          params.status);
        if (params.tableCountMin != null) p = p.set('tableCountMin', params.tableCountMin);
        if (params.tableCountMax != null) p = p.set('tableCountMax', params.tableCountMax);

        return this.http.get<any>(`${BASE}/booking/search`, {
            headers: this.getHeaders(),
            params: p,
        });
    }

    getById(id: number): Observable<any> {
        return this.http.get<any>(`${BASE}/booking/${id}`, {
            headers: this.getHeaders(),
        });
    }

    create(payload: any): Observable<any> {
        return this.http.post<any>(`${BASE}/booking`, payload, {
            headers: this.getHeaders(),
        });
    }

    update(id: number, payload: any): Observable<any> {
        return this.http.put<any>(`${BASE}/booking/${id}`, payload, {
            headers: this.getHeaders(),
        });
    }

    changeStatus(id: number, bookingState: string): Observable<any> {
        return this.http.patch<any>(`${BASE}/booking/${id}/status`, { bookingState }, {
            headers: this.getHeaders(),
        });
    }

    createContract(bookingId: number): Observable<any> {
        return this.http.post<any>(`${BASE}/booking/${bookingId}/contract`, {}, {
            headers: this.getHeaders(),
        });
    }
}