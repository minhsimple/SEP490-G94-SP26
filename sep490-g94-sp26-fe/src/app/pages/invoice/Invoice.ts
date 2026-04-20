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
import { Invoice, InvoiceService } from '../service/invoice.service';

interface Column { field: string; header: string; }

@Component({
    selector: 'app-invoices',
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
                <div class="px-4 pt-4 pb-3 border-bottom-1 surface-border">
                    <div class="text-xl font-bold text-900">Danh sách hóa đơn</div>
                </div>

                <!-- Search + filter bar inside card -->
                <div class="px-4 py-3 flex items-center gap-3 border-bottom-1 surface-border flex-wrap">
                    <input
                        pInputText
                        type="number"
                        [(ngModel)]="filterContractId"
                        placeholder="Lọc theo Contract ID"
                        style="width: 220px"
                    />

                    <p-select
                        [options]="invoiceStateOptions"
                        [(ngModel)]="filterInvoiceState"
                        optionLabel="label" optionValue="value"
                        placeholder="Invoice state"
                        [showClear]="true"
                        style="width:180px"
                    />

                    <input
                        pInputText
                        type="number"
                        [(ngModel)]="filterLowerBoundTotalAmount"
                        placeholder="Tổng tiền từ"
                        style="width: 170px"
                    />

                    <input
                        pInputText
                        type="number"
                        [(ngModel)]="filterUpperBoundTotalAmount"
                        placeholder="Đến"
                        style="width: 170px"
                    />

                    <p-button label="Lọc" icon="pi pi-filter" size="small" (click)="onFilter()" />
                    <p-button label="Xóa lọc" icon="pi pi-refresh" size="small" severity="secondary" [text]="true" (click)="resetFilter()" />
                </div>

                <p-table
                    #dt
                    [value]="invoices()"
                    [rows]="pageSize"
                    [paginator]="true"
                    [totalRecords]="totalRecords"
                    [lazy]="true"
                    (onLazyLoad)="onLazyLoad($event)"
                    [tableStyle]="{ 'min-width': '60rem' }"
                    [rowHover]="true"
                    dataKey="id"
                    currentPageReportTemplate="Hiển thị {first} đến {last} trong {totalRecords} hóa đơn"
                    [showCurrentPageReport]="true"
                    [rowsPerPageOptions]="[10, 20, 30]"
                    [loading]="loading"
                    styleClass="p-datatable-sm"
                >
                    <ng-template #header>
                        <tr>
                            <th style="min-width:8rem">Mã HĐơn</th>
                            <th style="min-width:9rem">Hợp đồng</th>
                            <th style="min-width:8rem">Sảnh</th>
                            <th style="min-width:10rem">Gói dịch vụ</th>
                            <th style="min-width:9rem">Set menu</th>
                            <th style="min-width:7rem; text-align:right">Bàn dự kiến</th>
                            <th style="min-width:9rem">Trạng thái hóa đơn</th>
                            <th style="min-width:8rem; text-align:right">Tổng</th>
                            <th style="min-width:8rem; text-align:center">Thao tác</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-inv>
                        <tr>
                            <!-- Mã HĐơn -->
                            <td>
                                <span class="font-semibold text-900" style="font-size:0.875rem;">
                                    #{{ inv.id }}
                                </span>
                            </td>

                            <!-- Hợp đồng -->
                            <td>
                                <span
                                    *ngIf="inv.contractNo; else noContract"
                                    class="font-semibold cursor-pointer"
                                    style="color:var(--primary-color); font-size:0.875rem;"
                                    (click)="goToContract(inv)"
                                >{{ inv.contractNo }}</span>
                                <ng-template #noContract>
                                    <span class="text-500">-</span>
                                </ng-template>
                            </td>

                            <td>
                                <div class="text-600 text-sm">{{ getHallName(inv) }}</div>
                                <div class="text-500 text-xs">{{ formatPrice(getHallPrice(inv)) }}</div>
                            </td>
                            <td>
                                <div class="text-600 text-sm">{{ getServicePackageName(inv) }}</div>
                                <div class="text-500 text-xs">{{ formatPrice(getServicePackagePrice(inv)) }}</div>
                            </td>
                            <td>
                                <div class="text-600 text-sm">{{ getSetMenuName(inv) }}</div>
                                <div class="text-500 text-xs">SL món: {{ getSetMenuItemTotalQuantity(inv) }} | {{ formatPrice(getSetMenuPrice(inv)) }}/bàn</div>
                            </td>
                            <td class="text-700 text-sm" style="text-align:right;">{{ inv.expectedTables ?? '-' }}</td>

                            <!-- Trạng thái -->
                            <td>
                                <span
                                    class="text-xs font-bold px-3 py-1 border-round-xl"
                                    [style.background]="getStatusBg(inv.invoiceState)"
                                    [style.color]="getStatusColor(inv.invoiceState)"
                                >
                                    {{ getStatusLabel(inv.invoiceState) }}
                                </span>
                            </td>

                            <!-- Tổng -->
                            <td class="font-semibold text-900 text-sm" style="text-align:right;">
                                {{ formatPrice(inv.totalAmount) }}
                            </td>

                            <!-- Thao tác -->
                            <td style="text-align:center;">
                                <div class="flex items-center justify-center gap-1">
                                    <p-button
                                        icon="pi pi-eye"
                                        [rounded]="true" [text]="true"
                                        severity="secondary"
                                        (click)="viewDetail(inv)"
                                        pTooltip="Xem chi tiết"
                                        tooltipPosition="top"
                                    />
                                    <p-button
                                        icon="pi pi-trash"
                                        [rounded]="true" [text]="true"
                                        severity="danger"
                                        (click)="confirmDelete(inv)"
                                        pTooltip="Xoá"
                                        tooltipPosition="top"
                                    />
                                </div>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="9" class="text-center py-8 text-500">
                                <i class="pi pi-inbox text-4xl mb-3 block"></i>
                                Không có hóa đơn nào
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
                padding: 0.55rem 0.7rem;
                border-bottom: 1px solid #e2e8f0;
            }
            .p-datatable .p-datatable-tbody > tr > td {
                padding: 0.65rem 0.7rem;
                border-bottom: 1px solid #f1f5f9;
            }
            .p-datatable .p-datatable-tbody > tr:hover > td { background: #f8fafc; }
            .p-datatable .p-datatable-tbody > tr:last-child > td { border-bottom: none; }
        }
    `],
    providers: [MessageService, ConfirmationService, InvoiceService]
})
export class InvoicesComponent implements OnInit {

    invoices = signal<Invoice[]>([]);
    loading = false;
    totalRecords = 0;
    pageSize = 20;
    currentPage = 0;
    filterContractId: number | null = null;
    filterInvoiceState: string | null = null;
    filterLowerBoundTotalAmount: number | null = null;
    filterUpperBoundTotalAmount: number | null = null;

    invoiceStateOptions = [
        { label: 'Chưa thanh toán', value: 'UNPAID' },
        { label: 'Thanh toán một phần', value: 'PARTIAL' },
        { label: 'Đã thanh toán', value: 'PAID' },
    ];

    cols: Column[] = [];
    @ViewChild('dt') dt!: Table;

    constructor(
        private invoiceService: InvoiceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.cols = [
            { field: 'code',         header: 'Mã HĐơn'   },
            { field: 'contractNo',   header: 'Hợp đồng'  },
            { field: 'hall.name',    header: 'Sảnh'       },
            { field: 'servicesPackage.name', header: 'Gói dịch vụ' },
            { field: 'setMenu.name', header: 'Set menu'   },
            { field: 'expectedTables', header: 'Bàn dự kiến' },
            { field: 'invoiceState', header: 'Trạng thái hóa đơn' },
            { field: 'totalAmount',  header: 'Tổng'       },
        ];
        this.loadInvoices();
    }

    loadInvoices(page = 0, size = this.pageSize) {
        this.loading = true;
        this.invoiceService.searchInvoices({
            page, size,
            contractId: this.filterContractId ?? undefined,
            invoiceState: this.filterInvoiceState ?? undefined,
            lowerBoundTotalAmount: this.filterLowerBoundTotalAmount ?? undefined,
            upperBoundTotalAmount: this.filterUpperBoundTotalAmount ?? undefined,
        }).subscribe({
            next: (res) => {
                if (res?.data) {
                    this.invoices.set(res.data.content);
                    this.totalRecords = res.data.totalElements;
                }
                this.loading = false;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách hóa đơn', life: 3000 });
                this.loading = false;
            }
        });
    }

    onLazyLoad(event: any) {
        this.currentPage = event.first / event.rows;
        this.pageSize    = event.rows;
        this.loadInvoices(this.currentPage, this.pageSize);
    }

    onFilter() {
        if (this.dt) this.dt.reset();
        this.loadInvoices();
    }

    resetFilter() {
        this.filterContractId = null;
        this.filterInvoiceState = null;
        this.filterLowerBoundTotalAmount = null;
        this.filterUpperBoundTotalAmount = null;
        if (this.dt) this.dt.reset();
        this.loadInvoices();
    }

    viewDetail(inv: Invoice) {
        this.router.navigate(['/pages/invoice', inv.id]);
    }

    goToContract(inv: Invoice) {
        if (inv.contractId) this.router.navigate(['/pages/booking', inv.contractId, 'view']);
    }

    confirmDelete(inv: Invoice) {
        this.confirmationService.confirm({
            message: `Bạn có chắc muốn xoá hóa đơn <strong>${inv.code}</strong>?`,
            header: 'Xác nhận xoá',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Xoá',
            rejectLabel: 'Hủy',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.invoiceService.deleteInvoice(inv.id!).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xoá hóa đơn', life: 3000 });
                        this.loadInvoices(this.currentPage, this.pageSize);
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xoá hóa đơn', life: 3000 });
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

    formatDate(d?: string): string {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('vi-VN');
    }

    isDue(dueDate?: string): boolean {
        if (!dueDate) return false;
        return new Date(dueDate) < new Date();
    }

    getStatusLabel(s?: string): string {
        const m: Record<string, string> = {
            UNPAID:  'Chưa thanh toán',
            PARTIAL: 'Thanh toán 1 phần',
            PAID:    'Đã thanh toán',
        };
        return m[s ?? ''] ?? s ?? '-';
    }

    getStatusColor(s?: string): string {
        const m: Record<string, string> = {
            UNPAID:  '#ffffff',
            PARTIAL: '#1e293b',
            PAID:    '#166534',
        };
        return m[s ?? ''] ?? '#1e293b';
    }

    getStatusBg(s?: string): string {
        const m: Record<string, string> = {
            UNPAID:  '#ef4444',
            PARTIAL: '#fef3c7',
            PAID:    '#dcfce7',
        };
        return m[s ?? ''] ?? '#f1f5f9';
    }

    getRecordStatusLabel(s?: string): string {
        return { active: 'Đang hoạt động', inactive: 'Không hoạt động' }[s ?? ''] ?? s ?? '-';
    }

    getRecordStatusColor(s?: string): string {
        return { active: '#166534', inactive: '#7f1d1d' }[s ?? ''] ?? '#1e293b';
    }

    getRecordStatusBg(s?: string): string {
        return { active: '#dcfce7', inactive: '#fee2e2' }[s ?? ''] ?? '#f1f5f9';
    }

    getHallName(inv: Invoice): string {
        return inv.hall?.name ?? inv.data?.hall_invoice?.name ?? '-';
    }

    getHallPrice(inv: Invoice): number {
        return Number(inv.hall?.basePrice ?? inv.data?.hall_invoice?.price ?? 0);
    }

    getServicePackageName(inv: Invoice): string {
        return inv.servicesPackage?.name ?? inv.data?.service_package_invoice?.name ?? '-';
    }

    getServicePackagePrice(inv: Invoice): number {
        return Number(inv.servicesPackage?.basePrice ?? inv.data?.service_package_invoice?.price ?? 0);
    }

    getSetMenuName(inv: Invoice): string {
        return inv.setMenu?.name ?? inv.data?.set_menu_invoice?.name ?? '-';
    }

    getSetMenuPrice(inv: Invoice): number {
        return Number(
            inv.setMenu?.setPrice
            ?? (inv.setMenu as any)?.price
            ?? inv.data?.set_menu_invoice?.price
            ?? 0
        );
    }

    getSetMenuItemTotalQuantity(inv: Invoice): number {
        const menuItems = inv.data?.set_menu_invoice?.menu_items ?? [];
        if (!menuItems.length) {
            return 0;
        }
        return menuItems.reduce((sum, item) => {
            const quantity = Number(item?.quantity ?? 0);
            return sum + (Number.isFinite(quantity) ? quantity : 0);
        }, 0);
    }
}