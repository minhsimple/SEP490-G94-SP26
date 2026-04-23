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
import { Invoice, InvoiceIncidentPayload, Payment, InvoiceService } from '../service/invoice.service';
import { PaymentService } from '../service/payment.service';
import { BookingService } from '../service/booking.service';
import { CustomerService } from '../service/customer.service';
import { SetMenuService } from '../service/set-menu';
import { ServicePackageService } from '../service/service-package.service';
import { ServiceService } from '../service/service.service';
import { catchError, map } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';

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
                <div class="flex items-center gap-2">
                    <p-button
                        *ngIf="canRefund"
                        label="Hoàn tiền"
                        icon="pi pi-replay"
                        severity="danger"
                        [loading]="refundingInvoice"
                        [disabled]="refundingInvoice"
                        (onClick)="refundInvoice()"
                    />
                    <p-button
                        *ngIf="canLiquidate"
                        label="Tất toán"
                        icon="pi pi-check-circle"
                        severity="warn"
                        [loading]="liquidatingContract"
                        [disabled]="liquidatingContract"
                        (onClick)="liquidateContract()"
                    />
                    <span
                        class="status-chip"
                        [style.background]="getStatusBg(invoice.invoiceState)"
                        [style.color]="getStatusColor(invoice.invoiceState)"
                    >
                        {{ getStatusLabel(invoice.invoiceState) }}
                    </span>
                </div>
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

                        <div class="section-title" style="margin:1rem 0 0.6rem; font-size:0.92rem;">Chi tiết món ăn theo set menu</div>
                        <table class="cost-table" *ngIf="menuItemDetails.length; else noMenuDetailTpl">
                            <thead>
                                <tr>
                                    <th>Danh mục</th>
                                    <th>Tên món</th>
                                    <th style="text-align:right;">Số lượng</th>
                                    <th style="text-align:right;">Đơn giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let dish of menuItemDetails">
                                    <td>{{ dish.category }}</td>
                                    <td>{{ dish.name }}</td>
                                    <td style="text-align:right;">{{ dish.quantity }} {{ dish.unit || '' }}</td>
                                    <td style="text-align:right;">{{ formatPrice(dish.unitPrice) }}</td>
                                    <td>{{ formatPrice(dish.totalPrice) }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <ng-template #noMenuDetailTpl>
                            <div class="text-500" style="font-size:0.86rem;">Chưa có dữ liệu chi tiết món ăn của set menu.</div>
                        </ng-template>
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

                        <div class="section-title" style="margin:1rem 0 0.6rem; font-size:0.92rem;">Chi tiết thành phần dịch vụ</div>
                        <table class="cost-table" *ngIf="serviceComponentDetails.length; else noServiceDetailTpl">
                            <thead>
                                <tr>
                                    <th>Tên thành phần</th>
                                    <th style="text-align:right;">Số lượng</th>
                                    <th style="text-align:right;">Đơn giá</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let detail of serviceComponentDetails">
                                    <td>{{ detail.name }}</td>
                                    <td style="text-align:right;">{{ detail.quantity }} {{ detail.unit || '' }}</td>
                                    <td style="text-align:right;">{{ formatPrice(detail.unitPrice) }}</td>
                                    <td>{{ formatPrice(detail.totalPrice) }}</td>
                                </tr>
                            </tbody>
                        </table>
                        <ng-template #noServiceDetailTpl>
                            <div class="text-500" style="font-size:0.86rem;">Chưa có dữ liệu thành phần chi tiết của gói dịch vụ.</div>
                        </ng-template>
                    </div>

                    <!-- Phát sinh theo hợp đồng -->
                    <div class="section">
                        <div class="flex items-center justify-between gap-2 flex-wrap mb-3">
                            <div>
                                <div class="section-title" style="margin-bottom:0.25rem;">Phát sinh theo hợp đồng</div>
                                <div class="text-500" style="font-size:0.82rem;">
                                    Hợp đồng: {{ invoice.contractNo ?? ('#' + (invoice.contractId ?? '-')) }}
                                </div>
                            </div>

                            <div class="flex items-center gap-2" *ngIf="canEditIncident">
                                <p-button
                                    *ngIf="!incidentEditing"
                                    label="Sửa chi phí phát sinh"
                                    icon="pi pi-pencil"
                                    severity="secondary"
                                    [outlined]="true"
                                    [disabled]="incidentLoading"
                                    (onClick)="startIncidentCostEdit()"
                                />

                                <p-button
                                    *ngIf="incidentEditing"
                                    label="Hủy"
                                    severity="secondary"
                                    [text]="true"
                                    [disabled]="savingIncidentCosts"
                                    (onClick)="cancelIncidentCostEdit()"
                                />
                                <p-button
                                    *ngIf="incidentEditing"
                                    label="Lưu chi phí phát sinh"
                                    icon="pi pi-save"
                                    [loading]="savingIncidentCosts"
                                    [disabled]="savingIncidentCosts || incidentLoading"
                                    (onClick)="saveIncidentCostChanges()"
                                />
                            </div>
                        </div>

                        <div *ngIf="incidentLoading" class="text-center py-5 text-500">
                            <i class="pi pi-spin pi-spinner"></i>
                        </div>

                        <div
                            *ngIf="!incidentLoading && incidentEditing"
                            class="grid mb-3"
                            style="grid-template-columns:2fr 3fr 180px auto;gap:0.6rem;align-items:end;"
                        >
                            <div>
                                <label class="text-xs text-500 block mb-1">Tiêu đề</label>
                                <input
                                    pInputText
                                    [(ngModel)]="newIncidentDraft.title"
                                    placeholder="Nhập tiêu đề phát sinh"
                                    style="width:100%;"
                                    (keydown.enter)="addIncidentInEditMode()"
                                />
                            </div>
                            <div>
                                <label class="text-xs text-500 block mb-1">Mô tả</label>
                                <input
                                    pInputText
                                    [(ngModel)]="newIncidentDraft.description"
                                    placeholder="Mô tả phát sinh"
                                    style="width:100%;"
                                    (keydown.enter)="addIncidentInEditMode()"
                                />
                            </div>
                            <div>
                                <label class="text-xs text-500 block mb-1">Chi phí</label>
                                <p-inputnumber
                                    [(ngModel)]="newIncidentDraft.price"
                                    [min]="0"
                                    [useGrouping]="true"
                                    [inputStyle]="{ width: '100%', textAlign: 'right' }"
                                />
                            </div>
                            <p-button
                                label="Thêm incident"
                                icon="pi pi-plus"
                                [outlined]="true"
                                (onClick)="addIncidentInEditMode()"
                            />
                        </div>

                        <table class="cost-table" *ngIf="!incidentLoading && incidents.length; else noIncidentTpl">
                            <thead>
                                <tr>
                                    <th style="width:72px;">STT</th>
                                    <th>Tiêu đề</th>
                                    <th>Mô tả</th>
                                    <th style="text-align:right;">Chi phí</th>
                                    <th style="width:96px; text-align:center;">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr *ngFor="let incident of incidents; let i = index">
                                    <td>{{ i + 1 }}</td>
                                    <td class="font-semibold text-900">{{ incident.title || '-' }}</td>
                                    <td>{{ incident.description || '-' }}</td>
                                    <td style="text-align:right;">
                                        <ng-container *ngIf="!incidentEditing; else incidentPriceEditorTpl">
                                            {{ formatPrice(incident.price) }}
                                        </ng-container>
                                        <ng-template #incidentPriceEditorTpl>
                                            <p-inputnumber
                                                [(ngModel)]="incident.price"
                                                [min]="0"
                                                [useGrouping]="true"
                                                [inputStyle]="{ width: '140px', textAlign: 'right' }"
                                            />
                                        </ng-template>
                                    </td>
                                    <td style="text-align:center;">
                                        <button
                                            *ngIf="incidentEditing"
                                            type="button"
                                            class="cursor-pointer p-1"
                                            style="color:#dc2626;background:#fff1f2;border:1px solid #fecdd3;border-radius:7px;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;"
                                            [disabled]="savingIncidentCosts"
                                            (click)="removeIncidentInEditMode(i)"
                                            pTooltip="Xóa phát sinh"
                                            tooltipPosition="top"
                                        >
                                            <i class="pi pi-trash" style="font-size:0.85rem;"></i>
                                        </button>
                                        <span *ngIf="!incidentEditing" class="text-500">-</span>
                                    </td>
                                </tr>
                                <tr class="subtotal">
                                    <td colspan="4" style="text-align:right; padding-right:1.5rem;">Tổng phát sinh:</td>
                                    <td>{{ formatPrice(incidentTotalAmount) }}</td>
                                </tr>
                            </tbody>
                        </table>

                        <ng-template #noIncidentTpl>
                            <div class="text-500" style="font-size:0.86rem;">Chưa có phát sinh nào cho hợp đồng này.</div>
                        </ng-template>
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
                        <div class="summary-line" *ngIf="incidents.length">
                            <span>Chi phí phát sinh:</span>
                            <span>{{ formatPrice(incidentTotalAmount) }}</span>
                        </div>
                        <div class="summary-line">
                            <span>Tạm tính:</span>
                            <span>{{ formatPrice(invoice.subTotal ?? invoice.totalAmount) }}</span>
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
                        
                        <div class="summary-line" *ngIf="incidents.length">
                            <span>Phát sinh ghi nhận:</span>
                            <span>{{ formatPrice(incidentTotalAmount) }}</span>
                        </div>
                        <div class="summary-line total" style="border-top:1px solid #e2e8f0; margin-top:0.5rem; padding-top:0.5rem;">
                            <span>Tổng cộng:</span>
                            <span>{{ formatPrice(invoice.totalAmount) }}</span>
                        </div>
                        <div class="summary-line" style="margin-top:0.5rem;">
                            <span>Đã thanh toán:</span>
                            <span class="paid-val" style="color:#16a34a; font-weight:600;">
                                {{ formatPrice(paidAmountValue) }}
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
    incidents: InvoiceIncidentPayload[] = [];
    incidentLoading = false;
    incidentEditing = false;
    savingIncidentCosts = false;
    newIncidentDraft: InvoiceIncidentPayload = {
        title: '',
        description: '',
        price: 0,
    };
    loading = false;
    returnUrl = '';
    contractState = '';
    liquidatingContract = false;
    refundingInvoice = false;
    paymentDialog = false;
    paymentSubmitted = false;
    savingPayment = false;
    payingPaymentId: number | null = null;
    resolvedSetMenuId: number | null = null;
    menuItemDetails: Array<{ category: string; name: string; quantity: number; unitPrice: number; unit?: string; totalPrice: number }> = [];
    serviceComponentDetails: Array<{ name: string; quantity: number; unitPrice: number; unit?: string; totalPrice: number }> = [];

    readonly roleCode = (localStorage.getItem('codeRole') ?? '').toUpperCase();
    readonly isAccountant = this.roleCode.includes('ACCOUNTANT');

    paymentForm: { amount: number | null; method: string; note: string; paymentDate: string; round: number } = {
        amount: null, method: 'CASH', note: '', paymentDate: '', round: 1
    };

    roundOptions = [
        { label: 'Đợt 1 (40%)', value: 1 },
        { label: 'Đợt 2 (Còn lại)', value: 2 },
    ];

    methodOptions = [
        { label: 'Tiền mặt', value: 'CASH' },
        { label: 'Chuyển khoản', value: 'BANK_TRANSFER' },
        { label: 'Thẻ tín dụng', value: 'CREDIT_CARD' },
        { label: 'Ví điện tử', value: 'E_WALLET' },
    ];

    get remainingAmount(): number {
        const total = Number(this.invoice?.totalAmount ?? 0);
        const paid = this.paidAmountValue;
        return Math.max(total - paid, 0);
    }

    get paidAmountValue(): number {
        const payments = this.invoice?.payments ?? [];
        if (payments.length > 0) {
            return payments
                .filter((payment) => this.isPaidPaymentStatus(payment.status))
                .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0);
        }

        const rawPaid = Number(this.invoice?.paidAmount ?? 0);
        return Number.isFinite(rawPaid) ? rawPaid : 0;
    }

    get incidentTotalAmount(): number {
        return this.incidents.reduce((sum, incident) => {
            const amount = Number(incident?.price ?? 0);
            return sum + (Number.isFinite(amount) ? amount : 0);
        }, 0);
    }

    get canLiquidate(): boolean {
        const paymentCount = this.invoice?.payments?.length ?? 0;
        if (paymentCount > 1) return false;
        const state = this.contractState.toUpperCase();
        if (state === 'DRAFT' || state === 'CANCELLED') return false;
        return true;
    }

    get canRefund(): boolean {
        const invoiceState = String(this.invoice?.invoiceState ?? '').toUpperCase();
        if (invoiceState === 'REFUNDED' || invoiceState === 'PAID') return false;
        const state = this.contractState.toUpperCase();
        if (state === 'DRAFT' || state === 'CANCELLED') return false;
        return true;
    }

    get canEditIncident(): boolean {
        if (!this.isAccountant) return false;
        const invoiceState = String(this.invoice?.invoiceState ?? '').toUpperCase();
        return invoiceState !== 'PAID' && invoiceState !== 'REFUNDED';
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private invoiceService: InvoiceService,
        private paymentService: PaymentService,
        private bookingService: BookingService,
        private customerService: CustomerService,
        private setMenuService: SetMenuService,
        private servicePackageService: ServicePackageService,
        private serviceService: ServiceService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
    ) { }

    ngOnInit() {
        const navState = this.router.getCurrentNavigation()?.extras?.state as { returnUrl?: string } | undefined;
        const queryReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '';
        const candidateReturnUrl = navState?.returnUrl || history.state?.returnUrl || queryReturnUrl || '';
        this.returnUrl = this.isPaymentDetailUrl(candidateReturnUrl) ? '' : candidateReturnUrl;

        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isFinite(id) || id <= 0) { this.goBack(); return; }
        this.loadDetail(id);
    }

    loadDetail(id: number) {
        this.loading = true;
        this.resolvedSetMenuId = null;
        this.incidents = [];
        this.incidentLoading = false;
        this.incidentEditing = false;
        this.savingIncidentCosts = false;
        this.invoiceService.getById(id).subscribe({
            next: (res) => {
                this.invoice = this.adaptInvoice(res.data);
                this.loadPaymentsByContract();
                this.loadIncidentsByContract();
                this.enrichInvoiceMissingInfo();
                this.loadDetailedQuotation();
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

    private loadIncidentsByContract() {
        const contractId = Number(this.invoice?.contractId ?? 0);
        if (!Number.isFinite(contractId) || contractId <= 0) {
            this.incidents = [];
            this.incidentLoading = false;
            this.incidentEditing = false;
            this.cdr.detectChanges();
            return;
        }

        this.incidentLoading = true;
        this.invoiceService.getIncidentsByContractId(contractId).subscribe({
            next: (res) => {
                this.incidents = (res.data ?? []).map((incident) => ({
                    title: String(incident?.title ?? '').trim(),
                    description: String(incident?.description ?? '').trim(),
                    price: Number(incident?.price ?? 0),
                }));
                this.incidentLoading = false;
                if (this.incidents.length === 0) {
                    this.incidentEditing = false;
                }
                this.cdr.detectChanges();
            },
            error: () => {
                this.incidents = [];
                this.incidentLoading = false;
                this.incidentEditing = false;
                this.cdr.detectChanges();
            }
        });
    }

    startIncidentCostEdit() {
        if (this.incidentLoading || this.savingIncidentCosts) {
            return;
        }

        this.incidentEditing = true;
        this.newIncidentDraft = { title: '', description: '', price: 0 };
        this.cdr.detectChanges();
    }

    cancelIncidentCostEdit() {
        if (this.savingIncidentCosts) {
            return;
        }

        this.incidentEditing = false;
        this.newIncidentDraft = { title: '', description: '', price: 0 };
        this.loadIncidentsByContract();
    }

    addIncidentInEditMode() {
        if (!this.incidentEditing || this.incidentLoading || this.savingIncidentCosts) {
            return;
        }

        const title = String(this.newIncidentDraft.title ?? '').trim();
        if (!title) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Thiếu tiêu đề',
                detail: 'Vui lòng nhập tiêu đề phát sinh để thêm.',
                life: 2500,
            });
            return;
        }

        this.incidents = [
            ...this.incidents,
            {
                title,
                description: String(this.newIncidentDraft.description ?? '').trim(),
                price: this.normalizeIncidentPrice(this.newIncidentDraft.price),
            }
        ];

        this.newIncidentDraft = { title: '', description: '', price: 0 };
        this.cdr.detectChanges();
    }

    removeIncidentInEditMode(index: number) {
        if (!this.incidentEditing || this.savingIncidentCosts) {
            return;
        }

        if (!Number.isInteger(index) || index < 0 || index >= this.incidents.length) {
            return;
        }

        this.incidents = this.incidents.filter((_, i) => i !== index);
        this.cdr.detectChanges();
    }

    saveIncidentCostChanges() {
        const contractId = Number(this.invoice?.contractId ?? 0);
        if (!this.incidentEditing || this.incidentLoading || this.savingIncidentCosts || !Number.isFinite(contractId) || contractId <= 0) {
            return;
        }

        const hasInvalidTitle = this.incidents.some((incident) => !String(incident?.title ?? '').trim());
        if (hasInvalidTitle) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Dữ liệu chưa hợp lệ',
                detail: 'Mỗi phát sinh cần có tiêu đề trước khi lưu.',
                life: 2800,
            });
            return;
        }

        const payload: InvoiceIncidentPayload[] = this.incidents.map((incident) => ({
            title: String(incident?.title ?? '').trim(),
            description: String(incident?.description ?? '').trim(),
            price: this.normalizeIncidentPrice(incident?.price),
        }));

        this.savingIncidentCosts = true;
        this.invoiceService.updateIncidentsByContractId(contractId, payload).subscribe({
            next: (res) => {
                this.savingIncidentCosts = false;
                this.incidentEditing = false;
                this.newIncidentDraft = { title: '', description: '', price: 0 };
                this.incidents = (res.data ?? []).map((incident) => ({
                    title: String(incident?.title ?? '').trim(),
                    description: String(incident?.description ?? '').trim(),
                    price: this.normalizeIncidentPrice(incident?.price),
                }));
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Đã cập nhật chi phí phát sinh.',
                    life: 2500,
                });
                this.refreshInvoiceTotalAfterIncidentSave();
                this.cdr.detectChanges();
            },
            error: () => {
                this.savingIncidentCosts = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Không thể cập nhật chi phí phát sinh.',
                    life: 3000,
                });
                this.cdr.detectChanges();
            }
        });
    }

    private refreshInvoiceTotalAfterIncidentSave() {
        const invoiceId = Number(this.invoice?.id ?? 0);
        if (!Number.isFinite(invoiceId) || invoiceId <= 0 || !this.invoice) {
            return;
        }

        this.invoiceService.getById(invoiceId).subscribe({
            next: (res) => {
                const latest = this.adaptInvoice(res.data);
                this.invoice = {
                    ...this.invoice,
                    totalAmount: latest.totalAmount,
                    subTotal: latest.subTotal,
                    tax: latest.tax,
                    hallTotal: latest.hallTotal,
                    setMenuTotal: latest.setMenuTotal,
                    serviceTotal: latest.serviceTotal,
                };
                this.cdr.detectChanges();
            },
            error: () => {
                this.cdr.detectChanges();
            }
        });
    }

    private normalizeIncidentPrice(rawPrice: unknown): number {
        const value = Number(rawPrice ?? 0);
        if (!Number.isFinite(value)) {
            return 0;
        }

        return Math.max(0, value);
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
                        .filter((p) => this.isPaidPaymentStatus(p.status))
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

    liquidateContract() {
        const invoiceId = this.invoice?.id;
        if (!invoiceId) return;

        this.confirmationService.confirm({
            message: 'Bạn có chắc chắn muốn tất toán hóa đơn này?',
            header: 'Xác nhận thanh toán',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Thanh toán',
            rejectLabel: 'Hủy',
            acceptButtonStyleClass: 'p-button-warning',
            accept: () => {
                this.liquidatingContract = true;
                this.invoiceService.liquidateInvoice(invoiceId).subscribe({
                    next: () => {
                        this.liquidatingContract = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Đã xác nhận thành công.',
                            life: 3000,
                        });
                        this.loadDetail(invoiceId);
                    },
                    error: (err) => {
                        this.liquidatingContract = false;
                        const detail = err?.error?.message ?? 'Không thể tất toán.';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Lỗi',
                            detail,
                            life: 3000,
                        });
                    }
                });
            }
        });
    }

    refundInvoice() {
        const invoiceId = this.invoice?.id;
        if (!invoiceId) return;

        this.confirmationService.confirm({
            message: 'Bạn có chắc chắn muốn hoàn tiền cho hóa đơn này? Hành động này sẽ huỷ hợp đồng và tạo một khoản hoàn trả.',
            header: 'Xác nhận hoàn tiền',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Hoàn tiền',
            rejectLabel: 'Hủy',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.refundingInvoice = true;
                this.invoiceService.refundInvoice(invoiceId).subscribe({
                    next: () => {
                        this.refundingInvoice = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Đã hoàn tiền thành công.',
                            life: 3000,
                        });
                        this.loadDetail(invoiceId);
                    },
                    error: (err) => {
                        this.refundingInvoice = false;
                        const detail = err?.error?.message ?? 'Không thể hoàn tiền cho hóa đơn này.';
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Lỗi',
                            detail,
                            life: 3000,
                        });
                    }
                });
            }
        });
    }

    goBack() {
        if (this.returnUrl && !this.isPaymentDetailUrl(this.returnUrl)) {
            this.router.navigateByUrl(this.returnUrl);
            return;
        }

        const contractId = Number(this.invoice?.contractId ?? 0);
        if (Number.isFinite(contractId) && contractId > 0) {
            this.router.navigate(['/pages/booking', contractId, 'view']);
            return;
        }

        this.router.navigate(['/pages/invoice']);
    }

    private isPaymentDetailUrl(url?: string): boolean {
        const value = String(url ?? '').trim();
        return /^\/pages\/payment\//i.test(value);
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
        const missingSetMenuId = !this.resolveSetMenuId();
        if (!missingCore && !missingSetMenuId) return;

        this.bookingService.getById(current.contractId).subscribe({
            next: (res) => {
                const booking = res.data as any;
                const customerId = Number(current.customerId ?? booking?.customerId ?? 0) || undefined;
                const bookingSetMenuId = Number(booking?.setMenuId ?? 0);
                const safeBookingSetMenuId = Number.isFinite(bookingSetMenuId) && bookingSetMenuId > 0 ? bookingSetMenuId : null;
                this.resolvedSetMenuId = safeBookingSetMenuId;

                const currentSetMenu = (this.invoice as any)?.setMenu;
                const setMenuWithId = currentSetMenu
                    ? { ...currentSetMenu, id: currentSetMenu.id ?? safeBookingSetMenuId ?? undefined }
                    : (safeBookingSetMenuId ? { id: safeBookingSetMenuId } : undefined);

                this.contractState = String(booking?.contractState ?? booking?.bookingState ?? '').toUpperCase();

                this.invoice = {
                    ...this.invoice,
                    customerId,
                    customerName: this.invoice?.customerName ?? booking?.customerName,
                    bookingDate: this.invoice?.bookingDate ?? booking?.bookingDate ?? booking?.eventDate,
                    expectedTables: this.invoice?.expectedTables ?? booking?.expectedTables,
                    tableCount: this.invoice?.tableCount ?? booking?.tableCount ?? booking?.expectedTables,
                    setMenu: setMenuWithId,
                    setMenus: (this.invoice?.setMenus ?? []).map((menu) => ({
                        ...menu,
                        id: menu.id ?? safeBookingSetMenuId ?? undefined,
                    })),
                };

                if (safeBookingSetMenuId) {
                    this.loadMenuItemDetails();
                }

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
        const invoiceData = raw.data;
        const hallData = invoiceData?.hall_invoice;
        const setMenuData = invoiceData?.set_menu_invoice;
        const servicePackageData = invoiceData?.service_package_invoice;
        const setMenuItems = setMenuData?.menu_items ?? [];

        const expectedTables = raw.expectedTables ?? raw.tableCount ?? 0;
        const hallBasePrice = Number(hallData?.price ?? raw.hall?.basePrice ?? raw.pricePerTable ?? 0);
        const hallTotal = Number(raw.hallTotal ?? hallBasePrice);

        const servicesFromData = (servicePackageData?.services ?? []).map((service) => {
            const unitPrice = Number(service?.price ?? 0);
            return {
                id: service?.id,
                name: service?.name,
                quantity: 1,
                unitPrice,
                totalPrice: unitPrice,
            };
        });

        const serviceTotal = Number(
            raw.serviceTotal
            ?? servicePackageData?.price
            ?? servicesFromData.reduce((sum, service) => sum + Number(service.totalPrice ?? 0), 0)
            ?? raw.servicesPackage?.basePrice
            ?? 0
        );

        const directSetMenuUnit = Number(
            setMenuData?.price
            ?? raw.setMenu?.setPrice
            ?? (raw.setMenu as any)?.price
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

        const inlineMenuItemsByCategory = setMenuItems.reduce((acc, item) => {
            const category = String(item?.category_name ?? 'Khác').trim() || 'Khác';
            const quantity = Number(item?.quantity ?? 1);
            const unitPrice = Number(item?.price ?? 0);
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push({
                id: item?.id,
                code: item?.code,
                name: item?.name,
                quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
                unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
                unit: item?.unit,
            });
            return acc;
        }, {} as Record<string, Array<{ id?: number; code?: string; name?: string; quantity: number; unitPrice: number; unit?: string }>>);

        const setMenuRows: Array<{
            id?: number;
            name?: string;
            quantity?: number;
            pricePerTable?: number;
            tableCount?: number;
            totalPrice?: number;
        }> = raw.setMenus?.length
                ? raw.setMenus
                : raw.setMenu
                    ? [{
                        id: raw.setMenu.id,
                        name: raw.setMenu.name,
                        quantity: 1,
                        pricePerTable: raw.setMenu.setPrice,
                        tableCount: expectedTables,
                        totalPrice: setMenuTotal,
                    }]
                    : setMenuData
                        ? [{
                            id: setMenuData.id,
                            name: setMenuData.name,
                            quantity: 1,
                            pricePerTable: setMenuUnit,
                            tableCount: expectedTables,
                            totalPrice: setMenuTotal,
                        }]
                        : [];

        const normalizedSetMenus = setMenuRows.map((menu) => {
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
            hall: raw.hall ?? (hallData
                ? {
                    id: hallData.id,
                    code: hallData.code,
                    name: hallData.name,
                    basePrice: Number(hallData.price ?? 0),
                }
                : undefined),
            hallName: raw.hall?.name ?? hallData?.name ?? raw.hallName,
            tableCount: raw.tableCount ?? raw.expectedTables,
            expectedTables,
            servicesPackage: raw.servicesPackage ?? (servicePackageData
                ? {
                    name: servicePackageData.name,
                    basePrice: Number(servicePackageData.price ?? 0),
                }
                : undefined),
            setMenu: raw.setMenu ?? (setMenuData
                ? {
                    id: setMenuData.id,
                    code: setMenuData.code,
                    name: setMenuData.name,
                    setPrice: Number(setMenuData.price ?? 0),
                    menuItemsByCategory: inlineMenuItemsByCategory,
                }
                : undefined),
            pricePerTable: raw.pricePerTable ?? Number(hallData?.price ?? raw.hall?.basePrice ?? 0),
            hallTotal,
            serviceTotal,
            setMenuTotal,
            status: raw.status,
            invoiceState: raw.invoiceState ?? raw.status,
            services: raw.services?.length
                ? raw.services
                : servicesFromData.length
                    ? servicesFromData
                    : (raw.servicesPackage
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

    private loadDetailedQuotation() {
        this.loadMenuItemDetails();
        this.loadServiceComponentDetails();
    }

    private loadMenuItemDetails() {
        const inlineByCategory = (this.invoice as any)?.setMenu?.menuItemsByCategory as Record<string, any[]> | undefined;
        if (inlineByCategory && Object.keys(inlineByCategory).length > 0) {
            this.menuItemDetails = this.mapMenuItemsByCategory(inlineByCategory);
            this.cdr.detectChanges();
            return;
        }

        const setMenuId = this.resolveSetMenuId();
        if (!Number.isFinite(setMenuId) || setMenuId <= 0) {
            this.menuItemDetails = [];
            this.cdr.detectChanges();
            return;
        }

        this.setMenuService.getById(setMenuId).subscribe({
            next: (res) => {
                const byCategory = (res.data as any)?.menuItemsByCategory as Record<string, any[]> | undefined;
                this.menuItemDetails = byCategory ? this.mapMenuItemsByCategory(byCategory) : [];
                this.cdr.detectChanges();
            },
            error: () => {
                this.menuItemDetails = [];
                this.cdr.detectChanges();
            }
        });
    }

    private resolveSetMenuId(): number {
        const raw = (this.invoice as any)?.setMenu?.id
            ?? this.invoice?.setMenus?.[0]?.id
            ?? this.resolvedSetMenuId
            ?? 0;
        const num = Number(raw);
        return Number.isFinite(num) && num > 0 ? num : 0;
    }

    private mapMenuItemsByCategory(byCategory: Record<string, any[]>): Array<{ category: string; name: string; quantity: number; unitPrice: number; unit?: string; totalPrice: number }> {
        return Object.entries(byCategory).flatMap(([category, rows]) =>
            (rows ?? []).map((row) => {
                const quantity = Number(row?.quantity ?? 1);
                const unitPrice = Number(row?.unitPrice ?? 0);
                const safeQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
                const safePrice = Number.isFinite(unitPrice) ? unitPrice : 0;
                return {
                    category: category || 'Khác',
                    name: String(row?.name ?? '').trim() || 'Món ăn',
                    quantity: safeQty,
                    unitPrice: safePrice,
                    unit: String(row?.unit ?? '').trim() || undefined,
                    totalPrice: safeQty * safePrice,
                };
            })
        );
    }

    private loadServiceComponentDetails() {
        const packageId = Number((this.invoice as any)?.servicesPackage?.id ?? 0);
        if (!Number.isFinite(packageId) || packageId <= 0) {
            this.serviceComponentDetails = this.mapDirectServiceLines();
            this.cdr.detectChanges();
            return;
        }

        this.servicePackageService.getById(packageId).subscribe({
            next: (res) => {
                const rows = (res.data?.serviceResponseList ?? [])
                    .map((row: any) => ({
                        serviceId: Number(row?.serviceId ?? 0),
                        qty: Number(row?.qty ?? 1),
                    }))
                    .filter((row: any) => Number.isFinite(row.serviceId) && row.serviceId > 0);

                if (rows.length === 0) {
                    this.serviceComponentDetails = this.mapDirectServiceLines();
                    this.cdr.detectChanges();
                    return;
                }

                forkJoin(
                    rows.map((row: any) =>
                        this.serviceService.getServiceById(row.serviceId).pipe(
                            map((serviceRes) => {
                                const basePrice = Number(serviceRes.data?.basePrice ?? 0);
                                const safeUnitPrice = Number.isFinite(basePrice) ? basePrice : 0;
                                const safeQty = Number.isFinite(row.qty) && row.qty > 0 ? row.qty : 1;
                                return {
                                    name: String(serviceRes.data?.name ?? '').trim() || `Dịch vụ #${row.serviceId}`,
                                    quantity: safeQty,
                                    unitPrice: safeUnitPrice,
                                    unit: String(serviceRes.data?.unit ?? '').trim() || undefined,
                                    totalPrice: safeQty * safeUnitPrice,
                                };
                            }),
                            catchError(() =>
                                of({
                                    name: `Dịch vụ #${row.serviceId}`,
                                    quantity: Number.isFinite(row.qty) && row.qty > 0 ? row.qty : 1,
                                    unitPrice: 0,
                                    unit: undefined,
                                    totalPrice: 0,
                                })
                            )
                        )
                    )
                ).subscribe((details) => {
                    this.serviceComponentDetails = details;
                    this.cdr.detectChanges();
                });
            },
            error: () => {
                this.serviceComponentDetails = this.mapDirectServiceLines();
                this.cdr.detectChanges();
            }
        });
    }

    private mapDirectServiceLines(): Array<{ name: string; quantity: number; unitPrice: number; unit?: string; totalPrice: number }> {
        const serviceLines = this.invoice?.services ?? [];
        return serviceLines.map((svc) => {
            const quantity = Number(svc.quantity ?? 1);
            const unitPrice = Number(svc.unitPrice ?? 0);
            const safeQty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
            const safePrice = Number.isFinite(unitPrice) ? unitPrice : 0;
            return {
                name: String(svc.name ?? '').trim() || 'Dịch vụ',
                quantity: safeQty,
                unitPrice: safePrice,
                unit: undefined,
                totalPrice: Number(svc.totalPrice ?? (safeQty * safePrice)),
            };
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

    getStatusLabel(s?: string): string {
        return { UNPAID: 'Chưa thanh toán', PARTIAL: 'Thanh toán 1 phần', PAID: 'Đã thanh toán', REFUNDED: 'Đã hoàn tiền' }[s ?? ''] ?? s ?? '-';
    }

    getStatusColor(s?: string): string {
        return { UNPAID: '#ffffff', PARTIAL: '#1e293b', PAID: '#166534', REFUNDED: '#7c3aed' }[s ?? ''] ?? '#1e293b';
    }

    getStatusBg(s?: string): string {
        return { UNPAID: '#ef4444', PARTIAL: '#fef3c7', PAID: '#dcfce7', REFUNDED: '#ede9fe' }[s ?? ''] ?? '#f1f5f9';
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
            CANCELLED: 'Đã huỷ',
            REFUNDED: 'Đã hoàn tiền'
        }[s ?? ''] ?? s ?? '-';
    }

    getPaymentStatusBg(s?: string): string {
        return {
            PENDING: '#fef3c7',
            SUCCESS: '#dcfce7',
            FAILED: '#fee2e2',
            CONFIRMED: '#dcfce7',
            CANCELLED: '#fee2e2',
            REFUNDED: '#ede9fe'
        }[s ?? ''] ?? '#f1f5f9';
    }

    getPaymentStatusColor(s?: string): string {
        return {
            PENDING: '#d97706',
            SUCCESS: '#16a34a',
            FAILED: '#dc2626',
            CONFIRMED: '#16a34a',
            CANCELLED: '#dc2626',
            REFUNDED: '#7c3aed'
        }[s ?? ''] ?? '#64748b';
    }

    private isPaidPaymentStatus(status?: string): boolean {
        const normalized = String(status ?? '').toUpperCase();
        return normalized === 'SUCCESS' || normalized === 'CONFIRMED' || normalized === 'PAID';
    }
}