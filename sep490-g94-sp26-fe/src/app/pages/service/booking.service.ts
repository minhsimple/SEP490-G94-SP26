import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

const BASE = 'http://localhost:8080/api/v1';

export interface Booking {
    id: number;
    taskListId?: number;
    contractNo?: string;
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
    contractState?: string;
    bookingState?: string;
    salesId?: number | null;
    assignCoordinatorId?: number | null;
    assignCoordinatorName?: string;
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
    paymentPercent?: number | null;
    totalAmount?: number;
    status?: string;
    createAt?: string;
    createdAt?: string;
    updatedAt?: string;
    customerResponse?: {
        id?: number;
        fullName?: string;
        phone?: string;
    };
    invoiceData?: {
        hall_invoice?: {
            id?: number;
            name?: string;
            price?: number;
        };
        set_menu_invoice?: {
            id?: number;
            name?: string;
            price?: number;
            menu_items?: any[];
        };
        service_package_invoice?: {
            id?: number;
            name?: string;
            price?: number;
            services?: any[];
        };
    };
}

export interface BookingSearchParams {
    page?: number;
    size?: number;
    contractId?: number;
    contractNo?: string;
    bookingNo?: string;
    customerId?: number;
    hallId?: number;
    bookingDateFrom?: string;
    bookingDateTo?: string;
    bookingTime?: string;
    contractState?: string;
    bookingState?: string;
    salesId?: number;
    assignCoordinatorId?: number;
    brideName?: string;
    groomName?: string;
    status?: string;
    sort?: string;
}

export interface BookingUpsertPayload {
    customerId?: number | null;
    customerRequest: {
        fullName: string;
        citizenIdNumber?: string;
        phone: string;
        email?: string;
        address: string;
        notes?: string;
        locationId: number;
    };
    hallId: number;
    bookingDate: string;
    bookingTime: string;
    expectedTables: number;
    expectedGuests: number;
    assignCoordinatorId?: number | null;
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
    paymentPercent: number;
}

export interface UpdateBookingStatePayload {
    contractId: number;
    contractState: string;
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

    private toNumberOrNull(value: any): number | null {
        const n = Number(value);
        return Number.isFinite(n) && n > 0 ? n : null;
    }

    private deriveBookingDate(raw: any): string | undefined {
        const bookingDate = raw?.bookingDate;
        if (typeof bookingDate === 'string' && bookingDate.trim()) {
            return bookingDate;
        }

        const startTime = raw?.startTime;
        if (typeof startTime === 'string' && startTime.trim()) {
            return startTime.slice(0, 10);
        }

        return undefined;
    }

    private normalizeBooking(raw: any): Booking {
        const hallId = this.toNumberOrNull(raw?.hallId ?? raw?.invoiceData?.hall_invoice?.id);
        const setMenuId = this.toNumberOrNull(raw?.setMenuId ?? raw?.invoiceData?.set_menu_invoice?.id);
        const packageId = this.toNumberOrNull(raw?.packageId ?? raw?.invoiceData?.service_package_invoice?.id);

        const normalized: Booking = {
            ...raw,
            id: Number(raw?.id),
            contractNo: raw?.contractNo ?? raw?.bookingNo,
            bookingNo: raw?.bookingNo ?? raw?.contractNo,
            bookingDate: this.deriveBookingDate(raw),
            customerName: raw?.customerName ?? raw?.customerResponse?.fullName,
            hallId: hallId ?? undefined,
            hallName: raw?.hallName ?? raw?.invoiceData?.hall_invoice?.name,
            setMenuId: setMenuId,
            packageId: packageId,
            contractState: raw?.contractState ?? raw?.bookingState,
            bookingState: raw?.bookingState ?? raw?.contractState,
            createdAt: raw?.createdAt ?? raw?.createAt,
            invoiceData: raw?.invoiceData,
            customerResponse: raw?.customerResponse,
        };

        return normalized;
    }

    private normalizeBookingListResponse(
        res: ApiResponse<PageResponse<any>>
    ): ApiResponse<PageResponse<Booking>> {
        const rawContent = res?.data?.content ?? [];
        const normalizedContent = rawContent.map((item: any) => this.normalizeBooking(item));

        return {
            ...res,
            data: {
                ...(res?.data ?? { content: [], totalElements: 0, size: 0, totalPages: 0 }),
                content: normalizedContent,
            },
        } as ApiResponse<PageResponse<Booking>>;
    }

    private normalizeBookingSingleResponse(res: ApiResponse<any>): ApiResponse<Booking> {
        return {
            ...res,
            data: this.normalizeBooking(res?.data ?? {}),
        } as ApiResponse<Booking>;
    }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken') ?? '';
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });
    }

    private getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken') ?? '';
        return new HttpHeaders({
            Authorization: `Bearer ${token}`
        });
    }

    private normalizeCitizenCardImageFiles(imageFiles: File[]): File[] {
        if (!Array.isArray(imageFiles) || imageFiles.length === 0) {
            return [];
        }

        const uniqueMap = new Map<string, File>();
        for (const file of imageFiles) {
            if (!(file instanceof File)) {
                continue;
            }

            const key = `${file.name}__${file.size}__${file.lastModified}`;
            uniqueMap.set(key, file);

            if (uniqueMap.size >= 2) {
                break;
            }
        }

        return Array.from(uniqueMap.values());
    }

    searchBookings(params: BookingSearchParams = {}): Observable<ApiResponse<PageResponse<Booking>>> {
        const contractNo = params.contractNo ?? params.bookingNo;
        const contractState = params.contractState ?? params.bookingState;

        let p = new HttpParams()
            .set('page', params.page ?? 0)
            .set('size', params.size ?? 20)
            .set('sort', params.sort ?? 'updatedAt,DESC');

        if (params.contractId)      p = p.set('contractId',      params.contractId);
        if (contractNo)             p = p.set('contractNo',      contractNo);
        if (params.customerId)      p = p.set('customerId',      params.customerId);
        if (params.hallId)          p = p.set('hallId',          params.hallId);
        if (params.bookingDateFrom) p = p.set('bookingDateFrom', params.bookingDateFrom);
        if (params.bookingDateTo)   p = p.set('bookingDateTo',   params.bookingDateTo);
        if (params.bookingTime)     p = p.set('bookingTime',     params.bookingTime);
        if (contractState)          p = p.set('contractState',   contractState);
        if (params.salesId)         p = p.set('salesId',         params.salesId);
        if (params.assignCoordinatorId) p = p.set('assignCoordinatorId', params.assignCoordinatorId);
        if (params.brideName)       p = p.set('brideName',       params.brideName);
        if (params.groomName)       p = p.set('groomName',       params.groomName);
        if (params.status)          p = p.set('status',          params.status);

        return this.http.get<ApiResponse<PageResponse<any>>>(`${BASE}/contract/search`, {
            headers: this.getHeaders(),
            params: p,
        }).pipe(
            map((res) => this.normalizeBookingListResponse(res))
        );
    }

    getById(id: number): Observable<ApiResponse<Booking>> {
        return this.http.get<ApiResponse<any>>(`${BASE}/contract/${id}`, {
            headers: this.getHeaders(),
        }).pipe(
            map((res) => this.normalizeBookingSingleResponse(res))
        );
    }

    create(payload: BookingUpsertPayload, imageFiles: File[] = []): Observable<ApiResponse<Booking>> {
        const normalizedImageFiles = this.normalizeCitizenCardImageFiles(imageFiles);

        if (normalizedImageFiles.length === 0) {
            return this.http.post<ApiResponse<any>>(`${BASE}/contract/create`, payload, {
                headers: this.getHeaders(),
            }).pipe(
                map((res) => this.normalizeBookingSingleResponse(res))
            );
        }

        const formData = new FormData();
        formData.append('request', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        normalizedImageFiles.forEach((file) => formData.append('imageFiles', file, file.name));

        return this.http.post<ApiResponse<any>>(`${BASE}/contract/create`, formData, {
            headers: this.getAuthHeaders(),
        }).pipe(
            map((res) => this.normalizeBookingSingleResponse(res))
        );
    }

    update(id: number, payload: BookingUpsertPayload): Observable<ApiResponse<Booking>> {
        return this.http.put<ApiResponse<any>>(`${BASE}/contract/update`, payload, {
            headers: this.getHeaders(),
            params: new HttpParams().set('bookingId', id),
        }).pipe(
            map((res) => this.normalizeBookingSingleResponse(res))
        );
    }

    updateState(payload: UpdateBookingStatePayload): Observable<ApiResponse<Booking>> {
        return this.http.put<ApiResponse<any>>(`${BASE}/contract/update-state`, payload, {
            headers: this.getHeaders(),
        }).pipe(
            map((res) => this.normalizeBookingSingleResponse(res))
        );
    }

    changeStatus(id: number): Observable<ApiResponse<Booking>> {
        return this.http.patch<ApiResponse<any>>(`${BASE}/contract/${id}/change-status`, {}, {
            headers: this.getHeaders(),
        }).pipe(
            map((res) => this.normalizeBookingSingleResponse(res))
        );
    }

}