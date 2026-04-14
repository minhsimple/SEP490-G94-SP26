import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { PaymentService } from '../service/payment.service';
import { BookingService } from '../service/booking.service';
import { CustomerService } from '../service/customer.service';

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
            grid-template-columns: minmax(0,1fr) 360px;
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
                        </div>
                    </div>
                </div>
                <span
                    class="status-chip"
                    [style.background]="getStatusBg(invoice.invoiceState)"
                    [style.color]="getStatusColor(invoice.invoiceState)"
                >
                    {{ getStatusLabel(invoice.invoiceState) }}
                </span>
            </div>

            <div class="layout">

                <!-- LEFT -->
                <div>

                    <!-- Thông tin hóa đơn -->
                    <div class="section">
                        <div class="section-title">Thông tin hoá đơn</div>
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
                            <span class="val">{{ invoice.hall?.name ?? invoice.hallName ?? '-' }}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">Số bàn:</span>
                            <span class="val">{{ invoice.expectedTables ?? invoice.tableCount ?? '-' }} bàn</span>
                        </div>
                    </div>

                    <!-- Chi phí sảnh -->
                    <div class="section">
                        <div class="section-title">Chi phí sảnh</div>
                        <table class="cost-table">
                            <thead>
                                <tr>
                                    <th>Sảnh</th>
                                    <th style="text-align:right;">Giá sảnh</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{{ invoice.hall?.name ?? invoice.hallName ?? '-' }}</td>
                                    <td style="text-align:right;">{{ formatPrice(invoice.hall?.basePrice ?? invoice.pricePerTable ?? 0) }}</td>
                                    <td>{{ formatPrice(invoice.hallTotal ?? 0) }}</td>
                                </tr>
                                <tr class="subtotal">
                                    <td colspan="2" style="text-align:right; padding-right:1.5rem;">Tổng chi phí sảnh:</td>
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
                                    <th style="text-align:right;">x Số bàn</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let sm of invoice.setMenus">
                                    <td>{{ sm.name ?? '-' }}</td>
                                    <td style="text-align:right;">{{ sm.quantity ?? 1 }}</td>
                                    <td style="text-align:right;">{{ formatPrice(sm.pricePerTable) }}</td>
                                    <td style="text-align:right;">{{ sm.tableCount ?? invoice.expectedTables ?? invoice.tableCount }}</td>
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
                        <div class="summary-line" *ngIf="invoice.setMenus?.length">
                            <span>Chi phí thực đơn:</span>
                            <span>{{ formatPrice(invoice.setMenuTotal ?? 0) }}</span>
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
                        <div class="section-title" style="margin:0 0 1rem;">
                            Danh sách thanh toán ({{ invoice.payments?.length ?? 0 }})
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
                                            icon="pi pi-eye"
                                            [rounded]="true" [text]="true"
                                            severity="info"
                                            (click)="goToPaymentDetail(p)"
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
                        <label class="block font-semibold mb-2 text-sm">Đợt thanh toán</label>
                        <p-select
                            [options]="roundOptions"
                            [(ngModel)]="paymentForm.round"
                            optionLabel="label" optionValue="value"
                            placeholder="Chọn đợt..."
                            (ngModelChange)="onRoundChange()"
                            fluid
                        />
                        <small class="text-500" *ngIf="paymentForm.round === 1">
                            Đợt 1 mặc định 40% tổng hóa đơn.
                        </small>
                        <small class="text-500" *ngIf="paymentForm.round === 2">
                            Đợt 2 mặc định phần còn lại (60% + phí phát sinh nếu có).
                        </small>
                    </div>
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
    providers: [MessageService, ConfirmationService, InvoiceService, PaymentService, BookingService]
})
export class InvoiceDetailComponent implements OnInit {

    invoice: Invoice | null = null;
    loading = false;
    returnUrl = '';
    paymentDialog = false;
    paymentSubmitted = false;
    savingPayment = false;
    payingPaymentId: number | null = null;

    paymentForm: { amount: number | null; method: string; note: string; paymentDate: string; round: number } = {
        amount: null, method: 'CASH', note: '', paymentDate: '', round: 1
    };

    roundOptions = [
        { label: 'Đợt 1 (40%)', value: 1 },
        { label: 'Đợt 2 (Còn lại)', value: 2 },
    ];

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
        private location: Location,
        private invoiceService: InvoiceService,
        private paymentService: PaymentService,
        private bookingService: BookingService,
        private customerService: CustomerService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        const navState = this.router.getCurrentNavigation()?.extras?.state as { returnUrl?: string } | undefined;
        const queryReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '';
        this.returnUrl = navState?.returnUrl || history.state?.returnUrl || queryReturnUrl || '';

        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isFinite(id) || id <= 0) { this.goBack(); return; }
        this.loadDetail(id);
    }

    loadDetail(id: number) {
        this.loading = true;
        this.invoiceService.getById(id).subscribe({
            next: (res) => {
                this.invoice = this.adaptInvoice(res.data);
                this.loadPaymentsByContract();
                this.enrichInvoiceMissingInfo();
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
        const suggestedRound = this.suggestRound();
        this.paymentForm = {
            amount: null, method: 'CASH', note: '',
            paymentDate: new Date().toISOString().slice(0, 10),
            round: suggestedRound,
        };
        this.onRoundChange();
        this.paymentSubmitted = false;
        this.paymentDialog = true;
    }

    onRoundChange() {
        const suggested = this.getSuggestedAmountByRound(this.paymentForm.round);
        this.paymentForm.amount = suggested > 0 ? suggested : null;
    }

    savePayment() {
        this.paymentSubmitted = true;
        if (!this.paymentForm.amount) return;

        const invoiceId = this.invoice?.id;
        const contractId = this.invoice?.contractId;
        if (!invoiceId || !contractId) {
            this.messageService.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'Không tìm thấy thông tin hợp đồng của hóa đơn',
                life: 3000
            });
            return;
        }

        this.savingPayment = true;
        const noteWithRound = this.buildRoundNote(this.paymentForm.note, this.paymentForm.round);
        this.paymentService.createPayment({
            contractId,
            amount: this.paymentForm.amount,
            method: this.paymentForm.method,
            note: noteWithRound,
            paymentState: 'PENDING'
        }).subscribe({
            next: (res) => {
                const createdPaymentId = res.data?.id;
                if (!createdPaymentId) {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không lấy được mã thanh toán vừa tạo', life: 3000 });
                    this.savingPayment = false;
                    return;
                }

                if (this.requiresPayOSRedirect(this.paymentForm.method)) {
                    const returnUrl = this.buildInvoiceReturnUrl(invoiceId);
                    const description = this.buildPayOSDescription();

                    this.paymentService.createPayOSPaymentLink({
                        paymentId: createdPaymentId,
                        returnUrl,
                        cancelUrl: returnUrl,
                        description
                    }).subscribe({
                        next: (payRes) => {
                            const checkoutUrl = payRes.data?.checkoutUrl;
                            if (!checkoutUrl) {
                                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không nhận được link thanh toán PayOS', life: 3000 });
                                this.savingPayment = false;
                                return;
                            }

                            this.paymentDialog = false;
                            this.savingPayment = false;
                            window.location.href = checkoutUrl;
                        },
                        error: () => {
                            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tạo link thanh toán PayOS', life: 3000 });
                            this.savingPayment = false;
                        }
                    });
                    return;
                }

                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm thanh toán', life: 3000 });
                this.paymentDialog = false;
                this.savingPayment = false;
                this.loadDetail(invoiceId);
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể thêm thanh toán', life: 3000 });
                this.savingPayment = false;
            }
        });
    }

    private requiresPayOSRedirect(method?: string): boolean {
        return method === 'BANK_TRANSFER' || method === 'E_WALLET' || method === 'CREDIT_CARD';
    }

    private buildInvoiceReturnUrl(invoiceId: number): string {
        return `${window.location.origin}/pages/invoice/${invoiceId}`;
    }

    private buildPayOSDescription(): string {
        const invoiceNo = this.invoice?.code ?? `#${this.invoice?.id ?? ''}`;
        const contractNo = this.invoice?.contractNo ?? `#${this.invoice?.contractId ?? ''}`;
        return `thanh toán hóa đơn ${invoiceNo} của hợp đồng ${contractNo}`;
    }

    private suggestRound(): number {
        const paid = Number(this.invoice?.paidAmount ?? 0);
        return paid > 0 ? 2 : 1;
    }

    private getSuggestedAmountByRound(round: number): number {
        const total = Number(this.invoice?.totalAmount ?? 0);
        const remaining = this.remainingAmount;
        if (!Number.isFinite(total) || total <= 0) return 0;

        if (round === 1) {
            // Đợt 1 cố định 40% tổng hóa đơn.
            const fortyPercent = Math.round(total * 0.4);
            return Math.min(fortyPercent, Math.max(remaining, 0));
        }

        // Đợt 2 là phần còn lại: 60% + phí phát sinh (nếu tổng hóa đơn tăng).
        return Math.max(Math.round(remaining), 0);
    }

    private buildRoundNote(note: string, round: number): string {
        const prefix = round === 1 ? 'Đợt 1 (40%)' : 'Đợt 2 (60% + phí nếu có)';
        const trimmed = (note ?? '').trim();
        return trimmed ? `${prefix} - ${trimmed}` : prefix;
    }

    private buildPayOSFallbackDescription(): string {
        const invoiceNo = String(this.invoice?.code ?? this.invoice?.id ?? '').replace(/[^a-zA-Z0-9-]/g, '');
        const contractNo = String(this.invoice?.contractNo ?? this.invoice?.contractId ?? '').replace(/[^a-zA-Z0-9-]/g, '');
        const shortText = `TT ${invoiceNo} HD ${contractNo}`.trim();
        return shortText.slice(0, 25) || 'Thanh toan hop dong';
    }

    canPayWithPayOS(payment?: Payment): boolean {
        const state = String(payment?.status ?? '').toUpperCase();
        return !!payment?.id
            && this.requiresPayOSRedirect(payment?.method)
            && (!state || state === 'PENDING' || state === 'FAILED');
    }

    payExistingPayment(payment: Payment) {
        if (!payment?.id || !this.invoice?.id) return;

        if (!this.requiresPayOSRedirect(payment.method)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Không hỗ trợ',
                detail: 'Phương thức này không dùng cổng PayOS. Vui lòng chọn thanh toán online.',
                life: 3500
            });
            return;
        }

        this.payingPaymentId = payment.id;
        const returnUrl = this.buildInvoiceReturnUrl(this.invoice.id);
        const description = this.buildPayOSDescription();
        const fallbackDescription = this.buildPayOSFallbackDescription();

        this.paymentService.createPayOSPaymentLink({
            paymentId: payment.id,
            returnUrl,
            cancelUrl: returnUrl,
            description
        }).subscribe({
            next: (res) => {
                const checkoutUrl = res.data?.checkoutUrl;
                if (!checkoutUrl) {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không nhận được link thanh toán PayOS', life: 3000 });
                    this.payingPaymentId = null;
                    return;
                }

                window.location.href = checkoutUrl;
            },
            error: (err) => {
                this.paymentService.createPayOSPaymentLink({
                    paymentId: payment.id!,
                    returnUrl,
                    cancelUrl: returnUrl,
                    description: fallbackDescription
                }).subscribe({
                    next: (retryRes) => {
                        const checkoutUrl = retryRes.data?.checkoutUrl;
                        if (!checkoutUrl) {
                            const detail = err?.error?.message ?? err?.message ?? 'Không thể tạo link thanh toán PayOS';
                            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail, life: 4000 });
                            this.payingPaymentId = null;
                            return;
                        }
                        window.location.href = checkoutUrl;
                    },
                    error: (retryErr) => {
                        const detail = retryErr?.error?.message ?? retryErr?.message ?? err?.error?.message ?? 'Không thể tạo link thanh toán PayOS';
                        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail, life: 4000 });
                        this.payingPaymentId = null;
                    }
                });
            }
        });
    }

    goToPaymentDetail(payment: Payment) {
        if (!payment?.id) return;
        const invoiceId = this.invoice?.id;
        const returnUrl = invoiceId ? `/pages/invoice/${invoiceId}` : '/pages/invoice';
        this.router.navigate(['/pages/payment', payment.id], {
            queryParams: { from: 'invoice', returnInvoiceId: invoiceId ?? null },
            state: { payment, returnUrl }
        });
    }

    private loadPaymentsByContract() {
        const contractId = this.invoice?.contractId;
        if (!contractId || !this.invoice) return;

        this.paymentService.getPaymentsByContract(contractId, 0, 100).subscribe({
            next: (res) => {
                const rows = [...(res.data?.content ?? [])].sort((a: any, b: any) => Number(a?.id ?? 0) - Number(b?.id ?? 0));
                const mappedPayments: Payment[] = rows.map((p: any, index: number) => ({
                    id: p.id,
                    code: p.code,
                    amount: Number(p.amount ?? 0),
                    method: p.method,
                    note: p.note,
                    round: p.round ?? (index === 0 ? 1 : 2),
                    paymentDate: p.paidAt ?? p.paymentDate ?? p.createdAt,
                    status: p.paymentState ?? p.status,
                }));

                this.invoice = {
                    ...this.invoice,
                    payments: mappedPayments,
                    paidAmount: mappedPayments
                        .filter((p) => ['SUCCESS', 'CONFIRMED', 'PAID'].includes(String(p.status ?? '').toUpperCase()))
                        .reduce((sum, p) => sum + Number(p.amount ?? 0), 0),
                };
                this.cdr.detectChanges();
            },
            error: () => {
                this.cdr.detectChanges();
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
                this.paymentService.deletePayment(p.id!).subscribe({
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

    goBack() {
        if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
            return;
        }
        if (window.history.length > 1) {
            this.location.back();
            return;
        }
        this.router.navigate(['/pages/invoice']);
    }

    goToContract() {
        if (!this.invoice?.contractId) return;
        const backUrl = this.router.url;
        this.router.navigate(['/pages/booking', this.invoice.contractId, 'view'], {
            state: { returnUrl: backUrl },
            queryParams: { returnUrl: backUrl }
        });
    }
    private enrichInvoiceMissingInfo() {
        const current = this.invoice;
        if (!current?.contractId) return;

        const missingCore = !current.createdAt || !current.bookingDate || !current.customerName || !current.customerPhone;
        if (!missingCore) return;

        this.bookingService.getById(current.contractId).subscribe({
            next: (res) => {
                const booking = res.data as any;
                const customerId = Number(current.customerId ?? booking?.customerId ?? 0) || undefined;

                this.invoice = {
                    ...this.invoice,
                    customerId,
                    customerName: this.invoice?.customerName ?? booking?.customerName,
                    bookingDate: this.invoice?.bookingDate ?? booking?.bookingDate ?? booking?.eventDate,
                    expectedTables: this.invoice?.expectedTables ?? booking?.expectedTables,
                    tableCount: this.invoice?.tableCount ?? booking?.tableCount ?? booking?.expectedTables,
                };

                if (!this.invoice?.customerPhone && customerId) {
                    this.customerService.getCustomerById(customerId).subscribe({
                        next: (cusRes) => {
                            this.invoice = {
                                ...this.invoice,
                                customerName: this.invoice?.customerName ?? cusRes.data?.fullName,
                                customerPhone: cusRes.data?.phone ?? this.invoice?.customerPhone,
                            };
                            this.cdr.detectChanges();
                        },
                        error: () => {
                            this.cdr.detectChanges();
                        }
                    });
                }

                this.cdr.detectChanges();
            },
            error: () => {
                this.cdr.detectChanges();
            }
        });
    }

    private adaptInvoice(raw: Invoice): Invoice {
        const expectedTables = raw.expectedTables ?? raw.tableCount ?? 0;
        const hallBasePrice = Number(raw.hall?.basePrice ?? raw.pricePerTable ?? 0);
        const hallTotal = Number(raw.hallTotal ?? hallBasePrice);

        const serviceTotal = Number(raw.serviceTotal ?? raw.servicesPackage?.basePrice ?? 0);
        const directSetMenuUnit = Number(
            raw.setMenu?.setPrice
            ?? (raw.setMenu as any)?.pricePerTable
            ?? (raw.setMenu as any)?.basePrice
            ?? (raw.setMenu as any)?.price
            ?? (raw as any)?.setMenuPrice
            ?? raw.setMenus?.[0]?.pricePerTable
            ?? 0
        );
        const setMenuUnit = Number.isFinite(directSetMenuUnit) && directSetMenuUnit > 0
            ? directSetMenuUnit
            : Number(raw.setMenuTotal ?? 0) > 0 && expectedTables > 0
                ? Number(raw.setMenuTotal) / expectedTables
                : 0;
        const setMenuTotal = Number(raw.setMenuTotal ?? (setMenuUnit > 0 ? setMenuUnit * expectedTables : 0));

        const normalizedSetMenus = (raw.setMenus?.length
            ? raw.setMenus
            : (raw.setMenu
                ? [{
                    id: raw.setMenu.id,
                    name: raw.setMenu.name,
                    quantity: 1,
                    pricePerTable: raw.setMenu.setPrice,
                    tableCount: expectedTables,
                    totalPrice: setMenuTotal,
                }]
                : [])
        ).map((menu) => {
            const quantity = Number(menu.quantity ?? 1) || 1;
            const unitPrice = Number(menu.pricePerTable ?? setMenuUnit ?? 0);
            const tableCount = Number(menu.tableCount ?? expectedTables ?? 0);
            const normalizedUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0;
            const normalizedTableCount = Number.isFinite(tableCount) ? tableCount : 0;
            const fallbackTotal = normalizedUnitPrice * normalizedTableCount * quantity;

            return {
                ...menu,
                quantity,
                pricePerTable: normalizedUnitPrice,
                tableCount: normalizedTableCount,
                totalPrice: Number(menu.totalPrice ?? fallbackTotal),
            };
        });

        return {
            ...raw,
            createdAt: raw.createdAt ?? (raw as any).created_at ?? new Date().toISOString(),
            bookingDate: raw.bookingDate ?? (raw as any).eventDate ?? (raw as any).booking_date,
            customerName: raw.customerName ?? (raw as any).customer?.fullName,
            customerPhone: raw.customerPhone ?? (raw as any).customer?.phone,
            hallName: raw.hall?.name ?? raw.hallName,
            tableCount: raw.tableCount ?? raw.expectedTables,
            expectedTables,
            pricePerTable: raw.pricePerTable ?? raw.hall?.basePrice,
            hallTotal,
            serviceTotal,
            setMenuTotal,
            status: raw.status,
            invoiceState: raw.invoiceState ?? raw.status,
            services: raw.services ?? (raw.servicesPackage
                ? [{
                    name: raw.servicesPackage.name,
                    quantity: 1,
                    unitPrice: raw.servicesPackage.basePrice,
                    totalPrice: raw.servicesPackage.basePrice,
                }]
                : []),
            setMenus: normalizedSetMenus,
        };
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
        return {
            PENDING: 'Chờ xử lý',
            SUCCESS: 'Thành công',
            FAILED: 'Thất bại',
            CONFIRMED: 'Đã xác nhận',
            CANCELLED: 'Đã huỷ'
        }[s ?? ''] ?? s ?? '-';
    }

    getPaymentStatusBg(s?: string): string {
        return {
            PENDING: '#fef3c7',
            SUCCESS: '#dcfce7',
            FAILED: '#fee2e2',
            CONFIRMED: '#dcfce7',
            CANCELLED: '#fee2e2'
        }[s ?? ''] ?? '#f1f5f9';
    }

    getPaymentStatusColor(s?: string): string {
        return {
            PENDING: '#d97706',
            SUCCESS: '#16a34a',
            FAILED: '#dc2626',
            CONFIRMED: '#16a34a',
            CANCELLED: '#dc2626'
        }[s ?? ''] ?? '#64748b';
    }
}