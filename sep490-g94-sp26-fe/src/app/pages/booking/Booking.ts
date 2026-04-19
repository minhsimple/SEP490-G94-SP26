import { Component, OnInit, signal, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ToastModule } from 'primeng/toast';
import { TableModule, Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { Booking, BookingSearchParams, BookingService } from '../service/booking.service';
import { HallService } from '../service/hall.service';
import { CustomerService } from '../service/customer.service';
import { SetMenuService } from '../service/set-menu';
import { ServicePackageService } from '../service/service-package.service';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';

@Component({
    selector: 'app-bookings',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        TableModule, ButtonModule, InputTextModule,
        SelectModule, TagModule, InputIconModule,
        IconFieldModule, ToastModule, TooltipModule,
    ],
    template: `
        <div class="card">
            <p-toast />

            <!-- Toolbar -->
            <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
                <div class="flex items-center gap-2 flex-wrap">

                    <!-- Search -->
                    <p-iconfield style="max-width:320px;">
                        <p-inputicon styleClass="pi pi-search" />
                        <input
                            pInputText type="text"
                            [(ngModel)]="searchKeyword"
                            (input)="onSearch()"
                            placeholder="Tìm theo số điện thoại khách hàng..."
                            style="width:280px;"
                        />
                    </p-iconfield>

                    <!-- Filter: trạng thái xử lý -->
                    <p-select
                        [options]="statusOptions"
                        [(ngModel)]="filterStatus"
                        optionLabel="label" optionValue="value"
                        placeholder="Tất cả trạng thái xử lý"
                        [showClear]="true"
                        (onChange)="onFilter()"
                        style="width:180px"
                    />

                    <!-- Filter: sảnh -->
                    <p-select
                        [options]="hallOptions"
                        [(ngModel)]="filterHallId"
                        optionLabel="label" optionValue="value"
                        placeholder="Tất cả sảnh"
                        [showClear]="true"
                        (onChange)="onFilter()"
                        style="width:160px"
                    />

                    <!-- Filter: ca -->
                    <p-select
                        [options]="shiftOptions"
                        [(ngModel)]="filterShift"
                        optionLabel="label" optionValue="value"
                        placeholder="Tất cả ca"
                        [showClear]="true"
                        (onChange)="onFilter()"
                        style="width:140px"
                    />

                    <!-- Filter: tháng -->
                    <p-select
                        [options]="monthOptions"
                        [(ngModel)]="filterMonth"
                        optionLabel="label" optionValue="value"
                        placeholder="Tất cả tháng"
                        [showClear]="true"
                        (onChange)="onFilter()"
                        style="width:150px"
                    />

                </div>

                <p-button
                    *ngIf="!isCoordinatorAccount"
                    label="Hợp đồng mới"
                    icon="pi pi-plus"
                    severity="primary"
                    (onClick)="goToCreate()"
                />
            </div>

            <!-- Table -->
            <div class="surface-card border-round-xl shadow-1 overflow-hidden">
                <div class="px-4 pt-4 pb-3 border-bottom-1 surface-border">
                    <div class="text-xl font-bold text-900">Danh sách đặt tiệc</div>
                    <div class="text-sm text-500 mt-1">Quản lý các đơn đặt tiệc cưới</div>
                </div>

                <p-table
                    #dt
                    [value]="bookings()"
                    [tableStyle]="{ 'min-width': '70rem' }"
                    [rowHover]="true"
                    dataKey="id"
                    [loading]="loading"
                    styleClass="p-datatable-sm"
                >
                    <ng-template #header>
                        <tr>
                            <th style="min-width:5rem">STT</th>
                            <th style="min-width:10rem">Mã hợp đồng</th>
                            <th style="min-width:16rem">Tên khách hàng</th>
                            <th style="min-width:12rem">Sảnh</th>
                            <th style="min-width:13rem">Ngày tạo hợp đồng</th>
                            <th style="min-width:13rem">Ngày cưới</th>
                            <th style="min-width:7rem">Số bàn</th>
                            <th style="min-width:11rem">Tổng tiền</th>
                            <th style="min-width:10rem">Trạng thái xử lý</th>
                            <th style="min-width:7rem">Thao tác</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-booking let-rowIndex="rowIndex">
                        <tr>
                            <!-- STT -->
                            <td>
                                <span class="text-sm text-700">{{ rowIndex + 1 }}</span>
                            </td>

                            <!-- Mã hợp đồng -->
                            <td>
                                <span class="font-semibold text-primary" style="font-size:0.85rem;">
                                    {{ booking.contractNo ?? booking.bookingNo ?? booking.code ?? ('#' + booking.id) }}
                                </span>
                            </td>

                            <!-- Tên khách hàng -->
                            <td>
                                <div class="font-semibold text-900">{{ getCustomerDisplayName(booking) }}</div>
                            </td>

                            <!-- Sảnh -->
                            <td>
                                <div class="flex items-center gap-2">
                                    <i class="pi pi-building text-500 text-xs"></i>
                                    <span class="text-600 text-sm">{{ getHallLabel(booking) }}</span>
                                </div>
                            </td>

                            <!-- Ngày tạo hợp đồng -->
                            <td>
                                <div class="flex items-center gap-2">
                                    <i class="pi pi-calendar text-500 text-xs"></i>
                                    <div>
                                        <div class="text-sm text-900">{{ formatDate(booking.bookingDate ?? booking.eventDate) }}</div>
                                    </div>
                                </div>
                            </td>

                            <!-- Ngày cưới & Ca -->
                            <td>
                                <div class="flex items-center gap-2">
                                    <i class="pi pi-calendar text-500 text-xs"></i>
                                    <div>
                                        <div class="text-sm text-900">{{ formatDate(booking.bookingDate ?? booking.eventDate) }}</div>
                                        <div class="text-xs text-500">{{ getShiftLabel(booking.shift ?? booking.bookingTime) }}</div>
                                    </div>
                                </div>
                            </td>

                            <!-- Số bàn -->
                            <td class="text-600 text-sm">{{ booking.expectedTables ?? booking.tableCount ?? '-' }} bàn</td>

                            <!-- Tổng tiền -->
                            <td class="font-semibold text-900">
                                {{ formatPrice(getBookingTotalValue(booking)) }}
                            </td>

                            <!-- Trạng thái xử lý -->
                            <td>
                                <span
                                    class="text-xs font-semibold px-2 py-1 border-round"
                                    [style.background]="getStatusBg(booking.contractState ?? booking.bookingState)"
                                    [style.color]="getStatusColor(booking.contractState ?? booking.bookingState)"
                                >
                                    {{ getStatusLabel(booking.contractState ?? booking.bookingState) }}
                                </span>
                            </td>

                            <!-- Thao tác -->
                            <td>
                                <p-button
                                    *ngIf="!isCoordinatorAccount"
                                    icon="pi pi-pencil"
                                    [rounded]="true"
                                    [text]="true"
                                    severity="secondary"
                                    (click)="editBooking(booking)"
                                    pTooltip="Chỉnh sửa"
                                    tooltipPosition="top"
                                />
                                <p-button
                                    icon="pi pi-eye"
                                    [rounded]="true"
                                    [text]="true"
                                    severity="secondary"
                                    (click)="viewDetail(booking)"
                                    pTooltip="Xem chi tiết"
                                    tooltipPosition="top"
                                />
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="10" class="text-center py-8 text-500">
                                <i class="pi pi-inbox text-4xl mb-3 block"></i>
                                Không có đơn đặt tiệc nào
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>
    `,
    styles: [`
        :host ::ng-deep {
            .p-datatable .p-datatable-thead > tr > th {
                background: #f8fafc;
                font-weight: 600;
                color: #64748b;
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 0.03em;
                padding: 0.75rem 1rem;
                border-bottom: 1px solid #e2e8f0;
            }
            .p-datatable .p-datatable-tbody > tr > td {
                padding: 0.85rem 1rem;
                border-bottom: 1px solid #f1f5f9;
            }
            .p-datatable .p-datatable-tbody > tr:hover > td { background: #f8fafc; }
            .p-datatable .p-datatable-tbody > tr:last-child > td { border-bottom: none; }
        }
    `],
    providers: [MessageService, BookingService],
})
export class BookingsComponent implements OnInit {

    bookings = signal<Booking[]>([]);
    loading = false;
    totalRecords = 0;
    searchKeyword = '';
    searchTimeout: any;

    // Filters
    filterStatus: string | null = null;
    filterHallId: number | null = null;
    filterShift: string | null = null;
    filterMonth: number | null = null;
    statusOptions = [
        { label: 'Nháp', value: 'DRAFT' },
        { label: 'Khách hàng đóng cọc', value: 'ACTIVE' },
        { label: 'Thanh lý hợp đồng', value: 'LIQUIDATED' },
        { label: 'Hủy contract', value: 'CANCELLED' },
    ];

    shiftOptions = [
        { label: 'Ca sáng (10:00 - 14:00)', value: 'SLOT_1' },
        { label: 'Ca chiều (17:00 - 21:00)', value: 'SLOT_2' },
        { label: 'Cả ngày (09:00 - 17:00)', value: 'SLOT_3' },
    ];

    monthOptions = Array.from({ length: 12 }, (_, i) => ({
        label: `Tháng ${i + 1}`,
        value: i + 1,
    }));

    // Điền hallOptions từ API hoặc cấu hình tĩnh nếu cần
    hallOptions: { label: string; value: number }[] = [];
    customerNameMap: Record<number, string> = {};
    customerPhoneMap: Record<number, string> = {};
    hallPriceMap: Record<number, number> = {};
    setMenuPriceMap: Record<number, number> = {};
    packagePriceMap: Record<number, number> = {};
    readonly codeRole = (localStorage.getItem('codeRole') ?? '').toUpperCase();
    readonly currentUserId = Number(localStorage.getItem('userId')) || 0;
    readonly isCoordinatorAccount = this.codeRole.includes('COORDINATOR') || this.codeRole.includes('COORD');

    @ViewChild('dt') dt!: Table;

    constructor(
        private bookingService: BookingService,
        private hallService: HallService,
        private customerService: CustomerService,
        private setMenuService: SetMenuService,
        private servicePackageService: ServicePackageService,
        private messageService: MessageService,
        private router: Router,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        if (this.isCoordinatorAccount && this.currentUserId <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Thiếu thông tin tài khoản',
                detail: 'Không xác định được tài khoản coordinator hiện tại.',
                life: 3000,
            });
        }
        this.loadHallOptions();
        this.loadBookings();
    }

    loadHallOptions() {
        this.hallService.searchHalls({ page: 0, size: 200, sort: 'name,ASC' }).subscribe({
            next: (res) => {
                this.hallOptions = (res.data?.content ?? []).map((hall) => ({
                    label: hall.name ?? `Sảnh #${hall.id}`,
                    value: Number(hall.id),
                }));
                this.hallPriceMap = (res.data?.content ?? []).reduce((acc: Record<number, number>, hall) => {
                    const id = Number(hall.id);
                    if (Number.isFinite(id) && id > 0) {
                        const price = Number((hall as any)?.basePrice ?? 0);
                        acc[id] = Number.isFinite(price) ? price : 0;
                    }
                    return acc;
                }, {});
                this.cdr.markForCheck();
            },
            error: () => {
                this.hallOptions = [];
                this.hallPriceMap = {};
            },
        });
    }

    loadBookings() {
        this.loading = true;

        const phoneKeyword = this.searchKeyword.trim();
        const shouldSearchByPhone = !!phoneKeyword;

        // Tính bookingDateFrom / To từ filterMonth (năm hiện tại)
        let bookingDateFrom: string | undefined;
        let bookingDateTo: string | undefined;
        if (this.filterMonth) {
            const year = new Date().getFullYear();
            const m = String(this.filterMonth).padStart(2, '0');
            const lastDay = new Date(year, this.filterMonth, 0).getDate();
            bookingDateFrom = `${year}-${m}-01`;
            bookingDateTo   = `${year}-${m}-${String(lastDay).padStart(2, '0')}`;
        }

        const filters: Omit<BookingSearchParams, 'page' | 'size'> = {
            sort: 'updatedAt,DESC',
            hallId:       this.filterHallId  || undefined,
            bookingTime:  this.filterShift   || undefined,
            contractState:this.filterStatus  || undefined,
            assignCoordinatorId: this.isCoordinatorAccount && this.currentUserId > 0 ? this.currentUserId : undefined,
            bookingDateFrom,
            bookingDateTo,
        };

        this.fetchAllBookings(filters).subscribe({
            next: (rows) => {
                if (this.isCoordinatorAccount) {
                    rows = rows.filter((booking) => this.isBookingAssignedToCurrentCoordinator(booking));
                }

                if (!shouldSearchByPhone) {
                    this.setDisplayedRows(rows);
                    this.loading = false;
                    return;
                }

                this.filterRowsByCustomerPhone(rows, phoneKeyword);
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Không thể tải danh sách đặt tiệc',
                    life: 3000,
                });
                this.loading = false;
            },
        });
    }

    onSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            if (this.dt) this.dt.reset();
            this.loadBookings();
        }, 400);
    }

    onFilter() {
        if (this.dt) this.dt.reset();
        this.loadBookings();
    }

    viewDetail(booking: any) {
        this.router.navigate(['/pages/booking', booking.id, 'view']);
    }

    editBooking(booking: any) {
        this.router.navigate(['/pages/booking', booking.id, 'edit']);
    }

    goToCreate() {
        this.router.navigate(['/pages/booking/create']);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    formatPrice(v?: number): string {
        if (v == null) return '-';
        return new Intl.NumberFormat('vi-VN').format(v) + ' đ';
    }

    formatDate(d?: string): string {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('vi-VN');
    }

    getHallLabel(booking: Booking): string {
        if (booking.hallName) return booking.hallName;
        const hall = this.hallOptions.find((item) => item.value === booking.hallId);
        return hall?.label ?? (booking.hallId ? `Sảnh #${booking.hallId}` : '-');
    }

    getCustomerDisplayName(booking: Booking): string {
        if (booking.customerName) return booking.customerName;

        const customerId = Number(booking.customerId);
        if (Number.isFinite(customerId) && this.customerNameMap[customerId]) {
            return this.customerNameMap[customerId];
        }

        return 'Chưa có tên khách hàng';
    }

    private resolveMissingCustomerNames(rows: Booking[]) {
        const missingIds = Array.from(new Set(
            rows
                .filter((booking) => !booking.customerName && booking.customerId != null)
                .map((booking) => Number(booking.customerId))
                .filter((id) => Number.isFinite(id) && !this.customerNameMap[id])
        ));

        missingIds.forEach((id) => {
            this.customerService.getCustomerById(id).subscribe({
                next: (res) => {
                    const fullName = res.data?.fullName?.trim();
                    if (fullName) {
                        this.customerNameMap[id] = fullName;
                    }
                    const phone = res.data?.phone?.trim();
                    if (phone) {
                        this.customerPhoneMap[id] = phone;
                        this.cdr.markForCheck();
                    }
                },
                error: () => {
                    // Skip silent: not all bookings are guaranteed to have resolvable customer records.
                },
            });
        });
    }

    private resolveMissingPrices(rows: Booking[]) {
        const setMenuIds = Array.from(new Set(
            rows
                .map((booking) => Number(booking.setMenuId))
                .filter((id) => Number.isFinite(id) && id > 0 && !this.setMenuPriceMap[id])
        ));

        setMenuIds.forEach((id) => {
            this.setMenuService.getById(id).subscribe({
                next: (res) => {
                    const price = Number(res.data?.setPrice ?? 0);
                    this.setMenuPriceMap[id] = Number.isFinite(price) ? price : 0;
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.setMenuPriceMap[id] = 0;
                },
            });
        });

        const packageIds = Array.from(new Set(
            rows
                .map((booking) => Number(booking.packageId))
                .filter((id) => Number.isFinite(id) && id > 0 && !this.packagePriceMap[id])
        ));

        packageIds.forEach((id) => {
            this.servicePackageService.getById(id).subscribe({
                next: (res) => {
                    const price = Number(res.data?.basePrice ?? 0);
                    this.packagePriceMap[id] = Number.isFinite(price) ? price : 0;
                    this.cdr.markForCheck();
                },
                error: () => {
                    this.packagePriceMap[id] = 0;
                },
            });
        });
    }

    getBookingTotalValue(booking: Booking): number | undefined {
        const row = booking as any;
        const direct = Number(row.totalAmount ?? row.totalPrice ?? row.finalAmount ?? row.amount);
        if (Number.isFinite(direct) && direct > 0) {
            return direct;
        }

        const tables = Number(booking.expectedTables ?? booking.tableCount ?? 0);
        if (!Number.isFinite(tables) || tables <= 0) {
            return undefined;
        }

        const setMenuId = Number(booking.setMenuId);
        const packageId = Number(booking.packageId);
        const hallId = Number(booking.hallId);
        const setMenuPrice = Number.isFinite(setMenuId) ? (this.setMenuPriceMap[setMenuId] ?? 0) : 0;
        const packagePrice = Number.isFinite(packageId) ? (this.packagePriceMap[packageId] ?? 0) : 0;
        const hallPrice = Number.isFinite(hallId) ? (this.hallPriceMap[hallId] ?? 0) : 0;
        const computed = (setMenuPrice + hallPrice) * tables + packagePrice;

        return computed > 0 ? computed : undefined;
    }

    getShiftLabel(shift?: string): string {
        const m: Record<string, string> = {
            SLOT_1: 'Ca sáng (10:00 - 14:00)',
            SLOT_2: 'Ca chiều (17:00 - 21:00)',
            SLOT_3: 'Cả ngày (09:00 - 17:00)',
            AFTERNOON: 'Ca sáng (10:00 - 14:00)',
            EVENING:   'Ca chiều (17:00 - 21:00)',
            FULL_DAY:  'Cả ngày (09:00 - 17:00)',
        };
        return m[shift ?? ''] ?? shift ?? '-';
    }

    getStatusLabel(status?: string): string {
        const m: Record<string, string> = {
            DRAFT:      'Nháp',
            ACTIVE:     'Khách hàng đóng cọc',
            LIQUIDATED: 'Thanh lý hợp đồng',
            CANCELLED:  'Hủy contract',
        };
        return m[status ?? ''] ?? status ?? '-';
    }

    getStatusColor(status?: string): string {
        const m: Record<string, string> = {
            DRAFT:      '#92400e',
            ACTIVE:     '#166534',
            LIQUIDATED: '#1d4ed8',
            CANCELLED:  '#b91c1c',
        };
        return m[status ?? ''] ?? '#64748b';
    }

    getStatusBg(status?: string): string {
        const m: Record<string, string> = {
            DRAFT:      '#fef3c7',
            ACTIVE:     '#dcfce7',
            LIQUIDATED: '#dbeafe',
            CANCELLED:  '#fee2e2',
        };
        return m[status ?? ''] ?? '#f1f5f9';
    }

    private setDisplayedRows(rows: Booking[]): void {
        this.bookings.set(rows);
        this.resolveMissingCustomerNames(rows);
        this.resolveMissingPrices(rows);
        this.totalRecords = rows.length;
    }

    private filterRowsByCustomerPhone(rows: Booking[], phoneKeyword: string): void {
        this.customerService.searchCustomers({
            phone: phoneKeyword,
            page: 0,
            size: 500,
            sort: 'updatedAt,DESC',
        }).subscribe({
            next: (customerRes) => {
                const customers = customerRes.data?.content ?? [];
                const matchedCustomerIds = new Set(
                    customers
                        .map((customer) => Number(customer.id))
                        .filter((id) => Number.isFinite(id) && id > 0)
                );

                customers.forEach((customer) => {
                    const id = Number(customer.id);
                    if (!Number.isFinite(id) || id <= 0) {
                        return;
                    }
                    if (customer.fullName) {
                        this.customerNameMap[id] = customer.fullName;
                    }
                    if (customer.phone) {
                        this.customerPhoneMap[id] = customer.phone;
                    }
                });

                const filteredRows = rows.filter((booking) => {
                    const customerId = Number(booking.customerId);
                    return Number.isFinite(customerId) && matchedCustomerIds.has(customerId);
                });

                this.setDisplayedRows(filteredRows);
                this.loading = false;
            },
            error: () => {
                const normalizedKeyword = this.normalizePhone(phoneKeyword);
                const filteredRows = rows.filter((booking) => {
                    const phone = this.getCustomerPhoneFromBooking(booking);
                    const normalizedPhone = this.normalizePhone(phone);
                    if (normalizedKeyword) {
                        return normalizedPhone.includes(normalizedKeyword);
                    }
                    return phone.toLowerCase().includes(phoneKeyword.toLowerCase());
                });

                this.setDisplayedRows(filteredRows);
                this.loading = false;
            },
        });
    }

    private fetchAllBookings(filters: Omit<BookingSearchParams, 'page' | 'size'>): Observable<Booking[]> {
        const size = 500;

        return this.bookingService.searchBookings({ ...filters, page: 0, size }).pipe(
            switchMap((firstRes) => {
                const firstRows = firstRes.data?.content ?? [];
                const totalPages = firstRes.data?.totalPages ?? 1;

                if (totalPages <= 1) {
                    return of(firstRows);
                }

                const restRequests = Array.from({ length: totalPages - 1 }, (_, index) =>
                    this.bookingService.searchBookings({ ...filters, page: index + 1, size })
                );

                return forkJoin(restRequests).pipe(
                    map((responses) => [
                        ...firstRows,
                        ...responses.flatMap((res) => res.data?.content ?? [])
                    ])
                );
            })
        );
    }

    private normalizePhone(value: string): string {
        return value.replace(/\D/g, '');
    }

    private getCustomerPhoneFromBooking(booking: Booking): string {
        const row = booking as any;
        const directPhone = row.customerPhone;
        if (typeof directPhone === 'string' && directPhone.trim()) {
            return directPhone.trim();
        }

        const customerId = Number(booking.customerId);
        if (Number.isFinite(customerId) && customerId > 0 && this.customerPhoneMap[customerId]) {
            return this.customerPhoneMap[customerId];
        }

        return '';
    }

    private isBookingAssignedToCurrentCoordinator(booking: Booking): boolean {
        if (!this.isCoordinatorAccount) {
            return true;
        }
        if (this.currentUserId <= 0) {
            return false;
        }
        return Number(booking.assignCoordinatorId) === this.currentUserId;
    }
}