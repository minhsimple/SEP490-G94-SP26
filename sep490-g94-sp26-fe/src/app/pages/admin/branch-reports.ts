import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { BookingService } from '../service/booking.service';
import { CustomerService } from '../service/customer.service';
import { Hall, HallService } from '../service/hall.service';
import { InvoiceService } from '../service/invoice.service';
import { LeadService } from '../service/lead.service';
import { Location, LocationService } from '../service/location.service';
import { Payment, PaymentService } from '../service/payment.service';

interface ContractStateBreakdown {
    draft: number;
    active: number;
    liquidated: number;
    cancelled: number;
}

interface InvoiceStateBreakdown {
    total: number;
    paid: number;
    partiallyPaid: number;
    unpaid: number;
}

interface PaymentStateBreakdown {
    total: number;
    success: number;
    pending: number;
    failed: number;
}

interface RevenueHealth {
    billedAmount: number;
    collectedAmount: number;
    outstandingAmount: number;
    collectionRate: number;
}

interface BranchReportRow {
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
    contractState: ContractStateBreakdown;
    invoiceState: InvoiceStateBreakdown;
    paymentState: PaymentStateBreakdown;
    revenueHealth: RevenueHealth;
}

@Component({
    selector: 'app-admin-branch-reports',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, SelectModule, TagModule, ChartModule],
    providers: [BookingService, PaymentService, InvoiceService],
    template: `
        <div class="report-page">
            <div class="report-header">
                <div>
                    <h2>Báo cáo chi tiết chi nhánh</h2>
                    <p>Báo cáo của từng chi nhánh được tối ưu để theo dõi doanh thu.</p>
                </div>
                <div class="report-actions">
                    <input type="month" class="month-input" [(ngModel)]="selectedMonth" (change)="reload()" />
                    <p-button label="Làm mới" icon="pi pi-refresh" (onClick)="reload()"></p-button>
                </div>
            </div>

            <div class="unauthorized" *ngIf="!isAdmin">
                Bạn không có quyền truy cập trang báo cáo tổng hợp chi nhánh.
            </div>

            <ng-container *ngIf="isAdmin">
                <div class="loading" *ngIf="loading()">Đang tải báo cáo...</div>
                <div class="error" *ngIf="!loading() && errorMessage()">{{ errorMessage() }}</div>

                <ng-container *ngIf="!loading() && !errorMessage()">
                    <div class="summary-grid" *ngIf="selectedRow() as detail">
                        <div class="summary-card">
                            <span>Chi nhánh</span>
                            <strong>{{ detail.locationName }}</strong>
                        </div>
                        <div class="summary-card">
                            <span>Doanh thu tháng</span>
                            <strong>{{ formatCurrency(detail.revenueInMonth) }}</strong>
                        </div>
                        <div class="summary-card">
                            <span>Tổng giá trị doanh thu theo tháng</span>
                            <strong>{{ formatCurrency(totalMonthlyRevenueValue(detail)) }}</strong>
                        </div>
                        <div class="summary-card">
                            <span>Tổng giá trị hóa đơn (tháng)</span>
                            <strong>{{ formatCurrency(detail.revenueHealth.billedAmount) }}</strong>
                        </div>
                        <div class="summary-card">
                            <span>Tổng đã thu (tháng)</span>
                            <strong>{{ formatCurrency(detail.revenueHealth.collectedAmount) }}</strong>
                        </div>
                        <div class="summary-card">
                            <span>Tỉ lệ thu tiền</span>
                            <strong>{{ detail.revenueHealth.collectionRate }}%</strong>
                        </div>
                        <div class="summary-card">
                            <span>Giá trị TB / hợp đồng tháng</span>
                            <strong>{{ formatCurrency(detail.avgRevenuePerContractInMonth) }}</strong>
                        </div>
                    </div>

                    <div class="detail-branch-picker" *ngIf="rows().length > 0">
                        <label>Chi nhánh xem chi tiết</label>
                        <p-select
                            [options]="locationOptions"
                            optionLabel="label"
                            optionValue="value"
                            [(ngModel)]="selectedDetailLocationId"
                            [showClear]="true"
                            placeholder="Chọn chi nhánh"
                            (onChange)="onDetailBranchChange()"
                        ></p-select>
                    </div>

                    <div class="detail" *ngIf="selectedRow() as detail">
                        <div class="detail-head">
                            <h3>Chi tiết: {{ detail.locationName }}</h3>
                            <p-tag [value]="'ID ' + detail.locationId" severity="secondary"></p-tag>
                        </div>

                        <div class="detail-grid">
                            <div class="detail-card">
                                <h4>Tổng quan doanh thu</h4>
                                <div class="metric-line"><span>Doanh thu tháng</span><strong>{{ formatCurrency(detail.revenueInMonth) }}</strong></div>
                                <div class="metric-line"><span>Tổng giá trị doanh thu theo tháng</span><strong>{{ formatCurrency(totalMonthlyRevenueValue(detail)) }}</strong></div>
                                <div class="metric-line"><span>Tổng giá trị hóa đơn tháng</span><strong>{{ formatCurrency(detail.revenueHealth.billedAmount) }}</strong></div>
                                <div class="metric-line"><span>Tổng đã thu tháng</span><strong>{{ formatCurrency(detail.revenueHealth.collectedAmount) }}</strong></div>
                                <div class="metric-line"><span>Tỉ lệ thu tiền</span><strong>{{ detail.revenueHealth.collectionRate }}%</strong></div>
                            </div>

                            <div class="detail-card">
                                <h4>Trạng thái hợp đồng theo tháng</h4>
                                <div class="metric-line"><span>Nháp</span><strong>{{ detail.contractState.draft }}</strong></div>
                                <div class="metric-line"><span>Hiệu lực</span><strong>{{ detail.contractState.active }}</strong></div>
                                <div class="metric-line"><span>Đã thanh lý</span><strong>{{ detail.contractState.liquidated }}</strong></div>
                                <div class="metric-line"><span>Đã hủy</span><strong>{{ detail.contractState.cancelled }}</strong></div>
                            </div>

                            <div class="detail-card">
                                <h4>Trạng thái hóa đơn theo tháng</h4>
                                <div class="metric-line"><span>Tổng hóa đơn</span><strong>{{ detail.invoiceState.total }}</strong></div>
                                <div class="metric-line"><span>Đã thanh toán</span><strong>{{ detail.invoiceState.paid }}</strong></div>
                                <div class="metric-line"><span>Thanh toán một phần</span><strong>{{ detail.invoiceState.partiallyPaid }}</strong></div>
                                <div class="metric-line"><span>Chưa thanh toán</span><strong>{{ detail.invoiceState.unpaid }}</strong></div>
                            </div>

                            <div class="detail-card">
                                <h4>Trạng thái thanh toán theo tháng</h4>
                                <div class="metric-line"><span>Tổng giao dịch</span><strong>{{ detail.paymentState.total }}</strong></div>
                                <div class="metric-line"><span>Thành công</span><strong>{{ detail.paymentState.success }}</strong></div>
                                <div class="metric-line"><span>Đang xử lý</span><strong>{{ detail.paymentState.pending }}</strong></div>
                                <div class="metric-line"><span>Thất bại/khác</span><strong>{{ detail.paymentState.failed }}</strong></div>
                            </div>
                        </div>

                        <div class="chart-grid">
                            <div class="chart-card">
                                <h4>Biểu đồ trạng thái hợp đồng theo tháng</h4>
                                <p-chart type="doughnut" [data]="contractChartData(detail)" [options]="pieChartOptions()"></p-chart>
                            </div>
                            <div class="chart-card">
                                <h4>Biểu đồ trạng thái hóa đơn</h4>
                                <p-chart type="doughnut" [data]="invoiceChartData(detail)" [options]="pieChartOptions()"></p-chart>
                            </div>
                            <div class="chart-card">
                                <h4>Biểu đồ trạng thái thanh toán</h4>
                                <p-chart type="doughnut" [data]="paymentChartData(detail)" [options]="pieChartOptions()"></p-chart>
                            </div>
                        </div>
                    </div>

                    <div class="empty" *ngIf="rows().length === 0">
                        Không có dữ liệu báo cáo cho bộ lọc hiện tại.
                    </div>
                </ng-container>
            </ng-container>
        </div>
    `,
    styles: [`
        .report-page { display: flex; flex-direction: column; gap: 1rem; }
        .report-header { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
        .report-header h2 { margin: 0; color: #0f172a; }
        .report-header p { margin: 0.25rem 0 0; color: #64748b; font-size: 0.9rem; }
        .report-actions { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; min-width: 320px; }
        .month-input {
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            padding: 0.45rem 0.6rem;
            min-height: 2.2rem;
            background: #fff;
            color: #0f172a;
        }
        .unauthorized, .loading, .error, .empty {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 0.9rem 1rem;
            color: #334155;
        }
        .error { border-color: #fecaca; background: #fef2f2; color: #b91c1c; }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 0.8rem;
        }
        .summary-card {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 0.75rem 0.9rem;
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
        }
        .summary-card span { color: #64748b; font-size: 0.83rem; }
        .summary-card strong { color: #0f172a; font-size: 1.1rem; }
        .detail-branch-picker {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 0.75rem 0.9rem;
            display: flex;
            flex-direction: column;
            gap: 0.45rem;
            max-width: 380px;
        }
        .detail-branch-picker label {
            color: #334155;
            font-size: 0.85rem;
            font-weight: 600;
        }
        .detail {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1rem;
        }
        .detail-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.8rem;
            margin-bottom: 0.8rem;
            flex-wrap: wrap;
        }
        .detail-head h3 { margin: 0; color: #0f172a; font-size: 1.05rem; }
        .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 0.8rem;
        }
        .detail-card {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 0.8rem;
            background: #f8fafc;
        }
        .detail-card h4 { margin: 0 0 0.55rem; color: #0f172a; font-size: 0.92rem; }
        .chart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 0.8rem;
            margin-top: 0.8rem;
        }
        .chart-card {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 0.8rem;
            background: #fff;
        }
        .chart-card h4 { margin: 0 0 0.6rem; color: #0f172a; font-size: 0.9rem; }
        .metric-line {
            display: flex;
            justify-content: space-between;
            gap: 0.75rem;
            font-size: 0.85rem;
            margin-bottom: 0.35rem;
            color: #334155;
        }
        .metric-line:last-child { margin-bottom: 0; }
        .metric-line strong { color: #0f172a; }
    `]
})
export class BranchReportsComponent implements OnInit {
    readonly roleCode = (localStorage.getItem('codeRole') ?? '').toUpperCase();
    readonly isAdmin = this.roleCode.includes('ADMIN');

    rows = signal<BranchReportRow[]>([]);
    selectedRow = signal<BranchReportRow | null>(null);
    loading = signal(false);
    errorMessage = signal('');

    selectedDetailLocationId: number | null = null;
    selectedMonth = this.getCurrentMonthKey();

    locations = signal<Location[]>([]);
    locationOptions: Array<{ label: string; value: number }> = [];

    constructor(
        private readonly locationService: LocationService,
        private readonly hallService: HallService,
        private readonly leadService: LeadService,
        private readonly customerService: CustomerService,
        private readonly bookingService: BookingService,
        private readonly paymentService: PaymentService,
        private readonly invoiceService: InvoiceService
    ) {}

    ngOnInit(): void {
        if (!this.isAdmin) {
            this.errorMessage.set('Bạn không có quyền truy cập trang này.');
            return;
        }
        this.loadLocations();
    }

    reload(): void {
        this.loadReportRows();
    }

    onDetailBranchChange(): void {
        if (!this.selectedDetailLocationId) {
            this.selectedRow.set(this.rows()[0] ?? null);
            return;
        }

        const target = this.rows().find((row) => row.locationId === this.selectedDetailLocationId) ?? null;
        this.selectedRow.set(target);
    }

    formatCurrency(value: number): string {
        return `${new Intl.NumberFormat('vi-VN').format(this.toNumber(value))} đ`;
    }

    totalMonthlyRevenueValue(row: BranchReportRow): number {
        // Prefer billed value when available, fallback to collected revenue to avoid empty-looking KPI.
        return Math.max(this.toNumber(row.revenueHealth.billedAmount), this.toNumber(row.revenueInMonth));
    }

    contractChartData(row: BranchReportRow): any {
        return {
            labels: ['Nháp', 'Hiệu lực', 'Đã thanh lý', 'Đã hủy'],
            datasets: [
                {
                    data: [
                        row.contractState.draft,
                        row.contractState.active,
                        row.contractState.liquidated,
                        row.contractState.cancelled
                    ],
                    backgroundColor: ['#94a3b8', '#22c55e', '#0ea5e9', '#f97316']
                }
            ]
        };
    }

    invoiceChartData(row: BranchReportRow): any {
        return {
            labels: ['Đã thanh toán', 'Thanh toán một phần', 'Chưa thanh toán'],
            datasets: [
                {
                    data: [row.invoiceState.paid, row.invoiceState.partiallyPaid, row.invoiceState.unpaid],
                    backgroundColor: ['#16a34a', '#f59e0b', '#ef4444']
                }
            ]
        };
    }

    paymentChartData(row: BranchReportRow): any {
        return {
            labels: ['Thành công', 'Đang xử lý', 'Thất bại'],
            datasets: [
                {
                    data: [row.paymentState.success, row.paymentState.pending, row.paymentState.failed],
                    backgroundColor: ['#22c55e', '#f59e0b', '#ef4444']
                }
            ]
        };
    }

    pieChartOptions(): any {
        const textColor = this.resolveCssVar('--text-color', '#334155');
        return {
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: textColor }
                }
            }
        };
    }

    private loadLocations(): void {
        this.loading.set(true);
        this.errorMessage.set('');
        this.locationService.searchLocations({ page: 0, size: 500, sort: 'name,ASC' }).subscribe({
            next: (res) => {
                const list = res.data?.content ?? [];
                this.locations.set(list);
                this.locationOptions = list.map((item) => ({
                    label: item.name ?? `Chi nhánh #${item.id}`,
                    value: this.toNumber(item.id)
                }));
                this.loadReportRows();
            },
            error: () => {
                this.rows.set([]);
                this.selectedRow.set(null);
                this.errorMessage.set('Không thể tải danh sách chi nhánh.');
                this.loading.set(false);
            }
        });
    }

    private loadReportRows(): void {
        const source = this.locations();
        const targets = source;

        if (!targets.length) {
            this.rows.set([]);
            this.selectedRow.set(null);
            this.loading.set(false);
            return;
        }

        this.loading.set(true);
        this.errorMessage.set('');

        forkJoin(targets.map((location) => this.buildBranchReport(location))).subscribe({
            next: (rows) => {
                const sorted = rows.sort((a, b) => a.locationName.localeCompare(b.locationName));
                this.rows.set(sorted);
                const selectedId = this.selectedDetailLocationId;
                const selected = selectedId
                    ? sorted.find((row) => row.locationId === selectedId) ?? null
                    : null;

                if (selected) {
                    this.selectedRow.set(selected);
                    this.selectedDetailLocationId = selected.locationId;
                } else {
                    this.selectedRow.set(sorted[0] ?? null);
                    this.selectedDetailLocationId = sorted[0]?.locationId ?? null;
                }
                this.loading.set(false);
            },
            error: () => {
                this.rows.set([]);
                this.selectedRow.set(null);
                this.errorMessage.set('Không thể tải báo cáo tổng hợp chi nhánh.');
                this.loading.set(false);
            }
        });
    }

    private buildBranchReport(location: Location): Observable<BranchReportRow> {
        const locationId = this.toNumber(location.id);
        const locationName = location.name ?? `Chi nhánh #${locationId}`;
        const selectedMonthFilter = this.getSelectedMonthRangeFilter();

        return this.hallService.searchHalls({ page: 0, size: 500, locationId, sort: 'name,ASC' }).pipe(
            switchMap((hallRes) => {
                const halls = hallRes.data?.content ?? [];
                const hallIds = this.extractHallIds(halls);

                return forkJoin({
                    leadsRes: this.leadService.searchLeads({ page: 0, size: 1, locationId }),
                    customersRes: this.customerService.searchCustomers({ page: 0, size: 1, locationId }),
                    contractsTotal: this.sumContractsByHall(hallIds, selectedMonthFilter),
                    contractsActive: this.sumContractsByHall(hallIds, { contractState: 'ACTIVE', ...selectedMonthFilter }),
                    contractsDraft: this.sumContractsByHall(hallIds, { contractState: 'DRAFT', ...selectedMonthFilter }),
                    contractsLiquidated: this.sumContractsByHall(hallIds, { contractState: 'LIQUIDATED', ...selectedMonthFilter }),
                    contractsCancelled: this.sumContractsByHall(hallIds, { contractState: 'CANCELLED', ...selectedMonthFilter }),
                    upcoming30Days: this.sumContractsByHall(hallIds, this.next30DayFilter()),
                    monthlyRevenue: this.getMonthlyRevenueByHall(hallIds),
                    invoiceState: this.getInvoiceBreakdownByHall(hallIds),
                    paymentState: this.getPaymentBreakdownByHall(hallIds),
                    revenueHealth: this.getRevenueHealthByHall(hallIds)
                }).pipe(
                    map((result) => ({
                        locationId,
                        locationName,
                        halls: hallRes.data?.totalElements ?? hallIds.length,
                        leads: result.leadsRes.data?.totalElements ?? 0,
                        customers: result.customersRes.data?.totalElements ?? 0,
                        contracts: result.contractsTotal,
                        activeContracts: result.contractsActive,
                        upcoming30Days: result.upcoming30Days,
                        contractsInMonth: result.monthlyRevenue.contractsInMonth,
                        revenueInMonth: result.monthlyRevenue.revenueInMonth,
                        avgRevenuePerContractInMonth: result.monthlyRevenue.avgRevenuePerContractInMonth,
                        contractState: {
                            draft: result.contractsDraft,
                            active: result.contractsActive,
                            liquidated: result.contractsLiquidated,
                            cancelled: result.contractsCancelled
                        },
                        invoiceState: result.invoiceState,
                        paymentState: result.paymentState,
                        revenueHealth: result.revenueHealth
                    }))
                );
            })
        );
    }

    private getRevenueHealthByHall(hallIds: number[]): Observable<RevenueHealth> {
        if (!hallIds.length) {
            return of({ billedAmount: 0, collectedAmount: 0, outstandingAmount: 0, collectionRate: 0 });
        }

        return forkJoin({
            invoices: this.getInvoicesByHallIds(hallIds, true),
            collectedAmount: this.getCollectedAmountByHall(hallIds)
        }).pipe(
            map(({ invoices, collectedAmount }) => {
                const billedAmount = invoices.reduce((sum: number, invoice: any) => {
                    return sum + this.toNumber(invoice?.totalAmount);
                }, 0);

                const outstandingAmount = Math.max(billedAmount - collectedAmount, 0);

                const collectionRate = billedAmount > 0
                    ? Math.round((collectedAmount / billedAmount) * 10000) / 100
                    : 0;

                return {
                    billedAmount,
                    collectedAmount,
                    outstandingAmount,
                    collectionRate
                };
            })
        );
    }

    private getInvoiceBreakdownByHall(hallIds: number[]): Observable<InvoiceStateBreakdown> {
        if (!hallIds.length) {
            return of({ total: 0, paid: 0, partiallyPaid: 0, unpaid: 0 });
        }

        return this.getInvoicesByHallIds(hallIds, true).pipe(
            map((invoices) => {

                let paid = 0;
                let partiallyPaid = 0;
                let unpaid = 0;

                invoices.forEach((invoice: any) => {
                    const state = String(invoice?.invoiceState ?? '').toUpperCase();
                    if (state === 'PAID') {
                        paid += 1;
                    } else if (state === 'PARTIALLY_PAID' || state === 'PARTIAL') {
                        partiallyPaid += 1;
                    } else {
                        unpaid += 1;
                    }
                });

                return {
                    total: invoices.length,
                    paid,
                    partiallyPaid,
                    unpaid
                };
            })
        );
    }

    private getPaymentBreakdownByHall(hallIds: number[]): Observable<PaymentStateBreakdown> {
        if (!hallIds.length) {
            return of({ total: 0, success: 0, pending: 0, failed: 0 });
        }

        const range = this.getSelectedMonthRange();

        return this.fetchAllPayments({ sort: 'updatedAt,DESC' }).pipe(
            switchMap((payments) => {
                const paymentsInMonth = payments.filter((payment) =>
                    this.isInDateRange(this.getPaymentFilterDate(payment), range.from, range.to)
                );

                const contractIds = Array.from(
                    new Set(
                        paymentsInMonth
                            .map((payment) => this.toNumber(payment.contractId))
                            .filter((id) => id > 0)
                    )
                );

                if (!contractIds.length) {
                    return of({ total: 0, success: 0, pending: 0, failed: 0 });
                }

                return forkJoin(contractIds.map((id) => this.bookingService.getById(id))).pipe(
                    map((contractResponses) => {
                        const hallByContract = new Map<number, number>();
                        contractResponses.forEach((response) => {
                            const contractId = this.toNumber(response?.data?.id);
                            const hallId = this.toNumber(response?.data?.hallId);
                            if (contractId > 0 && hallId > 0) {
                                hallByContract.set(contractId, hallId);
                            }
                        });

                        const hallSet = new Set(hallIds);
                        const branchPayments = paymentsInMonth.filter((payment) => {
                            const contractId = this.toNumber(payment.contractId);
                            const hallId = hallByContract.get(contractId) ?? 0;
                            return hallSet.has(hallId);
                        });

                        let success = 0;
                        let pending = 0;
                        let failed = 0;

                        branchPayments.forEach((payment) => {
                            const state = String(payment.paymentState ?? payment.status ?? '').toUpperCase();
                            if (state === 'SUCCESS' || state === 'PAID' || state === 'COMPLETED') {
                                success += 1;
                            } else if (state === 'PENDING' || state === 'PROCESSING') {
                                pending += 1;
                            } else {
                                failed += 1;
                            }
                        });

                        return {
                            total: branchPayments.length,
                            success,
                            pending,
                            failed
                        };
                    })
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
            return of({ contractsInMonth: 0, revenueInMonth: 0, avgRevenuePerContractInMonth: 0 });
        }

        const range = this.getSelectedMonthRange();

        return this.fetchAllPayments({
            paymentState: 'SUCCESS',
            sort: 'paidAt,DESC'
        }).pipe(
            switchMap((payments) => {
                const successfulPayments = payments.filter((payment) =>
                    this.isInDateRange(this.getPaymentFilterDate(payment), range.from, range.to)
                );

                const contractIds = Array.from(
                    new Set(
                        successfulPayments
                            .map((payment) => this.toNumber(payment.contractId))
                            .filter((id) => id > 0)
                    )
                );

                if (!contractIds.length) {
                    return of({ contractsInMonth: 0, revenueInMonth: 0, avgRevenuePerContractInMonth: 0 });
                }

                return forkJoin(contractIds.map((id) => this.bookingService.getById(id))).pipe(
                    map((contractResponses) => {
                        const hallByContract = new Map<number, number>();
                        contractResponses.forEach((response) => {
                            const contractId = this.toNumber(response?.data?.id);
                            const hallId = this.toNumber(response?.data?.hallId);
                            if (contractId > 0 && hallId > 0) {
                                hallByContract.set(contractId, hallId);
                            }
                        });

                        const hallSet = new Set(hallIds);
                        const branchPayments = successfulPayments.filter((payment) => {
                            const contractId = this.toNumber(payment.contractId);
                            const hallId = hallByContract.get(contractId) ?? 0;
                            return hallSet.has(hallId);
                        });

                        const contractsInMonth = new Set(
                            branchPayments
                                .map((payment) => this.toNumber(payment.contractId))
                                .filter((id) => id > 0)
                        ).size;

                        const revenueInMonth = branchPayments.reduce((sum, payment) => sum + this.toNumber(payment.amount), 0);

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
        ).pipe(
            map((responses) => responses.reduce((sum, res) => sum + (res.data?.totalElements ?? 0), 0))
        );
    }

    private next30DayFilter(): { bookingDateFrom: string; bookingDateTo: string } {
        const now = new Date();
        const end = new Date(now);
        end.setDate(end.getDate() + 30);
        return {
            bookingDateFrom: this.toDateOnly(now),
            bookingDateTo: this.toDateOnly(end)
        };
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

    private toDateOnly(date: Date): string {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    private extractHallIds(halls: Hall[]): number[] {
        return halls
            .map((hall) => this.toNumber(hall.id))
            .filter((id) => Number.isFinite(id) && id > 0);
    }

    private resolveCssVar(name: string, fallback: string): string {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name)?.trim();
        return value || fallback;
    }

    private fetchAllInvoices(params: { sort?: string; contractId?: number; invoiceState?: string; status?: string }): Observable<any[]> {
        const size = 500;
        return this.invoiceService.searchInvoices({ ...params, page: 0, size }).pipe(
            switchMap((firstRes) => {
                const firstContent = firstRes.data?.content ?? [];
                const totalPages = this.toNumber(firstRes.data?.totalPages);

                if (totalPages <= 1) {
                    return of(firstContent);
                }

                const requests: Observable<any>[] = [];
                for (let page = 1; page < totalPages; page += 1) {
                    requests.push(
                        this.invoiceService.searchInvoices({ ...params, page, size }).pipe(
                            map((res) => res.data?.content ?? [])
                        )
                    );
                }

                return forkJoin(requests).pipe(
                    map((otherPages) => [
                        ...firstContent,
                        ...otherPages.flat()
                    ])
                );
            })
        );
    }

    private fetchAllPayments(params: { sort?: string; paymentState?: string; method?: string; keyword?: string }): Observable<Payment[]> {
        const size = 500;
        return this.paymentService.searchPayments({ ...params, page: 0, size }).pipe(
            switchMap((firstRes) => {
                const firstContent = firstRes.data?.content ?? [];
                const totalPages = this.toNumber(firstRes.data?.totalPages);

                if (totalPages <= 1) {
                    return of(firstContent);
                }

                const requests: Observable<Payment[]>[] = [];
                for (let page = 1; page < totalPages; page += 1) {
                    requests.push(
                        this.paymentService.searchPayments({ ...params, page, size }).pipe(
                            map((res) => res.data?.content ?? [])
                        )
                    );
                }

                return forkJoin(requests).pipe(
                    map((otherPages) => [
                        ...firstContent,
                        ...otherPages.flat()
                    ])
                );
            })
        );
    }

    private getInvoicesByHallIds(hallIds: number[], onlySelectedMonth = false): Observable<any[]> {
        if (!hallIds.length) {
            return of([]);
        }

        const hallSet = new Set(hallIds);
        const range = this.getSelectedMonthRange();
        return this.fetchAllInvoices({ sort: 'id,DESC' }).pipe(
            switchMap((invoices) => {
                const unresolvedContractIds = Array.from(
                    new Set(
                        invoices
                            .filter((invoice) => {
                                const directHallId = this.toNumber(invoice?.hall?.id ?? invoice?.hallId);
                                return !hallSet.has(directHallId) && this.toNumber(invoice?.contractId) > 0;
                            })
                            .map((invoice) => this.toNumber(invoice?.contractId))
                            .filter((id) => id > 0)
                    )
                );

                if (!unresolvedContractIds.length) {
                    const branchInvoices = invoices.filter((invoice) => {
                        const directHallId = this.toNumber(invoice?.hall?.id ?? invoice?.hallId);
                        return hallSet.has(directHallId);
                    });
                    return of(this.filterInvoicesByMonth(branchInvoices, range.from, range.to, onlySelectedMonth));
                }

                return forkJoin(unresolvedContractIds.map((id) => this.bookingService.getById(id))).pipe(
                    map((contractResponses) => {
                        const hallByContract = new Map<number, number>();
                        contractResponses.forEach((response) => {
                            const contractId = this.toNumber(response?.data?.id);
                            const hallId = this.toNumber(response?.data?.hallId);
                            if (contractId > 0 && hallId > 0) {
                                hallByContract.set(contractId, hallId);
                            }
                        });

                        const branchInvoices = invoices.filter((invoice) => {
                            const directHallId = this.toNumber(invoice?.hall?.id ?? invoice?.hallId);
                            if (hallSet.has(directHallId)) {
                                return true;
                            }
                            const contractId = this.toNumber(invoice?.contractId);
                            const resolvedHallId = hallByContract.get(contractId) ?? 0;
                            return hallSet.has(resolvedHallId);
                        });

                        return this.filterInvoicesByMonth(branchInvoices, range.from, range.to, onlySelectedMonth);
                    })
                );
            })
        );
    }

    private getCollectedAmountByHall(hallIds: number[]): Observable<number> {
        if (!hallIds.length) {
            return of(0);
        }

        const range = this.getSelectedMonthRange();

        return this.fetchAllPayments({ sort: 'updatedAt,DESC' }).pipe(
            switchMap((payments) => {
                const successfulPayments = payments.filter((payment) => {
                    const state = String(payment.paymentState ?? payment.status ?? '').toUpperCase();
                    return state === 'SUCCESS' || state === 'PAID' || state === 'COMPLETED';
                }).filter((payment) =>
                    this.isInDateRange(this.getPaymentFilterDate(payment), range.from, range.to)
                );

                const contractIds = Array.from(
                    new Set(
                        successfulPayments
                            .map((payment) => this.toNumber(payment.contractId))
                            .filter((id) => id > 0)
                    )
                );

                if (!contractIds.length) {
                    return of(0);
                }

                return forkJoin(contractIds.map((id) => this.bookingService.getById(id))).pipe(
                    map((contractResponses) => {
                        const hallByContract = new Map<number, number>();
                        contractResponses.forEach((response) => {
                            const contractId = this.toNumber(response?.data?.id);
                            const hallId = this.toNumber(response?.data?.hallId);
                            if (contractId > 0 && hallId > 0) {
                                hallByContract.set(contractId, hallId);
                            }
                        });

                        const hallSet = new Set(hallIds);
                        const branchCollectedAmount = successfulPayments
                            .filter((payment) => {
                                const contractId = this.toNumber(payment.contractId);
                                const hallId = hallByContract.get(contractId) ?? 0;
                                return hallSet.has(hallId);
                            })
                            .reduce((sum, payment) => sum + this.toNumber(payment.amount), 0);

                        return branchCollectedAmount;
                    })
                );
            })
        );
    }

    private filterInvoicesByMonth(invoices: any[], fromDate: string, toDate: string, enabled: boolean): any[] {
        if (!enabled) {
            return invoices;
        }

        return invoices.filter((invoice) =>
            this.isInDateRange(
                this.getInvoiceFilterDate(invoice),
                fromDate,
                toDate
            )
        );
    }

    private getSelectedMonthRangeFilter(): { bookingDateFrom: string; bookingDateTo: string } {
        const range = this.getSelectedMonthRange();
        return {
            bookingDateFrom: range.from,
            bookingDateTo: range.to
        };
    }

    private getInvoiceFilterDate(invoice: any): string | undefined {
        return (
            invoice?.invoiceDate
            ?? invoice?.createdAt
            ?? invoice?.bookingDate
            ?? invoice?.issuedAt
            ?? invoice?.createDate
            ?? invoice?.dueDate
        );
    }

    private getPaymentFilterDate(payment: Payment): string | undefined {
        return payment.paidAt ?? payment.paymentDate ?? payment.createdAt;
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
