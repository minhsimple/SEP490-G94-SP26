import { Injectable } from '@angular/core';

export interface User {
    id?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    role?: string;
    status?: string;
    createdDate?: string;
    password?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {
    getUsers() {
        return Promise.resolve<User[]>([
            {
                id: '1',
                fullName: 'Test User',
                email: 'test@gmail.com',
                phone: '0901234567',
                role: 'Quản trị viên',
                status: 'ACTIVE',
                createdDate: '04/02/2026'
            },
            {
                id: '2',
                fullName: 'Toàn',
                email: 'toantit74@gmail.com',
                phone: '0987654321',
                role: 'Quản trị viên',
                status: 'ACTIVE',
                createdDate: '04/02/2026'
            },
            {
                id: '3',
                fullName: 'Nguyễn Văn A',
                email: 'nguyenvana@gmail.com',
                phone: '0912345678',
                role: 'Kinh doanh',
                status: 'INACTIVE',
                createdDate: '03/02/2026'
            },
            {
                id: '4',
                fullName: 'Trần Thị B',
                email: 'tranthib@gmail.com',
                phone: '0923456789',
                role: 'Nhân viên',
                status: 'ACTIVE',
                createdDate: '02/02/2026'
            },
            {
                id: '5',
                fullName: 'Lê Văn C',
                email: 'levanc@gmail.com',
                phone: '0934567890',
                role: 'Kinh doanh',
                status: 'ACTIVE',
                createdDate: '01/02/2026'
            }
        ]);
    }
}