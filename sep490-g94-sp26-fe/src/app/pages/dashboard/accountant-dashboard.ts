import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import {
    DashboardService,
    AccountantDashBoardRequest,
    AccountantDashBoardResponse
} from '../service/dashboard.service';

@Component({
    selector: 'app-accountant-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, TagModule],
    template: `
        <div class="acc-dash">
            <!-- HEADER -->
            <div class="acc-header">
                <div>
                    <h2>Dashboard Kế Toán</h2>
                    <p>Theo dõi dòng tiền, hóa đơn và công nợ theo chi nhánh</p>
                </div>
                <div class="acc-filters">
                    <input type="month" class="month-input" [(ngModel)]="selectedMonth" (change)="reload()" />
                    <p-button label="Tìm kiếm" icon="pi pi-search" (onClick)="reload()"></p-button>
                </div>
            </div>

            <!-- LOADING / ERROR -->
            <div class="acc-loading" *ngIf="loading()">Đang tải số liệu dashboard...</div>
            <div class="acc-error" *ngIf="!loading() && errorMessage()">{{ errorMessage() }}</div>

            <ng-container *ngIf="!loading() && !errorMessage() && dashData() && dashData()!.length > 0">
                <div class="acc-period">
                    <i class="pi pi-calendar"></i>
                    Báo cáo tháng: <strong>{{ selectedMonth }}</strong>
                </div>

                <!-- Lặp qua các chi nhánh -->
                <div class="location-section" *ngFor="let loc of dashData()">
                    <div class="location-title">
                        <i class="pi pi-building"></i> Chi nhánh: {{ loc.locationName }}
                    </div>
                    
                    <!-- CASH FLOW -->
                    <div class="acc-section-title"><i class="pi pi-wallet"></i> Dòng tiền (Cash Flow)</div>
                    <div class="acc-summary-grid">
                        <div class="acc-card acc-card--expected">
                            <div class="acc-card__icon"><i class="pi pi-chart-line"></i></div>
                            <div class="acc-card__body">
                                <span>Doanh thu dự kiến</span>
                                <strong>{{ formatCurrency(loc.cashFlow?.totalExpectedRevenue) }}</strong>
                            </div>
                        </div>
                        <div class="acc-card acc-card--collected">
                            <div class="acc-card__icon"><i class="pi pi-check-circle"></i></div>
                            <div class="acc-card__body">
                                <span>Tổng tiền đã thu</span>
                                <strong>{{ formatCurrency(loc.cashFlow?.totalCollectedAmount) }}</strong>
                            </div>
                        </div>
                        <div class="acc-card acc-card--debt">
                            <div class="acc-card__icon"><i class="pi pi-clock"></i></div>
                            <div class="acc-card__body">
                                <span>Tổng nợ còn lại</span>
                                <strong>{{ formatCurrency(loc.cashFlow?.totalOutstandingDebt) }}</strong>
                            </div>
                        </div>
                        <div class="acc-card acc-card--refund">
                            <div class="acc-card__icon"><i class="pi pi-refresh"></i></div>
                            <div class="acc-card__body">
                                <span>Tổng tiền đã hoàn</span>
                                <strong>{{ formatCurrency(loc.cashFlow?.totalRefundedAmount) }}</strong>
                            </div>
                        </div>
                    </div>

                    <div class="sub-sections-row">
                        <!-- PAYMENT METHOD -->
                        <div class="sub-section">
                            <div class="acc-section-title"><i class="pi pi-credit-card"></i> Phương thức thanh toán</div>
                            <div class="acc-summary-grid acc-summary-grid--2">
                                <div class="acc-card acc-card--cash">
                                    <div class="acc-card__icon"><i class="pi pi-money-bill"></i></div>
                                    <div class="acc-card__body">
                                        <span>Tiền mặt</span>
                                        <strong>{{ formatCurrency(loc.paymentMethod?.totalCash) }}</strong>
                                    </div>
                                </div>
                                <div class="acc-card acc-card--bank">
                                    <div class="acc-card__icon"><i class="pi pi-building-columns"></i></div>
                                    <div class="acc-card__body">
                                        <span>Chuyển khoản</span>
                                        <strong>{{ formatCurrency(loc.paymentMethod?.totalBankTransfer) }}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- PENDING ACTION -->
                        <div class="sub-section">
                            <div class="acc-section-title"><i class="pi pi-exclamation-circle"></i> Giao dịch chờ duyệt</div>
                            <div class="acc-summary-grid acc-summary-grid--2">
                                <div class="acc-card acc-card--pending-count">
                                    <div class="acc-card__icon"><i class="pi pi-list"></i></div>
                                    <div class="acc-card__body">
                                        <span>Số giao dịch chờ</span>
                                        <strong>{{ loc.pendingAction?.pendingPaymentsCount ?? 0 }}</strong>
                                    </div>
                                </div>
                                <div class="acc-card acc-card--pending-amount">
                                    <div class="acc-card__icon"><i class="pi pi-info-circle"></i></div>
                                    <div class="acc-card__body">
                                        <span>Tổng tiền chờ duyệt</span>
                                        <strong>{{ formatCurrency(loc.pendingAction?.pendingPaymentsAmount) }}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- INVOICE -->
                    <div class="acc-section-title"><i class="pi pi-receipt"></i> Trạng thái hóa đơn</div>
                    <div class="acc-summary-grid acc-summary-grid--3">
                        <div class="acc-card acc-card--unpaid">
                            <div class="acc-card__icon"><i class="pi pi-times-circle"></i></div>
                            <div class="acc-card__body">
                                <span>Chưa thanh toán</span>
                                <strong>{{ loc.invoice?.totalUnpaid ?? 0 }}</strong>
                            </div>
                        </div>
                        <div class="acc-card acc-card--partial">
                            <div class="acc-card__icon"><i class="pi pi-percentage"></i></div>
                            <div class="acc-card__body">
                                <span>Thanh toán 1 phần</span>
                                <strong>{{ loc.invoice?.totalPartiallyPaid ?? 0 }}</strong>
                            </div>
                        </div>
                        <div class="acc-card acc-card--paid">
                            <div class="acc-card__icon"><i class="pi pi-check"></i></div>
                            <div class="acc-card__body">
                                <span>Đã thanh toán</span>
                                <strong>{{ loc.invoice?.totalPaid ?? 0 }}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </ng-container>

            <ng-container *ngIf="!loading() && !errorMessage() && (!dashData() || dashData()!.length === 0)">
                <div class="acc-loading">Không có dữ liệu chi nhánh nào cho tài khoản này.</div>
            </ng-container>
        </div>
    `,
    styles: [`
        .acc-dash { display: flex; flex-direction: column; gap: 1.1rem; }
        .acc-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
        .acc-header h2 { margin: 0; font-size: 1.5rem; color: #0f172a; }
        .acc-header p { margin: 0.2rem 0 0; color: #64748b; font-size: 0.9rem; }
        .acc-filters { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
        .month-input {
            border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.45rem 0.6rem;
            min-height: 2.2rem; background: #fff; color: #0f172a; font-size: 0.9rem;
        }
        .acc-loading, .acc-error {
            background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
            padding: 1rem; color: #334155;
        }
        .acc-error { border-color: #fecaca; background: #fef2f2; color: #b91c1c; }
        .acc-period {
            background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
            border: 1px solid #e2e8f0; border-radius: 10px;
            padding: 0.7rem 1rem; font-size: 0.92rem; color: #334155;
            display: flex; align-items: center; gap: 0.5rem;
        }
        
        .location-section {
            background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px;
            padding: 1.5rem; margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;
        }
        .location-title {
            font-size: 1.25rem; font-weight: 700; color: #1e293b;
            display: flex; align-items: center; gap: 0.5rem;
            padding-bottom: 0.5rem; border-bottom: 2px solid #cbd5e1;
            margin-bottom: 0.5rem;
        }

        .acc-section-title {
            font-size: 1.05rem; font-weight: 700; color: #0f172a;
            display: flex; align-items: center; gap: 0.45rem;
            margin-top: 0.5rem;
        }
        .sub-sections-row {
            display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
        }
        @media (max-width: 768px) {
            .sub-sections-row { grid-template-columns: 1fr; }
        }

        /* ── Summary Cards ── */
        .acc-summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 0.75rem;
        }
        .acc-summary-grid--2 { grid-template-columns: 1fr 1fr; }
        .acc-summary-grid--3 { grid-template-columns: 1fr 1fr 1fr; }

        .acc-card {
            display: flex; align-items: center; gap: 0.8rem;
            background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
            padding: 0.85rem 1rem;
            transition: box-shadow 0.2s, transform 0.15s;
        }
        .acc-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.06); transform: translateY(-2px); }
        .acc-card__icon {
            width: 42px; height: 42px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.15rem; color: #fff; flex-shrink: 0;
        }
        .acc-card__body { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
        .acc-card__body span { color: #64748b; font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .acc-card__body strong { color: #0f172a; font-size: 1.1rem; line-height: 1.15; }

        .acc-card--expected .acc-card__icon   { background: linear-gradient(135deg, #0ea5e9, #0284c7); }
        .acc-card--collected .acc-card__icon   { background: linear-gradient(135deg, #10b981, #059669); }
        .acc-card--debt .acc-card__icon     { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .acc-card--refund .acc-card__icon    { background: linear-gradient(135deg, #ef4444, #dc2626); }
        
        .acc-card--cash .acc-card__icon      { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .acc-card--bank .acc-card__icon  { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        
        .acc-card--pending-count .acc-card__icon { background: linear-gradient(135deg, #f97316, #ea580c); }
        .acc-card--pending-amount .acc-card__icon { background: linear-gradient(135deg, #ec4899, #db2777); }
        
        .acc-card--unpaid .acc-card__icon    { background: linear-gradient(135deg, #94a3b8, #64748b); }
        .acc-card--partial .acc-card__icon    { background: linear-gradient(135deg, #06b6d4, #0891b2); }
        .acc-card--paid .acc-card__icon    { background: linear-gradient(135deg, #10b981, #059669); }

        @media (max-width: 600px) {
            .acc-summary-grid--2, .acc-summary-grid--3 { grid-template-columns: 1fr; }
        }
    `]
})
export class AccountantDashboard implements OnInit {
    loading = signal(false);
    errorMessage = signal('');
    dashData = signal<AccountantDashBoardResponse[] | null>(null);

    selectedMonth = this.getCurrentMonthKey();

    constructor(private dashboardService: DashboardService) { }

    ngOnInit(): void {
        this.reload();
    }

    reload(): void {
        const range = this.getMonthRange();
        const locationId = Number(localStorage.getItem('locationId') ?? 0);
        const request: AccountantDashBoardRequest = {
            fromDate: range.from,
            toDate: range.to
        };

        if (locationId > 0) {
            request.locationIds = [locationId];
        }

        this.loading.set(true);
        this.errorMessage.set('');

        this.dashboardService.searchAccountantDashboard(request).subscribe({
            next: (res) => {
                this.dashData.set(res.data || []);
                this.loading.set(false);
            },
            error: () => {
                this.dashData.set(null);
                this.errorMessage.set('Không thể tải dữ liệu dashboard kế toán.');
                this.loading.set(false);
            }
        });
    }

    formatCurrency(value: number | undefined | null): string {
        return `${new Intl.NumberFormat('vi-VN').format(value ?? 0)} đ`;
    }

    private getMonthRange(): { from: string; to: string } {
        const key = /^\d{4}-\d{2}$/.test(this.selectedMonth) ? this.selectedMonth : this.getCurrentMonthKey();
        const [y, m] = key.split('-').map(Number);
        const first = new Date(y, m - 1, 1);
        const last = new Date(y, m, 0);
        return { from: this.fmt(first), to: this.fmt(last) };
    }

    private getCurrentMonthKey(): string {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    private fmt(d: Date): string {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
}
