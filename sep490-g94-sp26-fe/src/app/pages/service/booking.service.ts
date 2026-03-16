import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:8080/api/v1';

export interface Booking {
    id: number;
    bookingNo?: string;
    customerId?: number;
    customerName?: string;
    hallId?: number;
    hallName?: string;
    bookingDate?: string;
    eventDate?: string;
    bookingTime?: string;
    shift?: string;
    startTime?: string;
    endTime?: string;
    expectedTables?: number;
    tableCount?: number;
    expectedGuests?: number;
    guestCount?: number;
    packageId?: number | null;
    setMenuId?: number | null;
    bookingState?: string;
    salesId?: number | null;
    reservedUntil?: string | null;
    notes?: string;
    brideName?: string;
    brideAge?: number | null;
    groomName?: string;
    groomAge?: number | null;
    brideFatherName?: string;
    brideMotherName?: string;
    groomFatherName?: string;
    groomMotherName?: string;
    totalAmount?: number;
    status?: string;
    updatedAt?: string;
}

export interface BookingSearchParams {
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
    sort?: string;
}

export interface BookingUpsertPayload {
    customerId: number;
    hallId: number;
    bookingDate: string;
    bookingTime: string;
    expectedTables: number;
    expectedGuests: number;
    packageId?: number | null;
    setMenuId?: number | null;
    salesId?: number | null;
    reservedUntil?: string | null;
    notes?: string;
    brideName: string;
    brideAge?: number | null;
    groomName: string;
    groomAge?: number | null;
    brideFatherName?: string;
    brideMotherName?: string;
    groomFatherName?: string;
    groomMotherName?: string;
}

export interface UpdateBookingStatePayload {
    bookingId: number;
    bookingState: string;
}

export interface ApiResponse<T> {
    code: number;
    message: string;
    data: T;
}

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    page?: number;
    size: number;
    totalPages: number;
    number?: number;
}

@Injectable()
export class BookingService {
    constructor(private http: HttpClient) {}

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken') ?? '';
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    searchBookings(params: BookingSearchParams = {}): Observable<ApiResponse<PageResponse<Booking>>> {
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

        return this.http.get<ApiResponse<PageResponse<Booking>>>(`${BASE}/booking/search`, {
            headers: this.getHeaders(),
            params: p,
        });
    }

    getById(id: number): Observable<ApiResponse<Booking>> {
        return this.http.get<ApiResponse<Booking>>(`${BASE}/booking/${id}`, {
            headers: this.getHeaders(),
        });
    }

    create(payload: BookingUpsertPayload): Observable<ApiResponse<Booking>> {
        return this.http.post<ApiResponse<Booking>>(`${BASE}/booking/create`, payload, {
            headers: this.getHeaders(),
        });
    }

    update(id: number, payload: BookingUpsertPayload): Observable<ApiResponse<Booking>> {
        return this.http.put<ApiResponse<Booking>>(`${BASE}/booking/update`, payload, {
            headers: this.getHeaders(),
            params: new HttpParams().set('bookingId', id),
        });
    }

    updateState(payload: UpdateBookingStatePayload): Observable<ApiResponse<Booking>> {
        return this.http.put<ApiResponse<Booking>>(`${BASE}/booking/update-state`, payload, {
            headers: this.getHeaders(),
        });
    }

    changeStatus(id: number): Observable<ApiResponse<Booking>> {
        return this.http.patch<ApiResponse<Booking>>(`${BASE}/booking/${id}/change-status`, {}, {
            headers: this.getHeaders(),
        });
    }

}