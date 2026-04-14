import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Customer, CustomerService } from '../service/customer.service';
import { Booking, BookingService } from '../service/booking.service';

@Component({
    selector: 'app-customer-detail',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TableModule, TagModule, ToastModule],
    providers: [MessageService, BookingService],
    template: `
        <p-toast />

        <div class="page-header">
            <div class="page-title-wrap">
                <h2>Chi tiết khách hàng</h2>
                <span class="page-subtitle">Thông tin khách hàng và danh sách hợp đồng liên quan</span>
            </div>
            <p-button label="Quay lại" icon="pi pi-arrow-left" severity="secondary" [outlined]="true" (onClick)="goBack()" />
        </div>

        <div class="grid-wrap" *ngIf="!loadingCustomer; else customerLoadingTpl">
            <div class="summary-card">
                <div class="summary-head">
                    <div class="avatar">{{ getInitials(customer?.fullName) }}</div>
                    <div>
                        <div class="name">{{ customer?.fullName || '-' }}</div>
                        <div class="meta">ID: {{ customer?.id || '-' }}</div>
                    </div>
                </div>

                <div class="summary-content">
                    <div class="row"><span>Email</span><strong>{{ customer?.email || '-' }}</strong></div>
                    <div class="row"><span>Số điện thoại</span><strong>{{ customer?.phone || '-' }}</strong></div>
                    <div class="row"><span>Chi nhánh</span><strong>{{ customer?.locationName || customer?.location?.name || '-' }}</strong></div>
                    <div class="row"><span>Địa chỉ</span><strong>{{ customer?.address || '-' }}</strong></div>
                    <div class="row"><span>Ghi chú</span><strong>{{ customer?.notes || '-' }}</strong></div>
                    <div class="row"><span>Trạng thái</span>
                        <p-tag [value]="statusLabel(customer?.status)" [severity]="statusSeverity(customer?.status)"></p-tag>
                    </div>
                </div>
            </div>

            <div class="contracts-card">
                <div class="contracts-head">
                    <h3>Hợp đồng của khách hàng</h3>
                    <span>Tổng: {{ totalContracts }}</span>
                </div>

                <p-table
                    [value]="contracts()"
                    [rows]="pageSize"
                    [paginator]="true"
                    [lazy]="true"
                    [totalRecords]="totalContracts"
                    [rowsPerPageOptions]="[10, 20, 30]"
                    [loading]="loadingContracts"
                    currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} hợp đồng"
                    [showCurrentPageReport]="true"
                    (onPage)="onPageChange($event)"
                    dataKey="id"
                >
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Mã hợp đồng</th>
                            <th>Ngày đặt</th>
                            <th>Ngày tiệc</th>
                            <th>Sảnh</th>
                            <th>Số bàn</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="body" let-contract>
                        <tr>
                            <td>{{ contract.contractNo || contract.bookingNo || ('#' + contract.id) }}</td>
                            <td>{{ formatDate(contract.bookingDate) }}</td>
                            <td>{{ formatDate(contract.eventDate || contract.bookingDate) }}</td>
                            <td>{{ contract.hallName || '-' }}</td>
                            <td>{{ contract.expectedTables || contract.tableCount || '-' }}</td>
                            <td>
                                <p-tag
                                    [value]="bookingStateLabel(contract.contractState || contract.bookingState || '-')"
                                    [severity]="bookingStateSeverity(contract.contractState || contract.bookingState || '-')"
                                ></p-tag>
                            </td>
                            <td>
                                <p-button
                                    icon="pi pi-eye"
                                    [rounded]="true"
                                    [outlined]="true"
                                    severity="info"
                                    pTooltip="Xem chi tiết hợp đồng"
                                    tooltipPosition="top"
                                    (onClick)="viewContract(contract)"
                                ></p-button>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="7" class="empty-cell">Khách hàng này chưa có hợp đồng nào.</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <ng-template #customerLoadingTpl>
            <div class="loading-wrap">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Đang tải thông tin khách hàng...</span>
            </div>
        </ng-template>
    `,
    styles: [`
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
            gap: 1rem;
            flex-wrap: wrap;
        }
        .page-title-wrap h2 {
            margin: 0;
            font-size: 1.5rem;
            color: #1f2937;
        }
        .page-subtitle {
            color: #6b7280;
            font-size: 0.9rem;
        }
        .grid-wrap {
            display: grid;
            grid-template-columns: 320px minmax(0, 1fr);
            gap: 1rem;
            align-items: start;
        }
        .summary-card,
        .contracts-card {
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            padding: 1rem;
        }
        .summary-head {
            display: flex;
            gap: 0.75rem;
            align-items: center;
            margin-bottom: 1rem;
        }
        .avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            background: #dbeafe;
            color: #1d4ed8;
            font-weight: 700;
        }
        .name {
            font-weight: 700;
            color: #111827;
        }
        .meta {
            color: #6b7280;
            font-size: 0.85rem;
        }
        .summary-content .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 0;
            border-bottom: 1px dashed #e5e7eb;
            font-size: 0.92rem;
        }
        .summary-content .row:last-child {
            border-bottom: none;
        }
        .summary-content .row span {
            color: #6b7280;
        }
        .summary-content .row strong {
            font-weight: 600;
            color: #111827;
            text-align: right;
        }
        .contracts-head {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.8rem;
        }
        .contracts-head h3 {
            margin: 0;
            color: #111827;
        }
        .contracts-head span {
            color: #6b7280;
            font-size: 0.9rem;
        }
        .empty-cell {
            text-align: center;
            color: #6b7280;
            padding: 1rem;
        }
        .loading-wrap {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            color: #4b5563;
        }
        .loading-wrap .pi-spinner {
            font-size: 1.2rem;
        }
        @media (max-width: 992px) {
            .grid-wrap {
                grid-template-columns: 1fr;
            }
        }
    `]
})
export class CustomerDetailComponent implements OnInit {
    customer: Customer | null = null;
    contracts = signal<Booking[]>([]);

    loadingCustomer = false;
    loadingContracts = false;

    customerId: number | null = null;
    totalContracts = 0;
    currentPage = 0;
    pageSize = 10;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private customerService: CustomerService,
        private bookingService: BookingService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isFinite(id) || id <= 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'ID khách hàng không hợp lệ',
                life: 3000
            });
            this.goBack();
            return;
        }

        this.customerId = id;
        this.loadCustomer();
        this.loadContracts();
    }

    loadCustomer(): void {
        if (!this.customerId) return;
        this.loadingCustomer = true;

        this.customerService.getCustomerById(this.customerId).subscribe({
            next: (res) => {
                this.customer = res.data;
                this.loadingCustomer = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.loadingCustomer = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Không thể tải thông tin khách hàng',
                    life: 3000
                });
                this.cdr.markForCheck();
            }
        });
    }

    loadContracts(page = this.currentPage, size = this.pageSize): void {
        if (!this.customerId) return;
        this.loadingContracts = true;

        this.bookingService.searchBookings({
            customerId: this.customerId,
            page,
            size,
            sort: 'updatedAt,DESC'
        }).subscribe({
            next: (res) => {
                const data = res?.data;
                this.contracts.set(data?.content ?? []);
                this.totalContracts = data?.totalElements ?? 0;
                this.currentPage = page;
                this.pageSize = size;
                this.loadingContracts = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.contracts.set([]);
                this.totalContracts = 0;
                this.loadingContracts = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Không thể tải danh sách hợp đồng',
                    life: 3000
                });
                this.cdr.markForCheck();
            }
        });
    }

    onPageChange(event: any): void {
        const page = Math.floor((event?.first ?? 0) / (event?.rows ?? this.pageSize));
        const size = event?.rows ?? this.pageSize;
        this.loadContracts(page, size);
    }

    viewContract(contract: Booking): void {
        if (!contract?.id) return;
        const backUrl = this.router.url;
        this.router.navigate(['/pages/booking', contract.id, 'view'], {
            state: { returnUrl: backUrl },
            queryParams: { returnUrl: backUrl }
        });
    }

    goBack(): void {
        if (window.history.length > 1) {
            this.location.back();
            return;
        }
        this.router.navigate(['/pages/customers']);
    }

    formatDate(value?: string): string {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '-';
        return new Intl.DateTimeFormat('vi-VN').format(date);
    }

    getInitials(fullName?: string): string {
        if (!fullName) return '?';
        const names = fullName.trim().split(' ').filter(Boolean);
        if (names.length >= 2) return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        return fullName.slice(0, 2).toUpperCase();
    }

    statusLabel(status?: string): string {
        return status === 'active' ? 'Hoạt động' : 'Không hoạt động';
    }

    statusSeverity(status?: string): 'success' | 'danger' {
        return status === 'active' ? 'success' : 'danger';
    }

    bookingStateLabel(state?: string): string {
        const map: Record<string, string> = {
            DRAFT: 'Nháp',
            ACTIVE: 'Đang hiệu lực',
            LIQUIDATED: 'Đã thanh lý',
            CANCELLED: 'Đã hủy'
        };
        return map[state ?? ''] ?? state ?? '-';
    }

    bookingStateSeverity(state?: string): 'success' | 'warn' | 'danger' | 'secondary' {
        const map: Record<string, 'success' | 'warn' | 'danger' | 'secondary'> = {
            DRAFT: 'warn',
            ACTIVE: 'success',
            LIQUIDATED: 'secondary',
            CANCELLED: 'danger'
        };
        return map[state ?? ''] ?? 'secondary';
    }
}
