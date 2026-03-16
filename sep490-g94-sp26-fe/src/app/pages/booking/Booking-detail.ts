import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Booking, BookingService } from '../service/booking.service';
import { Customer, CustomerService } from '../service/customer.service';
import { HallService } from '../service/hall.service';
import { SetMenuService } from '../service/set-menu';
import { ServicePackageService } from '../service/service-package.service';

@Component({
    selector: 'app-booking-detail',
    standalone: true,
    imports: [CommonModule, ButtonModule],
    providers: [BookingService],
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
        @media (max-width: 992px) {
            .layout {
                grid-template-columns: 1fr;
            }
            .meta-grid,
            .detail-grid {
                grid-template-columns: 1fr;
            }
        }
    `],
    template: `
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
                            <div class="booking-no">{{ booking.bookingNo || ('BK-' + booking.id) }}</div>
                            <div class="couple-line">
                                {{ booking.brideName || '-' }} & {{ booking.groomName || '-' }}
                            </div>
                        </div>
                    </div>
                    <span class="chip" [style.background]="statusBg(booking.bookingState)" [style.color]="statusColor(booking.bookingState)">
                        {{ bookingStateLabel(booking.bookingState) }}
                    </span>
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
                        <div style="padding:1.6rem 0; text-align:center" class="muted">Chưa có hợp đồng</div>
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

    totalAmount = 0;
    paidAmount = 0;
    remainingAmount = 0;
    progressPercent = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private bookingService: BookingService,
        private customerService: CustomerService,
        private hallService: HallService,
        private setMenuService: SetMenuService,
        private servicePackageService: ServicePackageService,
        private cdr: ChangeDetectorRef,
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

                const rawTotal = Number((this.booking as any)?.totalAmount ?? 0);
                const rawPaid = Number((this.booking as any)?.paidAmount ?? 0);
                this.totalAmount = Number.isFinite(rawTotal) ? rawTotal : 0;
                this.paidAmount = Number.isFinite(rawPaid) ? rawPaid : 0;
                this.recalculatePaymentSummary();

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

    private loadCustomer(customerId: number) {
        this.customerService.getCustomerById(customerId).subscribe({
            next: (res) => {
                this.customer = res.data;
                this.customerName = res.data?.fullName ?? '';
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
                const price = Number(res.data?.setPrice ?? 0);
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

        if (this.totalAmount <= 0) {
            const tables = Number(this.booking.expectedTables ?? this.booking.tableCount ?? 0);
            if (Number.isFinite(tables) && tables > 0) {
                this.totalAmount = (this.setMenuPrice * tables) + this.packagePrice;
            }
        }

        this.remainingAmount = Math.max(this.totalAmount - this.paidAmount, 0);
        this.progressPercent = this.totalAmount > 0
            ? Math.min(100, Math.max(0, Math.round((this.paidAmount / this.totalAmount) * 100)))
            : 0;
    }

    goBack() {
        this.router.navigate(['/pages/booking']);
    }

    shiftLabel(value?: string): string {
        const map: Record<string, string> = {
            SLOT_1: 'Trưa (12:00 - 17:00)',
            SLOT_2: 'Tối (17:00 - 21:00)',
        };
        return map[value ?? ''] ?? (value || '-');
    }

    bookingStateLabel(value?: string): string {
        const map: Record<string, string> = {
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
