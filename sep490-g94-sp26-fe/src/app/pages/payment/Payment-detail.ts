import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Payment, PaymentService } from '../service/payment.service';
import { Invoice, InvoiceService } from '../service/invoice.service';
import { BookingService } from '../service/booking.service';
import { CustomerService } from '../service/customer.service';
import { catchError, finalize, map, of } from 'rxjs';

@Component({
    selector: 'app-payment-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, SelectModule, ToastModule],
    providers: [MessageService, PaymentService, InvoiceService, BookingService, CustomerService],
    template: `
        <p-toast />

        <div *ngIf="loading" class="flex items-center justify-center py-16">
            <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
        </div>

        <ng-container *ngIf="!loading && payment">
            <div class="page-header">
                <div class="header-left">
                    <p-button icon="pi pi-arrow-left" [text]="true" severity="secondary" (onClick)="goBack()" />
                    <div>
                        <div class="title">{{ payment.code ?? ('#' + payment.id) }}</div>
                        <div class="subtitle">Cập nhật: {{ formatDateTime(payment.updatedAt || payment.paidAt || payment.paymentDate) }}</div>
                    </div>
                </div>
                <span
                    class="status-chip"
                    [style.background]="getStatusBg(payment.paymentState || payment.status)"
                    [style.color]="getStatusColor(payment.paymentState || payment.status)"
                >
                    {{ getStatusLabel(payment.paymentState || payment.status) }}
                </span>
            </div>

            <div class="layout">
                <div class="section">
                    <div class="section-title">Thông tin thanh toán</div>
                    <div class="info-row">
                        <span class="label">Mã thanh toán</span>
                        <span class="val">{{ payment.code ?? ('#' + payment.id) }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Số tiền</span>
                        <span class="val amount">{{ formatPrice(payment.amount) }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Phương thức</span>
                        <span class="val">{{ getMethodLabel(payment.method) }}</span>
                    </div>
                    <div class="info-row" *ngIf="payment.methodNote">
                        <span class="label">Ghi chú phương thức</span>
                        <span class="val">{{ payment.methodNote }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Ngày thanh toán</span>
                        <span class="val">{{ formatDateTime(payment.paidAt || payment.paymentDate) }}</span>
                    </div>
                    <div class="info-row" *ngIf="payment.note">
                        <span class="label">Ghi chú</span>
                        <span class="val">{{ payment.note }}</span>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Liên kết dữ liệu</div>
                    <div class="info-row">
                        <span class="label">Hợp đồng</span>
                        <span class="val">#{{ payment.contractId || '-' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Hóa đơn</span>
                        <span class="val link" *ngIf="payment.invoiceId" (click)="goToInvoice()">{{ payment.invoiceCode ?? ('#' + payment.invoiceId) }}</span>
                        <span class="val" *ngIf="!payment.invoiceId">-</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Khách hàng</span>
                        <span class="val">{{ payment.customerName || '-' }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Tạo lúc</span>
                        <span class="val">{{ formatDateTime(payment.createdAt) }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Cập nhật lúc</span>
                        <span class="val">{{ formatDateTime(payment.updatedAt) }}</span>
                    </div>
                </div>

                <div class="section" *ngIf="canProcessPayment(payment)">
                    <div class="section-title">Thao tác thanh toán</div>
                    <div class="text-600 text-sm mb-3">
                        Chọn phương thức để hoàn tất thanh toán.
                    </div>
                    <div class="flex gap-2 items-center flex-wrap">
                        <div style="min-width: 220px;">
                            <p-select
                                [options]="payMethodOptions"
                                [(ngModel)]="selectedPayMethod"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Chọn phương thức"
                                fluid
                            />
                        </div>
                        <p-button
                            label="Thanh toán"
                            icon="pi pi-check"
                            severity="primary"
                            [loading]="paying"
                            [disabled]="!selectedPayMethod"
                            (onClick)="processPayment()"
                        />
                    </div>
                    <small class="text-500 block mt-3" *ngIf="selectedPayMethod === 'BANK_TRANSFER'">
                        Chuyển khoản sẽ tạo link PayOS và chuyển hướng sang trang thanh toán.
                    </small>
                </div>
            </div>
        </ng-container>
    `,
    styles: [`
        .page-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 1.25rem;
            flex-wrap: wrap;
        }
        .header-left { display: flex; align-items: center; gap: 0.75rem; }
        .title { font-size: 1.35rem; font-weight: 700; color: #1e293b; }
        .subtitle { font-size: 0.84rem; color: #64748b; margin-top: 0.2rem; }
        .status-chip {
            display: inline-flex;
            align-items: center;
            font-size: 0.8rem;
            font-weight: 700;
            border-radius: 999px;
            padding: 0.35rem 0.9rem;
        }
        .layout {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1.2rem;
        }
        .section {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1.1rem 1.3rem;
        }
        .section-title {
            font-size: 1rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0 0 0.9rem;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            gap: 0.8rem;
            padding: 0.45rem 0;
            border-bottom: 1px dashed #e2e8f0;
        }
        .info-row:last-child { border-bottom: none; }
        .label { color: #64748b; font-size: 0.88rem; }
        .val { color: #1e293b; font-size: 0.9rem; font-weight: 600; text-align: right; }
        .val.amount { color: #0f766e; font-size: 1rem; }
        .val.link {
            color: var(--primary-color);
            cursor: pointer;
            text-decoration: underline;
            text-underline-offset: 2px;
        }
        @media (max-width: 900px) {
            .layout { grid-template-columns: 1fr; }
        }
    `]
})
export class PaymentDetailComponent implements OnInit {
    loading = false;
    paying = false;
    payment: Payment | null = null;
    returnUrl: string | null = null;
    selectedPayMethod: 'CASH' | 'BANK_TRANSFER' = 'CASH';
    payMethodOptions = [
        { label: 'Tiền mặt', value: 'CASH' },
        { label: 'Chuyển khoản', value: 'BANK_TRANSFER' },
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private paymentService: PaymentService,
        private invoiceService: InvoiceService,
        private bookingService: BookingService,
        private customerService: CustomerService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isFinite(id) || id <= 0) {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'ID thanh toán không hợp lệ', life: 3000 });
            this.goBack();
            return;
        }

        const navReturnUrl = String(history.state?.returnUrl ?? '').trim();
        if (navReturnUrl.startsWith('/pages/')) {
            this.returnUrl = navReturnUrl;
        }

        if (!this.returnUrl) {
            const from = String(this.route.snapshot.queryParamMap.get('from') ?? '').toLowerCase();
            const returnInvoiceId = Number(this.route.snapshot.queryParamMap.get('returnInvoiceId'));
            if (from === 'invoice' && Number.isFinite(returnInvoiceId) && returnInvoiceId > 0) {
                this.returnUrl = `/pages/invoice/${returnInvoiceId}`;
            }
        }

        const navPayment = (history.state?.payment ?? null) as Payment | null;
        if (navPayment?.id === id) {
            this.payment = navPayment;
            this.cdr.detectChanges();
        }

        this.loadPayment(id);
    }

    private loadPayment(id: number): void {
        this.loading = true;
        this.cdr.detectChanges();
        this.paymentService.getById(id).pipe(
            map((res) => res?.data as Payment),
            finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            })
        ).subscribe({
            next: (p) => this.enrichPayment(p),
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Không thể tải chi tiết thanh toán',
                    life: 3000
                });
                this.goBack();
            }
        });
    }

    private enrichPayment(raw: Payment): void {
        const contractId = Number(raw.contractId);
        if (!Number.isFinite(contractId) || contractId <= 0) {
            this.payment = raw;
            this.seedPaymentMethod(raw);
            this.cdr.detectChanges();
            return;
        }

        this.invoiceService.searchInvoices({ contractId, page: 0, size: 1, sort: 'id,DESC' }).pipe(
            map((res) => res?.data?.content?.[0] ?? null),
            catchError(() => of(null))
        ).subscribe((invoice: Invoice | null) => {
            this.bookingService.getById(contractId).pipe(
                map((res) => res?.data ?? null),
                catchError(() => of(null))
            ).subscribe((booking: any) => {
                const customerId = Number(raw.customerId ?? booking?.customerId ?? invoice?.customerId);
                if (!Number.isFinite(customerId) || customerId <= 0) {
                    this.payment = {
                        ...raw,
                        invoiceId: raw.invoiceId ?? invoice?.id,
                        invoiceCode: raw.invoiceCode ?? invoice?.code ?? invoice?.contractNo,
                        customerName: raw.customerName ?? invoice?.customerName ?? booking?.customerName,
                    };
                    this.seedPaymentMethod(this.payment);
                    this.cdr.detectChanges();
                    return;
                }

                this.customerService.getCustomerById(customerId).pipe(
                    map((res) => res?.data ?? null),
                    catchError(() => of(null))
                ).subscribe((customer) => {
                    this.payment = {
                        ...raw,
                        customerId,
                        invoiceId: raw.invoiceId ?? invoice?.id,
                        invoiceCode: raw.invoiceCode ?? invoice?.code ?? invoice?.contractNo,
                        customerName: raw.customerName ?? customer?.fullName ?? invoice?.customerName ?? booking?.customerName,
                    };
                    this.seedPaymentMethod(this.payment);
                    this.cdr.detectChanges();
                });
            });
        });
    }

    canProcessPayment(payment?: Payment | null): boolean {
        const state = String(payment?.paymentState ?? payment?.status ?? '').toUpperCase();
        return !!payment?.id && (state === 'PENDING' || state === 'FAILED' || state === '');
    }

    processPayment(): void {
        const paymentId = this.payment?.id;
        if (!paymentId || !this.payment?.contractId || !this.payment?.amount) {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Thiếu dữ liệu thanh toán', life: 3000 });
            return;
        }

        this.paying = true;
        this.cdr.detectChanges();

        this.paymentService.updatePayment(paymentId, {
            contractId: this.payment.contractId,
            amount: Number(this.payment.amount),
            method: this.selectedPayMethod,
            paymentState: this.selectedPayMethod === 'CASH' ? 'SUCCESS' : 'PENDING',
            referenceNo: this.payment.referenceNo,
            note: this.payment.note,
        }).subscribe({
            next: (res) => {
                const updated = res?.data;
                if (this.selectedPayMethod === 'BANK_TRANSFER') {
                    const returnUrl = `${window.location.origin}/pages/payment/${this.payment?.id}`;
                    const description = `Thanh toan ${updated?.code ?? '#' + this.payment?.id}`;
                    this.paymentService.createPayOSPaymentLink({
                        paymentId,
                        returnUrl,
                        cancelUrl: returnUrl,
                        description,
                    }).subscribe({
                        next: (payRes) => {
                            const checkoutUrl = payRes.data?.checkoutUrl;
                            if (!checkoutUrl) {
                                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không nhận được link thanh toán', life: 3000 });
                                this.paying = false;
                                this.cdr.detectChanges();
                                return;
                            }
                            window.location.href = checkoutUrl;
                        },
                        error: () => {
                            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tạo link PayOS', life: 3000 });
                            this.paying = false;
                            this.cdr.detectChanges();
                        }
                    });
                    return;
                }

                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã ghi nhận thanh toán tiền mặt', life: 3000 });
                this.loadPayment(paymentId);
                this.paying = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật thanh toán', life: 3000 });
                this.paying = false;
                this.cdr.detectChanges();
            }
        });
    }

    private seedPaymentMethod(payment?: Payment | null): void {
        const method = String(payment?.method ?? '').toUpperCase();
        this.selectedPayMethod = method === 'BANK_TRANSFER' ? 'BANK_TRANSFER' : 'CASH';
    }

    goBack(): void {
        if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
            return;
        }
        if (window.history.length > 1) {
            this.location.back();
            return;
        }
        this.router.navigate(['/pages/payment']);
    }

    goToInvoice(): void {
        if (this.payment?.invoiceId) {
            const backUrl = this.router.url;
            this.router.navigate(['/pages/invoice', this.payment.invoiceId], {
                state: { returnUrl: backUrl },
                queryParams: { returnUrl: backUrl }
            });
        }
    }

    formatPrice(v?: number): string {
        const n = Number(v ?? 0);
        return `${new Intl.NumberFormat('vi-VN').format(Number.isFinite(n) ? n : 0)} đ`;
    }

    formatDateTime(v?: string): string {
        if (!v) return '-';
        const d = new Date(v);
        if (Number.isNaN(d.getTime())) return '-';
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false,
        }).format(d);
    }

    getMethodLabel(m?: string): string {
        const map: Record<string, string> = {
            BANK_TRANSFER: 'Chuyển khoản',
            CASH: 'Tiền mặt',
            CREDIT_CARD: 'Thẻ tín dụng',
            E_WALLET: 'Ví điện tử',
        };
        return map[m ?? ''] ?? m ?? '-';
    }

    getStatusLabel(s?: string): string {
        const map: Record<string, string> = {
            SUCCESS: 'Thành công',
            PENDING: 'Chờ thanh toán',
            FAILED: 'Thất bại',
            CANCELLED: 'Đã huỷ',
        };
        return map[s ?? ''] ?? s ?? '-';
    }

    getStatusColor(s?: string): string {
        const map: Record<string, string> = {
            SUCCESS: '#ffffff',
            PENDING: '#1e293b',
            FAILED: '#991b1b',
            CANCELLED: '#dc2626',
        };
        return map[s ?? ''] ?? '#1e293b';
    }

    getStatusBg(s?: string): string {
        const map: Record<string, string> = {
            SUCCESS: '#2563eb',
            PENDING: '#e2e8f0',
            FAILED: '#fee2e2',
            CANCELLED: '#fee2e2',
        };
        return map[s ?? ''] ?? '#f1f5f9';
    }
}
