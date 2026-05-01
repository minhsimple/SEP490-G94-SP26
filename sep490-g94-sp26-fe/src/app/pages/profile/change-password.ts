import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../service/auth.service';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        PasswordModule,
        MessageModule,
    ],
    template: `
        <div class="p-6 max-w-2xl mx-auto w-full">
            <div class="mb-6">
                <h2 class="text-2xl font-bold flex items-center gap-2 m-0 text-color">
                    <i class="pi pi-lock text-primary text-2xl"></i> 
                    Đổi mật khẩu
                </h2>
            </div>
            
            <div class="bg-surface-0 dark:bg-surface-900 p-6 shadow rounded-2xl border border-surface-200 dark:border-surface-700">
                <div *ngIf="errorMessage" class="mb-4">
                    <p-message severity="error" [text]="errorMessage" styleClass="w-full"></p-message>
                </div>
                <div *ngIf="successMessage" class="mb-4">
                    <p-message severity="success" [text]="successMessage" styleClass="w-full"></p-message>
                </div>

                <div class="flex flex-col gap-6">
                    <div class="flex flex-col gap-2">
                        <label htmlFor="oldPassword" class="font-semibold text-color">Mật khẩu hiện tại</label>
                        <p-password
                            id="oldPassword"
                            [(ngModel)]="oldPassword"
                            placeholder="Nhập mật khẩu hiện tại"
                            [toggleMask]="true"
                            [feedback]="false"
                            [fluid]="true"
                        ></p-password>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label htmlFor="newPassword" class="font-semibold text-color">Mật khẩu mới</label>
                        <p-password
                            id="newPassword"
                            [(ngModel)]="newPassword"
                            placeholder="Nhập mật khẩu mới"
                            [toggleMask]="true"
                            [feedback]="true"
                            [fluid]="true"
                        ></p-password>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label htmlFor="confirmPassword" class="font-semibold text-color">Xác nhận mật khẩu mới</label>
                        <p-password
                            id="confirmPassword"
                            [(ngModel)]="confirmPassword"
                            placeholder="Nhập lại mật khẩu mới"
                            [toggleMask]="true"
                            [feedback]="false"
                            [fluid]="true"
                        ></p-password>
                    </div>

                    <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-surface-200 dark:border-surface-700">
                        <p-button label="Hủy" icon="pi pi-times" severity="secondary" [outlined]="true" (onClick)="cancel()"></p-button>
                        <p-button label="Lưu thay đổi" icon="pi pi-check" [loading]="isLoading" (onClick)="changePassword()"></p-button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class ChangePasswordComponent {
    oldPassword = '';
    newPassword = '';
    confirmPassword = '';
    
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    changePassword(): void {
        this.errorMessage = '';
        this.successMessage = '';

        if (!this.oldPassword) {
            this.errorMessage = 'Vui lòng nhập mật khẩu hiện tại.';
            return;
        }

        if (!this.newPassword || this.newPassword.length < 6) {
            this.errorMessage = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.errorMessage = 'Mật khẩu xác nhận không khớp.';
            return;
        }

        this.isLoading = true;

        this.authService.changePassword({
            oldPassword: this.oldPassword,
            newPassword: this.newPassword
        }).subscribe({
            next: () => {
                this.isLoading = false;
                this.successMessage = 'Đổi mật khẩu thành công!';
                this.oldPassword = '';
                this.newPassword = '';
                this.confirmPassword = '';
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.isLoading = false;
                // You can add specific handling for invalid old password if your backend returns a distinct error code
                this.errorMessage = err.error?.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.';
                this.cdr.markForCheck();
            }
        });
    }

    cancel(): void {
        this.router.navigate(['/']);
    }
}
