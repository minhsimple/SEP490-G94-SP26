import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { catchError, forkJoin, map, of } from 'rxjs';
import { Booking, BookingService } from '../service/booking.service';
import { CustomerService } from '../service/customer.service';
import { InvoiceService } from '../service/invoice.service';
import { LocationService } from '../service/location.service';
import { TaskList, TaskListService } from '../service/beo.service';
import { RoleService } from '../service/role.service';
import { User, UserService } from '../service/users.service';
import { Payment, PaymentService } from '../service/payment.service';

interface SalesMetrics {
  customersManaged: number;
  contracts: number;
  activeContracts: number;
  upcoming30Days: number;
  contractsInMonth: number;
  revenueInMonth: number;
  avgRevenuePerContractInMonth: number;
}

interface CoordinatorMetrics {
  contracts: number;
  activeContracts: number;
  upcoming30Days: number;
  contractsInMonth: number;
  taskLists: number;
  completedTaskLists: number;
  pendingTaskLists: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

interface ContractParticipationRow {
  id: number;
  contractNo: string;
  customerName: string;
  bookingDate: string;
  contractState: string;
  totalAmount: number;
  collectedAmount: number;
  remainingAmount: number;
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, ButtonModule, TagModule, TableModule, ChartModule],
  providers: [BookingService, PaymentService, InvoiceService],
  template: `
    <div class="detail-page">
      <div class="detail-header">
        <div>
          <h2>Chi tiết người dùng</h2>
          <p>
            Thông tin cá nhân và thống kê theo vai trò.
          </p>
        </div>
        <div class="detail-actions">
          <p-button label="Quay lại" icon="pi pi-arrow-left" severity="secondary" [outlined]="true" (onClick)="goBack()" />
          <p-button label="Làm mới" icon="pi pi-refresh" (onClick)="reloadMetrics()" />
        </div>
      </div>

      <div class="error-box" *ngIf="errorMessage()">{{ errorMessage() }}</div>
      <div class="loading-box" *ngIf="loading()">Đang tải dữ liệu...</div>

      <ng-container *ngIf="!loading() && !errorMessage() && user() as detailUser">
        <div class="panel-card">
          <div class="panel-title">Thông tin người dùng</div>
          <table class="user-info-table">
            <tbody>
              <tr>
                <th>Họ và tên</th>
                <td>{{ detailUser.fullName || '-' }}</td>
                <th>Email</th>
                <td>{{ detailUser.email || '-' }}</td>
              </tr>
              <tr>
                <th>Số điện thoại</th>
                <td>{{ detailUser.phone || '-' }}</td>
                <th>Vai trò</th>
                <td>{{ roleName() }}</td>
              </tr>
              <tr>
                <th>Chi nhánh</th>
                <td>{{ locationName() }}</td>
                <th>Trạng thái</th>
                <td>
                  <p-tag [value]="statusLabel(detailUser.status)" [severity]="statusSeverity(detailUser.status)"></p-tag>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="stats-grid" *ngIf="salesMetrics() as sales">
          <div class="stats-card"><span>Khách hàng phụ trách</span><strong>{{ sales.customersManaged }}</strong></div>
          <div class="stats-card"><span>Tổng hợp đồng</span><strong>{{ sales.contracts }}</strong></div>
          <div class="stats-card"><span>Hợp đồng hiệu lực</span><strong>{{ sales.activeContracts }}</strong></div>
          <div class="stats-card"><span>{{ eventKpiLabel() }}</span><strong>{{ sales.upcoming30Days }}</strong></div>
          <div class="stats-card"><span>{{ contractsKpiLabel() }}</span><strong>{{ sales.contractsInMonth }}</strong></div>
          <div class="stats-card"><span>{{ revenueKpiLabel() }}</span><strong>{{ formatCurrency(sales.revenueInMonth) }}</strong></div>
          <div class="stats-card"><span>{{ avgRevenueKpiLabel() }}</span><strong>{{ formatCurrency(sales.avgRevenuePerContractInMonth) }}</strong></div>
        </div>

        <div class="stats-grid" *ngIf="coordinatorMetrics() as coordinator">
          <div class="stats-card"><span>Hợp đồng phụ trách</span><strong>{{ coordinator.contracts }}</strong></div>
          <div class="stats-card"><span>Hợp đồng hiệu lực</span><strong>{{ coordinator.activeContracts }}</strong></div>
          <div class="stats-card"><span>{{ eventKpiLabel() }}</span><strong>{{ coordinator.upcoming30Days }}</strong></div>
          <div class="stats-card"><span>{{ contractsKpiLabel() }}</span><strong>{{ coordinator.contractsInMonth }}</strong></div>
          <div class="stats-card"><span>Tổng task list</span><strong>{{ coordinator.taskLists }}</strong></div>
          <div class="stats-card"><span>Task list hoàn thành</span><strong>{{ coordinator.completedTaskLists }}</strong></div>
          <div class="stats-card"><span>Task list chưa hoàn thành</span><strong>{{ coordinator.pendingTaskLists }}</strong></div>
          <div class="stats-card"><span>Tổng task</span><strong>{{ coordinator.totalTasks }}</strong></div>
          <div class="stats-card"><span>Task hoàn thành</span><strong>{{ coordinator.completedTasks }}</strong></div>
          <div class="stats-card"><span>Tỉ lệ hoàn thành</span><strong>{{ coordinator.completionRate }}%</strong></div>
        </div>

        <div class="stats-grid" *ngIf="contractRows().length > 0">
          <div class="stats-card"><span>Số hợp đồng tham gia</span><strong>{{ contractRows().length }}</strong></div>
          <div class="stats-card"><span>Tổng giá trị hợp đồng</span><strong>{{ formatCurrency(totalContractValue()) }}</strong></div>
          <div class="stats-card"><span>Tổng tiền đã thu</span><strong>{{ formatCurrency(totalCollectedAmount()) }}</strong></div>
          <div class="stats-card"><span>Còn lại cần thu</span><strong>{{ formatCurrency(totalRemainingAmount()) }}</strong></div>
        </div>

        <div class="panel-card" *ngIf="contractChartData()">
          <div class="panel-title">Biểu đồ trạng thái hợp đồng</div>
          <div class="chart-wrap">
            <p-chart type="doughnut" [data]="contractChartData()" [options]="chartOptions()"></p-chart>
          </div>
        </div>

        <div class="panel-card" *ngIf="contractRows().length > 0">
          <div class="panel-title">Danh sách hợp đồng tham gia</div>
          <p-table [value]="contractRows()" dataKey="id" [tableStyle]="{ 'min-width': '72rem' }" [paginator]="true" [rows]="10" [rowsPerPageOptions]="[10, 20, 50]">
            <ng-template #header>
              <tr>
                <th>Mã hợp đồng</th>
                <th>Khách hàng</th>
                <th>Ngày tiệc</th>
                <th>Trạng thái</th>
                <th>Tổng giá trị</th>
                <th>Đã thu</th>
                <th>Còn lại</th>
              </tr>
            </ng-template>
            <ng-template #body let-row>
              <tr>
                <td>
                  <button type="button" class="contract-link" (click)="goToContractDetail(row.id)">{{ row.contractNo }}</button>
                </td>
                <td>{{ row.customerName }}</td>
                <td>{{ row.bookingDate }}</td>
                <td>
                  <p-tag [value]="contractStateLabel(row.contractState)" [severity]="contractStateSeverity(row.contractState)"></p-tag>
                </td>
                <td>{{ formatCurrency(row.totalAmount) }}</td>
                <td>{{ formatCurrency(row.collectedAmount) }}</td>
                <td>{{ formatCurrency(row.remainingAmount) }}</td>
              </tr>
            </ng-template>
          </p-table>
        </div>

        <div class="empty-box" *ngIf="!salesMetrics() && !coordinatorMetrics()">
          Chưa có bộ chỉ số riêng cho vai trò này.
        </div>
      </ng-container>
    </div>
  `,
  styles: [
    `
      .detail-page {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .detail-header {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        align-items: flex-start;
        flex-wrap: wrap;
      }
      .detail-header h2 {
        margin: 0;
        color: #0f172a;
      }
      .detail-header p {
        margin: 0.25rem 0 0;
        color: #64748b;
      }
      .detail-actions {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        flex-wrap: wrap;
      }
      .month-input {
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        padding: 0.45rem 0.6rem;
        min-height: 2.2rem;
        background: #fff;
        color: #0f172a;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 0.8rem;
      }
      .panel-card,
      .stats-card,
      .loading-box,
      .error-box,
      .empty-box {
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 0.9rem;
      }
      .panel-title {
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 0.85rem;
      }
      .user-info-table {
        width: 100%;
        border-collapse: collapse;
      }
      .user-info-table th,
      .user-info-table td {
        border-bottom: 1px solid #e2e8f0;
        padding: 0.65rem 0.5rem;
        text-align: left;
      }
      .user-info-table th {
        width: 12rem;
        color: #475569;
        font-weight: 600;
        background: #f8fafc;
      }
      .user-info-table td {
        color: #0f172a;
      }
      .user-info-table tr:last-child th,
      .user-info-table tr:last-child td {
        border-bottom: none;
      }
      .stats-card span {
        color: #64748b;
        font-size: 0.85rem;
      }
      .stats-card strong {
        display: block;
        margin-top: 0.35rem;
        color: #0f172a;
        font-size: 1.1rem;
      }
      .error-box {
        border-color: #fecaca;
        color: #b91c1c;
        background: #fef2f2;
      }
      .chart-wrap {
        height: 300px;
      }
      .contract-link {
        border: none;
        background: transparent;
        color: #0ea5e9;
        font-weight: 600;
        text-decoration: underline;
        cursor: pointer;
        padding: 0;
      }
    `,
  ],
})
export class UserDetailComponent implements OnInit {
  readonly roleCode = (localStorage.getItem('codeRole') ?? '').toUpperCase();
  readonly isAdmin = this.roleCode.includes('ADMIN');
  readonly isManager = this.roleCode.includes('MANAGER');
  readonly managerLocationId = Number(localStorage.getItem('locationId') ?? 0) || null;

  user = signal<User | null>(null);
  loading = signal(false);
  errorMessage = signal('');
  roleName = signal('');
  roleCodeOfUser = signal('');
  locationName = signal('');
  salesMetrics = signal<SalesMetrics | null>(null);
  coordinatorMetrics = signal<CoordinatorMetrics | null>(null);
  contractRows = signal<ContractParticipationRow[]>([]);
  totalContractValue = signal(0);
  totalCollectedAmount = signal(0);
  totalRemainingAmount = signal(0);
  contractChartData = signal<any>(null);
  chartOptions = signal<any>(null);

  selectedMonth = '';
  userId = 0;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly locationService: LocationService,
    private readonly bookingService: BookingService,
    private readonly customerService: CustomerService,
    private readonly paymentService: PaymentService,
    private readonly invoiceService: InvoiceService,
    private readonly taskListService: TaskListService,
  ) {}

  ngOnInit(): void {
    if (!this.isAdmin && !this.isManager) {
      this.errorMessage.set('Bạn không có quyền truy cập trang chi tiết người dùng.');
      return;
    }

    const id = Number(this.route.snapshot.paramMap.get('id') ?? 0);
    if (!Number.isFinite(id) || id <= 0) {
      this.errorMessage.set('ID người dùng không hợp lệ.');
      return;
    }

    this.userId = id;
    this.loadAll();
  }

  onMonthChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.selectedMonth = /^\d{4}-\d{2}$/.test(value) ? value : '';
    this.reloadMetrics();
  }

  clearMonthFilter(): void {
    this.selectedMonth = '';
    this.reloadMetrics();
  }

  goToContractDetail(contractId: number): void {
    const id = this.toNumber(contractId);
    if (id <= 0) return;
    this.router.navigate(['/pages/booking', id, 'view']);
  }

  goBack(): void {
    this.router.navigate(['/pages/users']);
  }

  reloadMetrics(): void {
    if (!this.user()) return;

    this.salesMetrics.set(null);
    this.coordinatorMetrics.set(null);
    this.contractRows.set([]);
    this.totalContractValue.set(0);
    this.totalCollectedAmount.set(0);
    this.totalRemainingAmount.set(0);
    this.contractChartData.set(null);
    const roleCode = this.roleCodeOfUser();

    if (roleCode.includes('SALE')) {
      this.loadSalesMetrics();
      return;
    }

    if (roleCode.includes('COORDINATOR') || roleCode.includes('COORD')) {
      this.loadCoordinatorMetrics();
      return;
    }
  }

  private loadAll(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    forkJoin({
      userRes: this.userService.getUser(this.userId),
      rolesRes: this.roleService.searchRoles({ page: 0, size: 100 }),
      locationsRes: this.locationService.searchLocations({ page: 0, size: 200 }),
    }).subscribe({
      next: ({ userRes, rolesRes, locationsRes }) => {
        const detailUser = userRes.data;
        this.user.set(detailUser);

        if (this.isManager && this.managerLocationId && Number(detailUser.locationId) !== this.managerLocationId) {
          this.errorMessage.set('MANAGER chỉ có thể xem người dùng thuộc chi nhánh của mình.');
          this.loading.set(false);
          return;
        }

        const role = (rolesRes.data?.content ?? []).find((item) => Number(item.id) === Number(detailUser.roleId));
        this.roleName.set(role?.name ?? 'Không xác định');
        this.roleCodeOfUser.set((role?.code ?? '').toUpperCase());

        const location = (locationsRes.data?.content ?? []).find((item) => Number(item.id) === Number(detailUser.locationId));
        this.locationName.set(location?.name ?? '-');

        this.loading.set(false);
        this.reloadMetrics();
      },
      error: () => {
        this.errorMessage.set('Không thể tải dữ liệu chi tiết người dùng.');
        this.loading.set(false);
      },
    });
  }

  private loadSalesMetrics(): void {
    this.loading.set(true);
    const range = this.getSelectedMonthRange();

    forkJoin({
      contractListRes: this.bookingService.searchBookings({
        page: 0,
        size: 1000,
        salesId: this.userId,
        sort: 'updatedAt,DESC',
      }),
      paymentRes: this.paymentService.searchPayments({
        page: 0,
        size: 1000,
        paymentState: 'SUCCESS',
        sort: 'paidAt,DESC',
      }),
    }).subscribe({
      next: ({ contractListRes, paymentRes }) => {
        const allContracts = contractListRes.data?.content ?? [];
        const contractsForKpi = this.filterContractsByCreatedDate(allContracts, range);
        const contractIdsInScope = new Set(
          contractsForKpi.map((item) => this.toNumber(item.id)).filter((id) => id > 0),
        );
        const customerIds = new Set(
          contractsForKpi
            .map((contract) => this.toNumber(contract.customerId))
            .filter((id) => id > 0),
        );

        const successfulPayments: Payment[] = paymentRes.data?.content ?? [];
        const monthlyRevenue = successfulPayments
          .filter((payment) => contractIdsInScope.has(this.toNumber(payment.contractId)))
          .filter((payment) => this.matchesPaymentRange(payment, range))
          .reduce((sum, payment) => sum + this.toNumber(payment.amount), 0);

        const monthlyContractCount = contractIdsInScope.size;
        const activeContractsCount = contractsForKpi.filter((item) => String(item.contractState ?? '').toUpperCase() === 'ACTIVE').length;
        const upcomingOrCreatedCount = range
          ? monthlyContractCount
          : this.countUpcomingByBookingDate(contractsForKpi);

        this.salesMetrics.set({
          customersManaged: customerIds.size,
          contracts: monthlyContractCount,
          activeContracts: activeContractsCount,
          upcoming30Days: upcomingOrCreatedCount,
          contractsInMonth: monthlyContractCount,
          revenueInMonth: monthlyRevenue,
          avgRevenuePerContractInMonth: monthlyContractCount > 0 ? monthlyRevenue / monthlyContractCount : 0,
        });

        this.loadCustomerNamesByContracts(contractsForKpi).subscribe({
          next: (customerNames) => {
            const contractIds = contractsForKpi.map((item) => this.toNumber(item.id)).filter((id) => id > 0);
            this.loadInvoiceTotalsByContractIds(contractIds).subscribe({
              next: (invoiceTotals) => {
                this.buildContractParticipation(contractsForKpi, successfulPayments, range?.from, range?.to, customerNames, invoiceTotals);
                this.loading.set(false);
              },
              error: () => {
                this.buildContractParticipation(contractsForKpi, successfulPayments, range?.from, range?.to, customerNames);
                this.loading.set(false);
              },
            });
          },
          error: () => {
            this.buildContractParticipation(contractsForKpi, successfulPayments, range?.from, range?.to);
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.errorMessage.set('Không thể tải thống kê cho SALE.');
        this.loading.set(false);
      },
    });
  }

  private loadCoordinatorMetrics(): void {
    this.loading.set(true);
    const range = this.getSelectedMonthRange();

    forkJoin({
      contractListRes: this.bookingService.searchBookings({
        page: 0,
        size: 1000,
        assignCoordinatorId: this.userId,
        sort: 'updatedAt,DESC',
      }),
      paymentRes: this.paymentService.searchPayments({
        page: 0,
        size: 1000,
        paymentState: 'SUCCESS',
        sort: 'paidAt,DESC',
      }),
      taskListsRes: this.taskListService.searchTaskLists({
        status: 'active',
        coordinatorId: this.userId,
      }),
    }).subscribe({
      next: ({ contractListRes, paymentRes, taskListsRes }) => {
        const allContracts = contractListRes.data?.content ?? [];
        const contractsForKpi = this.filterContractsByCreatedDate(allContracts, range);
        const activeContractsCount = contractsForKpi.filter((item) => String(item.contractState ?? '').toUpperCase() === 'ACTIVE').length;
        const contractsCount = contractsForKpi.length;
        const upcomingOrCreatedCount = range
          ? contractsCount
          : this.countUpcomingByBookingDate(contractsForKpi);

        const contractIds = new Set(
          contractsForKpi
            .map((item) => this.toNumber(item.id))
            .filter((id) => id > 0),
        );
        const filteredTaskLists = (taskListsRes.data ?? []).filter((item) => {
          const contractId = this.toNumber(item.contractId);
          return contractId > 0 && contractIds.has(contractId);
        });
        const summary = this.summarizeTaskLists(filteredTaskLists);
        const successfulPayments: Payment[] = paymentRes.data?.content ?? [];

        this.coordinatorMetrics.set({
          contracts: contractsCount,
          activeContracts: activeContractsCount,
          upcoming30Days: upcomingOrCreatedCount,
          contractsInMonth: contractsCount,
          taskLists: summary.taskLists,
          completedTaskLists: summary.completedTaskLists,
          pendingTaskLists: summary.pendingTaskLists,
          totalTasks: summary.totalTasks,
          completedTasks: summary.completedTasks,
          completionRate: summary.completionRate,
        });

        this.loadCustomerNamesByContracts(contractsForKpi).subscribe({
          next: (customerNames) => {
            const contractIds = contractsForKpi.map((item) => this.toNumber(item.id)).filter((id) => id > 0);
            this.loadInvoiceTotalsByContractIds(contractIds).subscribe({
              next: (invoiceTotals) => {
                this.buildContractParticipation(contractsForKpi, successfulPayments, range?.from, range?.to, customerNames, invoiceTotals);
                this.loading.set(false);
              },
              error: () => {
                this.buildContractParticipation(contractsForKpi, successfulPayments, range?.from, range?.to, customerNames);
                this.loading.set(false);
              },
            });
          },
          error: () => {
            this.buildContractParticipation(contractsForKpi, successfulPayments, range?.from, range?.to);
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.errorMessage.set('Không thể tải thống kê cho Coordinator.');
        this.loading.set(false);
      },
    });
  }

  private summarizeTaskLists(taskLists: TaskList[]): {
    taskLists: number;
    completedTaskLists: number;
    pendingTaskLists: number;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  } {
    const safeTaskLists = taskLists ?? [];
    const completedTaskLists = safeTaskLists.filter((item) => this.isTaskListCompleted(item)).length;

    const allTaskStates = safeTaskLists
      .flatMap((item) => item.taskCategoryGroups ?? [])
      .flatMap((group) => group.tasks ?? [])
      .map((task) => String(task.state ?? '').toUpperCase());

    const totalTasks = allTaskStates.length;
    const completedTasks = allTaskStates.filter((state) => state === 'COMPLETED').length;

    return {
      taskLists: safeTaskLists.length,
      completedTaskLists,
      pendingTaskLists: Math.max(safeTaskLists.length - completedTaskLists, 0),
      totalTasks,
      completedTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    };
  }

  private isTaskListCompleted(item: TaskList): boolean {
    const taskStates = (item.taskCategoryGroups ?? [])
      .flatMap((group) => group.tasks ?? [])
      .map((task) => String(task.state ?? '').toUpperCase());

    if (!taskStates.length) return false;
    return taskStates.every((state) => state === 'COMPLETED');
  }

  private buildContractParticipation(
    contracts: Booking[],
    successfulPayments: Payment[],
    fromDate?: string,
    toDate?: string,
    customerNames?: Map<number, string>,
    invoiceTotals?: Map<number, number>,
  ): void {
    const paymentByContract = new Map<number, number>();

    successfulPayments.forEach((payment) => {
      if (fromDate && toDate) {
        const paidDate = payment.paidAt ?? payment.paymentDate ?? payment.updatedAt ?? payment.createdAt;
        if (!this.isInDateRange(paidDate, fromDate, toDate)) {
          return;
        }
      }

      const contractId = this.toNumber(payment.contractId);
      if (contractId <= 0) return;
      const current = paymentByContract.get(contractId) ?? 0;
      paymentByContract.set(contractId, current + this.toNumber(payment.amount));
    });

    const rows: ContractParticipationRow[] = contracts.map((contract) => {
      const id = this.toNumber(contract.id);
      const invoiceTotal = this.toNumber(invoiceTotals?.get(id));
      const totalAmount = invoiceTotal > 0 ? invoiceTotal : this.toNumber(contract.totalAmount);
      const collectedAmount = paymentByContract.get(id) ?? 0;

      return {
        id,
        contractNo: String(contract.contractNo ?? `HD-${id || '-'}`),
        customerName: this.resolveCustomerName(contract, customerNames),
        bookingDate: this.formatDateOnly(contract.bookingDate),
        contractState: String(contract.contractState ?? 'UNKNOWN'),
        totalAmount,
        collectedAmount,
        remainingAmount: Math.max(totalAmount - collectedAmount, 0),
      };
    });

    this.contractRows.set(rows);

    const rowsForDebtKpi = rows.filter((row) => !this.isDraftContractState(row.contractState));

    const totalContractValue = rowsForDebtKpi.reduce((sum, row) => sum + row.totalAmount, 0);
    const totalCollected = rows.reduce((sum, row) => sum + row.collectedAmount, 0);
    const totalRemaining = rowsForDebtKpi.reduce((sum, row) => sum + row.remainingAmount, 0);

    this.totalContractValue.set(totalContractValue);
    this.totalCollectedAmount.set(totalCollected);
    this.totalRemainingAmount.set(totalRemaining);

    this.rebuildContractStateChart(rows);
  }

  private rebuildContractStateChart(rows: ContractParticipationRow[]): void {
    if (!rows.length) {
      this.contractChartData.set(null);
      return;
    }

    const stateMap = new Map<string, number>();
    rows.forEach((row) => {
      const label = this.contractStateLabel(row.contractState);
      stateMap.set(label, (stateMap.get(label) ?? 0) + 1);
    });

    const labels = Array.from(stateMap.keys());
    const values = Array.from(stateMap.values());

    this.contractChartData.set({
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: ['#22c55e', '#0ea5e9', '#f97316', '#ef4444', '#64748b'],
        },
      ],
    });

    this.chartOptions.set({
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
        },
      },
    });
  }

  statusLabel(status?: string): string {
    return String(status ?? '').toUpperCase() === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động';
  }

  statusSeverity(status?: string): 'success' | 'danger' {
    return String(status ?? '').toUpperCase() === 'ACTIVE' ? 'success' : 'danger';
  }

  contractStateLabel(state?: string): string {
    const normalized = String(state ?? '').toUpperCase();
    if (normalized === 'ACTIVE') return 'Hiệu lực';
    if (normalized === 'DRAFT') return 'Nháp';
    if (normalized === 'LIQUIDATED') return 'Đã thanh lý';
    if (normalized === 'CANCELLED') return 'Đã hủy';
    return normalized || 'Không xác định';
  }

  contractStateSeverity(state?: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    const normalized = String(state ?? '').toUpperCase();
    if (normalized === 'ACTIVE') return 'success';
    if (normalized === 'DRAFT') return 'info';
    if (normalized === 'LIQUIDATED') return 'warn';
    if (normalized === 'CANCELLED') return 'danger';
    return 'secondary';
  }

  private isDraftContractState(state?: string): boolean {
    const normalized = String(state ?? '').toUpperCase();
    return normalized === 'DRAFT' || normalized === 'DRAF';
  }

  formatCurrency(value: number): string {
    return `${new Intl.NumberFormat('vi-VN').format(this.toNumber(value))} đ`;
  }

  private next30DayFilter(): { bookingDateFrom: string; bookingDateTo: string } {
    const now = new Date();
    const from = this.toDateOnly(now);
    const end = new Date(now);
    end.setDate(end.getDate() + 30);
    return {
      bookingDateFrom: from,
      bookingDateTo: this.toDateOnly(end),
    };
  }

  hasMonthFilter(): boolean {
    return /^\d{4}-\d{2}$/.test(this.selectedMonth);
  }

  contractsKpiLabel(): string {
    return this.hasMonthFilter() ? 'HĐ trong tháng' : 'Tổng hợp đồng theo bộ lọc';
  }

  revenueKpiLabel(): string {
    return this.hasMonthFilter() ? 'Doanh thu tháng' : 'Doanh thu theo bộ lọc';
  }

  avgRevenueKpiLabel(): string {
    return this.hasMonthFilter() ? 'Giá trị TB / HĐ tháng' : 'Giá trị TB / HĐ';
  }

  eventKpiLabel(): string {
    return this.hasMonthFilter() ? 'HĐ tạo trong tháng' : 'Sự kiện 30 ngày tới';
  }

  private filterContractsByCreatedDate(
    contracts: Booking[],
    range: { from: string; to: string } | null,
  ): Booking[] {
    if (!range) {
      return contracts;
    }

    return contracts.filter((contract) =>
      this.isInDateRange(contract.createdAt, range.from, range.to),
    );
  }

  private loadCustomerNamesByContracts(contracts: Booking[]) {
    const ids = Array.from(
      new Set(
        contracts
          .map((item) => this.toNumber((item as any).customerId ?? item.customerId))
          .filter((id) => id > 0),
      ),
    );

    if (!ids.length) {
      return of(new Map<number, string>());
    }

    const requests = ids.map((id) =>
      this.customerService.getCustomerById(id).pipe(
        map((res) => ({
          id,
          name: String(res.data?.fullName ?? '').trim(),
        })),
        catchError(() => of({ id, name: '' })),
      ),
    );

    return forkJoin(requests).pipe(
      map((rows) => {
        const mapData = new Map<number, string>();
        rows.forEach((row) => {
          if (row.name) {
            mapData.set(row.id, row.name);
          }
        });
        return mapData;
      }),
    );
  }

  private resolveCustomerName(contract: Booking, customerNames?: Map<number, string>): string {
    const raw = contract as any;
    const directName = String(raw?.customerName ?? raw?.customer?.fullName ?? raw?.customer?.name ?? '').trim();
    if (directName) {
      return directName;
    }

    const customerId = this.toNumber(raw?.customerId ?? contract.customerId);
    if (customerId > 0 && customerNames?.has(customerId)) {
      return customerNames.get(customerId) as string;
    }

    return '-';
  }

  private loadInvoiceTotalsByContractIds(contractIds: number[]) {
    const uniqueIds = Array.from(new Set(contractIds.filter((id) => Number.isFinite(id) && id > 0)));

    if (!uniqueIds.length) {
      return of(new Map<number, number>());
    }

    const requests = uniqueIds.map((contractId) =>
      this.invoiceService.searchInvoices({ contractId, page: 0, size: 1 }).pipe(
        map((res) => {
          const invoice = (res.data?.content ?? [])[0] as Record<string, unknown> | undefined;
          const total = this.toNumber(invoice?.['totalAmount'] ?? invoice?.['total_amount']);
          return { contractId, total };
        }),
        catchError(() => of({ contractId, total: 0 })),
      ),
    );

    return forkJoin(requests).pipe(
      map((rows) => {
        const totals = new Map<number, number>();
        rows.forEach((row) => {
          if (row.total > 0) {
            totals.set(row.contractId, row.total);
          }
        });
        return totals;
      }),
    );
  }

  private matchesPaymentRange(payment: Payment, range: { from: string; to: string } | null): boolean {
    if (!range) {
      return true;
    }

    const paidDate = payment.paidAt ?? payment.paymentDate ?? payment.updatedAt ?? payment.createdAt;
    return this.isInDateRange(paidDate, range.from, range.to);
  }

  private countUpcomingByBookingDate(contracts: Booking[]): number {
    const next30 = this.next30DayFilter();
    return contracts.filter((contract) =>
      this.isInDateRange(contract.bookingDate, next30.bookingDateFrom, next30.bookingDateTo),
    ).length;
  }

  private getSelectedMonthRange(): { from: string; to: string } | null {
    if (!/^\d{4}-\d{2}$/.test(this.selectedMonth)) {
      return null;
    }

    const key = this.selectedMonth;
    const [yearStr, monthStr] = key.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);

    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);

    return {
      from: this.toDateOnly(firstDay),
      to: this.toDateOnly(lastDay),
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

  private formatDateOnly(rawDate: string | undefined): string {
    if (!rawDate) return '-';
    const datePart = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
    const [yyyy, mm, dd] = datePart.split('-');
    if (!yyyy || !mm || !dd) return datePart;
    return `${dd}/${mm}/${yyyy}`;
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
