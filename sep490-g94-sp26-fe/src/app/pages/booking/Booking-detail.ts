import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Booking, BookingService } from '../service/booking.service';
import { Customer, CustomerService } from '../service/customer.service';
import { HallService } from '../service/hall.service';
import { SetMenuService } from '../service/set-menu';
import { ServicePackageService } from '../service/service-package.service';
import { Invoice, InvoiceService } from '../service/invoice.service';
import { Payment, PaymentService } from '../service/payment.service';

@Component({
    selector: 'app-booking-detail',
    standalone: true,
    imports: [CommonModule, ButtonModule, ToastModule],
    providers: [BookingService, MessageService, InvoiceService, PaymentService],
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
        .state-view {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
        }
        .layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 360px;
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
                        <div class="state-view">
                            <span
                                class="chip"
                                [style.background]="statusBg(booking.contractState ?? booking.bookingState ?? 'DRAFT')"
                                [style.color]="statusColor(booking.contractState ?? booking.bookingState ?? 'DRAFT')"
                            >
                                {{ bookingStateLabel(booking.contractState ?? booking.bookingState ?? 'DRAFT') }}
                            </span>
                            <small class="muted">Trạng thái được đồng bộ tự động theo thanh toán.</small>
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
                                    <div class="muted" *ngIf="hallPrice > 0" style="margin-top:0.2rem">Phí thuê: {{ formatPrice(hallPrice) }}</div>
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
                        <div *ngIf="paymentHistory.length; else noPaymentHistoryTpl" style="margin-top:0.8rem">
                            <div class="line" *ngFor="let p of paymentHistory" style="align-items:flex-start">
                                <span>
                                    {{ p.code || ('TT-' + p.id) }}
                                    <small class="muted" style="display:block; margin-top:0.15rem">{{ formatDate(p.paymentDate || p.createdAt) }} - {{ paymentMethodLabel(p.method) }}</small>
                                </span>
                                <strong [style.color]="isPaidState(p.status || p.paymentState) ? '#16a34a' : '#b45309'">
                                    {{ formatPrice(p.amount) }}
                                </strong>
                            </div>
                        </div>
                        <ng-template #noPaymentHistoryTpl>
                            <div style="padding:2rem 0; text-align:center" class="muted">Chưa có thanh toán nào</div>
                        </ng-template>
                    </div>
                </div>

                <div>
                    <div class="card" style="margin-bottom:1rem">
                        <h2 class="section-title">Tổng quan thanh toán</h2>
                        <div class="line" *ngIf="setMenuName || booking.setMenuId"><span>Set menu</span><strong>{{ setMenuName || ('#' + booking.setMenuId) }}</strong></div>
                        <div class="line" *ngIf="setMenuPrice > 0"><span>Giá set menu</span><strong>{{ formatPrice(setMenuPrice) }}/bàn</strong></div>
                        <div class="line" *ngIf="hallName || booking.hallId"><span>Sảnh</span><strong>{{ hallName || ('#' + booking.hallId) }}</strong></div>
                        <div class="line" *ngIf="hallPrice > 0"><span>Phí thuê sảnh</span><strong>{{ formatPrice(hallPrice) }}</strong></div>
                        <div class="line" *ngIf="packageName || booking.packageId"><span>Gói dịch vụ</span><strong>{{ packageName || ('#' + booking.packageId) }}</strong></div>
                        <div class="line" *ngIf="packagePrice > 0"><span>Giá gói dịch vụ</span><strong>{{ formatPrice(packagePrice) }}</strong></div>
                        <div class="line"><span>Tổng tiền</span><strong>{{ formatPrice(totalAmount) }}</strong></div>
                        <div class="line" style="color:#16a34a"><span>Đã thanh toán</span><strong style="color:#16a34a">{{ formatPrice(paidAmount) }}</strong></div>
                        <div class="line total"><span>Còn lại</span><strong>{{ formatPrice(remainingAmount) }}</strong></div>
                        <div class="line" style="margin-top:0.8rem"><span>Tiến độ</span><strong>{{ progressPercent }}%</strong></div>
                        <div class="progress"><div class="progress-fill" [style.width.%]="progressPercent"></div></div>
                    </div>

                    <div class="card" style="margin-bottom:1rem">
                        <h2 class="section-title">Hoá đơn</h2>

                        <div *ngIf="invoicePreview; else noInvoiceTpl">
                            <div class="line" style="margin-top:0; margin-bottom:0.35rem;">
                                <span class="muted">Mã hoá đơn</span>
                                <strong>{{ invoicePreview.code || ('INV-' + invoicePreview.id) }}</strong>
                            </div>
                            <div class="line" style="margin:0.35rem 0;">
                                <span class="muted">Ngày tạo</span>
                                <strong>{{ formatDate(resolveInvoiceCreatedAt(invoicePreview)) }}</strong>
                            </div>
                            <div class="line" style="margin:0.35rem 0;">
                                <span class="muted">Tổng tiền</span>
                                <strong>{{ formatPrice(invoicePreview.totalAmount) }}</strong>
                            </div>
                            <div class="line" style="margin:0.35rem 0;">
                                <span class="muted">Đã thanh toán</span>
                                <strong style="color:#16a34a">{{ formatPrice(invoicePreview.paidAmount) }}</strong>
                            </div>
                            <div class="line" style="margin:0.35rem 0 0.85rem;">
                                <span class="muted">Trạng thái</span>
                                <span
                                    class="chip"
                                    [style.background]="invoiceStateBg(invoicePreview.invoiceState)"
                                    [style.color]="invoiceStateColor(invoicePreview.invoiceState)"
                                >
                                    {{ invoiceStateLabel(invoicePreview.invoiceState) }}
                                </span>
                            </div>

                            <p-button
                                label="Xem chi tiết & Thanh toán"
                                icon="pi pi-external-link"
                                severity="secondary"
                                [outlined]="true"
                                styleClass="w-full"
                                (onClick)="goToInvoiceDetail()"
                            />
                        </div>

                        <ng-template #noInvoiceTpl>
                            <div class="muted" style="margin-bottom:0.8rem">Chưa có hoá đơn cho hợp đồng này.</div>
                        </ng-template>
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
    hallPrice = 0;
    setMenuName = '';
    setMenuPrice = 0;
    packageName = '';
    packagePrice = 0;
    invoicePreview: Invoice | null = null;
    paymentHistory: Payment[] = [];

    apiTotalAmount = 0;
    totalAmount = 0;
    paidAmount = 0;
    remainingAmount = 0;
    progressPercent = 0;
    contractPreviewHtml: SafeHtml = '';
    contractPreviewRawHtml = '';
    contractDialogVisible = false;
    contractZoom = 1;
    zoomPercent = 100;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private bookingService: BookingService,
        private customerService: CustomerService,
        private hallService: HallService,
        private setMenuService: SetMenuService,
        private servicePackageService: ServicePackageService,
        private invoiceService: InvoiceService,
        private paymentService: PaymentService,
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
                if (this.booking?.id) {
                    this.loadInvoicePreview(this.booking.id);
                    this.loadPaymentHistory(this.booking.id);
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

    private loadInvoicePreview(contractId: number) {
        this.invoiceService.searchInvoices({ contractId, page: 0, size: 1 }).subscribe({
            next: (res) => {
                const list = res.data?.content ?? [];
                if (list.length === 0) {
                    this.invoicePreview = null;
                    this.cdr.detectChanges();
                    return;
                }

                const preview = list[0] as any;
                this.invoicePreview = {
                    ...preview,
                    paidAmount: Number(preview?.paidAmount ?? this.paidAmount ?? 0),
                    createdAt: this.resolveInvoiceCreatedAt(preview),
                };
                this.cdr.detectChanges();

                if (!this.invoicePreview?.createdAt && this.invoicePreview?.id) {
                    this.invoiceService.getById(this.invoicePreview.id).subscribe({
                        next: (detailRes) => {
                            const detail = detailRes.data as any;
                            this.invoicePreview = {
                                ...this.invoicePreview,
                                ...detail,
                                paidAmount: Number(detail?.paidAmount ?? this.paidAmount ?? 0),
                                createdAt: this.resolveInvoiceCreatedAt({ ...this.invoicePreview, ...detail }),
                            };
                            this.cdr.detectChanges();
                        },
                        error: () => {
                            this.cdr.detectChanges();
                        },
                    });
                }
            },
            error: () => {
                this.invoicePreview = null;
                this.cdr.detectChanges();
            },
        });
    }

    private loadPaymentHistory(contractId: number) {
        this.paymentService.getPaymentsByContract(contractId, 0, 100).subscribe({
            next: (res) => {
                const rows = [...(res.data?.content ?? [])].sort((a: any, b: any) => Number(a?.id ?? 0) - Number(b?.id ?? 0));
                const mappedPayments: Payment[] = rows.map((p: any) => ({
                    id: p.id,
                    code: p.code,
                    amount: Number(p.amount ?? 0),
                    method: p.method,
                    status: p.paymentState ?? p.status,
                    paymentState: p.paymentState,
                    paymentDate: p.paidAt ?? p.paymentDate ?? p.createdAt,
                    createdAt: p.createdAt,
                    note: p.note,
                }));

                // Only successful payments are recorded in contract payment history table.
                this.paymentHistory = mappedPayments.filter((p) => this.isPaidState(p.status ?? p.paymentState));

                this.paidAmount = this.paymentHistory
                    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

                if (this.invoicePreview) {
                    this.invoicePreview = {
                        ...this.invoicePreview,
                        paidAmount: this.paidAmount,
                    };
                }

                this.recalculatePaymentSummary();
                this.cdr.detectChanges();
            },
            error: () => {
                this.paymentHistory = [];
                this.cdr.detectChanges();
            },
        });
    }

    goToInvoiceDetail() {
        if (!this.invoicePreview?.id) return;
        this.router.navigate(['/pages/invoice', this.invoicePreview.id]);
    }

    invoiceStateLabel(value?: string): string {
        return {
            UNPAID: 'Chưa thanh toán',
            PARTIAL: 'Thanh toán một phần',
            PAID: 'Đã thanh toán',
        }[value ?? ''] ?? (value || '-');
    }

    invoiceStateBg(value?: string): string {
        return {
            UNPAID: '#fee2e2',
            PARTIAL: '#fef3c7',
            PAID: '#dcfce7',
        }[value ?? ''] ?? '#e2e8f0';
    }

    invoiceStateColor(value?: string): string {
        return {
            UNPAID: '#b91c1c',
            PARTIAL: '#92400e',
            PAID: '#166534',
        }[value ?? ''] ?? '#334155';
    }

    resolveInvoiceCreatedAt(invoice?: any): string {
        return invoice?.createdAt
            ?? invoice?.created_at
            ?? invoice?.createdDate
            ?? invoice?.createAt
            ?? invoice?.invoiceDate
            ?? new Date().toISOString();
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
                const price = Number((res.data as any)?.basePrice ?? 0);
                this.hallPrice = Number.isFinite(price) ? price : 0;
                this.recalculatePaymentSummary();
                this.updateContractPreview();
                this.cdr.detectChanges();
            },
            error: () => {
                this.hallPrice = 0;
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
            ? (this.setMenuPrice * tables) + this.hallPrice + this.packagePrice
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
        const groomAge = this.booking.groomAge ? `${this.booking.groomAge}` : '-';
        const brideName = this.booking.brideName || '-';
        const brideAge = this.booking.brideAge ? `${this.booking.brideAge}` : '-';
        const brideFatherName = this.booking.brideFatherName || '-';
        const brideMotherName = this.booking.brideMotherName || '-';
        const groomFatherName = this.booking.groomFatherName || '-';
        const groomMotherName = this.booking.groomMotherName || '-';
        const customerName = this.customer?.fullName || this.customerName || '-';
        const customerPhone = this.customer?.phone || '-';
        const customerEmail = this.customer?.email || '-';
        const customerAddress = this.customer?.address || '-';
        const hallName = this.hallName || (this.booking.hallId ? `Sảnh #${this.booking.hallId}` : '-');
        const shift = this.shiftLabel(this.booking.bookingTime ?? this.booking.shift);
        const invoiceCode = this.invoicePreview?.code || (this.invoicePreview?.id ? `INV-${this.invoicePreview.id}` : '-');
        const tables = Number(this.booking.expectedTables ?? this.booking.tableCount ?? 0);
        const guests = Number(this.booking.expectedGuests ?? this.booking.guestCount ?? 0);
        const amount = this.totalAmount > 0 ? this.totalAmount : this.apiTotalAmount;
        const hallAmount = this.hallPrice;
        const setMenuAmount = tables > 0 ? this.setMenuPrice * tables : 0;
        const packageAmount = this.packagePrice;
        const baseAmount = hallAmount + setMenuAmount + packageAmount;
        const estimatedExtra = Math.max(amount - baseAmount, 0);
        const paidAmount = Number(this.paidAmount ?? 0);
        const remainingAmount = Math.max(amount - paidAmount, 0);
        const deposit1 = Math.round(amount * 0.4);
        const deposit2 = Math.max(amount - deposit1, 0);
        const notes = this.booking.notes || '-';
        const recordStatus = this.booking.contractState || this.booking.bookingState || '-';

        return `
            <p style="text-align:center; margin:0; font-size:10pt">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p style="text-align:center; margin:0; font-size:10pt">Độc Lập - Tự Do - Hạnh Phúc</p>
            <p style="text-align:center; margin:8px 0 0; font-size:16pt"><strong>HỢP ĐỒNG CUNG CẤP DỊCH VỤ TIỆC CƯỚI</strong></p>
            <p style="text-align:center; margin:4px 0 10px; font-size:10pt">Số: <span style="color:#dc2626">${esc(contractNo)}</span></p>

            <p>Hợp đồng được lập ngày <span style="color:#dc2626">${esc(signDate)}</span>, gồm có:</p>

            <p><strong>BÊN SỬ DỤNG DỊCH VỤ (BÊN A - KHÁCH HÀNG)</strong></p>
            <p><strong>Người đại diện:</strong> <span style="color:#dc2626">${esc(customerName)}</span></p>

            <table>
                <tr>
                    <td><strong>CÔ DÂU: ${esc(brideName)} - Tuổi: ${esc(brideAge)}</strong></td>
                    <td><strong>CHÚ RỂ: ${esc(groomName)} - Tuổi: ${esc(groomAge)}</strong></td>
                </tr>
                <tr>
                    <td>
                        <p><strong>Địa chỉ:</strong> ${esc(customerAddress)}</p>
                        <p><strong>Số điện thoại:</strong> ${esc(customerPhone)}</p>
                        <p><strong>Email:</strong> ${esc(customerEmail)}</p>
                        <p><strong>Cha cô dâu:</strong> ${esc(brideFatherName)}</p>
                        <p><strong>Mẹ cô dâu:</strong> ${esc(brideMotherName)}</p>
                    </td>
                    <td>
                        <p><strong>Ngày tổ chức:</strong> ${esc(bookingDate)}</p>
                        <p><strong>Sảnh:</strong> ${esc(hallName)}</p>
                        <p><strong>Ca tiệc:</strong> ${esc(shift)}</p>
                        <p><strong>Cha chú rể:</strong> ${esc(groomFatherName)}</p>
                        <p><strong>Mẹ chú rể:</strong> ${esc(groomMotherName)}</p>
                    </td>
                </tr>
            </table>

            <p style="margin-top:10px"><strong>BÊN CUNG CẤP DỊCH VỤ CƯỚI (BÊN B)</strong></p>
            <p><strong>Đơn vị:</strong> WEDDINGLINK</p>
            <p><strong>Vai trò:</strong> Đơn vị tổ chức và cung cấp dịch vụ tiệc cưới trọn gói theo thỏa thuận.</p>

            <p><strong>THÔNG TIN THAM CHIẾU HÓA ĐƠN:</strong> ${esc(invoiceCode)}</p>
            <p><strong>Trạng thái hợp đồng:</strong> ${esc(this.bookingStateLabel(recordStatus))}</p>

            <p style="margin-top:10px"><strong>ĐIỀU I: NỘI DUNG CÔNG VIỆC</strong></p>
            <p>1. Bên B cung cấp dịch vụ tổ chức tiệc cưới theo yêu cầu của Bên A, bao gồm các hạng mục đã xác nhận.</p>
            <p>2. Bên A xác nhận thông tin sự kiện: ngày tổ chức, sảnh, ca tiệc, số bàn, số khách và các yêu cầu riêng.</p>
            <p>3. Danh mục dịch vụ dự kiến:</p>
            <p>- Sảnh tổ chức: ${esc(hallName)} (phí thuê: ${esc(this.formatPrice(hallAmount))}).</p>
            <p>- Set menu: ${esc(this.setMenuName || '-')}, đơn giá ${esc(this.setMenuPrice > 0 ? `${this.formatPrice(this.setMenuPrice)}/bàn` : '-')}.</p>
            <p>- Gói dịch vụ đi kèm: ${esc(this.packageName || '-')}, giá ${esc(this.formatPrice(packageAmount))}.</p>
            <p>- Ghi chú bổ sung: ${esc(notes)}.</p>

            <p><strong>ĐIỀU II: GIÁ TRỊ HỢP ĐỒNG VÀ THANH TOÁN</strong></p>
            <p>1. Tổng giá trị tạm tính của hợp đồng: <span style="color:#dc2626"><strong>${esc(this.formatPrice(amount))}</strong></span>.</p>
            <p>2. Cấu phần chi phí:</p>
            <p>- Phí sảnh: ${esc(this.formatPrice(hallAmount))}.</p>
            <p>- Chi phí set menu (theo số bàn dự kiến): ${esc(this.formatPrice(setMenuAmount))}.</p>
            <p>- Chi phí gói dịch vụ: ${esc(this.formatPrice(packageAmount))}.</p>
            <p>- Chi phí phát sinh tạm tính: ${esc(this.formatPrice(estimatedExtra))} (sẽ quyết toán theo thực tế).</p>
            <p>3. Tiến độ thanh toán:</p>
            <p>- Đợt 1 (đặt cọc 40% khi ký hợp đồng): ${esc(this.formatPrice(deposit1))}.</p>
            <p>- Đợt 2 (60% còn lại + toàn bộ chi phí phát sinh): ${esc(this.formatPrice(deposit2))} + phí phát sinh (nếu có), thanh toán trước khi diễn ra tiệc.</p>
            <p>4. Tình trạng thanh toán hiện tại:</p>
            <p>- Đã thanh toán: ${esc(this.formatPrice(paidAmount))}.</p>
            <p>- Còn phải thanh toán: ${esc(this.formatPrice(remainingAmount))}.</p>
            <p>5. Hình thức thanh toán: tiền mặt/chuyển khoản/thanh toán điện tử theo thông tin do Bên B cung cấp.</p>

            <p><strong>ĐIỀU III: THAY ĐỔI DỊCH VỤ VÀ PHÍ PHÁT SINH</strong></p>
            <p>1. Mọi thay đổi về thực đơn, số bàn, hạng mục dịch vụ, timeline chương trình phải được xác nhận trước ngày tổ chức theo quy định của Bên B.</p>
            <p>2. Chi phí phát sinh gồm nhưng không giới hạn: tăng số bàn, nâng cấp thực đơn, bổ sung nhân sự, thiết bị, trang trí hoặc dịch vụ ngoài danh mục ban đầu.</p>
            <p>3. Phát sinh được lập thành phụ lục/xác nhận bổ sung và là phần không tách rời hợp đồng.</p>

            <p><strong>ĐIỀU IV: HỦY/TẠM HOÃN SỰ KIỆN</strong></p>
            <p>1. Trường hợp Bên A hủy tiệc, khoản cọc Đợt 1 được xử lý theo chính sách hủy của Bên B và các chi phí đã phát sinh thực tế.</p>
            <p>2. Trường hợp Bên A đổi ngày tổ chức, hai bên sẽ thống nhất lịch mới bằng phụ lục; mọi chênh lệch chi phí (nếu có) được cập nhật vào giá trị hợp đồng.</p>
            <p>3. Trường hợp bất khả kháng (thiên tai, dịch bệnh, quy định cơ quan nhà nước...), hai bên ưu tiên phương án dời lịch và hạn chế thiệt hại cho cả hai bên.</p>

            <p><strong>ĐIỀU V: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN</strong></p>
            <p>1. Bên A có trách nhiệm cung cấp thông tin chính xác, thanh toán đúng hạn và phối hợp trong quá trình tổ chức.</p>
            <p>2. Bên B có trách nhiệm cung cấp dịch vụ đúng hạng mục, đúng chất lượng, bảo đảm tiến độ và an toàn sự kiện.</p>
            <p>3. Hai bên có trách nhiệm phối hợp nghiệm thu trước và sau sự kiện.</p>

            <p><strong>ĐIỀU VI: PHẠT VI PHẠM VÀ BỒI THƯỜNG</strong></p>
            <p>1. Bên vi phạm nghĩa vụ thanh toán hoặc nghĩa vụ thực hiện dịch vụ phải khắc phục và bồi thường thiệt hại thực tế cho bên còn lại theo quy định pháp luật.</p>
            <p>2. Trường hợp chậm thanh toán, Bên B có quyền tạm ngừng cung cấp một phần dịch vụ cho đến khi Bên A hoàn tất nghĩa vụ tài chính theo thỏa thuận.</p>

            <p><strong>ĐIỀU VII: ĐIỀU KHOẢN CHUNG</strong></p>
            <p>1. Hợp đồng có hiệu lực từ ngày ký đến khi hai bên hoàn thành mọi quyền và nghĩa vụ.</p>
            <p>2. Mọi sửa đổi, bổ sung hợp đồng phải lập thành văn bản và có xác nhận của cả hai bên.</p>
            <p>3. Nếu phát sinh tranh chấp, hai bên ưu tiên thương lượng; trường hợp không đạt thỏa thuận sẽ giải quyết theo quy định pháp luật hiện hành.</p>
            <p>4. Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.</p>

            <table style="margin-top:20px; border:none; width:100%">
                <tr>
                    <td style="width:50%; border:none; text-align:center; vertical-align:top">
                        <p><strong>ĐẠI DIỆN BÊN A</strong></p>
                        <p>(Ký, ghi rõ họ tên)</p>
                    </td>
                    <td style="width:50%; border:none; text-align:center; vertical-align:top">
                        <p><strong>ĐẠI DIỆN BÊN B</strong></p>
                        <p>(Ký, ghi rõ họ tên, đóng dấu)</p>
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
            DRAFT: 'Nháp',
            ACTIVE: 'Khách hàng đóng cọc',
            LIQUIDATED: 'Thanh lý hợp đồng',
            CANCELLED: 'Hủy contract',
        };
        return map[value ?? ''] ?? (value || '-');
    }

    statusBg(value?: string): string {
        const map: Record<string, string> = {
            DRAFT: '#fef3c7',
            ACTIVE: '#dcfce7',
            LIQUIDATED: '#dbeafe',
            CANCELLED: '#fee2e2',
        };
        return map[value ?? ''] ?? '#e2e8f0';
    }

    statusColor(value?: string): string {
        const map: Record<string, string> = {
            DRAFT: '#92400e',
            ACTIVE: '#166534',
            LIQUIDATED: '#1d4ed8',
            CANCELLED: '#b91c1c',
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

    paymentMethodLabel(value?: string): string {
        const map: Record<string, string> = {
            CASH: 'Tiền mặt',
            BANK_TRANSFER: 'Chuyển khoản',
            CREDIT_CARD: 'Thẻ tín dụng',
            E_WALLET: 'Ví điện tử',
        };
        return map[value ?? ''] ?? (value || '-');
    }

    isPaidState(value?: string): boolean {
        const state = String(value ?? '').toUpperCase();
        return state === 'SUCCESS' || state === 'CONFIRMED' || state === 'PAID';
    }
}
