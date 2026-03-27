import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Booking, BookingService } from '../service/booking.service';
import { Customer, CustomerService } from '../service/customer.service';
import { HallService } from '../service/hall.service';
import { SetMenuService } from '../service/set-menu';
import { ServicePackageService } from '../service/service-package.service';

@Component({
    selector: 'app-booking-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, SelectModule, ToastModule],
    providers: [BookingService, MessageService],
    styles: [`
        .page-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0;
        }
        .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 0.75rem;
        }
        .hero {
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            background: #ffffff;
            padding: 1rem 1.1rem;
            margin-bottom: 1rem;
        }
        .hero-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            flex-wrap: wrap;
        }
        .hero-left {
            display: flex;
            gap: 0.75rem;
            align-items: flex-start;
        }
        .booking-no {
            margin-top: 0.35rem;
            font-size: 1.35rem;
            font-weight: 700;
            color: #1e293b;
            letter-spacing: 0.02em;
        }
        .couple-line {
            margin-top: 0.2rem;
            font-weight: 500;
            color: #64748b;
        }
        .hero-right {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.35rem;
            text-align: left;
        }
        .state-edit {
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .state-select {
            min-width: 210px;
        }
        .layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 320px;
            gap: 1.25rem;
            align-items: start;
        }
        .card {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1.25rem;
        }
        .section-title {
            font-size: 1.05rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 1rem;
        }
        .muted {
            color: #64748b;
        }
        .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.85rem 1rem;
        }
        .meta-row {
            display: flex;
            align-items: flex-start;
            gap: 0.65rem;
        }
        .meta-icon {
            width: 2rem;
            height: 2rem;
            border-radius: 8px;
            background: #f1f5f9;
            color: #64748b;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.95rem;
            flex: 0 0 2rem;
        }
        .value {
            color: #1e293b;
            font-weight: 600;
        }
        .chip {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 700;
            border-radius: 999px;
            padding: 0.32rem 0.7rem;
        }
        .line {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0.55rem 0;
            color: #334155;
        }
        .line strong {
            color: #1e293b;
        }
        .line.total {
            border-top: 1px solid #dbe2ea;
            margin-top: 0.8rem;
            padding-top: 0.8rem;
            font-size: 1.35rem;
            font-weight: 700;
        }
        .progress {
            height: 8px;
            border-radius: 999px;
            background: #e2e8f0;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: #16a34a;
        }
        .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.85rem;
            margin-top: 0.65rem;
        }
        .contract-shell {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #ffffff;
            overflow: hidden;
            padding: 1rem;
        }
        .contract-summary {
            color: #64748b;
            margin-bottom: 0.75rem;
            font-size: 0.9rem;
        }
        .contract-actions {
            display: flex;
            gap: 0.6rem;
            flex-wrap: nowrap;
            align-items: center;
            overflow-x: auto;
            
        }
        .contract-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.5);
            display: flex;
            align-items: flex-start;
            justify-content: center;
            z-index: 1200;
            padding: 1rem;
        }
        .contract-modal {
            width: min(95vw, 980px);
            max-height: calc(100vh - 2rem);
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #cbd5e1;
            box-shadow: 0 24px 48px rgba(15, 23, 42, 0.35);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .contract-modal-header {
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            padding: 0.8rem 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            flex-wrap: wrap;
        }
        .contract-modal-title {
            font-size: 0.95rem;
            font-weight: 600;
            color: #0f172a;
        }
        .contract-toolbar {
            display: flex;
            align-items: center;
            gap: 0.45rem;
            flex-wrap: wrap;
        }
        .contract-content {
            padding: 1rem;
            overflow: auto;
            background: #e2e8f0;
            display: flex;
            justify-content: center;
        }
        .contract-zoom-wrap {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }
        .contract-paper {
            width: 210mm;
            min-height: 297mm;
            background: #fff;
            border: 1px solid #dbe2ea;
            padding: 18mm 16mm;
            box-sizing: border-box;
            transition: transform 0.16s ease;
        }
        .contract-paper table {
            width: 100%;
            border-collapse: collapse;
        }
        .contract-paper td,
        .contract-paper th {
            border: 1px solid #d1d5db;
            padding: 6px;
            vertical-align: top;
        }
        .contract-paper p {
            margin: 0 0 6px;
            line-height: 1.45;
            font-size: 10pt;
        }
        @media (max-width: 992px) {
            .layout {
                grid-template-columns: 1fr;
            }
            .meta-grid,
            .detail-grid {
                grid-template-columns: 1fr;
            }
            .hero-right {
                width: 100%;
                align-items: flex-start;
                text-align: left;
            }
            .state-select {
                min-width: 0;
                width: 100%;
            }
            .contract-modal {
                width: 100%;
                max-height: calc(100vh - 1rem);
            }
            .contract-paper {
                width: 100%;
                min-height: auto;
                padding: 1rem;
            }
        }
    `],
    template: `
        <p-toast />

        <div class="card" *ngIf="loading" style="text-align:center; color:#64748b">
            Đang tải thông tin đặt tiệc...
        </div>

        <ng-container *ngIf="!loading && booking">
            <div class="page-header">
                <h1 class="page-title">Chi tiết đặt tiệc</h1>
            </div>

            <div class="hero">
                <div class="hero-top">
                    <div class="hero-left">
                        <p-button icon="pi pi-arrow-left" [text]="true" severity="secondary" (onClick)="goBack()" />
                        <div>
                            <div class="booking-no">{{ booking.contractNo || booking.bookingNo || ('BK-' + booking.id) }}</div>
                            <div class="couple-line">
                                {{ booking.brideName || '-' }} & {{ booking.groomName || '-' }}
                            </div>
                        </div>
                    </div>
                    <div class="hero-right">
                        <div class="muted">Trạng thái xử lý</div>
                        <div class="state-edit">
                            <p-select
                                class="state-select"
                                [options]="bookingStateOptions"
                                [(ngModel)]="selectedBookingState"
                                optionLabel="label"
                                optionValue="value"
                            />
                            <p-button
                                icon="pi pi-check"
                                severity="secondary"
                                [loading]="stateSubmitting"
                                (onClick)="saveBookingState()"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="layout">
                <div>
                    <div class="card" style="margin-bottom:1rem">
                        <h2 class="section-title">Thông tin tiệc cưới</h2>
                        <div class="meta-grid">
                            <div class="meta-row">
                                <div class="meta-icon"><i class="pi pi-building"></i></div>
                                <div>
                                    <div class="muted">Sảnh cưới</div>
                                    <div class="value">{{ hallName || ('Sảnh #' + (booking.hallId || '-')) }}</div>
                                </div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-icon"><i class="pi pi-calendar"></i></div>
                                <div>
                                    <div class="muted">Ngày tổ chức</div>
                                    <div class="value">{{ formatDate(booking.bookingDate) }} - {{ shiftLabel(booking.bookingTime) }}</div>
                                </div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-icon"><i class="pi pi-table"></i></div>
                                <div>
                                    <div class="muted">Số bàn</div>
                                    <div class="value">{{ booking.expectedTables || '-' }} bàn</div>
                                </div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-icon"><i class="pi pi-users"></i></div>
                                <div>
                                    <div class="muted">Số khách dự kiến</div>
                                    <div class="value">{{ booking.expectedGuests || '-' }} khách</div>
                                </div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-icon"><i class="pi pi-list"></i></div>
                                <div>
                                    <div class="muted">Set menu</div>
                                    <div class="value">{{ setMenuName || (booking.setMenuId ? ('Set menu #' + booking.setMenuId) : '-') }}</div>
                                    <div class="muted" *ngIf="setMenuPrice > 0" style="margin-top:0.2rem">{{ formatPrice(setMenuPrice) }}/bàn</div>
                                </div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-icon"><i class="pi pi-briefcase"></i></div>
                                <div>
                                    <div class="muted">Gói dịch vụ</div>
                                    <div class="value">{{ packageName || (booking.packageId ? ('Gói dịch vụ #' + booking.packageId) : '-') }}</div>
                                    <div class="muted" *ngIf="packagePrice > 0" style="margin-top:0.2rem">{{ formatPrice(packagePrice) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card" style="margin-bottom:1rem">
                        <h2 class="section-title">Thông tin khách hàng</h2>
                        <div class="muted">Người liên hệ</div>
                        <div class="value" style="margin-top:0.35rem; font-size:1.2rem">{{ customerName || ('Khách hàng #' + (booking.customerId || '-')) }}</div>
                        <div style="margin-top:0.65rem" class="muted" *ngIf="customer?.phone"><i class="pi pi-phone"></i> {{ customer?.phone }}</div>
                        <div style="margin-top:0.35rem" class="muted" *ngIf="customer?.email"><i class="pi pi-envelope"></i> {{ customer?.email }}</div>

                        <div style="border-top:1px solid #e2e8f0; margin:1rem 0"></div>

                        <div class="detail-grid">
                            <div>
                                <div class="muted">Chú rể</div>
                                <div class="value" style="margin-top:0.3rem">{{ booking.groomName || '-' }}</div>
                            </div>
                            <div>
                                <div class="muted">Cô dâu</div>
                                <div class="value" style="margin-top:0.3rem">{{ booking.brideName || '-' }}</div>
                            </div>
                        </div>

                        <div style="border-top:1px solid #e2e8f0; margin:1rem 0"></div>

                        <div class="muted">Địa chỉ</div>
                        <div class="value" style="margin-top:0.3rem; font-weight:500">{{ customer?.address || '-' }}</div>
                    </div>

                    <div class="card">
                        <h2 class="section-title">Lịch sử thanh toán</h2>
                        <div class="muted">Các đợt thanh toán đã ghi nhận</div>
                        <div style="padding:2rem 0; text-align:center" class="muted">Chưa có thanh toán nào</div>
                    </div>
                </div>

                <div>
                    <div class="card" style="margin-bottom:1rem">
                        <h2 class="section-title">Tổng quan thanh toán</h2>
                        <div class="line" *ngIf="setMenuName || booking.setMenuId"><span>Set menu</span><strong>{{ setMenuName || ('#' + booking.setMenuId) }}</strong></div>
                        <div class="line" *ngIf="setMenuPrice > 0"><span>Giá set menu</span><strong>{{ formatPrice(setMenuPrice) }}/bàn</strong></div>
                        <div class="line" *ngIf="packageName || booking.packageId"><span>Gói dịch vụ</span><strong>{{ packageName || ('#' + booking.packageId) }}</strong></div>
                        <div class="line" *ngIf="packagePrice > 0"><span>Giá gói dịch vụ</span><strong>{{ formatPrice(packagePrice) }}</strong></div>
                        <div class="line"><span>Tổng tiền</span><strong>{{ formatPrice(totalAmount) }}</strong></div>
                        <div class="line" style="color:#16a34a"><span>Đã thanh toán</span><strong style="color:#16a34a">{{ formatPrice(paidAmount) }}</strong></div>
                        <div class="line total"><span>Còn lại</span><strong>{{ formatPrice(remainingAmount) }}</strong></div>
                        <div class="line" style="margin-top:0.8rem"><span>Tiến độ</span><strong>{{ progressPercent }}%</strong></div>
                        <div class="progress"><div class="progress-fill" [style.width.%]="progressPercent"></div></div>
                    </div>

                    <div class="card">
                        <h2 class="section-title">Hợp đồng</h2>
                        <div class="contract-shell">
                            <div class="contract-summary">Xem hợp đồng đã điền thông tin đặt tiệc theo khổ giấy A4.</div>
                            <div class="contract-actions">
                                <p-button label="Xem hợp đồng" icon="pi pi-file" (onClick)="openContractDialog()" />
                                <p-button label="In hợp đồng" icon="pi pi-print" severity="secondary" (onClick)="printContract()" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="contract-overlay" *ngIf="contractDialogVisible" (click)="closeContractDialog()">
                <div class="contract-modal" (click)="$event.stopPropagation()">
                    <div class="contract-modal-header">
                        <div class="contract-modal-title">Hợp đồng dịch vụ - Khổ A4</div>
                        <div class="contract-toolbar">
                            <span class="muted" style="font-size:0.82rem">Zoom: {{ zoomPercent }}%</span>
                            <p-button icon="pi pi-search-minus" [rounded]="true" [text]="true" severity="secondary" (onClick)="zoomOut()" />
                            <p-button icon="pi pi-search-plus" [rounded]="true" [text]="true" severity="secondary" (onClick)="zoomIn()" />
                            <p-button label="100%" [text]="true" severity="secondary" (onClick)="resetZoom()" />
                            <p-button icon="pi pi-print" label="In" severity="secondary" [text]="true" (onClick)="printContract()" />
                            <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="secondary" (onClick)="closeContractDialog()" />
                        </div>
                    </div>
                    <div class="contract-content">
                        <div class="contract-zoom-wrap">
                            <div
                                class="contract-paper"
                                [style.transform]="'scale(' + contractZoom + ')'"
                                [style.transformOrigin]="'top center'"
                                [innerHTML]="contractPreviewHtml"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    `,
})
export class BookingDetailComponent implements OnInit {
    loading = false;
    booking: Booking | null = null;
    customer: Customer | null = null;
    customerName = '';
    hallName = '';
    setMenuName = '';
    setMenuPrice = 0;
    packageName = '';
    packagePrice = 0;

    apiTotalAmount = 0;
    totalAmount = 0;
    paidAmount = 0;
    remainingAmount = 0;
    progressPercent = 0;
    stateSubmitting = false;
    selectedBookingState = 'ACTIVE';
    contractPreviewHtml: SafeHtml = '';
    contractPreviewRawHtml = '';
    contractDialogVisible = false;
    contractZoom = 1;
    zoomPercent = 100;
    bookingStateOptions = [
        { label: 'Đang hiệu lực', value: 'ACTIVE' },
        { label: 'Ngưng hiệu lực', value: 'INACTIVE' },
        { label: 'Nháp', value: 'DRAFT' },
        { label: 'Hết hạn', value: 'EXPIRED' },
        { label: 'Đã duyệt', value: 'APPROVED' },
        { label: 'Chưa duyệt', value: 'UNAPPROVED' },
        { label: 'Đã hủy', value: 'CANCELLED' },
        { label: 'Đã chuyển đổi', value: 'CONVERTED' },
    ];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private bookingService: BookingService,
        private customerService: CustomerService,
        private hallService: HallService,
        private setMenuService: SetMenuService,
        private servicePackageService: ServicePackageService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
    ) {}

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isFinite(id) || id <= 0) {
            this.goBack();
            return;
        }

        this.loadDetail(id);
    }

    loadDetail(id: number) {
        this.loading = true;
        this.cdr.detectChanges();
        this.bookingService.getById(id).subscribe({
            next: (res) => {
                this.booking = res.data;
                this.selectedBookingState = this.booking?.contractState ?? this.booking?.bookingState ?? 'ACTIVE';

                if (this.booking?.customerId) {
                    this.loadCustomer(this.booking.customerId);
                }
                if (this.booking?.hallId) {
                    this.loadHall(this.booking.hallId);
                }
                if (this.booking?.setMenuId) {
                    this.loadSetMenu(this.booking.setMenuId);
                }
                if (this.booking?.packageId) {
                    this.loadPackage(this.booking.packageId);
                }

                const rawTotal = Number((this.booking as any)?.totalAmount ?? (this.booking as any)?.totalPrice ?? (this.booking as any)?.finalAmount ?? (this.booking as any)?.amount ?? 0);
                const rawPaid = Number((this.booking as any)?.paidAmount ?? 0);
                this.apiTotalAmount = Number.isFinite(rawTotal) ? rawTotal : 0;
                this.paidAmount = Number.isFinite(rawPaid) ? rawPaid : 0;
                this.recalculatePaymentSummary();
                this.updateContractPreview();

                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.cdr.detectChanges();
                this.goBack();
            },
        });
    }

    saveBookingState() {
        if (!this.booking?.id) {
            return;
        }

        this.stateSubmitting = true;
        this.bookingService.updateState({
            contractId: this.booking.id,
            contractState: this.selectedBookingState,
        }).subscribe({
            next: (res) => {
                this.stateSubmitting = false;
                if (this.booking) {
                    this.booking.contractState = res.data?.contractState ?? res.data?.bookingState ?? this.selectedBookingState;
                    this.selectedBookingState = this.booking.contractState ?? this.selectedBookingState;
                }
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Đã cập nhật trạng thái xử lý',
                    life: 3000,
                });
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.stateSubmitting = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: err?.error?.message ?? 'Không thể cập nhật trạng thái xử lý',
                    life: 4000,
                });
                this.cdr.detectChanges();
            },
        });
    }

    private loadCustomer(customerId: number) {
        this.customerService.getCustomerById(customerId).subscribe({
            next: (res) => {
                this.customer = res.data;
                this.customerName = res.data?.fullName ?? '';
                this.updateContractPreview();
                this.cdr.detectChanges();
            },
            error: () => {
                this.cdr.detectChanges();
            },
        });
    }

    private loadHall(hallId: number) {
        this.hallService.getHallById(hallId).subscribe({
            next: (res) => {
                this.hallName = res.data?.name ?? '';
                this.updateContractPreview();
                this.cdr.detectChanges();
            },
            error: () => {
                this.cdr.detectChanges();
            },
        });
    }

    private loadSetMenu(setMenuId: number) {
        this.setMenuService.getById(setMenuId).subscribe({
            next: (res) => {
                this.setMenuName = res.data?.name ?? '';
                const price = Number((res.data as any)?.setPrice ?? (res.data as any)?.pricePerTable ?? (res.data as any)?.price ?? 0);
                this.setMenuPrice = Number.isFinite(price) ? price : 0;
                this.recalculatePaymentSummary();
                this.cdr.detectChanges();
            },
            error: () => {
                this.cdr.detectChanges();
            },
        });
    }

    private loadPackage(packageId: number) {
        this.servicePackageService.getById(packageId).subscribe({
            next: (res) => {
                this.packageName = res.data?.name ?? '';
                const price = Number(res.data?.basePrice ?? 0);
                this.packagePrice = Number.isFinite(price) ? price : 0;
                this.recalculatePaymentSummary();
                this.updateContractPreview();
                this.cdr.detectChanges();
            },
            error: () => {
                this.cdr.detectChanges();
            },
        });
    }

    private recalculatePaymentSummary() {
        if (!this.booking) {
            this.totalAmount = 0;
            this.remainingAmount = 0;
            this.progressPercent = 0;
            return;
        }

        const tables = Number(this.booking.expectedTables ?? this.booking.tableCount ?? 0);
        const computedTotal = Number.isFinite(tables) && tables > 0
            ? (this.setMenuPrice * tables) + this.packagePrice
            : 0;

        this.totalAmount = computedTotal > 0 ? computedTotal : this.apiTotalAmount;

        this.remainingAmount = Math.max(this.totalAmount - this.paidAmount, 0);
        this.progressPercent = this.totalAmount > 0
            ? Math.min(100, Math.max(0, Math.round((this.paidAmount / this.totalAmount) * 100)))
            : 0;

        this.updateContractPreview();
    }

    private updateContractPreview() {
        this.contractPreviewRawHtml = this.buildContractHtml();
        this.contractPreviewHtml = this.sanitizer.bypassSecurityTrustHtml(this.contractPreviewRawHtml);
    }

    private buildContractHtml(): string {
        if (!this.booking) {
            return '<p style="text-align:center; color:#64748b">Chưa có dữ liệu hợp đồng</p>';
        }

        const esc = (value?: string | number | null) => {
            const raw = String(value ?? '-');
            return raw
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };

        const bookingDate = this.formatDate(this.booking.bookingDate ?? this.booking.eventDate);
        const signDate = this.formatDate(this.booking.updatedAt ?? this.booking.bookingDate ?? this.booking.eventDate);
        const contractNo = this.booking.contractNo || this.booking.bookingNo || `HD-${this.booking.id}`;
        const groomName = this.booking.groomName || '-';
        const brideName = this.booking.brideName || '-';
        const customerName = this.customer?.fullName || this.customerName || '-';
        const customerPhone = this.customer?.phone || '-';
        const customerEmail = this.customer?.email || '-';
        const customerAddress = this.customer?.address || '-';
        const hallName = this.hallName || (this.booking.hallId ? `Sảnh #${this.booking.hallId}` : '-');
        const tables = Number(this.booking.expectedTables ?? this.booking.tableCount ?? 0);
        const guests = Number(this.booking.expectedGuests ?? this.booking.guestCount ?? 0);
        const amount = this.totalAmount > 0 ? this.totalAmount : this.apiTotalAmount;
        const deposit1 = Math.round(amount * 0.3);
        const deposit2 = Math.round(amount * 0.4);
        const deposit3 = Math.max(amount - deposit1 - deposit2, 0);

        return `
            <p style="text-align:center; margin:0; font-size:10pt">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p style="text-align:center; margin:0; font-size:10pt">Độc Lập - Tự Do - Hạnh Phúc</p>
            <p style="text-align:center; margin:8px 0 0; font-size:16pt"><strong>HỢP ĐỒNG DỊCH VỤ</strong></p>
            <p style="text-align:center; margin:4px 0 10px; font-size:10pt">Số: <span style="color:#dc2626">${esc(contractNo)}</span></p>

            <p>Hợp đồng được lập ngày <span style="color:#dc2626">${esc(signDate)}</span>, gồm có:</p>

            <p><strong>BÊN SỬ DỤNG DỊCH VỤ (BÊN A)</strong></p>
            <p><strong>Ông/Bà:</strong> <span style="color:#dc2626">${esc(customerName)}</span></p>

            <table>
                <tr>
                    <td><strong>CÔ DÂU: ${esc(brideName)}</strong></td>
                    <td><strong>CHÚ RỂ: ${esc(groomName)}</strong></td>
                </tr>
                <tr>
                    <td>
                        <p><strong>Địa chỉ:</strong> ${esc(customerAddress)}</p>
                        <p><strong>Số điện thoại:</strong> ${esc(customerPhone)}</p>
                        <p><strong>Email:</strong> ${esc(customerEmail)}</p>
                    </td>
                    <td>
                        <p><strong>Ngày tổ chức:</strong> ${esc(bookingDate)}</p>
                        <p><strong>Sảnh:</strong> ${esc(hallName)}</p>
                        <p><strong>Ca tiệc:</strong> ${esc(this.shiftLabel(this.booking.bookingTime ?? this.booking.shift))}</p>
                    </td>
                </tr>
            </table>

            <p style="margin-top:10px"><strong>BÊN CUNG CẤP DỊCH VỤ CƯỚI (BÊN B)</strong></p>
            <p><strong>Đơn vị:</strong> WEDDINGLINK</p>

            <p style="margin-top:10px"><strong>ĐIỀU I: NỘI DUNG CÔNG VIỆC</strong></p>
            <p>Bên B cung cấp dịch vụ tiệc cưới theo phụ lục đính kèm cho sự kiện của Bên A.</p>

            <p><strong>ĐIỀU II: GIÁ TRỊ HỢP ĐỒNG VÀ THANH TOÁN</strong></p>
            <p><strong>Tổng giá trị hợp đồng:</strong> <span style="color:#dc2626">${esc(this.formatPrice(amount))}</span></p>
            <p><strong>Số bàn dự kiến:</strong> ${esc(tables > 0 ? `${tables} bàn` : '-')}</p>
            <p><strong>Số khách dự kiến:</strong> ${esc(guests > 0 ? `${guests} khách` : '-')}</p>
            <p><strong>Đợt 1 (đặt cọc):</strong> ${esc(this.formatPrice(deposit1))}</p>
            <p><strong>Đợt 2:</strong> ${esc(this.formatPrice(deposit2))}</p>
            <p><strong>Đợt 3:</strong> ${esc(this.formatPrice(deposit3))}</p>

            <p><strong>ĐIỀU III: TRÁCH NHIỆM HAI BÊN</strong></p>
            <p>Hai bên cam kết thực hiện đúng nội dung đã thỏa thuận trong hợp đồng và phụ lục.</p>

            <p><strong>ĐIỀU IV: THAY ĐỔI HỢP ĐỒNG</strong></p>
            <p>Mọi thay đổi phải được hai bên thống nhất bằng văn bản và có thể làm thay đổi giá trị hợp đồng.</p>

            <p><strong>ĐIỀU V: ĐIỀU KHOẢN CHUNG</strong></p>
            <p>Hợp đồng có hiệu lực từ ngày ký đến khi hai bên hoàn tất trách nhiệm.</p>

            <table style="margin-top:20px; border:none; width:100%">
                <tr>
                    <td style="width:50%; border:none; text-align:center; vertical-align:top">
                        <p><strong>ĐẠI DIỆN BÊN A</strong></p>
                    </td>
                    <td style="width:50%; border:none; text-align:center; vertical-align:top">
                        <p><strong>ĐẠI DIỆN BÊN B</strong></p>
                    </td>
                </tr>
                <tr>
                    <td style="height:95px; border:none"></td>
                    <td style="height:95px; border:none"></td>
                </tr>
            </table>
        `;
    }

    openContractDialog() {
        this.contractDialogVisible = true;
    }

    closeContractDialog() {
        this.contractDialogVisible = false;
    }

    zoomIn() {
        this.setZoom(this.contractZoom + 0.1);
    }

    zoomOut() {
        this.setZoom(this.contractZoom - 0.1);
    }

    resetZoom() {
        this.setZoom(1);
    }

    private setZoom(value: number) {
        this.contractZoom = Math.min(2, Math.max(0.5, Number(value.toFixed(2))));
        this.zoomPercent = Math.round(this.contractZoom * 100);
    }

    printContract() {
        const printWindow = window.open('', '_blank', 'width=1000,height=900');
        if (!printWindow) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Không thể in',
                detail: 'Trình duyệt đang chặn cửa sổ in. Vui lòng cho phép popup.',
                life: 3500,
            });
            return;
        }

        const docHtml = `
            <!doctype html>
            <html lang="vi">
            <head>
                <meta charset="utf-8" />
                <title>Hợp đồng dịch vụ</title>
                <style>
                    @page { size: A4; margin: 12mm; }
                    body { margin: 0; font-family: 'Times New Roman', serif; background: #fff; }
                    .paper {
                        width: 210mm;
                        min-height: 297mm;
                        margin: 0 auto;
                        box-sizing: border-box;
                        padding: 18mm 16mm;
                    }
                    table { width: 100%; border-collapse: collapse; }
                    td, th { border: 1px solid #d1d5db; padding: 6px; vertical-align: top; }
                    p { margin: 0 0 6px; line-height: 1.45; font-size: 10pt; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .paper { margin: 0; padding: 0; width: auto; min-height: auto; }
                    }
                </style>
            </head>
            <body>
                <div class="paper">${this.contractPreviewRawHtml}</div>
                <script>
                    window.onload = function () {
                        window.print();
                    };
                <\/script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(docHtml);
        printWindow.document.close();
    }

    goBack() {
        this.router.navigate(['/pages/booking']);
    }

    shiftLabel(value?: string): string {
        const map: Record<string, string> = {
            SLOT_1: 'Ca sáng (10:00 - 14:00)',
            SLOT_2: 'Ca chiều (17:00 - 21:00)',
            SLOT_3: 'Cả ngày (09:00 - 17:00)',
            AFTERNOON: 'Ca sáng (10:00 - 14:00)',
            EVENING: 'Ca chiều (17:00 - 21:00)',
            FULL_DAY: 'Cả ngày (09:00 - 17:00)',
        };
        return map[value ?? ''] ?? (value || '-');
    }

    bookingStateLabel(value?: string): string {
        const map: Record<string, string> = {
            ACTIVE: 'Đang hiệu lực',
            INACTIVE: 'Ngưng hiệu lực',
            DRAFT: 'Nháp',
            EXPIRED: 'Hết hạn',
            APPROVED: 'Đã duyệt',
            UNAPPROVED: 'Chưa duyệt',
            CANCELLED: 'Đã hủy',
            CONVERTED: 'Đã chuyển đổi',
        };
        return map[value ?? ''] ?? (value || '-');
    }

    statusBg(value?: string): string {
        const map: Record<string, string> = {
            ACTIVE: '#dcfce7',
            INACTIVE: '#fee2e2',
            DRAFT: '#fef3c7',
            EXPIRED: '#ffedd5',
            APPROVED: '#dcfce7',
            UNAPPROVED: '#fee2e2',
            CANCELLED: '#fee2e2',
            CONVERTED: '#dbeafe',
        };
        return map[value ?? ''] ?? '#e2e8f0';
    }

    statusColor(value?: string): string {
        const map: Record<string, string> = {
            ACTIVE: '#166534',
            INACTIVE: '#b91c1c',
            DRAFT: '#92400e',
            EXPIRED: '#9a3412',
            APPROVED: '#166534',
            UNAPPROVED: '#b91c1c',
            CANCELLED: '#b91c1c',
            CONVERTED: '#1d4ed8',
        };
        return map[value ?? ''] ?? '#334155';
    }

    formatDate(value?: string): string {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('vi-VN');
    }

    formatPrice(value?: number): string {
        const num = Number(value ?? 0);
        return `${new Intl.NumberFormat('vi-VN').format(Number.isFinite(num) ? num : 0)} đ`;
    }
}
