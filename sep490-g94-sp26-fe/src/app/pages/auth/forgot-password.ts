import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { StepperModule } from 'primeng/stepper';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';
import { AuthService } from '../service/auth.service';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        ButtonModule,
        InputTextModule,
        PasswordModule,
        MessageModule,
        StepperModule,
        AppFloatingConfigurator,
    ],
    template: `
        <app-floating-configurator />
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-16 px-8 sm:px-20" style="border-radius: 53px; min-width: 420px; max-width: 520px;">

                        <!-- Header -->
                        <div class="text-center mb-6">
                            <svg viewBox="0 0 54 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="mb-6 w-14 shrink-0 mx-auto">
                                <path fill-rule="evenodd" clip-rule="evenodd"
                                    d="M17.1637 19.2467C17.1566 19.4033 17.1529 19.561 17.1529 19.7194C17.1529 25.3503 21.7203 29.915 27.3546 29.915C32.9887 29.915 37.5561 25.3503 37.5561 19.7194C37.5561 19.5572 37.5524 19.3959 37.5449 19.2355C38.5617 19.0801 39.5759 18.9013 40.5867 18.6994L40.6926 18.6782C40.7191 19.0218 40.7326 19.369 40.7326 19.7194C40.7326 27.1036 34.743 33.0896 27.3546 33.0896C19.966 33.0896 13.9765 27.1036 13.9765 19.7194C13.9765 19.374 13.9896 19.0316 14.0154 18.6927L14.0486 18.6994C15.0837 18.9062 16.1223 19.0886 17.1637 19.2467Z"
                                    fill="var(--primary-color)" />
                            </svg>
                            <div class="text-surface-900 dark:text-surface-0 text-2xl font-bold mb-2">
                                Quên mật khẩu
                            </div>
                            <span class="text-muted-color text-sm">
                                {{ stepDescription }}
                            </span>
                        </div>

                        <!-- Step indicators -->
                        <div class="flex items-center justify-center gap-2 mb-6">
                            <div *ngFor="let s of [1,2,3]"
                                 class="flex items-center justify-center rounded-full text-sm font-bold transition-all duration-300"
                                 [style.width.px]="32" [style.height.px]="32"
                                 [ngClass]="{
                                     'bg-primary text-white shadow-md': s === step,
                                     'bg-green-500 text-white': s < step,
                                     'surface-200 text-500': s > step
                                 }">
                                <i *ngIf="s < step" class="pi pi-check text-xs"></i>
                                <span *ngIf="s >= step">{{ s }}</span>
                            </div>
                            <div *ngIf="false" class="w-8 h-0.5 surface-300"></div>
                        </div>

                        <!-- Messages -->
                        @if (errorMessage) {
                            <p-message severity="error" [text]="errorMessage" styleClass="w-full mb-4" />
                        }
                        @if (successMessage) {
                            <p-message severity="success" [text]="successMessage" styleClass="w-full mb-4" />
                        }

                        <!-- Step 1: Enter Email -->
                        @if (step === 1) {
                            <div>
                                <label for="fp-email" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-2">
                                    Email
                                </label>
                                <input
                                    pInputText
                                    id="fp-email"
                                    type="email"
                                    placeholder="Nhập email đã đăng ký"
                                    class="w-full mb-6"
                                    [(ngModel)]="email"
                                    (keyup.enter)="onSendOtp()"
                                    [disabled]="isLoading"
                                />
                                <p-button
                                    label="Gửi mã OTP"
                                    icon="pi pi-send"
                                    styleClass="w-full"
                                    [loading]="isLoading"
                                    (onClick)="onSendOtp()"
                                />
                            </div>
                        }

                        <!-- Step 2: Enter OTP -->
                        @if (step === 2) {
                            <div>
                                <div class="mb-4 p-3 border-round surface-100 dark:surface-800">
                                    <div class="flex items-center gap-2">
                                        <i class="pi pi-envelope text-primary"></i>
                                        <span class="text-sm text-700">{{ email }}</span>
                                    </div>
                                </div>
                                <label for="fp-otp" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-2">
                                    Mã OTP
                                </label>
                                <input
                                    pInputText
                                    id="fp-otp"
                                    type="text"
                                    placeholder="Nhập mã OTP 6 chữ số"
                                    class="w-full mb-2 text-center text-xl tracking-widest font-mono"
                                    [(ngModel)]="otp"
                                    maxlength="6"
                                    (keyup.enter)="onVerifyOtp()"
                                    [disabled]="isLoading"
                                />
                                <div class="flex justify-between items-center mb-6">
                                    <small class="text-muted-color">Mã có hiệu lực trong 5 phút</small>
                                    <a class="text-primary cursor-pointer text-sm font-medium no-underline"
                                       (click)="onResendOtp()"
                                       [class.pointer-events-none]="resendCooldown > 0"
                                       [class.text-400]="resendCooldown > 0">
                                        {{ resendCooldown > 0 ? 'Gửi lại (' + resendCooldown + 's)' : 'Gửi lại mã' }}
                                    </a>
                                </div>
                                <p-button
                                    label="Xác nhận OTP"
                                    icon="pi pi-check-circle"
                                    styleClass="w-full"
                                    [loading]="isLoading"
                                    (onClick)="onVerifyOtp()"
                                />
                            </div>
                        }

                        <!-- Step 3: New Password -->
                        @if (step === 3) {
                            <div>
                                <label for="fp-newpass" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-2">
                                    Mật khẩu mới
                                </label>
                                <p-password
                                    id="fp-newpass"
                                    [(ngModel)]="newPassword"
                                    placeholder="Nhập mật khẩu mới"
                                    [toggleMask]="true"
                                    styleClass="mb-4"
                                    [fluid]="true"
                                    [feedback]="true"
                                    (keyup.enter)="onResetPassword()"
                                />

                                <label for="fp-confirm" class="block text-surface-900 dark:text-surface-0 text-base font-medium mb-2">
                                    Xác nhận mật khẩu
                                </label>
                                <p-password
                                    id="fp-confirm"
                                    [(ngModel)]="confirmPassword"
                                    placeholder="Nhập lại mật khẩu mới"
                                    [toggleMask]="true"
                                    styleClass="mb-6"
                                    [fluid]="true"
                                    [feedback]="false"
                                    (keyup.enter)="onResetPassword()"
                                />

                                <p-button
                                    label="Đặt lại mật khẩu"
                                    icon="pi pi-lock"
                                    styleClass="w-full"
                                    [loading]="isLoading"
                                    (onClick)="onResetPassword()"
                                />
                            </div>
                        }

                        <!-- Step 4: Success -->
                        @if (step === 4) {
                            <div class="text-center">
                                <div class="flex items-center justify-center mx-auto mb-4 border-circle"
                                     style="width: 64px; height: 64px; background: linear-gradient(135deg, #22c55e, #16a34a);">
                                    <i class="pi pi-check text-white text-3xl"></i>
                                </div>
                                <h3 class="text-surface-900 dark:text-surface-0 font-bold text-xl mb-2">
                                    Đặt lại mật khẩu thành công!
                                </h3>
                                <p class="text-muted-color text-sm mb-6">
                                    Mật khẩu của bạn đã được cập nhật. Hãy đăng nhập với mật khẩu mới.
                                </p>
                                <p-button
                                    label="Đăng nhập ngay"
                                    icon="pi pi-sign-in"
                                    styleClass="w-full"
                                    (onClick)="goToLogin()"
                                />
                            </div>
                        }

                        <!-- Back to login link -->
                        @if (step < 4) {
                            <div class="text-center mt-6">
                                <a routerLink="/auth/login"
                                   class="text-primary font-medium no-underline cursor-pointer flex items-center justify-center gap-2">
                                    <i class="pi pi-arrow-left text-sm"></i>
                                    Quay lại đăng nhập
                                </a>
                            </div>
                        }

                    </div>
                </div>
            </div>
        </div>
    `
})
export class ForgotPassword {
    step = 1;
    email = '';
    otp = '';
    newPassword = '';
    confirmPassword = '';
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    resendCooldown = 0;
    private cooldownInterval: any = null;

    constructor(
        private authService: AuthService,
        private router: Router,
        private cdr: ChangeDetectorRef
    ) {}

    get stepDescription(): string {
        switch (this.step) {
            case 1: return 'Nhập email để nhận mã xác thực';
            case 2: return 'Nhập mã OTP đã gửi đến email của bạn';
            case 3: return 'Tạo mật khẩu mới cho tài khoản';
            case 4: return '';
            default: return '';
        }
    }

    onSendOtp(): void {
        if (!this.email || !this.email.trim()) {
            this.errorMessage = 'Vui lòng nhập email.';
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.email)) {
            this.errorMessage = 'Email không hợp lệ.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.sendOtp(this.email).subscribe({
            next: () => {
                this.isLoading = false;
                this.successMessage = 'Mã OTP đã được gửi đến email của bạn.';
                this.step = 2;
                this.startResendCooldown();
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại email.';
                this.cdr.markForCheck();
            }
        });
    }

    onResendOtp(): void {
        if (this.resendCooldown > 0) return;

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.sendOtp(this.email).subscribe({
            next: () => {
                this.isLoading = false;
                this.successMessage = 'Mã OTP mới đã được gửi.';
                this.startResendCooldown();
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.isLoading = false;
                this.errorMessage = err.error?.message || 'Không thể gửi lại mã OTP.';
                this.cdr.markForCheck();
            }
        });
    }

    onVerifyOtp(): void {
        if (!this.otp || this.otp.trim().length !== 6) {
            this.errorMessage = 'Vui lòng nhập mã OTP 6 chữ số.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.verifyOtp(this.email, this.otp).subscribe({
            next: () => {
                this.isLoading = false;
                this.successMessage = 'Xác thực OTP thành công!';
                this.step = 3;
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.isLoading = false;
                const code = err.error?.code;
                if (code === 1010) {
                    this.errorMessage = 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.';
                } else if (code === 1011) {
                    this.errorMessage = 'Mã OTP không chính xác. Vui lòng thử lại.';
                } else {
                    this.errorMessage = err.error?.message || 'Xác thực OTP thất bại.';
                }
                this.cdr.markForCheck();
            }
        });
    }

    onResetPassword(): void {
        if (!this.newPassword || this.newPassword.length < 6) {
            this.errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự.';
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.errorMessage = 'Mật khẩu xác nhận không khớp.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.resetPassword(this.email, this.newPassword).subscribe({
            next: () => {
                this.isLoading = false;
                this.step = 4;
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.isLoading = false;
                const code = err.error?.code;
                if (code === 1012) {
                    this.errorMessage = 'OTP chưa được xác minh. Vui lòng quay lại bước trước.';
                } else {
                    this.errorMessage = err.error?.message || 'Đặt lại mật khẩu thất bại.';
                }
                this.cdr.markForCheck();
            }
        });
    }

    goToLogin(): void {
        this.router.navigate(['/auth/login']);
    }

    private startResendCooldown(): void {
        this.resendCooldown = 60;
        if (this.cooldownInterval) {
            clearInterval(this.cooldownInterval);
        }
        this.cooldownInterval = setInterval(() => {
            this.resendCooldown--;
            if (this.resendCooldown <= 0) {
                clearInterval(this.cooldownInterval);
                this.cooldownInterval = null;
            }
            this.cdr.markForCheck();
        }, 1000);
    }
}
