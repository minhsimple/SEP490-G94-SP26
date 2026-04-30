import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { Location, LocationService } from '../service/location.service';
import {
    DashboardService,
    AdminDashBoardRequest,
    AdminDashBoardResponse,
    DashCenter,
    DashSummary
} from '../service/dashboard.service';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, ChartModule, SelectModule, MultiSelectModule, TagModule],
    template: `
        <div class="adm-dash">
            <!-- HEADER -->
            <div class="adm-header">
                <div>
                    <h2>Dashboard Quản lý</h2>
                    <p>Tổng quan tài chính, kinh doanh, vận hành và khách hàng theo kỳ</p>
                </div>
                <div class="adm-filters">
                    <p-multiSelect
                        [options]="locationOptions"
                        optionLabel="label"
                        optionValue="value"
                        [(ngModel)]="selectedLocationIds"
                        placeholder="Tất cả chi nhánh"
                        [showClear]="true"
                        [filter]="true"
                        filterPlaceholder="Tìm chi nhánh"
                        styleClass="w-full"
                        display="chip"
                    ></p-multiSelect>
                    <input type="month" class="month-input" [(ngModel)]="selectedMonth" (change)="reload()" />
                    <p-button label="Tìm kiếm" icon="pi pi-search" (onClick)="reload()"></p-button>
                </div>
            </div>

            <!-- LOADING / ERROR -->
            <div class="adm-loading" *ngIf="loading()">Đang tải số liệu dashboard...</div>
            <div class="adm-error" *ngIf="!loading() && errorMessage()">{{ errorMessage() }}</div>

            <ng-container *ngIf="!loading() && !errorMessage() && dashData()">
                <!-- PERIOD -->
                <div class="adm-period">
                    <i class="pi pi-calendar"></i>
                    Kỳ báo cáo: <strong>{{ dashData()!.period }}</strong>
                </div>

                <!-- SUMMARY CARDS -->
                <div class="adm-section-title"><i class="pi pi-chart-bar"></i> Tổng hợp</div>
                <div class="adm-summary-grid">
                    <div class="adm-card adm-card--revenue">
                        <div class="adm-card__icon"><i class="pi pi-wallet"></i></div>
                        <div class="adm-card__body">
                            <span>Doanh thu thực thu</span>
                            <strong>{{ formatCurrency(dashData()!.summary.financial.totalRevenue) }}</strong>
                        </div>
                    </div>
                    <div class="adm-card adm-card--expected">
                        <div class="adm-card__icon"><i class="pi pi-chart-line"></i></div>
                        <div class="adm-card__body">
                            <span>Doanh thu dự kiến</span>
                            <strong>{{ formatCurrency(dashData()!.summary.financial.expectedRevenue) }}</strong>
                        </div>
                    </div>
                    <div class="adm-card adm-card--rate">
                        <div class="adm-card__icon"><i class="pi pi-percentage"></i></div>
                        <div class="adm-card__body">
                            <span>Tỉ lệ thu</span>
                            <strong>{{ dashData()!.summary.financial.collectionRate | number:'1.1-1' }}%</strong>
                        </div>
                    </div>
                    <div class="adm-card adm-card--new">
                        <div class="adm-card__icon"><i class="pi pi-file-plus"></i></div>
                        <div class="adm-card__body">
                            <span>HĐ mới</span>
                            <strong>{{ dashData()!.summary.business.newContracts }}</strong>
                        </div>
                    </div>
                    <div class="adm-card adm-card--expiring">
                        <div class="adm-card__icon"><i class="pi pi-clock"></i></div>
                        <div class="adm-card__body">
                            <span>HĐ sắp hết hạn</span>
                            <strong>{{ dashData()!.summary.business.expiringContracts }}</strong>
                        </div>
                    </div>
                    <div class="adm-card adm-card--liquidated">
                        <div class="adm-card__icon"><i class="pi pi-ban"></i></div>
                        <div class="adm-card__body">
                            <span>HĐ đã thanh lý</span>
                            <strong>{{ dashData()!.summary.business.liquidatedContracts }}</strong>
                        </div>
                    </div>
                    <div class="adm-card adm-card--incident">
                        <div class="adm-card__icon"><i class="pi pi-exclamation-triangle"></i></div>
                        <div class="adm-card__body">
                            <span>Sự cố</span>
                            <strong>{{ dashData()!.summary.operation.totalIncidents }}</strong>
                        </div>
                    </div>
                    <div class="adm-card adm-card--customer">
                        <div class="adm-card__icon"><i class="pi pi-user-plus"></i></div>
                        <div class="adm-card__body">
                            <span>Khách hàng mới</span>
                            <strong>{{ dashData()!.summary.customer.newCustomers }}</strong>
                        </div>
                    </div>
                    <div class="adm-card adm-card--resident">
                        <div class="adm-card__icon"><i class="pi pi-users"></i></div>
                        <div class="adm-card__body">
                            <span>Cư dân hoạt động</span>
                            <strong>{{ dashData()!.summary.customer.totalActiveResidents }}</strong>
                        </div>
                    </div>
                </div>

                <!-- CHARTS ROW -->
                <div class="adm-charts-row" *ngIf="dashData()!.centers.length > 0">
                    <div class="adm-chart-card">
                        <h4>Doanh thu theo chi nhánh</h4>
                        <p-chart type="bar" [data]="revenueChartData()" [options]="barChartOptions()" class="h-80"></p-chart>
                    </div>
                    <div class="adm-chart-card">
                        <h4>Hợp đồng theo chi nhánh</h4>
                        <p-chart type="bar" [data]="contractChartData()" [options]="barChartOptions()" class="h-80"></p-chart>
                    </div>
                </div>

                <!-- COLLECTION RATE PIE -->
                <div class="adm-charts-row" *ngIf="dashData()!.centers.length > 0">
                    <div class="adm-chart-card">
                        <h4>Tỉ lệ thu tiền tổng hợp</h4>
                        <p-chart type="doughnut" [data]="collectionPieData()" [options]="pieOptions()"></p-chart>
                    </div>
                    <div class="adm-chart-card">
                        <h4>Khách hàng & sự cố theo chi nhánh</h4>
                        <p-chart type="bar" [data]="customerIncidentChartData()" [options]="barChartOptions()" class="h-80"></p-chart>
                    </div>
                </div>

                <!-- CENTER CARDS -->
                <div class="adm-section-title"><i class="pi pi-building"></i> Chi tiết theo chi nhánh</div>
                <div class="adm-center-grid">
                    <div class="adm-center-card" *ngFor="let c of dashData()!.centers">
                        <div class="adm-center-head">
                            <h3>{{ c.centerName }}</h3>
                            <p-tag [value]="'ID ' + c.centerId" severity="info"></p-tag>
                        </div>
                        <div class="adm-center-metrics">
                            <div class="adm-metric-group">
                                <h5><i class="pi pi-wallet"></i> Tài chính</h5>
                                <div class="adm-metric"><span>Doanh thu thực thu</span><strong>{{ formatCurrency(c.financial.totalRevenue) }}</strong></div>
                                <div class="adm-metric"><span>Doanh thu dự kiến</span><strong>{{ formatCurrency(c.financial.expectedRevenue) }}</strong></div>
                                <div class="adm-metric"><span>Tỉ lệ thu</span><strong>{{ c.financial.collectionRate | number:'1.1-1' }}%</strong></div>
                            </div>
                            <div class="adm-metric-group">
                                <h5><i class="pi pi-briefcase"></i> Kinh doanh</h5>
                                <div class="adm-metric"><span>HĐ mới</span><strong>{{ c.business.newContracts }}</strong></div>
                                <div class="adm-metric"><span>HĐ sắp hết hạn</span><strong>{{ c.business.expiringContracts }}</strong></div>
                                <div class="adm-metric"><span>HĐ đã thanh lý</span><strong>{{ c.business.liquidatedContracts }}</strong></div>
                            </div>
                            <div class="adm-metric-group">
                                <h5><i class="pi pi-exclamation-circle"></i> Vận hành</h5>
                                <div class="adm-metric"><span>Tổng sự cố</span><strong>{{ c.operation.totalIncidents }}</strong></div>
                            </div>
                            <div class="adm-metric-group">
                                <h5><i class="pi pi-users"></i> Khách hàng</h5>
                                <div class="adm-metric"><span>KH mới</span><strong>{{ c.customer.newCustomers }}</strong></div>
                                <div class="adm-metric"><span>Cư dân hoạt động</span><strong>{{ c.customer.totalActiveResidents }}</strong></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="adm-empty" *ngIf="dashData()!.centers.length === 0">
                    Không có dữ liệu chi nhánh cho kỳ này.
                </div>
            </ng-container>
        </div>
    `,
    styles: [`
        .adm-dash { display: flex; flex-direction: column; gap: 1.1rem; }
        .adm-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
        .adm-header h2 { margin: 0; font-size: 1.5rem; color: #0f172a; }
        .adm-header p { margin: 0.2rem 0 0; color: #64748b; font-size: 0.9rem; }
        .adm-filters { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; min-width: 340px; }
        .month-input {
            border: 1px solid #cbd5e1; border-radius: 8px; padding: 0.45rem 0.6rem;
            min-height: 2.2rem; background: #fff; color: #0f172a; font-size: 0.9rem;
        }
        .adm-loading, .adm-error, .adm-empty {
            background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
            padding: 1rem; color: #334155;
        }
        .adm-error { border-color: #fecaca; background: #fef2f2; color: #b91c1c; }
        .adm-period {
            background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
            border: 1px solid #e2e8f0; border-radius: 10px;
            padding: 0.7rem 1rem; font-size: 0.92rem; color: #334155;
            display: flex; align-items: center; gap: 0.5rem;
        }
        .adm-section-title {
            font-size: 1.05rem; font-weight: 700; color: #0f172a;
            display: flex; align-items: center; gap: 0.45rem;
            margin-top: 0.3rem;
        }

        /* ── Summary Cards ── */
        .adm-summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
            gap: 0.75rem;
        }
        .adm-card {
            display: flex; align-items: center; gap: 0.8rem;
            background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
            padding: 0.85rem 1rem;
            transition: box-shadow 0.2s, transform 0.15s;
        }
        .adm-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.06); transform: translateY(-2px); }
        .adm-card__icon {
            width: 42px; height: 42px; border-radius: 10px;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.15rem; color: #fff; flex-shrink: 0;
        }
        .adm-card__body { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
        .adm-card__body span { color: #64748b; font-size: 0.82rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .adm-card__body strong { color: #0f172a; font-size: 1.2rem; line-height: 1.15; }

        .adm-card--revenue .adm-card__icon   { background: linear-gradient(135deg, #0ea5e9, #0284c7); }
        .adm-card--expected .adm-card__icon   { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
        .adm-card--rate .adm-card__icon       { background: linear-gradient(135deg, #10b981, #059669); }
        .adm-card--new .adm-card__icon        { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .adm-card--expiring .adm-card__icon   { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .adm-card--liquidated .adm-card__icon { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .adm-card--incident .adm-card__icon   { background: linear-gradient(135deg, #f97316, #ea580c); }
        .adm-card--customer .adm-card__icon   { background: linear-gradient(135deg, #06b6d4, #0891b2); }
        .adm-card--resident .adm-card__icon   { background: linear-gradient(135deg, #14b8a6, #0d9488); }

        /* ── Charts ── */
        .adm-charts-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 0.8rem; }
        .adm-chart-card {
            background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem;
        }
        .adm-chart-card h4 { margin: 0 0 0.7rem; color: #0f172a; font-size: 0.95rem; }
        .h-80 { height: 320px; }

        /* ── Center Detail Cards ── */
        .adm-center-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 0.85rem; }
        .adm-center-card {
            background: #fff; border: 1px solid #e2e8f0; border-radius: 12px;
            padding: 1rem; transition: box-shadow 0.2s;
        }
        .adm-center-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,.06); }
        .adm-center-head {
            display: flex; justify-content: space-between; align-items: center;
            gap: 0.5rem; margin-bottom: 0.8rem; flex-wrap: wrap;
        }
        .adm-center-head h3 { margin: 0; font-size: 1.05rem; color: #0f172a; }
        .adm-center-metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
        .adm-metric-group {
            background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 10px;
            padding: 0.65rem 0.8rem;
        }
        .adm-metric-group h5 {
            margin: 0 0 0.4rem; font-size: 0.82rem; color: #64748b;
            display: flex; align-items: center; gap: 0.35rem;
        }
        .adm-metric {
            display: flex; justify-content: space-between; gap: 0.5rem;
            font-size: 0.85rem; color: #334155; margin-bottom: 0.25rem;
        }
        .adm-metric:last-child { margin-bottom: 0; }
        .adm-metric strong { color: #0f172a; }

        @media (max-width: 600px) {
            .adm-center-metrics { grid-template-columns: 1fr; }
            .adm-charts-row { grid-template-columns: 1fr; }
        }
    `]
})
export class AdminDashboardComponent implements OnInit {
    loading = signal(false);
    errorMessage = signal('');
    dashData = signal<AdminDashBoardResponse | null>(null);

    selectedMonth = this.getCurrentMonthKey();
    selectedLocationIds: number[] = [];
    locationOptions: Array<{ label: string; value: number }> = [];

    constructor(
        private dashboardService: DashboardService,
        private locationService: LocationService
    ) {}

    ngOnInit(): void {
        this.loadLocations();
    }

    reload(): void {
        const range = this.getMonthRange();
        const request: AdminDashBoardRequest = {
            fromDate: range.from,
            toDate: range.to
        };
        if (this.selectedLocationIds && this.selectedLocationIds.length > 0) {
            request.locationIds = this.selectedLocationIds;
        }

        this.loading.set(true);
        this.errorMessage.set('');

        this.dashboardService.searchDashboard(request).subscribe({
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

    // ── Chart data builders ──

    revenueChartData(): any {
        const centers = this.dashData()?.centers ?? [];
        return {
            labels: centers.map(c => c.centerName),
            datasets: [
                { label: 'Doanh thu thực thu', backgroundColor: '#0ea5e9', borderRadius: 6, data: centers.map(c => c.financial.totalRevenue) },
                { label: 'Doanh thu dự kiến', backgroundColor: '#a78bfa', borderRadius: 6, data: centers.map(c => c.financial.expectedRevenue) }
            ]
        };
    }

    contractChartData(): any {
        const centers = this.dashData()?.centers ?? [];
        return {
            labels: centers.map(c => c.centerName),
            datasets: [
                { label: 'HĐ mới', backgroundColor: '#3b82f6', borderRadius: 6, data: centers.map(c => c.business.newContracts) },
                { label: 'HĐ sắp hết hạn', backgroundColor: '#f59e0b', borderRadius: 6, data: centers.map(c => c.business.expiringContracts) },
                { label: 'HĐ đã thanh lý', backgroundColor: '#ef4444', borderRadius: 6, data: centers.map(c => c.business.liquidatedContracts) }
            ]
        };
    }

    collectionPieData(): any {
        const s = this.dashData()?.summary?.financial;
        const collected = s?.totalRevenue ?? 0;
        const remaining = Math.max((s?.expectedRevenue ?? 0) - collected, 0);
        return {
            labels: ['Đã thu', 'Chưa thu'],
            datasets: [{ data: [collected, remaining], backgroundColor: ['#22c55e', '#e2e8f0'] }]
        };
    }

    customerIncidentChartData(): any {
        const centers = this.dashData()?.centers ?? [];
        return {
            labels: centers.map(c => c.centerName),
            datasets: [
                { label: 'KH mới', backgroundColor: '#06b6d4', borderRadius: 6, data: centers.map(c => c.customer.newCustomers) },
                { label: 'Sự cố', backgroundColor: '#f97316', borderRadius: 6, data: centers.map(c => c.operation.totalIncidents) }
            ]
        };
    }

    barChartOptions(): any {
        return {
            maintainAspectRatio: false,
            plugins: { legend: { labels: { color: '#334155' } } },
            scales: {
                x: { ticks: { color: '#64748b' }, grid: { color: 'transparent' } },
                y: { beginAtZero: true, ticks: { color: '#64748b' }, grid: { color: '#e2e8f0' } }
            }
        };
    }

    pieOptions(): any {
        return { plugins: { legend: { position: 'bottom', labels: { color: '#334155' } } } };
    }

    formatCurrency(value: number): string {
        return `${new Intl.NumberFormat('vi-VN').format(value ?? 0)} đ`;
    }

    // ── Helpers ──

    private loadLocations(): void {
        this.locationService.searchLocations({ page: 0, size: 500, sort: 'name,ASC' }).subscribe({
            next: (res) => {
                const list = res.data?.content ?? [];
                this.locationOptions = list.map(item => ({
                    label: item.name ?? `Chi nhánh #${item.id}`,
                    value: Number(item.id)
                }));
                this.reload();
            },
            error: () => {
                this.errorMessage.set('Không thể tải danh sách chi nhánh.');
            }
        });
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
