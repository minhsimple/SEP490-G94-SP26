import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Booking, BookingService, BookingUpsertPayload } from '../service/booking.service';
import { Customer, CustomerService } from '../service/customer.service';
import { HallService } from '../service/hall.service';
import { MenuItem, SetMenuService } from '../service/set-menu';
import { ServicePackageService } from '../service/service-package.service';
import { ServiceService } from '../service/service.service';
import { Invoice, InvoiceService } from '../service/invoice.service';
import { Payment, PaymentService } from '../service/payment.service';
import { UserService } from '../service/users.service';
import { RoleService } from '../service/role.service';

@Component({
    selector: 'app-booking-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, SelectModule, ToastModule],
    providers: [BookingService, MessageService, InvoiceService, PaymentService],
    styles: [`
        .page-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0;
        }
        .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 0.75rem;
        }
        .hero {
            border-radius: 14px;
            border: 1px solid #e2e8f0;
            background: #ffffff;
            padding: 1rem 1.1rem;
            margin-bottom: 1rem;
        }
        .hero-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 1rem;
            flex-wrap: wrap;
        }
        .hero-left {
            display: flex;
            gap: 0.75rem;
            align-items: flex-start;
        }
        .booking-no {
            margin-top: 0.35rem;
            font-size: 1.35rem;
            font-weight: 700;
            color: #1e293b;
            letter-spacing: 0.02em;
        }
        .couple-line {
            margin-top: 0.2rem;
            font-weight: 500;
            color: #64748b;
        }
        .hero-right {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.35rem;
            text-align: left;
        }
        .state-view {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
        }
        .layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 360px;
            gap: 1.25rem;
            align-items: start;
        }
        .card {
            background: #fff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 1.25rem;
        }
        .section-title {
            font-size: 1.05rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0 0 1rem;
        }
        .muted {
            color: #64748b;
        }
        .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.85rem 1rem;
        }
        .meta-row {
            display: flex;
            align-items: flex-start;
            gap: 0.65rem;
        }
        .meta-icon {
            width: 2rem;
            height: 2rem;
            border-radius: 8px;
            background: #f1f5f9;
            color: #64748b;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.95rem;
            flex: 0 0 2rem;
        }
        .value {
            color: #1e293b;
            font-weight: 600;
        }
        .chip {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 700;
            border-radius: 999px;
            padding: 0.32rem 0.7rem;
        }
        .line {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 0.55rem 0;
            color: #334155;
        }
        .line strong {
            color: #1e293b;
        }
        .line.total {
            border-top: 1px solid #dbe2ea;
            margin-top: 0.8rem;
            padding-top: 0.8rem;
            font-size: 1.35rem;
            font-weight: 700;
        }
        .progress {
            height: 8px;
            border-radius: 999px;
            background: #e2e8f0;
            overflow: hidden;
        }
        .progress-fill {
            height: 100%;
            background: #16a34a;
        }
        .detail-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.85rem;
            margin-top: 0.65rem;
        }
        .contract-shell {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #ffffff;
            overflow: hidden;
            padding: 1rem;
        }
        .contract-summary {
            color: #64748b;
            margin-bottom: 0.75rem;
            font-size: 0.9rem;
        }
        .contract-actions {
            display: flex;
            gap: 0.6rem;
            flex-wrap: nowrap;
            align-items: center;
            overflow-x: auto;
        }
        .coordinator-panel {
            margin-top: 0.9rem;
            padding-top: 0.8rem;
            border-top: 1px dashed #dbe2ea;
            display: grid;
            gap: 0.55rem;
        }
        .coordinator-panel-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            flex-wrap: wrap;
        }
        .coordinator-panel-title {
            font-size: 0.84rem;
            font-weight: 600;
            color: #334155;
        }
        .coordinator-panel-current {
            font-size: 0.8rem;
            color: #64748b;
        }
        .coordinator-panel-actions {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
        }
        .coordinator-select {
            min-width: 240px;
            flex: 1;
        }
        .contract-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.5);
            display: flex;
            align-items: flex-start;
            justify-content: center;
            z-index: 1200;
            padding: 1rem;
        }
        .contract-modal {
            width: min(95vw, 980px);
            max-height: calc(100vh - 2rem);
            background: #f8fafc;
            border-radius: 12px;
            border: 1px solid #cbd5e1;
            box-shadow: 0 24px 48px rgba(15, 23, 42, 0.35);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .contract-modal-header {
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            padding: 0.8rem 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            flex-wrap: wrap;
        }
        .contract-modal-title {
            font-size: 0.95rem;
            font-weight: 600;
            color: #0f172a;
        }
        .contract-toolbar {
            display: flex;
            align-items: center;
            gap: 0.45rem;
            flex-wrap: wrap;
        }
        .contract-content {
            padding: 1rem;
            overflow: auto;
            background: #e2e8f0;
            display: flex;
            justify-content: center;
        }
        .contract-zoom-wrap {
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: flex-start;
        }
        .contract-paper {
            width: 210mm;
            min-height: 297mm;
            background: #fff;
            border: 1px solid #dbe2ea;
            padding: 18mm 16mm;
            box-sizing: border-box;
            transition: transform 0.16s ease;
        }
        .contract-paper table {
            width: 100%;
            border-collapse: collapse;
        }
        .contract-paper td,
        .contract-paper th {
            border: 1px solid #d1d5db;
            padding: 6px;
            vertical-align: top;
        }
        .contract-paper p {
            margin: 0 0 6px;
            line-height: 1.45;
            font-size: 10pt;
        }
        /* ── CCCD Dialog ── */
        .cccd-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1200;
            padding: 1rem;
        }
        .cccd-modal {
            width: min(95vw, 780px);
            max-height: calc(100vh - 2rem);
            background: #fff;
            border-radius: 14px;
            border: 1px solid #cbd5e1;
            box-shadow: 0 24px 48px rgba(15, 23, 42, 0.35);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .cccd-modal-header {
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            padding: 0.85rem 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .cccd-modal-title {
            font-size: 1rem;
            font-weight: 600;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .cccd-modal-body {
            padding: 1.25rem;
            overflow: auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .cccd-card {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
        }
        .cccd-card-label {
            font-size: 0.85rem;
            font-weight: 600;
            color: #334155;
            padding: 0.55rem 0.85rem;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }
        .cccd-card img {
            width: 100%;
            display: block;
            object-fit: contain;
            max-height: 340px;
            background: #f1f5f9;
        }
        .cccd-empty {
            text-align: center;
            color: #94a3b8;
            padding: 2rem 1rem;
            font-size: 0.92rem;
        }
        .btn-cccd {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            margin-top: 0.75rem;
            padding: 0.4rem 0.75rem;
            font-size: 0.82rem;
            font-weight: 600;
            color: #3b82f6;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.15s, border-color 0.15s;
        }
        .btn-cccd:hover {
            background: #dbeafe;
            border-color: #93c5fd;
        }

        @media (max-width: 992px) {
            .layout {
                grid-template-columns: 1fr;
            }
            .meta-grid,
            .detail-grid {
                grid-template-columns: 1fr;
            }
            .hero-right {
                width: 100%;
                align-items: flex-start;
                text-align: left;
            }
            .contract-modal {
                width: 100%;
                max-height: calc(100vh - 1rem);
            }
            .contract-paper {
                width: 100%;
                min-height: auto;
                padding: 1rem;
            }
            .cccd-modal {
                width: 100%;
            }
        }
    `],
    template: `
        <p-toast />

        <div class="card" *ngIf="loading" style="text-align:center; color:#64748b">
            Đang tải thông tin hợp đồng...
        </div>

        <ng-container *ngIf="!loading && booking">
            <div class="page-header">
                <h1 class="page-title">Chi tiết hợp đồng</h1>
            </div>

            <div class="hero">
                <div class="hero-top">
                    <div class="hero-left">
                        <p-button icon="pi pi-arrow-left" [text]="true" severity="secondary" (onClick)="goBack()" />
                        <div>
                            <div class="booking-no">{{ booking.contractNo || booking.bookingNo || ('BK-' + booking.id) }}</div>
                            <div class="couple-line">
                                {{ booking.brideName || '-' }} & {{ booking.groomName || '-' }}
                            </div>
                        </div>
                    </div>
                    <div class="hero-right">
                        <div class="muted">Trạng thái xử lý</div>
                        <div class="state-view">
                            <span
                                class="chip"
                                [style.background]="statusBg(booking.contractState ?? booking.bookingState ?? 'DRAFT')"
                                [style.color]="statusColor(booking.contractState ?? booking.bookingState ?? 'DRAFT')"
                            >
                                {{ bookingStateLabel(booking.contractState ?? booking.bookingState ?? 'DRAFT') }}
                            </span>
                            <small class="muted">Trạng thái được đồng bộ tự động theo thanh toán.</small>
                            <p-button
                                label="Cập nhật Hủy hợp đồng"
                                icon="pi pi-times-circle"
                                severity="danger"
                                [outlined]="true"
                                size="small"
                                (onClick)="cancelContract()"
                                [loading]="updatingContractState"
                                [disabled]="updatingContractState || !canCancelContract()"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div class="layout">
                <div>
                    <!-- Thông tin tiệc cưới -->
                    <div class="card" style="margin-bottom:1rem">
                        <h2 class="section-title">Thông tin tiệc cưới</h2>
                        <div class="meta-grid">
                            <div class="meta-row">
                                <div class="meta-icon"><i class="pi pi-building"></i></div>
                                <div>
                                    <div class="muted">Sảnh cưới</div>
                                    <div class="value">{{ resolvedHallName() || ('Sảnh #' + (booking.hallId || '-')) }}</div>
                                    <div class="muted" *ngIf="resolvedHallPrice() > 0" style="margin-top:0.2rem">Phí thuê: {{ formatPrice(resolvedHallPrice()) }}</div>
                                </div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-icon"><i class="pi pi-calendar"></i></div>
                                <div>
                                    <div class="muted">Ngày tổ chức</div>
                                    <div class="value">{{ formatDate(booking.bookingDate) }} - {{ shiftLabel(booking.bookingTime) }}</div>
                                </div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-icon"><i class="pi pi-table"></i></div>
                                <div>
                                    <div class="muted">Số bàn</div>
                                    <div class="value">{{ booking.expectedTables || '-' }} bàn</div>
                                </div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-icon"><i class="pi pi-users"></i></div>
                                <div>
                                    <div class="muted">Số khách dự kiến</div>
                                    <div class="value">{{ booking.expectedGuests || '-' }} khách</div>
                                </div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-icon"><i class="pi pi-percentage"></i></div>
                                <div>
                                    <div class="muted">Phần trăm cọc</div>
                                    <div class="value">{{ resolvePaymentPercent(booking.paymentPercent) }}%</div>
                                </div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-icon"><i class="pi pi-list"></i></div>
                                <div>
                                    <div class="muted">Set menu</div>
                                    <div class="value">{{ resolvedSetMenuName() || (booking.setMenuId ? ('Set menu #' + booking.setMenuId) : '-') }}</div>
                                    <div class="muted" *ngIf="resolvedSetMenuPrice() > 0" style="margin-top:0.2rem">{{ formatPrice(resolvedSetMenuPrice()) }}/bàn</div>
                                </div>
                            </div>
                            <div class="meta-row">
                                <div class="meta-icon"><i class="pi pi-briefcase"></i></div>
                                <div>
                                    <div class="muted">Gói dịch vụ</div>
                                    <div class="value">{{ resolvedPackageName() || (booking.packageId ? ('Gói dịch vụ #' + booking.packageId) : '-') }}</div>
                                    <div class="muted" *ngIf="resolvedPackagePrice() > 0" style="margin-top:0.2rem">{{ formatPrice(resolvedPackagePrice()) }}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Thông tin khách hàng -->
                    <div class="card" style="margin-bottom:1rem">
                        <h2 class="section-title">Thông tin khách hàng</h2>
                        <div class="muted">Người liên hệ</div>
                        <div class="value" style="margin-top:0.35rem; font-size:1.2rem">{{ customerName || ('Khách hàng #' + (booking.customerId || '-')) }}</div>
                        <div style="margin-top:0.65rem" class="muted" *ngIf="customer?.phone"><i class="pi pi-phone"></i> {{ customer?.phone }}</div>
                        <div style="margin-top:0.35rem" class="muted" *ngIf="customer?.email"><i class="pi pi-envelope"></i> {{ customer?.email }}</div>

                        <div style="border-top:1px solid #e2e8f0; margin:1rem 0"></div>

                        <div class="detail-grid">
                            <div>
                                <div class="muted">Chú rể</div>
                                <div class="value" style="margin-top:0.3rem">{{ booking.groomName || '-' }}</div>
                            </div>
                            <div>
                                <div class="muted">Cô dâu</div>
                                <div class="value" style="margin-top:0.3rem">{{ booking.brideName || '-' }}</div>
                            </div>
                        </div>

                        <div style="border-top:1px solid #e2e8f0; margin:1rem 0"></div>

                        <div class="muted">Địa chỉ</div>
                        <div class="value" style="margin-top:0.3rem; font-weight:500">{{ customer?.address || '-' }}</div>

                        <button class="btn-cccd" *ngIf="customerImageUrls.length > 0" (click)="cccdDialogVisible = true">
                            <i class="pi pi-id-card"></i> Xem ảnh CCCD
                        </button>
                    </div>

                    <!-- Hạng mục đã chọn -->
                    <div class="card" style="margin-bottom:1rem">
                        <h2 class="section-title">Hạng mục đã chọn</h2>

                        <div class="value">Set menu: {{ resolvedSetMenuName() || (booking.setMenuId ? ('Set menu #' + booking.setMenuId) : '-') }}</div>
                        <div class="muted" *ngIf="resolvedSetMenuItems().length === 0" style="margin-top:0.35rem">Chưa có chi tiết món ăn trong set menu.</div>
                        <div *ngIf="resolvedSetMenuItems().length > 0" style="margin-top:0.45rem">
                            <div class="line" *ngFor="let item of resolvedSetMenuItems()" style="margin:0.4rem 0; align-items:flex-start">
                                <span>
                                    {{ item.name }}
                                    <small class="muted" style="display:block; margin-top:0.15rem">
                                        SL {{ item.quantity }}{{ item.unit ? ' ' + item.unit : '' }}
                                    </small>
                                </span>
                                <strong>{{ formatPrice((item.unitPrice || 0) * (item.quantity || 1)) }}</strong>
                            </div>
                        </div>

                        <div style="border-top:1px solid #e2e8f0; margin:1rem 0"></div>

                        <div>
                            <div class="value">Service package: {{ resolvedPackageName() || (booking.packageId ? ('Gói dịch vụ #' + booking.packageId) : '-') }}</div>
                            <div class="muted" *ngIf="resolvedPackageServices().length === 0" style="margin-top:0.35rem">Chưa có chi tiết dịch vụ trong service package.</div>
                            <div *ngIf="resolvedPackageServices().length > 0" style="margin-top:0.45rem">
                                <div class="line" *ngFor="let service of resolvedPackageServices()" style="margin:0.4rem 0; align-items:flex-start">
                                    <span>
                                        {{ service.name }}
                                        <small class="muted" style="display:block; margin-top:0.15rem">
                                            SL {{ service.quantity }}{{ service.unit ? ' ' + service.unit : '' }}
                                        </small>
                                    </span>
                                    <strong>{{ formatPrice((service.unitPrice || 0) * (service.quantity || 1)) }}</strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Lịch sử thanh toán -->
                    <div class="card">
                        <h2 class="section-title">Lịch sử thanh toán</h2>
                        <div class="muted">Các đợt thanh toán đã ghi nhận</div>
                        <div *ngIf="paymentHistory.length; else noPaymentHistoryTpl" style="margin-top:0.8rem">
                            <div class="line" *ngFor="let p of paymentHistory" style="align-items:flex-start">
                                <span>
                                    {{ p.code || ('TT-' + p.id) }}
                                    <small class="muted" style="display:block; margin-top:0.15rem">
                                        {{ formatDate(p.paymentDate || p.createdAt) }} - {{ paymentMethodLabel(p.method) }}
                                    </small>
                                </span>
                                <strong [style.color]="isPaidState(p.status || p.paymentState) ? '#16a34a' : '#b45309'">
                                    {{ formatPrice(p.amount) }}
                                </strong>
                            </div>
                        </div>
                        <ng-template #noPaymentHistoryTpl>
                            <div style="padding:2rem 0; text-align:center" class="muted">Chưa có thanh toán nào</div>
                        </ng-template>
                    </div>
                </div>

                <div>
                    <!-- Tổng quan thanh toán -->
                    <div class="card" style="margin-bottom:1rem">
                        <h2 class="section-title">Tổng quan thanh toán</h2>
                        <div class="line" *ngIf="resolvedSetMenuName() || booking.setMenuId"><span>Set menu</span><strong>{{ resolvedSetMenuName() || ('#' + booking.setMenuId) }}</strong></div>
                        <div class="line" *ngIf="resolvedSetMenuPrice() > 0"><span>Giá set menu</span><strong>{{ formatPrice(resolvedSetMenuPrice()) }}/bàn</strong></div>
                        <div class="line" *ngIf="resolvedHallName() || booking.hallId"><span>Sảnh</span><strong>{{ resolvedHallName() || ('#' + booking.hallId) }}</strong></div>
                        <div class="line" *ngIf="resolvedHallPrice() > 0"><span>Phí thuê sảnh</span><strong>{{ formatPrice(resolvedHallPrice()) }}</strong></div>
                        <div class="line" *ngIf="resolvedPackageName() || booking.packageId"><span>Gói dịch vụ</span><strong>{{ resolvedPackageName() || ('#' + booking.packageId) }}</strong></div>
                        <div class="line" *ngIf="resolvedPackagePrice() > 0"><span>Giá gói dịch vụ</span><strong>{{ formatPrice(resolvedPackagePrice()) }}</strong></div>
                        <div class="line"><span>Tỷ lệ cọc</span><strong>{{ resolvePaymentPercent(booking.paymentPercent) }}%</strong></div>
                        <div class="line"><span>Tổng tiền</span><strong>{{ formatPrice(totalAmount) }}</strong></div>
                        <div class="line" style="color:#16a34a"><span>Đã thanh toán</span><strong style="color:#16a34a">{{ formatPrice(paidAmount) }}</strong></div>
                        <div class="line total"><span>Còn lại</span><strong>{{ formatPrice(remainingAmount) }}</strong></div>
                        <div class="line" style="margin-top:0.8rem"><span>Tiến độ</span><strong>{{ progressPercent }}%</strong></div>
                        <div class="progress"><div class="progress-fill" [style.width.%]="progressPercent"></div></div>
                    </div>

                    <!-- Hoá đơn -->
                    <div class="card" style="margin-bottom:1rem">
                        <h2 class="section-title">Hoá đơn</h2>

                        <div *ngIf="invoicePreview; else noInvoiceTpl">
                            <div class="line" style="margin-top:0; margin-bottom:0.35rem;">
                                <span class="muted">Mã hoá đơn</span>
                                <strong>{{ invoicePreview.code || ('INV-' + invoicePreview.id) }}</strong>
                            </div>
                            <div class="line" style="margin:0.35rem 0;">
                                <span class="muted">Ngày tạo</span>
                                <strong>{{ formatDate(resolveInvoiceCreatedAt(invoicePreview)) }}</strong>
                            </div>
                            <div class="line" style="margin:0.35rem 0;">
                                <span class="muted">Tổng tiền</span>
                                <strong>{{ formatPrice(invoicePreview.totalAmount) }}</strong>
                            </div>
                            <div class="line" style="margin:0.35rem 0;">
                                <span class="muted">Đã thanh toán</span>
                                <strong style="color:#16a34a">{{ formatPrice(invoicePreview.paidAmount) }}</strong>
                            </div>
                            <div class="line" style="margin:0.35rem 0 0.85rem;">
                                <span class="muted">Trạng thái</span>
                                <span
                                    class="chip"
                                    [style.background]="invoiceStateBg(invoicePreview.invoiceState)"
                                    [style.color]="invoiceStateColor(invoicePreview.invoiceState)"
                                >
                                    {{ invoiceStateLabel(invoicePreview.invoiceState) }}
                                </span>
                            </div>

                            <p-button
                                label="Xem chi tiết & Thanh toán"
                                icon="pi pi-external-link"
                                severity="secondary"
                                [outlined]="true"
                                styleClass="w-full"
                                (onClick)="goToInvoiceDetail()"
                            />
                        </div>

                        <ng-template #noInvoiceTpl>
                            <div class="muted" style="margin-bottom:0.8rem">Chưa có hoá đơn cho hợp đồng này.</div>
                        </ng-template>
                    </div>

                    <!-- Hợp đồng -->
                    <div class="card">
                        <h2 class="section-title">Hợp đồng</h2>
                        <div class="contract-shell">
                            <div class="contract-summary">Xem hợp đồng đã điền thông tin hợp đồng theo khổ giấy A4.</div>
                            <div class="contract-actions">
                                <p-button label="Xem hợp đồng" icon="pi pi-file" (onClick)="openContractDialog()" />
                                <p-button label="In hợp đồng" icon="pi pi-print" severity="secondary" (onClick)="printContract()" />
                            </div>
                            <div class="coordinator-panel" *ngIf="canAssignCoordinator">
                                <div class="coordinator-panel-head">
                                    <span class="coordinator-panel-title">Phân công điều phối viên cho hợp đồng</span>
                                    <span class="coordinator-panel-current">Hiện tại: {{ coordinatorDisplayName() }}</span>
                                </div>
                                <div class="coordinator-panel-actions">
                                    <p-select
                                        class="coordinator-select"
                                        [options]="coordinatorOptions"
                                        [(ngModel)]="selectedCoordinatorId"
                                        optionLabel="label"
                                        optionValue="id"
                                        placeholder="Chọn coordinator"
                                        [showClear]="true"
                                    />
                                    <p-button
                                        label="Phân công"
                                        icon="pi pi-user-plus"
                                        (onClick)="assignCoordinator()"
                                        [loading]="assigningCoordinator"
                                        [disabled]="assigningCoordinator || !booking.id || selectedCoordinatorId == null"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CCCD Dialog -->
            <div class="cccd-overlay" *ngIf="cccdDialogVisible" (click)="cccdDialogVisible = false">
                <div class="cccd-modal" (click)="$event.stopPropagation()">
                    <div class="cccd-modal-header">
                        <div class="cccd-modal-title">
                            <i class="pi pi-id-card"></i> Ảnh CCCD - {{ customerName || 'Khách hàng' }}
                        </div>
                        <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="secondary" (onClick)="cccdDialogVisible = false" />
                    </div>
                    <div class="cccd-modal-body">
                        <div class="cccd-card" *ngIf="customerImageUrls.length >= 1">
                            <div class="cccd-card-label"><i class="pi pi-image"></i> Mặt trước</div>
                            <img [src]="getCcImage(0)" alt="CCCD mặt trước" />
                        </div>
                        <div class="cccd-card" *ngIf="customerImageUrls.length >= 2">
                            <div class="cccd-card-label"><i class="pi pi-image"></i> Mặt sau</div>
                            <img [src]="getCcImage(1)" alt="CCCD mặt sau" />
                        </div>
                        <div class="cccd-empty" *ngIf="customerImageUrls.length === 0">
                            Chưa có ảnh CCCD cho khách hàng này.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contract modal -->
            <div class="contract-overlay" *ngIf="contractDialogVisible" (click)="closeContractDialog()">
                <div class="contract-modal" (click)="$event.stopPropagation()">
                    <div class="contract-modal-header">
                        <div class="contract-modal-title">Hợp đồng dịch vụ - Khổ A4</div>
                        <div class="contract-toolbar">
                            <span class="muted" style="font-size:0.82rem">Zoom: {{ zoomPercent }}%</span>
                            <p-button icon="pi pi-search-minus" [rounded]="true" [text]="true" severity="secondary" (onClick)="zoomOut()" />
                            <p-button icon="pi pi-search-plus" [rounded]="true" [text]="true" severity="secondary" (onClick)="zoomIn()" />
                            <p-button label="100%" [text]="true" severity="secondary" (onClick)="resetZoom()" />
                            <p-button icon="pi pi-print" label="In" severity="secondary" [text]="true" (onClick)="printContract()" />
                            <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="secondary" (onClick)="closeContractDialog()" />
                        </div>
                    </div>
                    <div class="contract-content">
                        <div class="contract-zoom-wrap">
                            <div
                                class="contract-paper"
                                [style.transform]="'scale(' + contractZoom + ')'"
                                [style.transformOrigin]="'top center'"
                                [innerHTML]="contractPreviewHtml"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </ng-container>
    `,
})
export class BookingDetailComponent implements OnInit {
    loading = false;
    booking: Booking | null = null;
    customer: Customer | null = null;
    customerName = '';
    hallName = '';
    venueLocationName = '';
    hallPrice = 0;
    setMenuName = '';
    setMenuPrice = 0;
    setMenuItems: Array<{ name: string; quantity: number; unitPrice: number; unit?: string }> = [];
    packageName = '';
    packagePrice = 0;
    packageServices: Array<{ serviceId?: number; name: string; quantity: number; unitPrice: number; unit?: string }> = [];
    private packageServiceNameCache: Record<number, string> = {};
    readonly codeRole = (localStorage.getItem('codeRole') ?? '').toUpperCase();
    readonly currentUserId = Number(localStorage.getItem('userId')) || 0;
    readonly isAdminAccount = this.codeRole.includes('ADMIN');
    readonly isManagerAccount = this.codeRole.includes('MANAGER');
    readonly canAssignCoordinator = this.isAdminAccount || this.isManagerAccount;
    readonly isCoordinatorAccount = this.codeRole.includes('COORDINATOR') || this.codeRole.includes('COORD');
    coordinatorRoleIds = new Set<number>();
    coordinatorNameMap: Record<number, string> = {};
    coordinatorOptions: Array<{ id: number; label: string }> = [];
    coordinatorUsers: any[] = [];
    selectedCoordinatorId: number | null = null;
    contractLocationId: number | null = null;
    assigningCoordinator = false;
    updatingContractState = false;
    invoicePreview: Invoice | null = null;
    paymentHistory: Payment[] = [];

    apiTotalAmount = 0;
    totalAmount = 0;
    paidAmount = 0;
    remainingAmount = 0;
    progressPercent = 0;
    contractPreviewHtml: SafeHtml = '';
    contractPreviewRawHtml = '';
    contractDialogVisible = false;
    contractZoom = 1;
    zoomPercent = 100;
    customerImageUrls: any[] = [];
    cccdDialogVisible = false;
    returnUrl = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private bookingService: BookingService,
        private customerService: CustomerService,
        private hallService: HallService,
        private setMenuService: SetMenuService,
        private servicePackageService: ServicePackageService,
        private serviceService: ServiceService,
        private invoiceService: InvoiceService,
        private paymentService: PaymentService,
        private userService: UserService,
        private roleService: RoleService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
        private sanitizer: DomSanitizer,
    ) {}

    ngOnInit() {
        const navState = this.router.getCurrentNavigation()?.extras?.state as { returnUrl?: string } | undefined;
        const queryReturnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '';
        this.returnUrl = navState?.returnUrl || history.state?.returnUrl || queryReturnUrl || '';

        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isFinite(id) || id <= 0) {
            this.goBack();
            return;
        }

        if (this.canAssignCoordinator) {
            this.loadCoordinatorOptions();
        }

        this.loadDetail(id);
    }

    loadDetail(id: number) {
        this.loading = true;
        this.cdr.detectChanges();
        this.bookingService.getById(id).subscribe({
            next: (res) => {
                this.booking = res.data;
                const bookingLocationId = Number((this.booking as any)?.locationId ?? 0);
                if (Number.isFinite(bookingLocationId) && bookingLocationId > 0) {
                    this.contractLocationId = bookingLocationId;
                    this.applyCoordinatorFilter();
                }

                if (!this.canCurrentUserAccessBooking(this.booking)) {
                    this.loading = false;
                    this.booking = null;
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Không có quyền truy cập',
                        detail: 'Bạn chỉ được xem hợp đồng được phân công cho mình.',
                        life: 3200,
                    });
                    this.cdr.detectChanges();
                    this.goBack();
                    return;
                }

                this.selectedCoordinatorId = this.toNumberOrNull(this.booking?.assignCoordinatorId);
                this.ensureCoordinatorName(this.selectedCoordinatorId, this.booking?.assignCoordinatorName);

                if (this.booking?.customerId) this.loadCustomer(this.booking.customerId);
                if (this.booking?.hallId) this.loadHall(this.booking.hallId);
                if (this.booking?.setMenuId) this.loadSetMenu(this.booking.setMenuId);
                if (this.booking?.packageId) this.loadPackage(this.booking.packageId);
                if (this.booking?.id) {
                    this.loadInvoicePreview(this.booking.id);
                    this.loadPaymentHistory(this.booking.id);
                }

                const rawTotal = Number((this.booking as any)?.totalAmount ?? (this.booking as any)?.totalPrice ?? (this.booking as any)?.finalAmount ?? (this.booking as any)?.amount ?? 0);
                const rawPaid = Number((this.booking as any)?.paidAmount ?? 0);
                this.apiTotalAmount = Number.isFinite(rawTotal) ? rawTotal : 0;
                this.paidAmount = Number.isFinite(rawPaid) ? rawPaid : 0;
                this.recalculatePaymentSummary();
                this.updateContractPreview();

                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.cdr.detectChanges();
                this.goBack();
            },
        });
    }

    private loadCoordinatorOptions() {
        this.roleService.searchRoles({ page: 0, size: 100, sort: 'updatedAt,DESC' }).subscribe({
            next: (res) => {
                const roles = res.data?.content ?? [];
                this.coordinatorRoleIds = new Set(
                    roles
                        .filter((role: any) => this.isCoordinatorRole(role))
                        .map((role: any) => Number(role.id))
                        .filter((id: number) => Number.isFinite(id) && id > 0)
                );
                this.fetchCoordinatorUsers();
            },
            error: () => {
                this.coordinatorRoleIds.clear();
                this.fetchCoordinatorUsers();
            },
        });
    }

    private fetchCoordinatorUsers() {
        this.userService.searchUsers({ page: 0, size: 200, sort: 'fullName,ASC' }).subscribe({
            next: (res) => {
                const users = res.data?.content ?? [];
                this.coordinatorUsers = users.filter((user: any) => this.isCoordinatorUser(user));
                this.applyCoordinatorFilter();
            },
            error: () => {
                this.coordinatorUsers = [];
                this.coordinatorOptions = [];
                this.cdr.detectChanges();
            },
        });
    }

    private applyCoordinatorFilter() {
        const contractLocationId = Number(this.contractLocationId ?? 0);
        this.coordinatorOptions = this.coordinatorUsers
            .filter((user: any) => {
                if (this.isManagerAccount && !this.isAdminAccount) {
                    if (!Number.isFinite(contractLocationId) || contractLocationId <= 0) {
                        return false;
                    }
                    const userLocIds = this.getUserLocationIdsFromUser(user);
                    return userLocIds.includes(contractLocationId);
                }
                return true;
            })
            .map((user: any) => {
                const id = Number(user.id);
                const label = user.fullName?.trim() || `Coordinator #${id}`;
                this.coordinatorNameMap[id] = label;
                return { id, label };
            })
            .filter((item) => Number.isFinite(item.id) && item.id > 0);

        this.ensureCoordinatorName(this.selectedCoordinatorId, this.booking?.assignCoordinatorName);
        this.cdr.detectChanges();
    }

    private getUserLocationIdsFromUser(user: any): number[] {
        const locationIds = user?.locationIds;
        if (Array.isArray(locationIds)) {
            return locationIds.map((id: any) => Number(id)).filter((id: number) => Number.isFinite(id) && id > 0);
        }
        const singleId = Number(user?.locationId ?? 0);
        return Number.isFinite(singleId) && singleId > 0 ? [singleId] : [];
    }

    private isCoordinatorRole(role: any): boolean {
        const code = String(role?.code ?? '').toUpperCase();
        const name = String(role?.name ?? '').toUpperCase();
        return code.includes('COORDINATOR') || code.includes('COORD') || name.includes('COORDINATOR') || name.includes('COORD');
    }

    private isCoordinatorUser(user: any): boolean {
        const roleId = Number(user?.roleId ?? user?.role?.id);
        if (Number.isFinite(roleId) && roleId > 0 && this.coordinatorRoleIds.has(roleId)) {
            return true;
        }

        const roleCandidates = [
            user?.role,
            user?.roleCode,
            user?.codeRole,
            user?.roleName,
            user?.role?.code,
            user?.role?.name,
        ]
            .filter((value) => value != null)
            .map((value) => String(value).toUpperCase());

        return roleCandidates.some((value) => value.includes('COORDINATOR') || value.includes('COORD'));
    }

    coordinatorDisplayName(): string {
        if (this.selectedCoordinatorId == null) {
            return 'Chưa phân công';
        }

        const selected = this.coordinatorOptions.find((item) => item.id === this.selectedCoordinatorId);
        const mapped = this.coordinatorNameMap[this.selectedCoordinatorId];
        return selected?.label || mapped || `Coordinator #${this.selectedCoordinatorId}`;
    }

    assignCoordinator() {
        if (!this.canAssignCoordinator || !this.booking?.id || this.selectedCoordinatorId == null) {
            return;
        }

        const payload = this.buildUpdatePayloadForCoordinator(this.selectedCoordinatorId);
        if (!payload) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Thiếu dữ liệu',
                detail: 'Không đủ dữ liệu để cập nhật coordinator. Vui lòng kiểm tra lại thông tin bố trí bàn của hợp đồng.',
                life: 3000,
            });
            return;
        }

        this.assigningCoordinator = true;
        this.bookingService.update(this.booking.id, payload).subscribe({
            next: (res) => {
                this.assigningCoordinator = false;
                this.booking = res.data ?? this.booking;
                this.selectedCoordinatorId = this.toNumberOrNull(this.booking?.assignCoordinatorId) ?? this.selectedCoordinatorId;
                this.ensureCoordinatorName(this.selectedCoordinatorId, this.booking?.assignCoordinatorName);
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Đã phân công coordinator cho hợp đồng.',
                    life: 2500,
                });
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.assigningCoordinator = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: err?.error?.message ?? 'Không thể phân công coordinator.',
                    life: 3500,
                });
                this.cdr.detectChanges();
            },
        });
    }

    private buildUpdatePayloadForCoordinator(assignCoordinatorId: number): BookingUpsertPayload | null {
        const b = this.booking;
        if (!b) return null;

        const customerId = Number(b.customerId ?? 0);
        const hallId = Number(b.hallId ?? 0);
        const bookingDate = String(b.bookingDate ?? b.eventDate ?? '').trim();
        const bookingTime = String(b.bookingTime ?? b.shift ?? '').trim();
        const expectedTables = Number(b.expectedTables ?? b.tableCount ?? 0);
        const expectedGuests = Number(b.expectedGuests ?? b.guestCount ?? 0);
        const brideName = String(b.brideName ?? '').trim();
        const groomName = String(b.groomName ?? '').trim();

        if (!customerId || !hallId || !bookingDate || !bookingTime || !expectedTables || !expectedGuests || !brideName || !groomName) {
            return null;
        }

        const customerRequest = this.buildCustomerRequestForPayload(customerId);
        if (!customerRequest) {
            return null;
        }

        return {
            customerId,
            customerRequest,
            hallId,
            bookingDate,
            bookingTime,
            expectedTables,
            expectedGuests,
            paymentPercent: this.resolvePaymentPercent(b.paymentPercent),
            assignCoordinatorId,
            packageId: b.packageId ?? null,
            setMenuId: b.setMenuId ?? null,
            salesId: b.salesId ?? null,
            reservedUntil: b.reservedUntil ?? null,
            notes: b.notes ?? undefined,
            brideName,
            brideAge: b.brideAge ?? null,
            groomName,
            groomAge: b.groomAge ?? null,
            brideFatherName: b.brideFatherName ?? undefined,
            brideMotherName: b.brideMotherName ?? undefined,
            groomFatherName: b.groomFatherName ?? undefined,
            groomMotherName: b.groomMotherName ?? undefined,
        };
    }

    private buildCustomerRequestForPayload(customerId: number): BookingUpsertPayload['customerRequest'] | null {
        const customer = this.customer;
        if (!customer || Number(customer.id ?? 0) !== customerId) {
            return null;
        }

        const fullName = String(customer.fullName ?? '').trim();
        const phone = String(customer.phone ?? '').trim();
        const address = String(customer.address ?? '').trim();
        const locationId = Number(customer.locationId ?? 0);

        if (!fullName || !phone || !address || !locationId) {
            return null;
        }

        return {
            fullName,
            citizenIdNumber: customer.citizenIdNumber?.trim() || undefined,
            phone,
            email: customer.email?.trim() || undefined,
            address,
            notes: customer.notes?.trim() || undefined,
            locationId,
        };
    }

    private toNumberOrNull(value: unknown): number | null {
        const num = Number(value);
        return Number.isFinite(num) && num > 0 ? num : null;
    }

    resolvePaymentPercent(value: unknown): number {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) {
            return 10;
        }

        return Math.min(100, Math.max(10, Math.round(parsed)));
    }

    private ensureCoordinatorName(coordinatorId: number | null, fallbackName?: string | null) {
        if (!coordinatorId) {
            return;
        }

        const existing = this.coordinatorOptions.find((item) => item.id === coordinatorId);
        if (existing) {
            this.coordinatorNameMap[coordinatorId] = existing.label;
            return;
        }

        const cleanedFallback = String(fallbackName ?? '').trim();

        this.userService.getUser(coordinatorId).subscribe({
            next: (res) => {
                const user = res.data;
                if (user && this.isCoordinatorUser(user)) {
                    const fullName = user.fullName?.trim() || cleanedFallback || `Coordinator #${coordinatorId}`;
                    this.coordinatorNameMap[coordinatorId] = fullName;
                    this.upsertCoordinatorOption(coordinatorId, fullName);
                } else {
                    this.removeCoordinatorOption(coordinatorId);
                    delete this.coordinatorNameMap[coordinatorId];
                    if (this.selectedCoordinatorId === coordinatorId) {
                        this.selectedCoordinatorId = null;
                    }
                    if (this.booking && Number(this.booking.assignCoordinatorId) === coordinatorId) {
                        this.booking.assignCoordinatorId = null;
                        this.booking.assignCoordinatorName = undefined;
                    }
                }
                this.cdr.detectChanges();
            },
            error: () => {
                this.removeCoordinatorOption(coordinatorId);
                delete this.coordinatorNameMap[coordinatorId];
                if (this.selectedCoordinatorId === coordinatorId) {
                    this.selectedCoordinatorId = null;
                }
                this.cdr.detectChanges();
            },
        });
    }

    private upsertCoordinatorOption(id: number, label: string) {
        const idx = this.coordinatorOptions.findIndex((item) => item.id === id);
        if (idx >= 0) {
            this.coordinatorOptions[idx] = { id, label };
        } else {
            this.coordinatorOptions = [{ id, label }, ...this.coordinatorOptions];
        }
    }

    private removeCoordinatorOption(id: number) {
        this.coordinatorOptions = this.coordinatorOptions.filter((item) => item.id !== id);
    }

    private getInvoiceData(): NonNullable<Invoice['data']> | null {
        return this.invoicePreview?.data ?? null;
    }

    resolvedHallName(): string {
        const dataName = this.getInvoiceData()?.hall_invoice?.name;
        return String(dataName ?? this.hallName ?? '').trim();
    }

    resolvedHallPrice(): number {
        const dataPrice = Number(this.getInvoiceData()?.hall_invoice?.price ?? Number.NaN);
        if (Number.isFinite(dataPrice) && dataPrice > 0) {
            return dataPrice;
        }
        return this.hallPrice;
    }

    resolvedSetMenuName(): string {
        const dataName = this.getInvoiceData()?.set_menu_invoice?.name;
        return String(dataName ?? this.setMenuName ?? '').trim();
    }

    resolvedSetMenuPrice(): number {
        const dataPrice = Number(this.getInvoiceData()?.set_menu_invoice?.price ?? Number.NaN);
        if (Number.isFinite(dataPrice) && dataPrice > 0) {
            return dataPrice;
        }
        return this.setMenuPrice;
    }

    resolvedPackageName(): string {
        const dataName = this.getInvoiceData()?.service_package_invoice?.name;
        return String(dataName ?? this.packageName ?? '').trim();
    }

    resolvedPackagePrice(): number {
        const dataPrice = Number(this.getInvoiceData()?.service_package_invoice?.price ?? Number.NaN);
        if (Number.isFinite(dataPrice) && dataPrice > 0) {
            return dataPrice;
        }
        return this.packagePrice;
    }

    resolvedSetMenuItems(): Array<{ name: string; quantity: number; unitPrice: number; unit?: string }> {
        const menuItems = this.getInvoiceData()?.set_menu_invoice?.menu_items ?? [];
        if (menuItems.length > 0) {
            return menuItems.map((item) => {
                const quantity = Number(item?.quantity ?? 1);
                const unitPrice = Number(item?.price ?? 0);
                return {
                    name: String(item?.name ?? '').trim() || 'Món ăn',
                    quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
                    unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
                    unit: String(item?.unit ?? '').trim() || undefined,
                };
            });
        }
        return this.setMenuItems;
    }

    resolvedPackageServices(): Array<{ serviceId?: number; name: string; quantity: number; unitPrice: number; unit?: string }> {
        const invoiceServices = this.normalizePackageServices(this.getInvoiceData()?.service_package_invoice?.services ?? []);
        const source = invoiceServices.length > 0 ? invoiceServices : this.packageServices;

        return source
            .map((service) => {
                const mappedName = service.serviceId ? this.packageServiceNameCache[service.serviceId] : '';
                return {
                    ...service,
                    name: service.name || mappedName || (service.serviceId ? `Dịch vụ #${service.serviceId}` : 'Dịch vụ'),
                };
            })
            .filter((service) => service.name.trim().length > 0);
    }

    private normalizePackageServices(rawServices: any[]): Array<{ serviceId?: number; name: string; quantity: number; unitPrice: number; unit?: string }> {
        return (rawServices ?? [])
            .map((item: any) => {
                const serviceIdRaw = Number(item?.serviceId ?? item?.id ?? item?.service?.id ?? Number.NaN);
                const serviceId = Number.isFinite(serviceIdRaw) && serviceIdRaw > 0 ? serviceIdRaw : undefined;
                const quantityRaw = Number(item?.qty ?? item?.quantity ?? 1);
                const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? quantityRaw : 1;
                const unitPriceRaw = Number(item?.price ?? item?.unitPrice ?? item?.basePrice ?? item?.service?.basePrice ?? 0);
                const unitPrice = Number.isFinite(unitPriceRaw) && unitPriceRaw > 0 ? unitPriceRaw : 0;
                const name = String(item?.name ?? item?.serviceName ?? item?.service?.name ?? '').trim();
                const unit = String(item?.unit ?? item?.serviceUnit ?? item?.service?.unit ?? '').trim();

                if (serviceId && name) {
                    this.packageServiceNameCache[serviceId] = name;
                }

                return {
                    serviceId,
                    name,
                    quantity,
                    unitPrice,
                    unit: unit || undefined,
                };
            })
            .filter((service) => service.serviceId != null || service.name.length > 0);
    }

    private flattenPackageServices(servicePackage: any): any[] {
        if (!servicePackage || typeof servicePackage !== 'object') {
            return [];
        }

        const directLists = [
            servicePackage?.serviceResponseList,
            servicePackage?.ServiceResponseList,
            servicePackage?.services,
            servicePackage?.serviceList,
        ];

        const flattened = directLists.flatMap((items) => Array.isArray(items) ? items : []);
        if (flattened.length > 0) {
            return flattened;
        }

        if (servicePackage?.serviceResponseMap && typeof servicePackage.serviceResponseMap === 'object') {
            return Object.values(servicePackage.serviceResponseMap).flatMap((items) => Array.isArray(items) ? items : []);
        }

        return [];
    }

    private loadPackageServiceNamesByIds(serviceIds: number[]) {
        const ids = Array.from(new Set(serviceIds.filter((id) => Number.isFinite(id) && id > 0)));
        ids
            .filter((id) => !this.packageServiceNameCache[id])
            .forEach((id) => {
                this.serviceService.getServiceById(id).subscribe({
                    next: (res) => {
                        const name = String(res.data?.name ?? '').trim();
                        if (!name) {
                            return;
                        }

                        this.packageServiceNameCache[id] = name;
                        this.packageServices = this.packageServices.map((service) =>
                            service.serviceId === id && !service.name ? { ...service, name } : service
                        );
                        this.updateContractPreview();
                        this.cdr.detectChanges();
                    },
                    error: () => {
                        this.cdr.detectChanges();
                    },
                });
            });
    }

    private loadInvoicePreview(contractId: number) {
        this.invoiceService.searchInvoices({ contractId, page: 0, size: 1 }).subscribe({
            next: (res) => {
                const list = res.data?.content ?? [];
                if (list.length === 0) {
                    this.invoicePreview = null;
                    this.cdr.detectChanges();
                    return;
                }

                const preview = list[0] as any;
                this.invoicePreview = {
                    ...preview,
                    paidAmount: Number(preview?.paidAmount ?? this.paidAmount ?? 0),
                    createdAt: this.resolveInvoiceCreatedAt(preview),
                };
                this.recalculatePaymentSummary();
                this.cdr.detectChanges();

                if (!this.invoicePreview?.createdAt && this.invoicePreview?.id) {
                    this.invoiceService.getById(this.invoicePreview.id).subscribe({
                        next: (detailRes) => {
                            const detail = detailRes.data as any;
                            this.invoicePreview = {
                                ...this.invoicePreview,
                                ...detail,
                                paidAmount: Number(detail?.paidAmount ?? this.paidAmount ?? 0),
                                createdAt: this.resolveInvoiceCreatedAt({ ...this.invoicePreview, ...detail }),
                            };
                            this.recalculatePaymentSummary();
                            this.cdr.detectChanges();
                        },
                        error: () => { this.cdr.detectChanges(); },
                    });
                }
            },
            error: () => {
                this.invoicePreview = null;
                this.cdr.detectChanges();
            },
        });
    }

    private loadPaymentHistory(contractId: number) {
        this.paymentService.getPaymentsByContract(contractId, 0, 100).subscribe({
            next: (res) => {
                const rows = [...(res.data?.content ?? [])].sort((a: any, b: any) => Number(a?.id ?? 0) - Number(b?.id ?? 0));
                const mappedPayments: Payment[] = rows.map((p: any) => ({
                    id: p.id,
                    code: p.code,
                    amount: Number(p.amount ?? 0),
                    method: p.method,
                    status: p.paymentState ?? p.status,
                    paymentState: p.paymentState,
                    paymentDate: p.paidAt ?? p.paymentDate ?? p.createdAt,
                    createdAt: p.createdAt,
                    note: p.note,
                }));

                this.paymentHistory = mappedPayments.filter((p) => this.isPaidState(p.status ?? p.paymentState));
                this.paidAmount = this.paymentHistory.reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

                if (this.invoicePreview) {
                    this.invoicePreview = { ...this.invoicePreview, paidAmount: this.paidAmount };
                }

                this.recalculatePaymentSummary();
                this.cdr.detectChanges();
            },
            error: () => {
                this.paymentHistory = [];
                this.cdr.detectChanges();
            },
        });
    }

    goToInvoiceDetail() {
        if (!this.invoicePreview?.id) return;
        const backUrl = this.router.url;
        this.router.navigate(['/pages/invoice', this.invoicePreview.id], {
            state: { returnUrl: backUrl },
            queryParams: { returnUrl: backUrl }
        });
    }

    invoiceStateLabel(value?: string): string {
        return { UNPAID: 'Chưa thanh toán', PARTIAL: 'Thanh toán một phần', PAID: 'Đã thanh toán' }[value ?? ''] ?? (value || '-');
    }

    invoiceStateBg(value?: string): string {
        return { UNPAID: '#fee2e2', PARTIAL: '#fef3c7', PAID: '#dcfce7' }[value ?? ''] ?? '#e2e8f0';
    }

    invoiceStateColor(value?: string): string {
        return { UNPAID: '#b91c1c', PARTIAL: '#92400e', PAID: '#166534' }[value ?? ''] ?? '#334155';
    }

    resolveInvoiceCreatedAt(invoice?: any): string {
        return invoice?.createdAt ?? invoice?.created_at ?? invoice?.createdDate ?? invoice?.createAt ?? invoice?.invoiceDate ?? new Date().toISOString();
    }

    getCcImage(index: number): string {
        if (!this.customerImageUrls || this.customerImageUrls.length <= index) return '';
        const img = this.customerImageUrls[index];
        if (!img) return '';
        if (typeof img === 'string') return img;
        return img.originalUrl || img.original_url || img.mediumUrl || img.medium_url || img.url || '';
    }

    private loadCustomer(customerId: number) {
        this.customerService.getCustomerById(customerId).subscribe({
            next: (res) => {
                this.customer = res.data;
                this.customerName = res.data?.fullName ?? '';
                this.customerImageUrls = (res.data as any)?.imageUrls ?? [];
                if (this.customerImageUrls.length > 2) {
                    this.customerImageUrls = this.customerImageUrls.slice(-2);
                }
                this.updateContractPreview();
                this.cdr.detectChanges();
            },
            error: () => { this.cdr.detectChanges(); },
        });
    }

    private loadHall(hallId: number) {
        this.hallService.getHallById(hallId).subscribe({
            next: (res) => {
                const locationId = Number((res.data as any)?.locationId ?? (res.data as any)?.location?.id ?? 0);
                if (Number.isFinite(locationId) && locationId > 0) {
                    this.contractLocationId = locationId;
                    this.applyCoordinatorFilter();
                }
                this.hallName = res.data?.name ?? '';
                this.venueLocationName = String((res.data as any)?.locationName ?? '').trim();
                const price = Number((res.data as any)?.basePrice ?? 0);
                this.hallPrice = Number.isFinite(price) ? price : 0;
                this.recalculatePaymentSummary();
                this.updateContractPreview();
                this.cdr.detectChanges();
            },
            error: () => {
                this.hallPrice = 0;
                this.cdr.detectChanges();
            },
        });
    }

    private loadSetMenu(setMenuId: number) {
        this.setMenuService.getById(setMenuId).subscribe({
            next: (res) => {
                this.setMenuName = res.data?.name ?? '';
                const price = Number((res.data as any)?.setPrice ?? (res.data as any)?.pricePerTable ?? (res.data as any)?.price ?? 0);
                this.setMenuPrice = Number.isFinite(price) ? price : 0;

                const rawMenuItems = this.flattenSetMenuItems(res.data as any);
                this.setMenuItems = rawMenuItems
                    .map((item) => {
                        const quantity = Number((item as any)?.quantity ?? 1);
                        const unitPrice = Number((item as any)?.unitPrice ?? 0);
                        return {
                            name: String((item as any)?.name ?? '').trim() || 'Món ăn',
                            quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
                            unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
                            unit: String((item as any)?.unit ?? '').trim() || undefined,
                        };
                    })
                    .filter((item) => item.name.length > 0);

                this.recalculatePaymentSummary();
                this.cdr.detectChanges();
            },
            error: () => {
                this.setMenuItems = [];
                this.cdr.detectChanges();
            },
        });
    }

    private flattenSetMenuItems(setMenu: { menuItems?: MenuItem[]; menuItemsByCategory?: Record<string, MenuItem[]> } | null | undefined): MenuItem[] {
        if (!setMenu) {
            return [];
        }

        if (setMenu.menuItemsByCategory && typeof setMenu.menuItemsByCategory === 'object') {
            return Object.values(setMenu.menuItemsByCategory).flatMap((items) => items ?? []);
        }

        return setMenu.menuItems ?? [];
    }

    private loadPackage(packageId: number) {
        this.servicePackageService.getById(packageId).subscribe({
            next: (res) => {
                this.packageName = res.data?.name ?? '';
                const price = Number(res.data?.basePrice ?? 0);
                this.packagePrice = Number.isFinite(price) ? price : 0;

                this.packageServices = this.normalizePackageServices(this.flattenPackageServices(res.data));
                this.loadPackageServiceNamesByIds(
                    this.packageServices
                        .map((service) => Number(service.serviceId ?? 0))
                        .filter((id) => Number.isFinite(id) && id > 0)
                );

                this.recalculatePaymentSummary();
                this.updateContractPreview();
                this.cdr.detectChanges();
            },
            error: () => {
                this.packageServices = [];
                this.cdr.detectChanges();
            },
        });
    }

    private recalculatePaymentSummary() {
        if (!this.booking) {
            this.totalAmount = 0;
            this.paidAmount = 0;
            this.remainingAmount = 0;
            this.progressPercent = 0;
            return;
        }

        const tables = Number(this.booking.expectedTables ?? this.booking.tableCount ?? 0);
        const resolvedSetMenuPrice = this.resolvedSetMenuPrice();
        const resolvedHallPrice = this.resolvedHallPrice();
        const resolvedPackagePrice = this.resolvedPackagePrice();
        const computedTotal = Number.isFinite(tables) && tables > 0
            ? (resolvedSetMenuPrice * tables) + resolvedHallPrice + resolvedPackagePrice
            : 0;

        const invoiceTotal = Number(this.invoicePreview?.totalAmount ?? Number.NaN);
        const hasInvoiceTotal = Number.isFinite(invoiceTotal) && invoiceTotal > 0;
        const invoicePaidAmount = Number(this.invoicePreview?.paidAmount ?? Number.NaN);
        const hasInvoicePaidAmount = Number.isFinite(invoicePaidAmount) && invoicePaidAmount >= 0;

        const resolvedPaidAmount = hasInvoicePaidAmount
            ? invoicePaidAmount
            : Number.isFinite(this.paidAmount) && this.paidAmount >= 0
                ? this.paidAmount
                : 0;

        this.totalAmount = hasInvoiceTotal
            ? invoiceTotal
            : computedTotal > 0
                ? computedTotal
                : this.apiTotalAmount;
        this.paidAmount = resolvedPaidAmount;
        this.remainingAmount = Math.max(this.totalAmount - this.paidAmount, 0);
        this.progressPercent = this.totalAmount > 0
            ? Math.min(100, Math.max(0, Math.round((this.paidAmount / this.totalAmount) * 100)))
            : 0;

        this.updateContractPreview();
    }

    private updateContractPreview() {
        this.contractPreviewRawHtml = this.buildContractHtml();
        this.contractPreviewHtml = this.sanitizer.bypassSecurityTrustHtml(this.contractPreviewRawHtml);
    }

    private buildContractHtml(): string {
        if (!this.booking) {
            return '<p style="text-align:center; color:#64748b">Chưa có dữ liệu hợp đồng</p>';
        }

        const esc = (value?: string | number | null) => {
            const raw = String(value ?? '-');
            return raw
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;');
        };

        const bookingDate = this.formatDate(this.booking.bookingDate ?? this.booking.eventDate);
        const signDate = this.formatDate(this.booking.updatedAt ?? this.booking.bookingDate ?? this.booking.eventDate);
        const contractNo = this.booking.contractNo || this.booking.bookingNo || `HD-${this.booking.id}`;
        const groomName = this.booking.groomName || '-';
        const groomAge = this.booking.groomAge ? `${this.booking.groomAge}` : '-';
        const brideName = this.booking.brideName || '-';
        const brideAge = this.booking.brideAge ? `${this.booking.brideAge}` : '-';
        const brideFatherName = this.booking.brideFatherName || '-';
        const brideMotherName = this.booking.brideMotherName || '-';
        const groomFatherName = this.booking.groomFatherName || '-';
        const groomMotherName = this.booking.groomMotherName || '-';
        const customerName = this.customer?.fullName || this.customerName || '-';
        const customerPhone = this.customer?.phone || '-';
        const customerEmail = this.customer?.email || '-';
        const customerAddress = this.customer?.address || '-';
        const hallName = this.resolvedHallName() || (this.booking.hallId ? `Sảnh #${this.booking.hallId}` : '-');
        const venueProviderName = this.venueLocationName || '-';
        const shift = this.shiftLabel(this.booking.bookingTime ?? this.booking.shift);
        const tables = Number(this.booking.expectedTables ?? this.booking.tableCount ?? 0);
        const amount = this.totalAmount > 0 ? this.totalAmount : this.apiTotalAmount;
        const hallAmount = this.resolvedHallPrice();
        const setMenuAmount = tables > 0 ? this.resolvedSetMenuPrice() * tables : 0;
        const packageAmount = this.resolvedPackagePrice();
        const baseAmount = hallAmount + setMenuAmount + packageAmount;
        const estimatedExtra = Math.max(amount - baseAmount, 0);
        const paymentPercent = this.resolvePaymentPercent(this.booking.paymentPercent);
        const remainingPercent = Math.max(0, 100 - paymentPercent);
        const deposit1 = Math.round(amount * (paymentPercent / 100));
        const deposit2 = Math.max(amount - deposit1, 0);
        const notes = this.booking.notes || '-';
        const packageServices = this.resolvedPackageServices();
        const menuItemsHtml = this.resolvedSetMenuItems().length > 0
            ? this.resolvedSetMenuItems()
                .map((item, index) => {
                    const lineTotal = Number(item.unitPrice ?? 0) * Number(item.quantity ?? 1);
                    const unitText = item.unit ? ` / ${esc(item.unit)}` : '';
                    return `<p>- Món ${index + 1}: ${esc(item.name)} · SL ${esc(item.quantity)}${unitText} · Đơn giá ${esc(this.formatPrice(item.unitPrice))} · Thành tiền ${esc(this.formatPrice(lineTotal))}</p>`;
                })
                .join('')
            : '<p>- Chưa có dữ liệu chi tiết món ăn trong set menu.</p>';
        const packageServicesHtml = packageServices.length > 0
            ? packageServices
                .map((service, index) => {
                    const lineTotal = Number(service.unitPrice ?? 0) * Number(service.quantity ?? 1);
                    const unitText = service.unit ? ` / ${esc(service.unit)}` : '';
                    return `<p>- Dịch vụ ${index + 1}: ${esc(service.name)} · SL ${esc(service.quantity)}${unitText} · Đơn giá ${esc(this.formatPrice(service.unitPrice))} · Thành tiền ${esc(this.formatPrice(lineTotal))}</p>`;
                })
                .join('')
            : '<p>- Chưa có dữ liệu chi tiết dịch vụ trong gói.</p>';

        return `
            <p style="text-align:center; margin:0; font-size:10pt">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
            <p style="text-align:center; margin:0; font-size:10pt">Độc Lập - Tự Do - Hạnh Phúc</p>
            <p style="text-align:center; margin:8px 0 0; font-size:16pt"><strong>HỢP ĐỒNG CUNG CẤP DỊCH VỤ TIỆC CƯỚI</strong></p>
            <p style="text-align:center; margin:4px 0 10px; font-size:10pt">Số: <span style="color:#dc2626">${esc(contractNo)}</span></p>

            <p>Hợp đồng được lập ngày <span style="color:#dc2626">${esc(signDate)}</span>, gồm có:</p>

            <p><strong>BÊN SỬ DỤNG DỊCH VỤ (BÊN A - KHÁCH HÀNG)</strong></p>
            <p><strong>Người đại diện:</strong> <span style="color:#dc2626">${esc(customerName)}</span></p>
            <p><strong>Địa chỉ:</strong> ${esc(customerAddress)}</p>
            <table>
                <tr>
                    <td><strong>CÔ DÂU: ${esc(brideName)} - Tuổi: ${esc(brideAge)}</strong></td>
                    <td><strong>CHÚ RỂ: ${esc(groomName)} - Tuổi: ${esc(groomAge)}</strong></td>
                </tr>
                <tr>
                    <td>
                        <p><strong>Số điện thoại:</strong> ${esc(customerPhone)}</p>
                        <p><strong>Email:</strong> ${esc(customerEmail)}</p>
                        <p><strong>Cha cô dâu:</strong> ${esc(brideFatherName)}</p>
                        <p><strong>Mẹ cô dâu:</strong> ${esc(brideMotherName)}</p>
                    </td>
                    <td>
                        <p><strong>Ngày tổ chức:</strong> ${esc(bookingDate)}</p>
                        <p><strong>Sảnh:</strong> ${esc(hallName)}</p>
                        <p><strong>Ca tiệc:</strong> ${esc(shift)}</p>
                        <p><strong>Cha chú rể:</strong> ${esc(groomFatherName)}</p>
                        <p><strong>Mẹ chú rể:</strong> ${esc(groomMotherName)}</p>
                    </td>
                </tr>
            </table>

            <p style="margin-top:10px"><strong>BÊN CUNG CẤP DỊCH VỤ CƯỚI (BÊN B)</strong></p>
            <p><strong>Đơn vị:</strong> ${esc(venueProviderName)}</p>
            <p><strong>Vai trò:</strong> Đơn vị tổ chức và cung cấp dịch vụ tiệc cưới trọn gói theo thỏa thuận.</p>

            <p style="margin-top:10px"><strong>ĐIỀU I: NỘI DUNG CÔNG VIỆC</strong></p>
            <p>1. Bên B cung cấp dịch vụ tổ chức tiệc cưới theo yêu cầu của Bên A, bao gồm các hạng mục đã xác nhận.</p>
            <p>2. Bên A xác nhận thông tin sự kiện: ngày tổ chức, sảnh, ca tiệc, số bàn, số khách và các yêu cầu riêng.</p>
            <p>3. Danh mục dịch vụ dự kiến:</p>
            <p>- Sảnh tổ chức: ${esc(hallName)} (phí thuê: ${esc(this.formatPrice(hallAmount))}).</p>
            <p>- Set menu: ${esc(this.resolvedSetMenuName() || '-')}, đơn giá ${esc(this.resolvedSetMenuPrice() > 0 ? `${this.formatPrice(this.resolvedSetMenuPrice())}/bàn` : '-')}.</p>
            <p>- Chi tiết món ăn set menu:</p>
            ${menuItemsHtml}
            <p>- Gói dịch vụ đi kèm: ${esc(this.resolvedPackageName() || '-')}, giá ${esc(this.formatPrice(packageAmount))}.</p>
            <p>- Chi tiết dịch vụ trong gói:</p>
            ${packageServicesHtml}
            <p>- Ghi chú bổ sung: ${esc(notes)}.</p>

            <p><strong>ĐIỀU II: GIÁ TRỊ HỢP ĐỒNG VÀ THANH TOÁN</strong></p>
            <p>1. Tổng giá trị tạm tính của hợp đồng: <span style="color:#dc2626"><strong>${esc(this.formatPrice(amount))}</strong></span>.</p>
            <p>2. Cấu phần chi phí:</p>
            <p>- Phí sảnh: ${esc(this.formatPrice(hallAmount))}.</p>
            <p>- Chi phí set menu (theo số bàn dự kiến): ${esc(this.formatPrice(setMenuAmount))}.</p>
            <p>- Chi phí gói dịch vụ: ${esc(this.formatPrice(packageAmount))}.</p>
            <p>- Chi phí phát sinh tạm tính: ${esc(this.formatPrice(estimatedExtra))} (sẽ quyết toán theo thực tế).</p>
            <p>3. Tiến độ thanh toán:</p>
            <p>- Đợt 1 (đặt cọc ${esc(paymentPercent)}% khi ký hợp đồng): ${esc(this.formatPrice(deposit1))}.</p>
            <p>- Đợt 2 (${esc(remainingPercent)}% còn lại + toàn bộ chi phí phát sinh): ${esc(this.formatPrice(deposit2))} + phí phát sinh (nếu có), thanh toán trước khi diễn ra tiệc.</p>
            <p>4. Hình thức thanh toán: tiền mặt/chuyển khoản/thanh toán điện tử theo thông tin do Bên B cung cấp.</p>

            <p><strong>ĐIỀU III: THAY ĐỔI DỊCH VỤ VÀ PHÍ PHÁT SINH</strong></p>
            <p>1. Mọi thay đổi về thực đơn, số bàn, hạng mục dịch vụ, timeline chương trình phải được xác nhận trước ngày tổ chức theo quy định của Bên B.</p>
            <p>2. Chi phí phát sinh gồm nhưng không giới hạn: tăng số bàn, nâng cấp thực đơn, bổ sung nhân sự, thiết bị, trang trí hoặc dịch vụ ngoài danh mục ban đầu.</p>
            <p>3. Phát sinh được lập thành phụ lục/xác nhận bổ sung và là phần không tách rời hợp đồng.</p>

            <p><strong>ĐIỀU IV: HỦY/TẠM HOÃN SỰ KIỆN</strong></p>
            <p>1. Trường hợp Bên A hủy tiệc, khoản cọc Đợt 1 được xử lý theo chính sách hủy của Bên B và các chi phí đã phát sinh thực tế.</p>
            <p>2. Trường hợp Bên A đổi ngày tổ chức, hai bên sẽ thống nhất lịch mới bằng phụ lục; mọi chênh lệch chi phí (nếu có) được cập nhật vào giá trị hợp đồng.</p>
            <p>3. Trường hợp bất khả kháng (thiên tai, dịch bệnh, quy định cơ quan nhà nước...), hai bên ưu tiên phương án dời lịch và hạn chế thiệt hại cho cả hai bên.</p>

            <p><strong>ĐIỀU V: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN</strong></p>
            <p>1. Bên A có trách nhiệm cung cấp thông tin chính xác, thanh toán đúng hạn và phối hợp trong quá trình tổ chức.</p>
            <p>2. Bên B có trách nhiệm cung cấp dịch vụ đúng hạng mục, đúng chất lượng, bảo đảm tiến độ và an toàn sự kiện.</p>
            <p>3. Hai bên có trách nhiệm phối hợp nghiệm thu trước và sau sự kiện.</p>

            <p><strong>ĐIỀU VI: PHẠT VI PHẠM VÀ BỒI THƯỜNG</strong></p>
            <p>1. Bên vi phạm nghĩa vụ thanh toán hoặc nghĩa vụ thực hiện dịch vụ phải khắc phục và bồi thường thiệt hại thực tế cho bên còn lại theo quy định pháp luật.</p>
            <p>2. Trường hợp chậm thanh toán, Bên B có quyền tạm ngừng cung cấp một phần dịch vụ cho đến khi Bên A hoàn tất nghĩa vụ tài chính theo thỏa thuận.</p>

            <p><strong>ĐIỀU VII: ĐIỀU KHOẢN CHUNG</strong></p>
            <p>1. Hợp đồng có hiệu lực từ ngày ký đến khi hai bên hoàn thành mọi quyền và nghĩa vụ.</p>
            <p>2. Mọi sửa đổi, bổ sung hợp đồng phải lập thành văn bản và có xác nhận của cả hai bên.</p>
            <p>3. Nếu phát sinh tranh chấp, hai bên ưu tiên thương lượng; trường hợp không đạt thỏa thuận sẽ giải quyết theo quy định pháp luật hiện hành.</p>
            <p>4. Hợp đồng được lập thành 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.</p>

            <table style="margin-top:20px; border:none; width:100%">
                <tr>
                    <td style="width:50%; border:none; text-align:center; vertical-align:top">
                        <p><strong>ĐẠI DIỆN BÊN A</strong></p>
                        <p>(Ký, ghi rõ họ tên)</p>
                    </td>
                    <td style="width:50%; border:none; text-align:center; vertical-align:top">
                        <p><strong>ĐẠI DIỆN BÊN B</strong></p>
                        <p>(Ký, ghi rõ họ tên, đóng dấu)</p>
                    </td>
                </tr>
                <tr>
                    <td style="height:95px; border:none"></td>
                    <td style="height:95px; border:none"></td>
                </tr>
            </table>
        `;
    }

    openContractDialog() { this.contractDialogVisible = true; }
    closeContractDialog() { this.contractDialogVisible = false; }
    zoomIn() { this.setZoom(this.contractZoom + 0.1); }
    zoomOut() { this.setZoom(this.contractZoom - 0.1); }
    resetZoom() { this.setZoom(1); }

    private setZoom(value: number) {
        this.contractZoom = Math.min(2, Math.max(0.5, Number(value.toFixed(2))));
        this.zoomPercent = Math.round(this.contractZoom * 100);
    }

    printContract() {
        const printWindow = window.open('', '_blank', 'width=1000,height=900');
        if (!printWindow) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Không thể in',
                detail: 'Trình duyệt đang chặn cửa sổ in. Vui lòng cho phép popup.',
                life: 3500,
            });
            return;
        }

        const docHtml = `
            <!doctype html>
            <html lang="vi">
            <head>
                <meta charset="utf-8" />
                <title>Hợp đồng dịch vụ</title>
                <style>
                    @page { size: A4; margin: 12mm; }
                    body { margin: 0; font-family: 'Times New Roman', serif; background: #fff; }
                    .paper { width: 210mm; min-height: 297mm; margin: 0 auto; box-sizing: border-box; padding: 18mm 16mm; }
                    table { width: 100%; border-collapse: collapse; }
                    td, th { border: 1px solid #d1d5db; padding: 6px; vertical-align: top; }
                    p { margin: 0 0 6px; line-height: 1.45; font-size: 10pt; }
                    @media print {
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .paper { margin: 0; padding: 0; width: auto; min-height: auto; }
                    }
                </style>
            </head>
            <body>
                <div class="paper">${this.contractPreviewRawHtml}</div>
                <script>window.onload = function () { window.print(); };<\/script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(docHtml);
        printWindow.document.close();
    }

    canCancelContract(): boolean {
        if (!this.booking?.id) {
            return false;
        }
        const state = String(this.booking.contractState ?? this.booking.bookingState ?? '').toUpperCase();
        return state !== 'CANCELLED' && state !== 'LIQUIDATED';
    }

    cancelContract() {
        if (!this.booking?.id || !this.canCancelContract() || this.updatingContractState) {
            return;
        }

        const confirmed = window.confirm('Bạn có chắc muốn cập nhật trạng thái hợp đồng sang Hủy hợp đồng?');
        if (!confirmed) {
            return;
        }

        this.updatingContractState = true;
        this.bookingService.updateState({ contractId: this.booking.id, contractState: 'CANCELLED' }).subscribe({
            next: (res) => {
                this.updatingContractState = false;
                const updated = res.data;
                this.booking = {
                    ...this.booking,
                    ...(updated ?? {}),
                    contractState: updated?.contractState ?? 'CANCELLED',
                    bookingState: updated?.bookingState ?? 'CANCELLED',
                };
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Đã cập nhật trạng thái hủy hợp đồng.',
                    life: 2500,
                });
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.updatingContractState = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: err?.error?.message ?? 'Không thể cập nhật trạng thái hủy hợp đồng.',
                    life: 3500,
                });
                this.cdr.detectChanges();
            },
        });
    }

    goBack() {
        if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
            return;
        }

        // Always fallback to booking list to avoid back-loop to invoice detail.
        this.router.navigate(['/pages/booking']);
    }

    shiftLabel(value?: string): string {
        const map: Record<string, string> = {
            SLOT_1: 'Ca sáng (10:00 - 14:00)',
            SLOT_2: 'Ca chiều (17:00 - 21:00)',
            SLOT_3: 'Cả ngày (09:00 - 17:00)',
            AFTERNOON: 'Ca sáng (10:00 - 14:00)',
            EVENING: 'Ca chiều (17:00 - 21:00)',
            FULL_DAY: 'Cả ngày (09:00 - 17:00)',
        };
        return map[value ?? ''] ?? (value || '-');
    }

    bookingStateLabel(value?: string): string {
        const map: Record<string, string> = {
            DRAFT: 'Nháp',
            ACTIVE: 'Khách hàng đóng cọc',
            LIQUIDATED: 'Thanh lý hợp đồng',
            CANCELLED: 'Hủy hợp đồng',
        };
        return map[value ?? ''] ?? (value || '-');
    }

    statusBg(value?: string): string {
        return { DRAFT: '#fef3c7', ACTIVE: '#dcfce7', LIQUIDATED: '#dbeafe', CANCELLED: '#fee2e2' }[value ?? ''] ?? '#e2e8f0';
    }

    statusColor(value?: string): string {
        return { DRAFT: '#92400e', ACTIVE: '#166534', LIQUIDATED: '#1d4ed8', CANCELLED: '#b91c1c' }[value ?? ''] ?? '#334155';
    }

    formatDate(value?: string): string {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('vi-VN');
    }

    formatPrice(value?: number): string {
        const num = Number(value ?? 0);
        return `${new Intl.NumberFormat('vi-VN').format(Number.isFinite(num) ? num : 0)} đ`;
    }

    paymentMethodLabel(value?: string): string {
        const map: Record<string, string> = {
            CASH: 'Tiền mặt',
            BANK_TRANSFER: 'Chuyển khoản',
            CREDIT_CARD: 'Thẻ tín dụng',
            E_WALLET: 'Ví điện tử',
        };
        return map[value ?? ''] ?? (value || '-');
    }

    isPaidState(value?: string): boolean {
        const state = String(value ?? '').toUpperCase();
        return state === 'SUCCESS' || state === 'CONFIRMED' || state === 'PAID';
    }

    private canCurrentUserAccessBooking(booking: Booking | null): boolean {
        if (!booking) {
            return false;
        }
        if (!this.isCoordinatorAccount) {
            return true;
        }
        if (this.currentUserId <= 0) {
            return false;
        }
        return Number(booking.assignCoordinatorId) === this.currentUserId;
    }
}