import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiResponse } from './users.service';

export interface UserProfile {
    id: number;
    email: string;
    fullName: string;
    phone: string;
    roleId: number;
    locationId?: number;
    locationIds?: number[];
    status: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginData {
    codeRole: string;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    userId: number;
    email: string;
    fullName: string;
    locationId?: number | null;
    locationIds?: number[] | null;
}

export interface LoginResponse {
    code: number;
    message: string;
    data: LoginData;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = 'http://localhost:8080/api/v1/auth';

    private readonly storageKeys = {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
        tokenType: 'tokenType',
        codeRole: 'codeRole',
        userId: 'userId',
        email: 'email',
        fullName: 'fullName',
        locationId: 'locationId',
        locationIds: 'locationIds'
    };

    private codeRoleSubject = new BehaviorSubject<string>(
        localStorage.getItem(this.storageKeys.codeRole) ?? ''
    );
    codeRole$ = this.codeRoleSubject.asObservable();

    constructor(private http: HttpClient) {}

    private isPlaceholderToken(token: string): boolean {
        const normalized = token.trim().toLowerCase();
        return !normalized || normalized === 'null' || normalized === 'undefined';
    }

    private parseJwtPayload(token: string): Record<string, unknown> | null {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        try {
            const base64Payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const paddedPayload = base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, '=');
            const decodedPayload = atob(paddedPayload);
            const payload = JSON.parse(decodedPayload) as unknown;
            return typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : null;
        } catch {
            return null;
        }
    }

    private isTokenExpired(token: string): boolean {
        const payload = this.parseJwtPayload(token);
        if (!payload) {
            return true;
        }

        const exp = Number(payload['exp']);
        if (!Number.isFinite(exp)) {
            return true;
        }

        return exp * 1000 <= Date.now() + 5000;
    }

    login(payload: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.baseUrl}/login`, payload);
    }

    private normalizeLocationIds(data: LoginData): number[] {
        const fromArray = Array.isArray(data.locationIds)
            ? data.locationIds
            : [];

        const normalizedFromArray = fromArray
            .map((id) => Number(id))
            .filter((id) => Number.isFinite(id) && id > 0);

        if (normalizedFromArray.length > 0) {
            return Array.from(new Set(normalizedFromArray));
        }

        const singleLocationId = Number(data.locationId);
        if (Number.isFinite(singleLocationId) && singleLocationId > 0) {
            return [singleLocationId];
        }

        return [];
    }

    saveSession(data: LoginData): void {
        localStorage.setItem(this.storageKeys.accessToken, data.accessToken ?? '');
        localStorage.setItem(this.storageKeys.refreshToken, data.refreshToken ?? '');
        localStorage.setItem(this.storageKeys.tokenType, data.tokenType || 'Bearer');
        localStorage.setItem(this.storageKeys.userId, String(data.userId ?? ''));
        localStorage.setItem(this.storageKeys.email, data.email ?? '');
        localStorage.setItem(this.storageKeys.fullName, data.fullName ?? '');

        const normalizedLocationIds = this.normalizeLocationIds(data);
        if (normalizedLocationIds.length === 0) {
            localStorage.removeItem(this.storageKeys.locationId);
            localStorage.removeItem(this.storageKeys.locationIds);
        } else {
            localStorage.setItem(this.storageKeys.locationId, String(normalizedLocationIds[0]));
            localStorage.setItem(this.storageKeys.locationIds, JSON.stringify(normalizedLocationIds));
        }

        this.setCodeRole(data.codeRole ?? '');
    }

    setCodeRole(codeRole: string): void {
        localStorage.setItem(this.storageKeys.codeRole, codeRole);
        this.codeRoleSubject.next(codeRole);
    }

    getAccessToken(): string {
        const token = localStorage.getItem(this.storageKeys.accessToken) ?? '';
        return this.isPlaceholderToken(token) ? '' : token;
    }

    getTokenType(): string {
        return localStorage.getItem(this.storageKeys.tokenType) || 'Bearer';
    }

    isAuthenticated(): boolean {
        const token = this.getAccessToken();
        if (!token) {
            return false;
        }

        if (this.isTokenExpired(token)) {
            this.clearAuth();
            return false;
        }

        return true;
    }

    clearAuth(): void {
        Object.values(this.storageKeys).forEach((key) => localStorage.removeItem(key));
        this.codeRoleSubject.next('');
    }

    private getHeaders(): HttpHeaders {
        const token = this.getAccessToken();
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        if (token) {
            headers = headers.set('Authorization', `${this.getTokenType()} ${token}`);
        }

        return headers;
    }

    getMe(): Observable<ApiResponse<UserProfile>> {
        return this.http.get<ApiResponse<UserProfile>>(`${this.baseUrl}/me`, {
            headers: this.getHeaders()
        });
    }
}
