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
    locationId: number;
    status: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private baseUrl = 'http://localhost:8080/api/v1/auth';

    // Subject phát ra codeRole mỗi khi login/logout
    private codeRoleSubject = new BehaviorSubject<string>(
        localStorage.getItem('codeRole') ?? ''
    );
    codeRole$ = this.codeRoleSubject.asObservable();

    constructor(private http: HttpClient) {}

    setCodeRole(codeRole: string): void {
        localStorage.setItem('codeRole', codeRole);
        this.codeRoleSubject.next(codeRole);
    }

    clearAuth(): void {
        localStorage.clear();
        this.codeRoleSubject.next('');
    }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('accessToken');
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    getMe(): Observable<ApiResponse<UserProfile>> {
        return this.http.get<ApiResponse<UserProfile>>(`${this.baseUrl}/me`, {
            headers: this.getHeaders()
        });
    }
}