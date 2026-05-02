import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import {
    DashboardService,
    SaleDashBoardRequest,
    SaleDashBoardResponse
} from '../service/dashboard.service';

@Component({
    selector: 'app-sale-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, ChartModule, TagModule],
    template: `
        <div class="sale-dash">
            <!-- HEADER -->
            <div class="sale-header">
                <div>
                    <h2>Dashboard Cá nhân (Sale)</h2>
                    <p>Theo dõi hiệu suất kinh doanh, khách hàng và doanh thu cá nhân</p>
                </div>
                <div class="sale-filters">
                    <input type="month" class="month-input" [(ngModel)]="selectedMonth" (change)="reload()" />
                    <p-button label="Tìm kiếm" icon="pi pi-search" (onClick)="reload()"></p-button>
                </div>
            </div>

            <!-- LOADING / ERROR -->
            <div class="sale-loading" *ngIf="loading()">Đang tải số liệu dashboard...</div>
            <div class="sale-error" *ngIf="!loading() && errorMessage()">{{ errorMessage() }}</div>

            <ng-container *ngIf="!loading() && !errorMessage() && dashData()">
                <!-- PERIOD -->
                <div class="sale-period">
                    <i class="pi pi-calendar"></i>
                    Báo cáo tháng: <strong>{{ selectedMonth }}</strong>
                </div>

                <!-- OVERALL STATS (BIG NUMBERS) -->
                <div class="sale-section-title"><i class="pi pi-chart-line"></i> Chỉ số tổng quan (Tất cả thời gian)</div>
                <div class="sale-summary-grid">
                    <div class="sale-card sale-card--customer">
                        <div class="sale-card__icon"><i class="pi pi-users"></i></div>
                        <div class="sale-card__body">
                            <span>Khách hàng phụ trách</span>
                            <strong>{{ dashData()!.customersInChargeCount }}</strong>
                        </div>
                    </div>
                    <div class="sale-card sale-card--contract">
                        <div class="sale-card__icon"><i class="pi pi-file"></i></div>
                        <div class="sale-card__body">
                            <span>Tổng hợp đồng</span>
                            <strong>{{ dashData()!.totalContracts }}</strong>
                        </div>
                    </div>
                    <div class="sale-card sale-card--active">
                        <div class="sale-card__icon"><i class="pi pi-check-circle"></i></div>
                        <div class="sale-card__body">
                            <span>HĐ đang hoạt động</span>
                            <strong>{{ dashData()!.activeContracts }}</strong>
                        </div>
                    </div>
                    <div class="sale-card sale-card--revenue">
                        <div class="sale-card__icon"><i class="pi pi-wallet"></i></div>
                        <div class="sale-card__body">
                            <span>Doanh thu thực thu</span>
                            <strong>{{ formatCurrency(dashData()!.totalCollectedAmount) }}</strong>
                        </div>
                    </div>
                    <div class="sale-card sale-card--value">
                        <div class="sale-card__icon"><i class="pi pi-dollar"></i></div>
                        <div class="sale-card__body">
                            <span>Tổng giá trị HĐ</span>
                            <strong>{{ formatCurrency(dashData()!.totalContractValue) }}</strong>
                        </div>
                    </div>
                    <div class="sale-card sale-card--remaining">
                        <div class="sale-card__icon"><i class="pi pi-clock"></i></div>
                        <div class="sale-card__body">
                            <span>Số tiền cần thu</span>
                            <strong>{{ formatCurrency(dashData()!.remainingAmountToCollect) }}</strong>
                        </div>
                    </div>
                </div>

                <!-- PERIOD STATS (IN MONTH) -->
                <div class="sale-section-title mt-4"><i class="pi pi-calendar-plus"></i> Chỉ số trong tháng {{ selectedMonth }}</div>
                <div class="sale-summary-grid">
                    <div class="sale-card sale-card--filtered-count">
                        <div class="sale-card__icon"><i class="pi pi-plus-circle"></i></div>
                        <div class="sale-card__body">
                            <span>HĐ mới trong tháng</span>
                            <strong>{{ dashData()!.filteredContractsCount }}</strong>
                        </div>
                    </div>
                    <div class="sale-card sale-card--filtered-revenue">
                        <div class="sale-card__icon"><i class="pi pi-chart-bar"></i></div>
                        <div class="sale-card__body">
                            <span>Doanh thu trong tháng</span>
                            <strong>{{ formatCurrency(dashData()!.filteredRevenue) }}</strong>
                        </div>
                    </div>
                    <div class="sale-card sale-card--average">
                        <div class="sale-card__icon"><i class="pi pi-calculator"></i></div>
                        <div class="sale-card__body">
                            <span>Giá trị TB hợp đồng</span>
                            <strong>{{ formatCurrency(dashData()!.averageContractValue) }}</strong>
                        </div>
                    </div>
                </div>

                <!-- CHARTS ROW -->
                <div class="sale-charts-row mt-4">
                    <div class="sale-chart-card">
                        <h4>Trạng thái hợp đồng (Trong tháng)</h4>
                        <div class="chart-container">
                            <p-chart type="pie" [data]="statusPieData()" [options]="pieOptions()"></p-chart>
                        </div>
                    </div>
                </div>
            </ng-container>
        </div>
    `,
    styles: [`
        .sale-dash { display: flex; flex-direction: column; gap: 1.1rem; }
        .sale-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
        .sale-header h2 { margin: 0; font-size: 1.5rem; color: #0f172a; }
        .sale-header p { margin: 0.2rem 0 0; color: #64748b; font-size: 0.9rem; }
        .sale-filters { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
        .month-input {
            border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.45rem 0.6rem;
            min-height: 2.2rem; background: #fff; color: #0f172a; font-size: 0.9rem;
        }
        .sale-loading, .sale-error {
            background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
            padding: 1rem; color: #334155;
        }
        .sale-error { border-color: #fecaca; background: #fef2f2; color: #b91c1c; }
        .sale-period {
            background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
            border: 1px solid #e2e8f0; border-radius: 10px;
            padding: 0.7rem 1rem; font-size: 0.92rem; color: #334155;
            display: flex; align-items: center; gap: 0.5rem;
        }
        .sale-section-title {
            font-size: 1.05rem; font-weight: 700; color: #0f172a;
            display: flex; align-items: center; gap: 0.45rem;
            margin-top: 0.3rem;
        }
        .mt-4 { margin-top: 1.5rem; }

        /* ── Summary Cards ── */
        .sale-summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 0.75rem;
        }
        .sale-card {
            display: flex; align-items: center; gap: 0.8rem;
            background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
            padding: 0.85rem 1rem;
            transition: box-shadow 0.2s, transform 0.15s;
        }
        .sale-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.06); transform: translateY(-2px); }
        .sale-card__icon {
            width: 42px; height: 42px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.15rem; color: #fff; flex-shrink: 0;
        }
        .sale-card__body { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
        .sale-card__body span { color: #64748b; font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sale-card__body strong { color: #0f172a; font-size: 1.2rem; line-height: 1.15; }

        .sale-card--customer .sale-card__icon   { background: linear-gradient(135deg, #06b6d4, #0891b2); }
        .sale-card--contract .sale-card__icon   { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .sale-card--active .sale-card__icon     { background: linear-gradient(135deg, #10b981, #059669); }
        .sale-card--revenue .sale-card__icon    { background: linear-gradient(135deg, #0ea5e9, #0284c7); }
        .sale-card--value .sale-card__icon      { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .sale-card--remaining .sale-card__icon  { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .sale-card--filtered-count .sale-card__icon { background: linear-gradient(135deg, #14b8a6, #0d9488); }
        .sale-card--filtered-revenue .sale-card__icon { background: linear-gradient(135deg, #6366f1, #4f46e5); }
        .sale-card--average .sale-card__icon    { background: linear-gradient(135deg, #ec4899, #db2777); }

        /* ── Charts ── */
        .sale-charts-row { display: grid; grid-template-columns: 1fr; gap: 0.8rem; }
        .sale-chart-card {
            background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem;
            display: flex; flex-direction: column; align-items: center;
        }
        .sale-chart-card h4 { margin: 0 0 1rem; color: #0f172a; font-size: 0.95rem; align-self: flex-start; }
        .chart-container { width: 100%; max-width: 300px; }

        @media (max-width: 600px) {
            .sale-charts-row { grid-template-columns: 1fr; }
        }
    `]
})
export class SaleDashboard implements OnInit {
    loading = signal(false);
    errorMessage = signal('');
    dashData = signal<SaleDashBoardResponse | null>(null);

    selectedMonth = this.getCurrentMonthKey();

    constructor(private dashboardService: DashboardService) { }

    ngOnInit(): void {
        this.reload();
    }

    reload(): void {
        const range = this.getMonthRange();
        const request: SaleDashBoardRequest = {
            fromDate: range.from,
            toDate: range.to
        };

        this.loading.set(true);
        this.errorMessage.set('');

        this.dashboardService.searchSaleDashboard(request).subscribe({
            next: (res) => {
                this.dashData.set(res.data);
                this.loading.set(false);
            },
            error: () => {
                this.dashData.set(null);
                this.errorMessage.set('Không thể tải dữ liệu dashboard.');
                this.loading.set(false);
            }
        });
    }

    statusPieData(): any {
        const d = this.dashData();
        if (!d) return { labels: [], datasets: [] };
        return {
            labels: ['Hoạt động', 'Đã thanh lý', 'Đã hủy'],
            datasets: [
                {
                    data: [d.activeCount, d.liquidatedCount, d.canceledCount],
                    backgroundColor: ['#22c55e', '#3b82f6', '#ef4444'],
                    hoverBackgroundColor: ['#16a34a', '#2563eb', '#dc2626']
                }
            ]
        };
    }

    pieOptions(): any {
        return {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#334155', usePointStyle: true }
                }
            },
            maintainAspectRatio: false
        };
    }

    formatCurrency(value: number): string {
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
