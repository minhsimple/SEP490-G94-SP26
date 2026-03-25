import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Invoice, Payment, InvoiceService } from '../service/invoice.service';

@Component({
    selector: 'app-invoice-detail',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        ButtonModule, DialogModule, SelectModule,
        InputTextModule, InputNumberModule, TextareaModule,
        ToastModule, ConfirmDialogModule, TableModule,
    ],
    styles: [`
        .page-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 1.25rem;
            flex-wrap: wrap;
        }
        .header-left { display: flex; align-items: center; gap: 0.75rem; }
        .invoice-no { font-size: 1.4rem; font-weight: 700; color: #1e293b; }
        .invoice-meta { font-size: 0.85rem; color: #64748b; margin-top: 0.2rem; }
        .status-chip {
            display: inline-flex; align-items: center;
            font-size: 0.8rem; font-weight: 700;
            border-radius: 999px; padding: 0.35rem 0.9rem;
        }
        .layout {
            display: grid;
            grid-template-columns: minmax(0,1fr) 300px;
            gap: 1.25rem;
            align-items: start;
        }
        .section {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1.25rem 1.5rem;
            margin-bottom: 1rem;
        }
        .section:last-child { margin-bottom: 0; }
        .section-title {
            font-size: 1rem; font-weight: 700;
            color: #1e293b; margin: 0 0 1rem;
        }
        .info-row {
            display: flex; justify-content: space-between;
            align-items: baseline; gap: 0.5rem;
            padding: 0.3rem 0;
            font-size: 0.9rem; color: #475569;
        }
        .info-row .label { color: #64748b; min-width: 90px; }
        .info-row .val   { font-weight: 500; color: #1e293b; text-align: right; }
        .info-row .link  { color: var(--primary-color); font-weight: 600; cursor: pointer; }
        .cost-table {
            width: 100%; border-collapse: collapse;
            font-size: 0.875rem;
        }
        .cost-table th {
            text-align: left; padding: 0.5rem 0.75rem;
            color: #64748b; font-weight: 600;
            border-bottom: 1px solid #e2e8f0;
            background: #f8fafc;
        }
        .cost-table th:last-child,
        .cost-table td:last-child { text-align: right; }
        .cost-table td {
            padding: 0.75rem 0.75rem;
            border-bottom: 1px solid #f1f5f9;
            color: #334155;
        }
        .cost-table tr:last-child td { border-bottom: none; }
        .cost-table .subtotal td {
            background: #f8fafc; font-weight: 600;
            color: #1e293b; border-top: 1px solid #e2e8f0;
        }
        .summary-line {
            display: flex; justify-content: space-between;
            align-items: baseline;
            padding: 0.4rem 0; font-size: 0.9rem; color: #475569;
        }
        .summary-line.total {
            border-top: 1px solid #e2e8f0;
            margin-top: 0.75rem; padding-top: 0.75rem;
            font-size: 1.1rem; font-weight: 700; color: #1e293b;
        }
        .summary-line .paid-val  { color: #16a34a; font-weight: 600; }
        .summary-line .remain-val{ color: #dc2626; font-weight: 600; }
        .finance-card {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1.25rem 1.5rem;
            margin-bottom: 1rem;
        }
        .finance-title {
            font-size: 1rem; font-weight: 700;
            color: #1e293b; margin-bottom: 0.75rem;
        }
        @media (max-width: 900px) {
            .layout { grid-template-columns: 1fr; }
        }
    `],
    template: `
        <p-toast />
        <p-confirmdialog />

        <!-- Loading -->
        <div *ngIf="loading" class="flex items-center justify-center py-16">
            <i class="pi pi-spin pi-spinner text-4xl text-primary"></i>
        </div>

        <ng-container *ngIf="!loading && invoice">

            <!-- Header -->
            <div class="page-header">
                <div class="header-left">
                    <p-button icon="pi pi-arrow-left" [text]="true" severity="secondary" (onClick)="goBack()" />
                    <div>
                        <div class="invoice-no">{{ invoice.code ?? ('#' + invoice.id) }}</div>
                        <div class="invoice-meta">
                            Ngày tạo: {{ formatDate(invoice.createdAt) }}
                            &nbsp;·&nbsp;
                            Hạn: {{ formatDate(invoice.dueDate) }}
                        </div>
                    </div>
                </div>
                <span
                    class="status-chip"
                    [style.background]="getStatusBg(invoice.status)"
                    [style.color]="getStatusColor(invoice.status)"
                >
                    {{ getStatusLabel(invoice.status) }}
                </span>
            </div>

            <div class="layout">

                <!-- LEFT -->
                <div>

                    <!-- Thông tin hóa đơn -->
                    <div class="section">
                        <div class="section-title">Thông tin hoá đơn</div>
                        <div class="info-row">
                            <span class="label">Hợp đồng:</span>
                            <span
                                *ngIf="invoice.contractNo; else dash1"
                                class="val link"
                                (click)="goToContract()"
                            >{{ invoice.contractNo }}</span>
                            <ng-template #dash1><span class="val">-</span></ng-template>
                        </div>
                        <div class="info-row">
                            <span class="label">Khách hàng:</span>
                            <span class="val">{{ invoice.customerName ?? '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">SĐT:</span>
                            <span class="val">{{ invoice.customerPhone ?? '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Ngày tiệc:</span>
                            <span class="val">{{ formatDate(invoice.bookingDate) }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Sảnh:</span>
                            <span class="val">{{ invoice.hallName ?? '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Số bàn:</span>
                            <span class="val">{{ invoice.tableCount ?? '-' }} bàn</span>
                        </div>
                    </div>

                    <!-- Chi phí sảnh -->
                    <div class="section">
                        <div class="section-title">Chi phí sảnh</div>
                        <table class="cost-table">
                            <thead>
                                <tr>
                                    <th>Sảnh</th>
                                    <th style="text-align:right;">Số bàn</th>
                                    <th style="text-align:right;">Giá / bàn</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{{ invoice.hallName ?? '-' }}</td>
                                    <td style="text-align:right;">{{ invoice.tableCount ?? '-' }}</td>
                                    <td style="text-align:right;">{{ formatPrice(invoice.pricePerTable ?? 0) }}</td>
                                    <td>{{ formatPrice(invoice.hallTotal ?? 0) }}</td>
                                </tr>
                                <tr class="subtotal">
                                    <td colspan="3" style="text-align:right; padding-right:1.5rem;">Tổng chi phí sảnh:</td>
                                    <td>{{ formatPrice(invoice.hallTotal ?? 0) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Thực đơn (Set Menu) -->
                    <div class="section" *ngIf="invoice.setMenus?.length">
                        <div class="section-title">Thực đơn (Set Menu)</div>
                        <table class="cost-table">
                            <thead>
                                <tr>
                                    <th>Tên set menu</th>
                                    <th style="text-align:right;">Số lượng</th>
                                    <th style="text-align:right;">Đơn giá / bàn</th>
                                    <th style="text-align:right;">Số bàn</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let sm of invoice.setMenus">
                                    <td>{{ sm.name ?? '-' }}</td>
                                    <td style="text-align:right;">{{ sm.quantity ?? 1 }}</td>
                                    <td style="text-align:right;">{{ formatPrice(sm.pricePerTable) }}</td>
                                    <td style="text-align:right;">{{ sm.tableCount ?? invoice.tableCount }}</td>
                                    <td>{{ formatPrice(sm.totalPrice) }}</td>
                                </tr>
                                <tr class="subtotal">
                                    <td colspan="4" style="text-align:right; padding-right:1.5rem;">Tổng chi phí thực đơn:</td>
                                    <td>{{ formatPrice(invoice.setMenuTotal) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Dịch vụ đi kèm -->
                    <div class="section" *ngIf="invoice.services?.length">
                        <div class="section-title">Dịch vụ đi kèm</div>
                        <table class="cost-table">
                            <thead>
                                <tr>
                                    <th>Tên dịch vụ</th>
                                    <th style="text-align:right;">Số lượng</th>
                                    <th style="text-align:right;">Đơn giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let svc of invoice.services">
                                    <td>{{ svc.name }}</td>
                                    <td style="text-align:right;">{{ svc.quantity ?? 1 }}</td>
                                    <td style="text-align:right;">{{ formatPrice(svc.unitPrice) }}</td>
                                    <td>{{ formatPrice(svc.totalPrice) }}</td>
                                </tr>
                                <tr class="subtotal">
                                    <td colspan="3" style="text-align:right; padding-right:1.5rem;">Tổng chi phí dịch vụ:</td>
                                    <td>{{ formatPrice(invoice.serviceTotal) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Tổng hợp chi phí -->
                    <div class="section">
                        <div class="section-title">Tổng hợp chi phí</div>
                        <div class="summary-line">
                            <span>Chi phí sảnh:</span>
                            <span>{{ formatPrice(invoice.hallTotal ?? 0) }}</span>
                        </div>
                        <div class="summary-line" *ngIf="invoice.setMenuTotal">
                            <span>Chi phí thực đơn:</span>
                            <span>{{ formatPrice(invoice.setMenuTotal) }}</span>
                        </div>
                        <div class="summary-line" *ngIf="invoice.serviceTotal">
                            <span>Chi phí dịch vụ:</span>
                            <span>{{ formatPrice(invoice.serviceTotal) }}</span>
                        </div>
                        <div class="summary-line">
                            <span>Tạm tính:</span>
                            <span>{{ formatPrice(invoice.subTotal ?? invoice.totalAmount) }}</span>
                        </div>
                        <div class="summary-line">
                            <span>Thuế:</span>
                            <span>{{ formatPrice(invoice.tax ?? 0) }}</span>
                        </div>
                        <div class="summary-line total">
                            <span>Tổng cộng:</span>
                            <span style="color:var(--primary-color);">{{ formatPrice(invoice.totalAmount) }}</span>
                        </div>
                    </div>

                    <!-- Danh sách thanh toán -->
                    <div class="section">
                        <div class="flex items-center justify-between mb-4">
                            <div class="section-title" style="margin:0;">
                                Danh sách thanh toán ({{ invoice.payments?.length ?? 0 }})
                            </div>
                            <p-button
                                label="Thêm thanh toán"
                                icon="pi pi-plus"
                                severity="primary"
                                size="small"
                                (onClick)="openPaymentDialog()"
                            />
                        </div>

                        <table class="cost-table">
                            <thead>
                                <tr>
                                    <th>Mã TT</th>
                                    <th>Ngày</th>
                                    <th style="text-align:center;">Đợt</th>
                                    <th>Phương thức</th>
                                    <th>Trạng thái</th>
                                    <th style="text-align:right;">Số Tiền</th>
                                    <th>Ghi chú</th>
                                    <th style="text-align:center;">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let p of invoice.payments">
                                    <td class="font-semibold">{{ p.code ?? ('#' + p.id) }}</td>
                                    <td>{{ formatDate(p.paymentDate) }}</td>
                                    <td style="text-align:center;">{{ p.round ?? '-' }}</td>
                                    <td>{{ getMethodLabel(p.method) }}</td>
                                    <td>
                                        <span class="text-xs font-semibold px-2 py-1 border-round"
                                              [style.background]="getPaymentStatusBg(p.status)"
                                              [style.color]="getPaymentStatusColor(p.status)">
                                            {{ getPaymentStatusLabel(p.status) }}
                                        </span>
                                    </td>
                                    <td style="text-align:right;" class="font-semibold text-900">
                                        {{ formatPrice(p.amount) }}
                                    </td>
                                    <td class="text-500">{{ p.note ?? '-' }}</td>
                                    <td style="text-align:center;">
                                        <p-button
                                            icon="pi pi-trash"
                                            [rounded]="true" [text]="true"
                                            severity="danger"
                                            (click)="confirmDeletePayment(p)"
                                        />
                                    </td>
                                </tr>
                                <tr *ngIf="!invoice.payments?.length">
                                    <td colspan="8" class="text-center py-5 text-500">Chưa có thanh toán nào</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>

                <!-- RIGHT: tổng quan tài chính -->
                <div>
                    <div class="finance-card">
                        <div class="finance-title">Tổng quan tài chính</div>
                        <div class="summary-line">
                            <span>Tạm tính:</span>
                            <span>{{ formatPrice(invoice.subTotal ?? invoice.totalAmount) }}</span>
                        </div>
                        <div class="summary-line">
                            <span>Thuế:</span>
                            <span>{{ formatPrice(invoice.tax ?? 0) }}</span>
                        </div>
                        <div class="summary-line total" style="border-top:1px solid #e2e8f0; margin-top:0.5rem; padding-top:0.5rem;">
                            <span>Tổng cộng:</span>
                            <span>{{ formatPrice(invoice.totalAmount) }}</span>
                        </div>
                        <div class="summary-line" style="margin-top:0.5rem;">
                            <span>Đã thanh toán:</span>
                            <span class="paid-val" style="color:#16a34a; font-weight:600;">
                                {{ formatPrice(invoice.paidAmount ?? 0) }}
                            </span>
                        </div>
                        <div class="summary-line">
                            <span>Còn lại:</span>
                            <span class="remain-val" style="color:#dc2626; font-weight:600;">
                                {{ formatPrice(remainingAmount) }}
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </ng-container>

        <!-- Dialog Thêm thanh toán -->
        <p-dialog
            [(visible)]="paymentDialog"
            [style]="{ width: '460px' }"
            header="Thêm thanh toán"
            [modal]="true"
            styleClass="p-fluid"
        >
            <ng-template #content>
                <div class="flex flex-col gap-4 mt-2">
                    <div>
                        <label class="block font-semibold mb-2 text-sm">
                            Số tiền <span class="text-red-500">*</span>
                        </label>
                        <p-inputnumber
                            [(ngModel)]="paymentForm.amount"
                            [min]="0" fluid [useGrouping]="true"
                            [class.ng-invalid]="paymentSubmitted && !paymentForm.amount"
                        />
                        <small class="text-red-500" *ngIf="paymentSubmitted && !paymentForm.amount">
                            Vui lòng nhập số tiền.
                        </small>
                    </div>
                    <div>
                        <label class="block font-semibold mb-2 text-sm">Phương thức</label>
                        <p-select
                            [options]="methodOptions"
                            [(ngModel)]="paymentForm.method"
                            optionLabel="label" optionValue="value"
                            placeholder="Chọn phương thức..."
                            fluid
                        />
                    </div>
                    <div>
                        <label class="block font-semibold mb-2 text-sm">Ngày thanh toán</label>
                        <input type="date" pInputText [(ngModel)]="paymentForm.paymentDate" fluid />
                    </div>
                    <div>
                        <label class="block font-semibold mb-2 text-sm">Ghi chú</label>
                        <textarea pTextarea [(ngModel)]="paymentForm.note" rows="3" fluid
                                  placeholder="Ghi chú..." class="w-full"></textarea>
                    </div>
                </div>
            </ng-template>
            <ng-template #footer>
                <div class="flex justify-end gap-2">
                    <p-button label="Hủy" icon="pi pi-times" text (click)="paymentDialog = false" />
                    <p-button
                        label="Lưu"
                        icon="pi pi-check"
                        severity="primary"
                        (click)="savePayment()"
                        [loading]="savingPayment"
                    />
                </div>
            </ng-template>
        </p-dialog>
    `,
    providers: [MessageService, ConfirmationService, InvoiceService]
})
export class InvoiceDetailComponent implements OnInit {

    invoice: Invoice | null = null;
    loading = false;
    paymentDialog = false;
    paymentSubmitted = false;
    savingPayment = false;

    paymentForm: { amount: number | null; method: string; note: string; paymentDate: string } = {
        amount: null, method: 'CASH', note: '', paymentDate: ''
    };

    methodOptions = [
        { label: 'Tiền mặt',      value: 'CASH'          },
        { label: 'Chuyển khoản',  value: 'BANK_TRANSFER'  },
        { label: 'Thẻ tín dụng',  value: 'CREDIT_CARD'    },
        { label: 'Ví điện tử',    value: 'E_WALLET'       },
    ];

    get remainingAmount(): number {
        const total = Number(this.invoice?.totalAmount ?? 0);
        const paid  = Number(this.invoice?.paidAmount  ?? 0);
        return Math.max(total - paid, 0);
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private invoiceService: InvoiceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isFinite(id) || id <= 0) { this.goBack(); return; }
        this.loadDetail(id);
    }

    loadDetail(id: number) {
        this.loading = true;
        this.invoiceService.getById(id).subscribe({
            next: (res) => {
                this.invoice = res.data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải hóa đơn', life: 3000 });
                this.cdr.detectChanges();
            }
        });
    }

    openPaymentDialog() {
        this.paymentForm = {
            amount: null, method: 'CASH', note: '',
            paymentDate: new Date().toISOString().slice(0, 10)
        };
        this.paymentSubmitted = false;
        this.paymentDialog = true;
    }

    savePayment() {
        this.paymentSubmitted = true;
        if (!this.paymentForm.amount) return;

        this.savingPayment = true;
        this.invoiceService.addPayment(this.invoice!.id!, {
            amount:      this.paymentForm.amount,
            method:      this.paymentForm.method,
            note:        this.paymentForm.note,
            paymentDate: this.paymentForm.paymentDate,
        }).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm thanh toán', life: 3000 });
                this.paymentDialog = false;
                this.savingPayment = false;
                this.loadDetail(this.invoice!.id!);
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể thêm thanh toán', life: 3000 });
                this.savingPayment = false;
            }
        });
    }

    confirmDeletePayment(p: Payment) {
        this.confirmationService.confirm({
            message: 'Bạn có chắc muốn xoá thanh toán này?',
            header: 'Xác nhận xoá',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Xoá',
            rejectLabel: 'Hủy',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.invoiceService.deletePayment(this.invoice!.id!, p.id!).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xoá thanh toán', life: 3000 });
                        this.loadDetail(this.invoice!.id!);
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xoá thanh toán', life: 3000 });
                    }
                });
            }
        });
    }

    goBack()       { this.router.navigate(['/pages/invoice']); }
    goToContract() { if (this.invoice?.contractId) this.router.navigate(['/pages/booking', this.invoice.contractId, 'view']); }

    // ── Helpers ───────────────────────────────────────────────────────────────
    formatPrice(v?: number): string {
        const n = Number(v ?? 0);
        return new Intl.NumberFormat('vi-VN').format(Number.isFinite(n) ? n : 0) + ' đ';
    }

    formatDate(d?: string): string {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('vi-VN');
    }

    getStatusLabel(s?: string): string {
        return { UNPAID: 'Chưa thanh toán', PARTIAL: 'Thanh toán 1 phần', PAID: 'Đã thanh toán' }[s ?? ''] ?? s ?? '-';
    }

    getStatusColor(s?: string): string {
        return { UNPAID: '#ffffff', PARTIAL: '#1e293b', PAID: '#166534' }[s ?? ''] ?? '#1e293b';
    }

    getStatusBg(s?: string): string {
        return { UNPAID: '#ef4444', PARTIAL: '#fef3c7', PAID: '#dcfce7' }[s ?? ''] ?? '#f1f5f9';
    }

    getMethodLabel(m?: string): string {
        return { CASH: 'Tiền mặt', BANK_TRANSFER: 'Chuyển khoản', CREDIT_CARD: 'Thẻ tín dụng', E_WALLET: 'Ví điện tử' }[m ?? ''] ?? m ?? '-';
    }

    getPaymentStatusLabel(s?: string): string {
        return { PENDING: 'Chờ xử lý', CONFIRMED: 'Đã xác nhận', CANCELLED: 'Đã huỷ' }[s ?? ''] ?? s ?? '-';
    }

    getPaymentStatusBg(s?: string): string {
        return { PENDING: '#fef3c7', CONFIRMED: '#dcfce7', CANCELLED: '#fee2e2' }[s ?? ''] ?? '#f1f5f9';
    }

    getPaymentStatusColor(s?: string): string {
        return { PENDING: '#d97706', CONFIRMED: '#16a34a', CANCELLED: '#dc2626' }[s ?? ''] ?? '#64748b';
    }
}