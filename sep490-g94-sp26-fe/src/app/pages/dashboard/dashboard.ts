import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { BookingService } from '../service/booking.service';
import { CustomerService } from '../service/customer.service';
import { Hall, HallService } from '../service/hall.service';
import { LeadService } from '../service/lead.service';
import { Location, LocationService } from '../service/location.service';
import { Payment, PaymentService } from '../service/payment.service';

interface BranchMetrics {
    locationId: number;
    locationName: string;
    halls: number;
    leads: number;
    customers: number;
    contracts: number;
    activeContracts: number;
    upcoming30Days: number;
    contractsInMonth: number;
    revenueInMonth: number;
    avgRevenuePerContractInMonth: number;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, SelectModule, ChartModule],
    providers: [BookingService, PaymentService],
    template: `
        <div class="dash-page">
            <div class="dash-header">
                <div>
                    <h2>Dashboard Chi nhánh</h2>

                </div>
                <div class="dash-actions">
                    <p-select
                        *ngIf="isAdmin"
                        [options]="locationOptions"
                        optionLabel="label"
                        optionValue="value"
                        [(ngModel)]="selectedLocationId"
                        (onChange)="onLocationFilterChange()"
                        [showClear]="true"
                        placeholder="Tất cả chi nhánh"
                        styleClass="w-full"
                    ></p-select>
                    <input type="month" class="month-input" [(ngModel)]="selectedMonth" (change)="onMonthChange()" />
                    <p-button label="Làm mới" icon="pi pi-refresh" (onClick)="reload()"></p-button>
                </div>
            </div>

            <div class="quick-actions" *ngIf="isAdmin">
                <p-button
                    label="Quản lý chi nhánh"
                    icon="pi pi-sitemap"
                    severity="secondary"
                    [outlined]="true"
                    (onClick)="goToLocationManagement()"
                ></p-button>
                <p-button
                    label="Quản lý người dùng"
                    icon="pi pi-users"
                    severity="secondary"
                    [outlined]="true"
                    (onClick)="goToUserManagement()"
                ></p-button>
            </div>

            <div class="loading-box" *ngIf="loading()">Đang tải số liệu dashboard...</div>
            <div class="error-box" *ngIf="!loading() && errorMessage()">{{ errorMessage() }}</div>

            <div class="summary-grid" *ngIf="!loading() && !errorMessage() && metrics().length > 0">
                <div class="summary-card">
                    <span>Chi nhánh hiển thị</span>
                    <strong>{{ totalBranches() }}</strong>
                </div>
                <div class="summary-card">
                    <span>Tổng hợp đồng</span>
                    <strong>{{ totalContracts() }}</strong>
                </div>
                <div class="summary-card">
                    <span>Hợp đồng hiệu lực</span>
                    <strong>{{ totalActiveContracts() }}</strong>
                </div>
                <div class="summary-card">
                    <span>Tổng khách hàng</span>
                    <strong>{{ totalCustomers() }}</strong>
                </div>
                <div class="summary-card">
                    <span>Tổng lead</span>
                    <strong>{{ totalLeads() }}</strong>
                </div>
                <div class="summary-card">
                    <span>Sự kiện 30 ngày tới</span>
                    <strong>{{ totalUpcoming30Days() }}</strong>
                </div>
                <div class="summary-card">
                    <span>Doanh thu tháng {{ selectedMonthLabel() }}</span>
                    <strong>{{ formatCurrency(totalRevenueInMonth()) }}</strong>
                </div>
                <div class="summary-card">
                    <span>HĐ trong tháng {{ selectedMonthLabel() }}</span>
                    <strong>{{ totalContractsInMonth() }}</strong>
                </div>
                <div class="summary-card">
                    <span>Giá trị TB / HĐ tháng</span>
                    <strong>{{ formatCurrency(avgRevenuePerContractInMonth()) }}</strong>
                </div>
            </div>

            <div class="kpi-grid" *ngIf="!loading() && !errorMessage() && metrics().length > 0">
                <div class="branch-card" *ngFor="let item of metrics()">
                    <div class="branch-head">
                        <h3>{{ item.locationName }}</h3>
                        <span class="branch-code">ID: {{ item.locationId }}</span>
                    </div>

                    <div class="kpi-list">
                        <div class="kpi-row"><span>Sảnh</span><strong>{{ item.halls }}</strong></div>
                        <div class="kpi-row"><span>Lead</span><strong>{{ item.leads }}</strong></div>
                        <div class="kpi-row"><span>Khách hàng</span><strong>{{ item.customers }}</strong></div>
                        <div class="kpi-row"><span>Hợp đồng</span><strong>{{ item.contracts }}</strong></div>
                        <div class="kpi-row"><span>HĐ hiệu lực</span><strong>{{ item.activeContracts }}</strong></div>
                        <div class="kpi-row"><span>Sự kiện 30 ngày tới</span><strong>{{ item.upcoming30Days }}</strong></div>
                        <div class="kpi-row"><span>HĐ tháng {{ selectedMonthLabel() }}</span><strong>{{ item.contractsInMonth }}</strong></div>
                        <div class="kpi-row"><span>Doanh thu tháng</span><strong>{{ formatCurrency(item.revenueInMonth) }}</strong></div>
                        <div class="kpi-row"><span>TB / HĐ tháng</span><strong>{{ formatCurrency(item.avgRevenuePerContractInMonth) }}</strong></div>
                    </div>
                </div>
            </div>

            <div class="chart-card" *ngIf="!loading() && !errorMessage() && metrics().length > 0">
                <div class="chart-head">
                    <h3>Doanh thu theo chi nhánh</h3>
                    <span>Doanh thu tháng {{ selectedMonthLabel() }} và hợp đồng trong tháng</span>
                </div>
                <p-chart type="bar" [data]="chartData()" [options]="chartOptions()" class="h-90"></p-chart>
            </div>

            <div class="empty-box" *ngIf="!loading() && !errorMessage() && metrics().length === 0">
                Không có chi nhánh phù hợp để hiển thị.
            </div>
        </div>
    `,
    styles: [`
        .dash-page {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .dash-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            flex-wrap: wrap;
        }
        .dash-header h2 {
            margin: 0;
            font-size: 1.5rem;
            color: #0f172a;
        }
        .dash-header p {
            margin: 0.25rem 0 0;
            color: #64748b;
            font-size: 0.92rem;
        }
        .dash-actions {
            min-width: 300px;
            display: flex;
            gap: 0.5rem;
            align-items: center;
            flex-wrap: wrap;
        }
        .month-input {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 0.45rem 0.6rem;
            color: #0f172a;
            min-height: 2.2rem;
            background: #fff;
        }
        .quick-actions {
            display: flex;
            gap: 0.6rem;
            flex-wrap: wrap;
        }
        .loading-box,
        .error-box,
        .empty-box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1rem;
            color: #334155;
        }
        .error-box {
            border-color: #fecaca;
            color: #b91c1c;
            background: #fef2f2;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 0.8rem;
        }
        .summary-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 0.85rem 0.9rem;
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
        }
        .summary-card span {
            color: #64748b;
            font-size: 0.85rem;
        }
        .summary-card strong {
            color: #0f172a;
            font-size: 1.35rem;
            line-height: 1.1;
        }
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 0.9rem;
        }
        .chart-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1rem;
        }
        .chart-head {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 0.5rem;
            margin-bottom: 0.8rem;
            flex-wrap: wrap;
        }
        .chart-head h3 {
            margin: 0;
            color: #0f172a;
            font-size: 1rem;
        }
        .chart-head span {
            color: #64748b;
            font-size: 0.85rem;
        }
        .branch-card {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1rem;
        }
        .branch-head {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 0.5rem;
            margin-bottom: 0.7rem;
        }
        .branch-head h3 {
            margin: 0;
            font-size: 1rem;
            color: #0f172a;
        }
        .branch-code {
            color: #64748b;
            font-size: 0.8rem;
        }
        .kpi-list {
            display: flex;
            flex-direction: column;
            gap: 0.45rem;
        }
        .kpi-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px dashed #e2e8f0;
            padding-bottom: 0.35rem;
            font-size: 0.92rem;
        }
        .kpi-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        .kpi-row span {
            color: #64748b;
        }
        .kpi-row strong {
            color: #0f172a;
            font-size: 1rem;
        }
    `]
})
export class Dashboard implements OnInit {
    readonly roleCode = (localStorage.getItem('codeRole') ?? '').toUpperCase();
    readonly isAdmin = this.roleCode.includes('ADMIN');
    readonly isManager = this.roleCode.includes('MANAGER');
    readonly assignedLocationId = Number(localStorage.getItem('locationId') ?? 0) || null;

    locations = signal<Location[]>([]);
    metrics = signal<BranchMetrics[]>([]);
    chartData = signal<any>(null);
    chartOptions = signal<any>(null);
    loading = signal(false);
    errorMessage = signal('');

    selectedLocationId: number | null = null;
    selectedMonth = this.getCurrentMonthKey();
    locationOptions: Array<{ label: string; value: number }> = [];

    totalBranches = computed(() => this.metrics().length);
    totalContracts = computed(() => this.metrics().reduce((sum, item) => sum + item.contracts, 0));
    totalActiveContracts = computed(() => this.metrics().reduce((sum, item) => sum + item.activeContracts, 0));
    totalCustomers = computed(() => this.metrics().reduce((sum, item) => sum + item.customers, 0));
    totalLeads = computed(() => this.metrics().reduce((sum, item) => sum + item.leads, 0));
    totalUpcoming30Days = computed(() => this.metrics().reduce((sum, item) => sum + item.upcoming30Days, 0));
    totalRevenueInMonth = computed(() => this.metrics().reduce((sum, item) => sum + item.revenueInMonth, 0));
    totalContractsInMonth = computed(() => this.metrics().reduce((sum, item) => sum + item.contractsInMonth, 0));
    avgRevenuePerContractInMonth = computed(() => {
        const contracts = this.totalContractsInMonth();
        if (!contracts) return 0;
        return this.totalRevenueInMonth() / contracts;
    });

    constructor(
        private readonly router: Router,
        private readonly locationService: LocationService,
        private readonly hallService: HallService,
        private readonly leadService: LeadService,
        private readonly customerService: CustomerService,
        private readonly bookingService: BookingService,
        private readonly paymentService: PaymentService
    ) {}

    ngOnInit(): void {
        this.loadLocations();
    }

    onLocationFilterChange(): void {
        this.reload();
    }

    onMonthChange(): void {
        this.reload();
    }

    reload(): void {
        this.errorMessage.set('');
        const source = this.locations();
        const targets = this.pickTargetLocations(source);

        if (targets.length === 0) {
            this.metrics.set([]);
            return;
        }

        this.loading.set(true);
        forkJoin(targets.map((location) => this.buildBranchMetrics(location))).subscribe({
            next: (rows) => {
                const sortedRows = rows.sort((a, b) => a.locationName.localeCompare(b.locationName));
                this.metrics.set(sortedRows);
                this.rebuildChart(sortedRows);
                this.loading.set(false);
            },
            error: () => {
                this.metrics.set([]);
                this.chartData.set(null);
                this.errorMessage.set('Không thể tải số liệu dashboard theo chi nhánh.');
                this.loading.set(false);
            }
        });
    }

    goToLocationManagement(): void {
        this.router.navigate(['/pages/location']);
    }

    goToUserManagement(): void {
        this.router.navigate(['/pages/users']);
    }

    private loadLocations(): void {
        this.loading.set(true);
        this.errorMessage.set('');

        this.locationService.searchLocations({ page: 0, size: 500, sort: 'name,ASC' }).subscribe({
            next: (res) => {
                const allLocations = res.data?.content ?? [];
                let visibleLocations = allLocations;

                if (!this.isAdmin && this.assignedLocationId) {
                    visibleLocations = allLocations.filter((item) => Number(item.id) === this.assignedLocationId);
                    this.selectedLocationId = this.assignedLocationId;
                }

                this.locations.set(visibleLocations);
                this.locationOptions = visibleLocations
                    .filter((item) => Number(item.id) > 0)
                    .map((item) => ({ label: item.name ?? `Chi nhánh #${item.id}`, value: Number(item.id) }));

                if (!this.isAdmin && !this.selectedLocationId && this.locationOptions.length > 0) {
                    this.selectedLocationId = this.locationOptions[0].value;
                }

                this.loading.set(false);
                this.reload();
            },
            error: () => {
                this.locations.set([]);
                this.metrics.set([]);
                this.chartData.set(null);
                this.errorMessage.set('Không thể tải danh sách chi nhánh.');
                this.loading.set(false);
            }
        });
    }

    private pickTargetLocations(source: Location[]): Location[] {
        if (!source.length) return [];

        if (this.isAdmin && this.selectedLocationId) {
            return source.filter((item) => Number(item.id) === this.selectedLocationId);
        }

        if (!this.isAdmin && this.assignedLocationId) {
            return source.filter((item) => Number(item.id) === this.assignedLocationId);
        }

        return source;
    }

    private buildBranchMetrics(location: Location): Observable<BranchMetrics> {
        const locationId = Number(location.id);
        const locationName = location.name ?? `Chi nhánh #${locationId}`;

        return this.hallService.searchHalls({ page: 0, size: 500, locationId, sort: 'name,ASC' }).pipe(
            switchMap((hallRes) => {
                const halls = hallRes.data?.content ?? [];
                const hallIds = halls
                    .map((item: Hall) => Number(item.id))
                    .filter((id) => Number.isFinite(id) && id > 0);

                return forkJoin({
                    leadsRes: this.leadService.searchLeads({ page: 0, size: 1, locationId }),
                    customersRes: this.customerService.searchCustomers({ page: 0, size: 1, locationId }),
                    contractsTotal: this.sumContractsByHall(hallIds),
                    contractsActive: this.sumContractsByHall(hallIds, { contractState: 'ACTIVE' }),
                    upcoming30Days: this.sumContractsByHall(hallIds, this.next30DayFilter()),
                    monthlyRevenue: this.getMonthlyRevenueByHall(hallIds)
                }).pipe(
                    map((group) => ({
                        locationId,
                        locationName,
                        halls: hallRes.data?.totalElements ?? hallIds.length,
                        leads: group.leadsRes.data?.totalElements ?? 0,
                        customers: group.customersRes.data?.totalElements ?? 0,
                        contracts: group.contractsTotal,
                        activeContracts: group.contractsActive,
                        upcoming30Days: group.upcoming30Days,
                        contractsInMonth: group.monthlyRevenue.contractsInMonth,
                        revenueInMonth: group.monthlyRevenue.revenueInMonth,
                        avgRevenuePerContractInMonth: group.monthlyRevenue.avgRevenuePerContractInMonth
                    }))
                );
            })
        );
    }

    private getMonthlyRevenueByHall(hallIds: number[]): Observable<{
        contractsInMonth: number;
        revenueInMonth: number;
        avgRevenuePerContractInMonth: number;
    }> {
        if (!hallIds.length) {
            return of({
                contractsInMonth: 0,
                revenueInMonth: 0,
                avgRevenuePerContractInMonth: 0
            });
        }

        const range = this.getSelectedMonthRange();

        return this.paymentService.searchPayments({
            page: 0,
            size: 1000,
            paymentState: 'SUCCESS',
            sort: 'paidAt,DESC'
        }).pipe(
            switchMap((res) => {
                const successfulPayments = (res.data?.content ?? []).filter((p) =>
                    this.isInDateRange(p.paidAt ?? p.paymentDate ?? p.updatedAt ?? p.createdAt, range.from, range.to)
                );

                const contractIds = Array.from(
                    new Set(
                        successfulPayments
                            .map((p) => this.toNumber(p.contractId))
                            .filter((id) => id > 0)
                    )
                );

                if (!contractIds.length) {
                    return of({
                        contractsInMonth: 0,
                        revenueInMonth: 0,
                        avgRevenuePerContractInMonth: 0
                    });
                }

                return forkJoin(contractIds.map((id) => this.bookingService.getById(id))).pipe(
                    map((contractResponses) => {
                        const hallByContract = new Map<number, number>();
                        contractResponses.forEach((response) => {
                            const contract = response?.data;
                            const contractId = this.toNumber(contract?.id);
                            const hallId = this.toNumber(contract?.hallId);
                            if (contractId > 0 && hallId > 0) {
                                hallByContract.set(contractId, hallId);
                            }
                        });

                        const hallIdSet = new Set(hallIds);
                        const branchPayments = successfulPayments.filter((payment) => {
                            const contractId = this.toNumber(payment.contractId);
                            const hallId = hallByContract.get(contractId) ?? 0;
                            return hallIdSet.has(hallId);
                        });

                        const contractsInMonth = new Set(
                            branchPayments
                                .map((p) => this.toNumber(p.contractId))
                                .filter((id) => id > 0)
                        ).size;

                        const revenueInMonth = branchPayments.reduce((sum, p) => sum + this.toNumber(p.amount), 0);

                        return {
                            contractsInMonth,
                            revenueInMonth,
                            avgRevenuePerContractInMonth: contractsInMonth > 0 ? revenueInMonth / contractsInMonth : 0
                        };
                    })
                );
            })
        );
    }

    private sumContractsByHall(
        hallIds: number[],
        extraFilter?: { contractState?: string; bookingDateFrom?: string; bookingDateTo?: string }
    ): Observable<number> {
        if (!hallIds.length) {
            return of(0);
        }

        return forkJoin(
            hallIds.map((hallId) =>
                this.bookingService.searchBookings({
                    hallId,
                    page: 0,
                    size: 1,
                    ...extraFilter
                })
            )
        ).pipe(map((responses) => responses.reduce((sum, res) => sum + (res.data?.totalElements ?? 0), 0)));
    }

    private next30DayFilter(): { bookingDateFrom: string; bookingDateTo: string } {
        const now = new Date();
        const from = this.toDateOnly(now);
        const end = new Date(now);
        end.setDate(end.getDate() + 30);
        return {
            bookingDateFrom: from,
            bookingDateTo: this.toDateOnly(end)
        };
    }

    private toDateOnly(date: Date): string {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    private rebuildChart(rows: BranchMetrics[]): void {
        if (!rows.length) {
            this.chartData.set(null);
            return;
        }

        const style = getComputedStyle(document.documentElement);
        const textColor = style.getPropertyValue('--text-color') || '#334155';
        const textMutedColor = style.getPropertyValue('--text-color-secondary') || '#64748b';
        const borderColor = style.getPropertyValue('--surface-border') || '#e2e8f0';

        this.chartData.set({
            labels: rows.map((x) => x.locationName),
            datasets: [
                {
                    label: `Doanh thu ${this.selectedMonthLabel()}`,
                    backgroundColor: '#0ea5e9',
                    borderRadius: 6,
                    data: rows.map((x) => x.revenueInMonth)
                },
                {
                    label: 'HĐ trong tháng',
                    backgroundColor: '#10b981',
                    borderRadius: 6,
                    data: rows.map((x) => x.contractsInMonth)
                }
            ]
        });

        this.chartOptions.set({
            maintainAspectRatio: false,
            aspectRatio: 1.8,
            plugins: {
                legend: {
                    labels: { color: textColor }
                }
            },
            scales: {
                x: {
                    ticks: { color: textMutedColor },
                    grid: { color: 'transparent' }
                },
                y: {
                    beginAtZero: true,
                    ticks: { color: textMutedColor },
                    grid: { color: borderColor }
                }
            }
        });
    }

    selectedMonthLabel(): string {
        if (!this.selectedMonth || !/^\d{4}-\d{2}$/.test(this.selectedMonth)) {
            return this.getCurrentMonthKey();
        }
        const [year, month] = this.selectedMonth.split('-');
        return `${month}/${year}`;
    }

    formatCurrency(value: number): string {
        return `${new Intl.NumberFormat('vi-VN').format(this.toNumber(value))} đ`;
    }

    private getSelectedMonthRange(): { from: string; to: string } {
        const key = /^\d{4}-\d{2}$/.test(this.selectedMonth) ? this.selectedMonth : this.getCurrentMonthKey();
        const [yearStr, monthStr] = key.split('-');
        const year = Number(yearStr);
        const month = Number(monthStr);

        const firstDay = new Date(year, month - 1, 1);
        const lastDay = new Date(year, month, 0);

        return {
            from: this.toDateOnly(firstDay),
            to: this.toDateOnly(lastDay)
        };
    }

    private getCurrentMonthKey(): string {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        return `${yyyy}-${mm}`;
    }

    private toNumber(value: unknown): number {
        const num = Number(value ?? 0);
        return Number.isFinite(num) ? num : 0;
    }

    private isInDateRange(rawDate: string | undefined, fromDate: string, toDate: string): boolean {
        if (!rawDate) return false;
        const datePart = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
        return datePart >= fromDate && datePart <= toDate;
    }
}
