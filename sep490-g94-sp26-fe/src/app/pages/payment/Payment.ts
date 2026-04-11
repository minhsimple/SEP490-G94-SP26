import { Component, OnInit, signal, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule, Table } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Payment, PaymentService } from '../service/payment.service';
import { Invoice, InvoiceService } from '../service/invoice.service';
import { Booking, BookingService } from '../service/booking.service';
import { Customer, CustomerService } from '../service/customer.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface Column { field: string; header: string; }

@Component({
    selector: 'app-payments',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        TableModule, ButtonModule, InputTextModule,
        SelectModule, InputIconModule, IconFieldModule,
        ToastModule, TooltipModule, ConfirmDialogModule,
    ],
    template: `
        <div class="card">
            <p-toast />
            <p-confirmdialog />

            <!-- Table card -->
            <div class="surface-card border-round-xl shadow-1 overflow-hidden">

                <!-- Card header -->
                <div class="px-4 pt-4 pb-3 border-bottom-1 surface-border flex items-center justify-between flex-wrap gap-2">
                    <div>
                        <div class="text-xl font-bold text-900">Danh sách thanh toán</div>
                    </div>
                    <div class="text-sm text-500 italic">
                        Thanh toán được tạo từ chi tiết hoá đơn
                    </div>
                </div>

                <!-- Search + filter -->
                <div class="px-4 py-3 flex items-center gap-3 border-bottom-1 surface-border flex-wrap">
                    <p-iconfield style="flex:1; max-width:560px;">
                        <p-inputicon styleClass="pi pi-search" />
                        <input
                            pInputText type="text"
                            [(ngModel)]="searchKeyword"
                            (input)="onSearch()"
                            placeholder="Tìm mã TT, hoá đơn, khách..."
                            class="w-full"
                        />
                    </p-iconfield>
                    <p-select
                        [options]="methodOptions"
                        [(ngModel)]="filterMethod"
                        optionLabel="label" optionValue="value"
                        placeholder="Phương thức"
                        [showClear]="true"
                        (onChange)="onFilter()"
                        style="width:200px"
                    />
                    <p-select
                        [options]="statusOptions"
                        [(ngModel)]="filterStatus"
                        optionLabel="label" optionValue="value"
                        placeholder="Tất cả"
                        [showClear]="true"
                        (onChange)="onFilter()"
                        style="width:180px"
                    />
                    <p-button
                        label="Xóa lọc"
                        icon="pi pi-refresh"
                        severity="secondary"
                        [text]="true"
                        size="small"
                        (onClick)="clearFilters()"
                    />
                </div>

                <!-- Table -->
                <p-table
                    #dt
                    [value]="payments()"
                    [rows]="pageSize"
                    [paginator]="true"
                    [totalRecords]="totalRecords"
                    [lazy]="true"
                    (onLazyLoad)="onLazyLoad($event)"
                    [tableStyle]="{ 'min-width': '65rem' }"
                    [rowHover]="true"
                    dataKey="id"
                    currentPageReportTemplate="Hiển thị {first} đến {last} trong {totalRecords} thanh toán"
                    [showCurrentPageReport]="true"
                    [rowsPerPageOptions]="[10, 20, 30]"
                    [loading]="loading"
                    styleClass="p-datatable-sm"
                >
                    <ng-template #header>
                        <tr>
                            <th style="min-width:12rem">Mã TT</th>
                            <th style="min-width:12rem">Hoá đơn</th>
                            <th style="min-width:10rem">Khách hàng</th>
                            <th style="min-width:14rem">Cập nhật lúc</th>
                            <th style="min-width:12rem">Phương thức</th>
                            <th style="min-width:10rem">Trạng thái</th>
                            <th style="min-width:10rem; text-align:right">Số tiền</th>
                            <th style="min-width:8rem; text-align:center">Thao tác</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-payment>
                        <tr>
                            <!-- Mã TT -->
                            <td>
                                <span
                                    class="font-semibold"
                                    style="font-size:0.875rem; color:var(--primary-color); cursor:pointer;"
                                    (click)="goToPaymentDetail(payment)"
                                >
                                    {{ payment.code ?? ('#' + payment.id) }}
                                </span>
                            </td>

                            <!-- Hoá đơn -->
                            <td>
                                <span
                                    *ngIf="payment.invoiceCode; else dashInv"
                                    class="font-semibold cursor-pointer"
                                    style="color:var(--primary-color); font-size:0.875rem;"
                                    (click)="goToInvoice(payment)"
                                >{{ payment.invoiceCode }}</span>
                                <ng-template #dashInv>
                                    <span class="text-500">-</span>
                                </ng-template>
                            </td>

                            <!-- Khách hàng -->
                            <td class="text-600 text-sm">{{ payment.customerName ?? '-' }}</td>

                            <!-- Thời gian cập nhật -->
                            <td class="text-600 text-sm">{{ formatDateTime(payment.updatedAt || payment.paidAt || payment.paymentDate) }}</td>

                            <!-- Phương thức -->
                            <td class="text-600 text-sm">
                                {{ getMethodLabel(payment.method) }}
                                <span *ngIf="payment.methodNote" class="text-400">
                                    ({{ payment.methodNote }})
                                </span>
                            </td>

                            <!-- Trạng thái -->
                            <td>
                                <span
                                    class="text-xs font-bold px-3 py-1 border-round-xl"
                                    [style.background]="getStatusBg(payment.paymentState || payment.status)"
                                    [style.color]="getStatusColor(payment.paymentState || payment.status)"
                                >
                                    {{ getStatusLabel(payment.paymentState || payment.status) }}
                                </span>
                            </td>

                            <!-- Số tiền -->
                            <td class="font-semibold text-900 text-sm" style="text-align:right;">
                                {{ formatPrice(payment.amount) }}
                            </td>

                            <!-- Thao tác -->
                            <td style="text-align:center;">
                                <div class="flex items-center justify-center gap-1">
                                    <p-button
                                        icon="pi pi-eye"
                                        [rounded]="true" [text]="true"
                                        severity="secondary"
                                        (click)="goToPaymentDetail(payment)"
                                        pTooltip="Chi tiết"
                                        tooltipPosition="top"
                                    />
                                    <p-button
                                        icon="pi pi-trash"
                                        [rounded]="true" [text]="true"
                                        severity="danger"
                                        (click)="confirmDelete(payment)"
                                        pTooltip="Xoá"
                                        tooltipPosition="top"
                                    />
                                </div>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="8" class="text-center py-8 text-500">
                                <i class="pi pi-inbox text-4xl mb-3 block"></i>
                                Không có thanh toán nào
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
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 0.04em;
                padding: 0.7rem 1rem;
                border-bottom: 1px solid #e2e8f0;
            }
            .p-datatable .p-datatable-tbody > tr > td {
                padding: 0.9rem 1rem;
                border-bottom: 1px solid #f1f5f9;
            }
            .p-datatable .p-datatable-tbody > tr:hover > td { background: #f8fafc; }
            .p-datatable .p-datatable-tbody > tr:last-child > td { border-bottom: none; }
        }
    `],
    providers: [MessageService, ConfirmationService, PaymentService, InvoiceService, BookingService, CustomerService]
})
export class PaymentsComponent implements OnInit {

    payments = signal<Payment[]>([]);
    loading = false;
    totalRecords = 0;
    pageSize = 20;
    currentPage = 0;
    searchKeyword = '';
    searchTimeout: any;
    filterStatus: string | null = 'SUCCESS';
    filterMethod: string | null = null;

    methodOptions = [
        { label: 'Chuyển khoản', value: 'BANK_TRANSFER' },
        { label: 'Tiền mặt', value: 'CASH' },
        { label: 'Thẻ tín dụng', value: 'CREDIT_CARD' },
        { label: 'Ví điện tử', value: 'E_WALLET' },
    ];

    statusOptions = [
        { label: 'Thành công',      value: 'SUCCESS'   },
        { label: 'Chờ thanh toán',  value: 'PENDING'   },
        { label: 'Thất bại',        value: 'FAILED'    },
    ];

    cols: Column[] = [];
    @ViewChild('dt') dt!: Table;

    constructor(
        private paymentService: PaymentService,
        private invoiceService: InvoiceService,
        private bookingService: BookingService,
        private customerService: CustomerService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.cols = [
            { field: 'code',         header: 'Mã TT'        },
            { field: 'invoiceCode',  header: 'Hoá đơn'      },
            { field: 'customerName', header: 'Khách hàng'   },
            { field: 'updatedAt',    header: 'Cập nhật lúc' },
            { field: 'method',       header: 'Phương thức'  },
            { field: 'status',       header: 'Trạng thái'   },
            { field: 'amount',       header: 'Số tiền'      },
        ];
        this.loadPayments();
    }

    loadPayments(page = 0, size = this.pageSize) {
        this.loading = true;
        this.paymentService.searchPayments({
            page, size,
            keyword: this.searchKeyword || undefined,
            paymentState: this.filterStatus || undefined,
            method:  this.filterMethod  || undefined,
        }).subscribe({
            next: (res) => {
                if (res?.data) {
                    const rows = res.data.content ?? [];
                    this.payments.set(rows);
                    this.totalRecords = res.data.totalElements;
                    this.enrichPaymentRows(rows);
                }
                this.loading = false;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error', summary: 'Lỗi',
                    detail: 'Không thể tải danh sách thanh toán', life: 3000
                });
                this.loading = false;
            }
        });
    }

    private enrichPaymentRows(rows: Payment[]) {
        const contractIds = [...new Set(
            rows
                .filter((p) => (!p.invoiceCode || !p.customerName) && !!p.contractId)
                .map((p) => Number(p.contractId))
        )];

        if (!contractIds.length && !rows.some((p) => !p.customerName && !!p.customerId)) return;

        const requests = contractIds.map((contractId) =>
            forkJoin({
                invoice: this.invoiceService.searchInvoices({ contractId, page: 0, size: 1, sort: 'id,DESC' }).pipe(
                    map((res) => res?.data?.content?.[0] ?? null),
                    catchError(() => of(null))
                ),
                booking: this.bookingService.getById(contractId).pipe(
                    map((res) => res?.data ?? null),
                    catchError(() => of(null))
                )
            }).pipe(map((value) => ({ contractId, ...value })))
        );

        (requests.length ? forkJoin(requests) : of([])).subscribe((refs) => {
            const refMap = new Map<number, { invoice: Invoice | null; booking: Booking | null }>();
            refs.forEach((r) => refMap.set(r.contractId, { invoice: r.invoice, booking: r.booking }));

            const customerIds = [...new Set(
                rows
                    .map((p) => {
                        const ref = refMap.get(Number(p.contractId));
                        return Number(p.customerId ?? ref?.booking?.customerId ?? ref?.invoice?.customerId);
                    })
                    .filter((id) => Number.isFinite(id) && id > 0)
            )];

            const customerRequests = customerIds.map((customerId) =>
                this.customerService.getCustomerById(customerId).pipe(
                    map((res) => ({ customerId, customer: res?.data ?? null })),
                    catchError(() => of({ customerId, customer: null }))
                )
            );

            const customerSource$ = customerRequests.length ? forkJoin(customerRequests) : of([]);
            customerSource$.subscribe((customers) => {
                const customerMap = new Map<number, Customer | null>();
                customers.forEach((r) => customerMap.set(r.customerId, r.customer));

                const enriched = rows.map((p) => {
                    const ref = refMap.get(Number(p.contractId));
                    const resolvedCustomerId = Number(p.customerId ?? ref?.booking?.customerId ?? ref?.invoice?.customerId);
                    const customer = customerMap.get(resolvedCustomerId);

                    return {
                        ...p,
                        customerId: p.customerId ?? (Number.isFinite(resolvedCustomerId) ? resolvedCustomerId : undefined),
                        invoiceId: p.invoiceId ?? ref?.invoice?.id,
                        invoiceCode:
                            p.invoiceCode ??
                            ref?.invoice?.code ??
                            ref?.invoice?.contractNo ??
                            (ref?.invoice?.id ? `#${ref.invoice.id}` : undefined),
                        customerName:
                            p.customerName ??
                            customer?.fullName ??
                            ref?.invoice?.customerName ??
                            ref?.booking?.customerName,
                    };
                });

                this.payments.set(enriched);
                this.cdr.detectChanges();
            });
        });
    }

    onLazyLoad(event: any) {
        this.currentPage = event.first / event.rows;
        this.pageSize    = event.rows;
        this.loadPayments(this.currentPage, this.pageSize);
    }

    onSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            if (this.dt) this.dt.reset();
            this.loadPayments();
        }, 400);
    }

    onFilter() {
        if (this.dt) this.dt.reset();
        this.loadPayments();
    }

    clearFilters() {
        this.filterStatus = null;
        this.filterMethod = null;
        this.searchKeyword = '';
        if (this.dt) this.dt.reset();
        this.loadPayments();
    }

    goToInvoice(payment: Payment) {
        if (payment.invoiceId) {
            this.router.navigate(['/pages/invoice', payment.invoiceId]);
        }
    }

    goToPaymentDetail(payment: Payment) {
        if (!payment?.id) return;
        this.router.navigate(['/pages/payment', payment.id], { state: { payment } });
    }

    confirmDelete(payment: Payment) {
        this.confirmationService.confirm({
            message: `Bạn có chắc muốn xoá thanh toán <strong>${payment.code ?? '#' + payment.id}</strong>?`,
            header: 'Xác nhận xoá',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Xoá',
            rejectLabel: 'Hủy',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.paymentService.deletePayment(payment.id!).subscribe({
                    next: () => {
                        this.messageService.add({
                            severity: 'success', summary: 'Thành công',
                            detail: 'Đã xoá thanh toán', life: 3000
                        });
                        this.loadPayments(this.currentPage, this.pageSize);
                    },
                    error: () => {
                        this.messageService.add({
                            severity: 'error', summary: 'Lỗi',
                            detail: 'Không thể xoá thanh toán', life: 3000
                        });
                    }
                });
            }
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    formatPrice(v?: number): string {
        const n = Number(v ?? 0);
        return new Intl.NumberFormat('vi-VN').format(Number.isFinite(n) ? n : 0) + ' đ';
    }

    formatDateTime(d?: string): string {
        if (!d) return '-';
        const date = new Date(d);
        if (Number.isNaN(date.getTime())) return '-';
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        }).format(date);
    }

    getMethodLabel(m?: string): string {
        const map: Record<string, string> = {
            BANK_TRANSFER: 'Chuyển khoản',
            CASH:          'Tiền mặt',
            CREDIT_CARD:   'Thẻ tín dụng',
            E_WALLET:      'Ví điện tử',
        };
        return map[m ?? ''] ?? m ?? '-';
    }

    getStatusLabel(s?: string): string {
        const map: Record<string, string> = {
            SUCCESS:   'Thành công',
            PENDING:   'Chờ thanh toán',
            FAILED:    'Thất bại',
            CANCELLED: 'Đã huỷ',
        };
        return map[s ?? ''] ?? s ?? '-';
    }

    getStatusColor(s?: string): string {
        const map: Record<string, string> = {
            SUCCESS:   '#ffffff',
            PENDING:   '#1e293b',
            FAILED:    '#991b1b',
            CANCELLED: '#dc2626',
        };
        return map[s ?? ''] ?? '#1e293b';
    }

    getStatusBg(s?: string): string {
        const map: Record<string, string> = {
            SUCCESS:   '#2563eb',
            PENDING:   '#e2e8f0',
            FAILED:    '#fee2e2',
            CANCELLED: '#fee2e2',
        };
        return map[s ?? ''] ?? '#f1f5f9';
    }
}