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
import { Booking, BookingService } from '../service/booking.service';
import { HallService } from '../service/hall.service';
import { CustomerService } from '../service/customer.service';
import { SetMenuService } from '../service/set-menu';
import { ServicePackageService } from '../service/service-package.service';

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
                            placeholder="Tìm kiếm hợp đồng..."
                            style="width:280px;"
                        />
                    </p-iconfield>

                    <!-- Filter: trạng thái -->
                    <p-select
                        [options]="statusOptions"
                        [(ngModel)]="filterStatus"
                        optionLabel="label" optionValue="value"
                        placeholder="Tất cả trạng thái"
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
                    label="Đặt tiệc mới"
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
                    [rows]="pageSize"
                    [paginator]="true"
                    [totalRecords]="totalRecords"
                    [lazy]="true"
                    (onLazyLoad)="onLazyLoad($event)"
                    [tableStyle]="{ 'min-width': '70rem' }"
                    [rowHover]="true"
                    dataKey="id"
                    currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} đơn"
                    [showCurrentPageReport]="true"
                    [rowsPerPageOptions]="[10, 20, 30]"
                    [loading]="loading"
                    styleClass="p-datatable-sm"
                >
                    <ng-template #header>
                        <tr>
                            <th style="min-width:10rem">Mã đơn</th>
                            <th style="min-width:16rem">Cô dâu & Chú rể</th>
                            <th style="min-width:12rem">Sảnh</th>
                            <th style="min-width:13rem">Ngày tổ chức</th>
                            <th style="min-width:7rem">Số bàn</th>
                            <th style="min-width:11rem">Tổng tiền</th>
                            <th style="min-width:10rem">Trạng thái</th>
                            <th style="min-width:7rem">Thao tác</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-booking>
                        <tr>
                            <!-- Mã đơn -->
                            <td>
                                <span class="font-semibold text-primary" style="font-size:0.85rem;">
                                    {{ booking.bookingNo ?? booking.code ?? ('#' + booking.id) }}
                                </span>
                            </td>

                            <!-- Cô dâu & Chú rể -->
                            <td>
                                <div class="font-semibold text-900">
                                    {{ booking.groomName }} & {{ booking.brideName }}
                                </div>
                                <div class="text-xs text-500 mt-1">{{ getCustomerDisplayName(booking) }}</div>
                            </td>

                            <!-- Sảnh -->
                            <td>
                                <div class="flex items-center gap-2">
                                    <i class="pi pi-building text-500 text-xs"></i>
                                    <span class="text-600 text-sm">{{ getHallLabel(booking) }}</span>
                                </div>
                            </td>

                            <!-- Ngày & Ca -->
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

                            <!-- Trạng thái -->
                            <td>
                                <span
                                    class="text-xs font-semibold px-2 py-1 border-round"
                                    [style.background]="getStatusBg(booking.status ?? booking.bookingState)"
                                    [style.color]="getStatusColor(booking.status ?? booking.bookingState)"
                                >
                                    {{ getStatusLabel(booking.status ?? booking.bookingState) }}
                                </span>
                            </td>

                            <!-- Thao tác -->
                            <td>
                                <p-button
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
                            <td colspan="8" class="text-center py-8 text-500">
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
    pageSize = 20;
    currentPage = 0;
    searchKeyword = '';
    searchTimeout: any;

    // Filters
    filterStatus: string | null = null;
    filterHallId: number | null = null;
    filterShift: string | null = null;
    filterMonth: number | null = null;
    statusOptions = [
        { label: 'Nháp',          value: 'DRAFT'     },
        { label: 'Hết hạn',       value: 'EXPIRED' },
        { label: 'Đã duyệt',      value: 'APPROVED' },
        { label: 'Chưa duyệt',    value: 'UNAPPROVED' },
        { label: 'Đã huỷ',        value: 'CANCELLED' },
        { label: 'Đã chuyển đổi', value: 'CONVERTED' },
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
    setMenuPriceMap: Record<number, number> = {};
    packagePriceMap: Record<number, number> = {};

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
                this.cdr.markForCheck();
            },
            error: () => {
                this.hallOptions = [];
            },
        });
    }

    loadBookings(page = 0, size = this.pageSize) {
        this.loading = true;

        // Tính bookingDateFrom / To từ filterMonth (năm hiện tại)
        let bookingDateFrom: string | undefined;
        let bookingDateTo: string | undefined;
        if (this.filterMonth) {
            const year = new Date().getFullYear();
            const m = String(this.filterMonth).padStart(2, '0');
            const lastDay = new Date(year, this.filterMonth, 0).getDate();
            bookingDateFrom = `${year}-${m}-01`;
            bookingDateTo   = `${year}-${m}-${lastDay}`;
        }

        this.bookingService.searchBookings({
            page,
            size,
            sort: 'updatedAt,DESC',
            bookingNo:    this.searchKeyword || undefined,
            hallId:       this.filterHallId  || undefined,
            bookingTime:  this.filterShift   || undefined,
            bookingState: this.filterStatus  || undefined,
            bookingDateFrom,
            bookingDateTo,
        }).subscribe({
            next: (res) => {
                if (res?.data) {
                    const rows = res.data.content ?? [];
                    this.bookings.set(rows);
                    this.resolveMissingCustomerNames(rows);
                    this.resolveMissingPrices(rows);
                    this.totalRecords = res.data.totalElements ?? 0;
                }
                this.loading = false;
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

    onLazyLoad(event: any) {
        this.currentPage = event.first / event.rows;
        this.pageSize    = event.rows;
        this.loadBookings(this.currentPage, this.pageSize);
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
        const setMenuPrice = Number.isFinite(setMenuId) ? (this.setMenuPriceMap[setMenuId] ?? 0) : 0;
        const packagePrice = Number.isFinite(packageId) ? (this.packagePriceMap[packageId] ?? 0) : 0;
        const computed = setMenuPrice * tables + packagePrice;

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
            DRAFT:     'Nháp',
            EXPIRED:   'Hết hạn',
            APPROVED:  'Đã duyệt',
            UNAPPROVED:'Chưa duyệt',
            CANCELLED: 'Đã huỷ',
            CONVERTED: 'Đã chuyển đổi',
        };
        return m[status ?? ''] ?? status ?? '-';
    }

    getStatusColor(status?: string): string {
        const m: Record<string, string> = {
            DRAFT:     '#d97706',
            EXPIRED:   '#b45309',
            APPROVED:  '#16a34a',
            UNAPPROVED:'#b91c1c',
            CANCELLED: '#dc2626',
            CONVERTED: '#2563eb',
        };
        return m[status ?? ''] ?? '#64748b';
    }

    getStatusBg(status?: string): string {
        const m: Record<string, string> = {
            DRAFT:     '#fef3c7',
            EXPIRED:   '#ffedd5',
            APPROVED:  '#dcfce7',
            UNAPPROVED:'#fee2e2',
            CANCELLED: '#fee2e2',
            CONVERTED: '#dbeafe',
        };
        return m[status ?? ''] ?? '#f1f5f9';
    }
}