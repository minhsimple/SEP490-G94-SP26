import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Booking, BookingService, BookingUpsertPayload, TableLayoutRequest } from '../service/booking.service';
import { Customer, CustomerService } from '../service/customer.service';
import { HallService } from '../service/hall.service';
import { LocationService } from '../service/location.service';
import { ServicePackageService } from '../service/service-package.service';
import { ServiceService } from '../service/service.service';
import { SetMenuService } from '../service/set-menu';
import { UserService } from '../service/users.service';
import { RoleService } from '../service/role.service';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, map, mapTo, switchMap, tap } from 'rxjs/operators';

interface CustomerOption {
    id: number;
    label: string;
    phone: string;
}

interface HallOption {
    id: number;
    label: string;
    basePrice: number;
}

interface LocationOption {
    id: number;
    label: string;
}

interface SetMenuOption {
    id: number;
    label: string;
    price: number;
    imageUrl?: string;
}

interface ServicePackageOption {
    id: number;
    label: string;
    price: number;
}

interface SalesOption {
    id: number;
    label: string;
}

interface SummaryDetailItem {
    id: number;
    name: string;
    qty: number;
    unitPrice: number;
    totalPrice: number;
}

@Component({
    selector: 'app-booking-create',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        AutoCompleteModule,
        DatePickerModule,
        TextareaModule,
        InputNumberModule,
        ToastModule,
    ],
    providers: [MessageService, BookingService],
    styles: [`
        .page-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }
        .page-header-left {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
        }
        .page-header h1 {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0;
        }
        .page-header p {
            font-size: 0.82rem;
            color: #64748b;
            margin: 0.15rem 0 0;
        }
        .header-actions {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            justify-content: flex-end;
        }
        .create-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 360px;
            gap: 1.5rem;
            align-items: start;
        }
        .section-card,
        .summary-card {
            background: #fff;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
        }
        .section-card {
            margin-bottom: 1.25rem;
        }
        .section-title,
        .summary-title {
            font-weight: 600;
            font-size: 0.95rem;
            color: #1e293b;
            margin-bottom: 1rem;
        }
        .field-wrap {
            margin-bottom: 1rem;
        }
        .field-wrap:last-child {
            margin-bottom: 0;
        }
        .field-label {
            font-size: 0.82rem;
            font-weight: 500;
            color: #475569;
            margin-bottom: 0.35rem;
            display: block;
        }
        .field-label .req {
            color: #ef4444;
        }
        .two-col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        .three-col {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 1rem;
        }
        .menu-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
        }
        .selection-detail-panel {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: #f8fafc;
            padding: 0.75rem;
        }
        .selection-detail-panel + .selection-detail-panel {
            margin-top: 0.75rem;
        }
        .selection-detail-title {
            font-size: 0.8rem;
            font-weight: 700;
            color: #334155;
            margin-bottom: 0.5rem;
        }
        .selection-detail-empty {
            font-size: 0.78rem;
            color: #94a3b8;
        }
        .selection-detail-list {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
            max-height: 220px;
            overflow: auto;
            padding-right: 0.2rem;
        }
        .selection-detail-item {
            display: flex;
            justify-content: space-between;
            gap: 0.5rem;
            font-size: 0.8rem;
            color: #475569;
        }
        .selection-detail-item strong {
            color: #1e293b;
            font-weight: 700;
            white-space: nowrap;
        }
        .person-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        .person-panel {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 1rem;
            background: #fcfdff;
        }
        .person-title {
            font-size: 0.9rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 0.85rem;
        }
        .menu-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 0.85rem 1rem;
            cursor: pointer;
            transition: all 0.15s;
        }
        .menu-card:hover {
            border-color: #94a3b8;
        }
        .menu-card.selected {
            border: 2px solid #10b981;
            background: #f0fdf4;
        }
        .menu-head {
            display: flex;
            align-items: center;
            gap: 0.65rem;
        }
        .menu-thumb {
            width: 44px;
            height: 44px;
            border-radius: 8px;
            object-fit: cover;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            flex-shrink: 0;
        }
        .menu-thumb-placeholder {
            width: 44px;
            height: 44px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: #94a3b8;
            flex-shrink: 0;
        }
        .menu-name {
            font-weight: 600;
            color: #1e293b;
            font-size: 0.9rem;
        }
        .menu-price {
            color: #10b981;
            font-weight: 700;
            font-size: 0.85rem;
            margin-top: 0.2rem;
        }
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            color: #94a3b8;
            gap: 0.5rem;
            text-align: center;
        }
        .empty-state i {
            font-size: 1.75rem;
        }
        .empty-state span {
            font-size: 0.82rem;
        }
        .btn-setup {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            padding: 0.35rem 0.9rem;
            font-size: 0.82rem;
            font-weight: 500;
            color: #475569;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.15s, border-color 0.15s;
            white-space: nowrap;
        }
        .btn-setup:hover:not(:disabled) {
            background: #f1f5f9;
            border-color: #94a3b8;
        }
        .btn-setup:disabled {
            cursor: not-allowed;
            opacity: 0.6;
        }
        .seat-card-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 2rem 0;
            color: #94a3b8;
        }
        .seat-card-empty i {
            font-size: 2rem;
            color: #cbd5e1;
        }
        .layout-preview-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
            margin-top: 0.4rem;
        }
        .layout-zone-card {
            border: 2px solid #d6dde8;
            border-radius: 8px;
            padding: 0.8rem 0.75rem;
            background: #f8fafc;
        }
        .layout-zone-header {
            font-size: 0.95rem;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
        }
        .layout-zone-groups {
            font-size: 0.78rem;
            color: #475569;
        }
        .layout-group-list {
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
        }
        .layout-group-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.5rem;
        }
        .layout-group-left {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            min-width: 0;
            flex: 1;
        }
        .layout-group-dot {
            width: 10px;
            height: 10px;
            border-radius: 999px;
            border: 2px solid #cbd5e1;
            background: #fff;
            flex-shrink: 0;
        }
        .layout-group-name {
            font-weight: 500;
            color: #334155;
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .layout-group-count {
            font-weight: 600;
            color: #64748b;
            white-space: nowrap;
        }
        .layout-zone-empty {
            color: #cbd5e1;
            font-style: italic;
            font-size: 0.74rem;
        }
        .summary-sticky {
            position: sticky;
            top: 1rem;
            align-self: start;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            gap: 0.75rem;
            font-size: 0.85rem;
            margin-bottom: 0.65rem;
            color: #475569;
        }
        .summary-row strong {
            color: #1e293b;
            text-align: right;
        }
        .summary-divider {
            border-top: 1px solid #e2e8f0;
            margin: 0.75rem 0;
        }
        .state-chip {
            display: inline-flex;
            align-items: center;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.3rem 0.55rem;
            border-radius: 999px;
        }
        .loading-card {
            background: #fff;
            border-radius: 12px;
            padding: 3rem 1.5rem;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
            text-align: center;
            color: #64748b;
        }
        .loading-card i {
            font-size: 1.75rem;
            margin-bottom: 0.75rem;
            color: #94a3b8;
        }
        @media (max-width: 960px) {
            .create-layout {
                grid-template-columns: 1fr;
            }
            .summary-sticky {
                position: static;
                top: auto;
            }
            .two-col,
            .three-col,
            .menu-grid,
            .person-grid,
            .layout-preview-grid {
                grid-template-columns: 1fr;
            }
        }
    `],
    template: `
        <p-toast />

        <div class="page-header">
            <div class="page-header-left">
                <p-button icon="pi pi-arrow-left" [text]="true" severity="secondary" (onClick)="goBack()" />
                <div>
                    <h1>{{ isEditMode ? 'Chi tiết đặt tiệc' : 'Đặt tiệc mới' }}</h1>
                    <p>{{ isEditMode ? 'Xem và cập nhật đơn đặt tiệc theo API mới' : 'Tạo đơn đặt tiệc theo đúng contract backend' }}</p>
                </div>
            </div>

            <div class="header-actions">
                <p-button
                    *ngIf="isEditMode"
                    label="Lưu cập nhật"
                    icon="pi pi-save"
                    [loading]="submitting"
                    (onClick)="submit()"
                />
                <p-button
                    *ngIf="!isEditMode"
                    label="Tạo đơn đặt tiệc"
                    icon="pi pi-save"
                    [style]="{ 'background': '#10b981', 'border-color': '#10b981' }"
                    [loading]="submitting"
                    (onClick)="submit()"
                />
            </div>
        </div>

        <ng-container *ngIf="!isEditMode || !loading; else detailLoading">
        <div class="create-layout">
            <div>
                <div class="section-card">
                    <div class="section-title">Khách hàng và điều phối</div>
                    <div class="two-col">
                        <div class="field-wrap">
                            <label class="field-label">Số điện thoại khách hàng <span class="req">*</span></label>
                            <input
                                pInputText
                                [(ngModel)]="customerDraft.phone"
                                (ngModelChange)="onCustomerPhoneInput($event)"
                                placeholder="Nhập số điện thoại"
                                style="width:100%"
                            />
                            <div style="font-size:0.78rem;color:#64748b;margin-top:0.35rem" *ngIf="isCustomerLookupLoading">
                                Đang kiểm tra khách hàng theo số điện thoại...
                            </div>
                            <div style="font-size:0.78rem;color:#0f766e;margin-top:0.35rem" *ngIf="!isCustomerLookupLoading && matchedExistingCustomer">
                                Đã tìm thấy khách hàng: {{ matchedExistingCustomer.label }}
                            </div>
                            <div style="font-size:0.78rem;color:#64748b;margin-top:0.35rem" *ngIf="!isCustomerLookupLoading && !matchedExistingCustomer && customerDraft.phone">
                                Chưa có khách hàng trùng số điện thoại, bạn có thể nhập thông tin mới.
                            </div>
                        </div>

                        <div class="field-wrap">
                            <label class="field-label">Sales phụ trách</label>
                            <ng-container *ngIf="isSaleCreateMode; else salesSelectTpl">
                                <input
                                    pInputText
                                    [ngModel]="getSalesLabel(form.salesId || loggedInUserId)"
                                    readonly
                                    style="width:100%; background:#f8fafc; color:#334155"
                                />
                            </ng-container>
                            <ng-template #salesSelectTpl>
                                <p-select
                                    [options]="salesOptions"
                                    [(ngModel)]="form.salesId"
                                    optionLabel="label"
                                    optionValue="id"
                                    placeholder="Chọn sales phụ trách"
                                    [showClear]="true"
                                    styleClass="w-full"
                                />
                            </ng-template>
                        </div>
                    </div>

                    <div class="two-col" style="margin-top:1rem">
                        <div class="field-wrap">
                            <label class="field-label">Tên khách hàng <span class="req">*</span></label>
                            <input
                                pInputText
                                [(ngModel)]="customerDraft.fullName"
                                (ngModelChange)="syncSelectedCustomerLabel()"
                                placeholder="Nhập tên khách hàng"
                                style="width:100%"
                            />
                        </div>
                        <div class="field-wrap">
                            <label class="field-label">CMND/CCCD <span class="req">*</span></label>
                            <input
                                pInputText
                                [(ngModel)]="customerDraft.citizenIdNumber"
                                (ngModelChange)="onCitizenIdNumberInput($event)"
                                maxlength="12"
                                inputmode="numeric"
                                placeholder="Nhập CMND/CCCD"
                                style="width:100%"
                            />
                        </div>
                    </div>

                    <div class="two-col" style="margin-top:1rem">
                        <div class="field-wrap">
                            <label class="field-label">Email</label>
                            <input
                                pInputText
                                [(ngModel)]="customerDraft.email"
                                placeholder="name@example.com"
                                style="width:100%"
                            />
                        </div>
                        <div class="field-wrap">
                            <label class="field-label">Địa chỉ <span class="req">*</span></label>
                            <input
                                pInputText
                                [(ngModel)]="customerDraft.address"
                                placeholder="Nhập địa chỉ khách hàng"
                                style="width:100%"
                            />
                        </div>
                    </div>

                </div>

                <div class="section-card">
                    <div class="section-title">Thông tin cô dâu chú rể</div>
                    <div class="person-grid">
                        <div class="person-panel">
                            <div class="person-title">Thông tin cô dâu</div>
                            <div class="field-wrap">
                                <label class="field-label">Họ tên cô dâu <span class="req">*</span></label>
                                <input pInputText [(ngModel)]="form.brideName" placeholder="Trần Thị B" style="width:100%" />
                            </div>
                            <div class="field-wrap">
                                <label class="field-label">Tuổi cô dâu</label>
                                <p-inputnumber [(ngModel)]="form.brideAge" [min]="1" [max]="120" styleClass="w-full" inputStyleClass="w-full" />
                            </div>
                            <div class="field-wrap">
                                <label class="field-label">Tên cha cô dâu</label>
                                <input pInputText [(ngModel)]="form.brideFatherName" placeholder="Trần Văn..." style="width:100%" />
                            </div>
                            <div class="field-wrap" style="margin-bottom:0">
                                <label class="field-label">Tên mẹ cô dâu</label>
                                <input pInputText [(ngModel)]="form.brideMotherName" placeholder="Lê Thị..." style="width:100%" />
                            </div>
                        </div>

                        <div class="person-panel">
                            <div class="person-title">Thông tin chú rể</div>
                            <div class="field-wrap">
                                <label class="field-label">Họ tên chú rể <span class="req">*</span></label>
                                <input pInputText [(ngModel)]="form.groomName" placeholder="Nguyễn Văn A" style="width:100%" />
                            </div>
                            <div class="field-wrap">
                                <label class="field-label">Tuổi chú rể</label>
                                <p-inputnumber [(ngModel)]="form.groomAge" [min]="1" [max]="120" styleClass="w-full" inputStyleClass="w-full" />
                            </div>
                            <div class="field-wrap">
                                <label class="field-label">Tên cha chú rể</label>
                                <input pInputText [(ngModel)]="form.groomFatherName" placeholder="Nguyễn Văn..." style="width:100%" />
                            </div>
                            <div class="field-wrap" style="margin-bottom:0">
                                <label class="field-label">Tên mẹ chú rể</label>
                                <input pInputText [(ngModel)]="form.groomMotherName" placeholder="Trần Thị..." style="width:100%" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-title">Thông tin tiệc cưới</div>
                    <div class="field-wrap">
                        <label class="field-label">Chi nhánh</label>
                        <p-select
                            [options]="locationOptions"
                            [(ngModel)]="form.locationId"
                            optionLabel="label"
                            optionValue="id"
                            placeholder="Chọn chi nhánh"
                            [showClear]="!isSaleCreateMode"
                            [disabled]="isSaleCreateMode"
                            (onChange)="onLocationChange()"
                            styleClass="w-full"
                        />
                    </div>

                    <div class="two-col">
                        <div class="field-wrap">
                            <label class="field-label">Sảnh cưới <span class="req">*</span></label>
                            <p-select
                                [options]="hallOptions"
                                [(ngModel)]="form.hallId"
                                optionLabel="label"
                                optionValue="id"
                                placeholder="Chọn sảnh"
                                [showClear]="true"
                                (onChange)="onHallChange()"
                                styleClass="w-full"
                            />
                        </div>
                        <div class="field-wrap">
                            <label class="field-label">Ca tổ chức <span class="req">*</span></label>
                            <p-select
                                [options]="shiftOptions"
                                [(ngModel)]="form.bookingTime"
                                optionLabel="label"
                                optionValue="value"
                                styleClass="w-full"
                            />
                        </div>
                    </div>

                    <div class="three-col">
                        <div class="field-wrap">
                            <label class="field-label">Ngày tổ chức <span class="req">*</span></label>
                            <p-datepicker
                                [(ngModel)]="form.bookingDate"
                                dateFormat="dd/mm/yy"
                                [showIcon]="true"
                                [minDate]="today"
                                (ngModelChange)="onBookingDateChange()"
                                placeholder="Chọn ngày"
                                styleClass="w-full"
                            />
                        </div>
                        <div class="field-wrap">
                            <label class="field-label">Số bàn dự kiến <span class="req">*</span></label>
                            <p-inputnumber
                                [(ngModel)]="form.expectedTables"
                                [min]="1"
                                [max]="500"
                                (ngModelChange)="recalcEstimatedTotal()"
                                styleClass="w-full"
                                inputStyleClass="w-full"
                            />
                        </div>
                        <div class="field-wrap">
                            <label class="field-label">Số khách dự kiến <span class="req">*</span></label>
                            <p-inputnumber
                                [(ngModel)]="form.expectedGuests"
                                [min]="1"
                                styleClass="w-full"
                                inputStyleClass="w-full"
                            />
                        </div>
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-title">Set menu</div>
                    <div *ngIf="setMenuOptions.length === 0" class="empty-state">
                        <i class="pi pi-times-circle"></i>
                        <span>Chọn chi nhánh để tải danh sách set menu</span>
                    </div>

                    <div *ngIf="setMenuOptions.length > 0" class="menu-grid">
                        <div
                            *ngFor="let menu of setMenuOptions"
                            class="menu-card"
                            [class.selected]="form.setMenuId === menu.id"
                            (click)="selectSetMenu(menu)"
                        >
                            <div class="menu-head">
                                <img *ngIf="menu.imageUrl" [src]="menu.imageUrl" [alt]="menu.label" class="menu-thumb" />
                                <span *ngIf="!menu.imageUrl" class="menu-thumb-placeholder"><i class="pi pi-image"></i></span>
                                <div class="menu-name">{{ menu.label }}</div>
                            </div>
                            <div class="menu-price">{{ formatPrice(menu.price) }}/bàn</div>
                        </div>
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-title">Gói dịch vụ</div>

                    <div *ngIf="!form.locationId" class="empty-state">
                        <i class="pi pi-briefcase"></i>
                        <span>Chọn chi nhánh để xem danh sách gói dịch vụ</span>
                    </div>

                    <div *ngIf="form.locationId && packageOptions.length === 0" class="empty-state">
                        <i class="pi pi-briefcase"></i>
                        <span>Chưa có gói dịch vụ cho chi nhánh đã chọn</span>
                    </div>

                    <div *ngIf="form.locationId && packageOptions.length > 0" class="menu-grid">
                        <div
                            *ngFor="let pkg of packageOptions"
                            class="menu-card"
                            [class.selected]="form.packageId === pkg.id"
                            (click)="selectPackage(pkg)"
                        >
                            <div class="menu-name">{{ pkg.label }}</div>
                            <div class="menu-price">{{ formatPrice(pkg.price) }}</div>
                        </div>
                    </div>
                </div>

                <div class="section-card">
                    <div style="display:flex; align-items:center; justify-content:space-between; margin:0 0 0.75rem">
                        <h2 class="section-title" style="margin:0">Layout chỗ ngồi</h2>
                        <button class="btn-setup" (click)="openSeatLayout()">
                            Chỉnh sửa
                        </button>
                    </div>
                    <div *ngIf="layoutEntries.length > 0; else noLayoutPreview">
                        <div class="layout-preview-grid">
                            <div class="layout-zone-card" *ngFor="let zone of groupLayoutByZone()">
                                <div class="layout-zone-header">{{ zone.zoneLabel }}</div>
                                <div class="layout-zone-groups">
                                    <div *ngIf="zone.groups.length > 0; else noGroupsInZone" class="layout-group-list">
                                        <div class="layout-group-item" *ngFor="let group of zone.groups">
                                            <span class="layout-group-left">
                                                <i class="layout-group-dot" [ngStyle]="layoutLegendDotStyle(group.colorIndex)"></i>
                                                <span class="layout-group-name">{{ group.groupName }}</span>
                                            </span>
                                            <span class="layout-group-count">Bàn {{ group.startSeat }}-{{ group.endSeat }} · {{ group.numberOfTables }} bàn</span>
                                        </div>
                                    </div>
                                    <ng-template #noGroupsInZone>
                                        <div class="layout-zone-empty">Không có nhóm</div>
                                    </ng-template>
                                </div>
                            </div>
                        </div>
                    </div>
                    <ng-template #noLayoutPreview>
                    <div class="seat-card-empty">
                        <i class="pi pi-stop"></i>
                        <span style="font-size:0.88rem">Chưa có sơ đồ chỗ ngồi</span>
                        <span style="font-size:0.78rem">Nhấn "Thiết lập" để cấu hình layout</span>
                    </div>
                    </ng-template>
                </div>

                <div class="section-card">
                    <div class="section-title">Ghi chú</div>
                    <textarea
                        pTextarea
                        [(ngModel)]="form.notes"
                        placeholder="Nhập ghi chú cho đơn đặt tiệc..."
                        [rows]="4"
                        style="width:100%;resize:vertical"
                    ></textarea>
                </div>
            </div>

            <div class="summary-sticky">
                <div class="summary-card">
                    <div class="summary-title">Tóm tắt hợp đồng</div>

                    <div class="summary-row" *ngIf="bookingCode">
                        <span>Mã đơn</span>
                        <strong>{{ bookingCode }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="isEditMode">
                        <span>Trạng thái kích hoạt</span>
                        <strong>
                            <span
                                class="state-chip"
                                [style.background]="getStatusBg(currentStatus)"
                                [style.color]="getStatusColor(currentStatus)"
                            >
                                {{ getStatusLabel(currentStatus) }}
                            </span>
                        </strong>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-row" *ngIf="selectedCustomer || customerDraft.fullName">
                        <span>Khách hàng</span>
                        <strong>{{ selectedCustomer?.label || customerDraft.fullName }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="summary.hallName">
                        <span>Sảnh</span>
                        <strong>{{ summary.hallName }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="summary.hallPrice > 0">
                        <span>Giá sảnh</span>
                        <strong>{{ formatPrice(summary.hallPrice) }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="form.bookingDate">
                        <span>Ngày tổ chức</span>
                        <strong>{{ formatDateDisplay(form.bookingDate) }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="form.bookingTime">
                        <span>Ca</span>
                        <strong>{{ getShiftLabel(form.bookingTime) }}</strong>
                    </div>
                    <div class="summary-row">
                        <span>Số bàn / khách</span>
                        <strong>{{ form.expectedTables }} bàn / {{ form.expectedGuests }} khách</strong>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-row" *ngIf="summary.setMenuName">
                        <span>Set menu</span>
                        <strong>{{ summary.setMenuName }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="summary.packageName">
                        <span>Gói dịch vụ</span>
                        <strong>{{ summary.packageName }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="summary.estimatedTotal > 0">
                        <span>Tổng ước tính</span>
                        <strong>{{ formatPrice(summary.estimatedTotal) }}</strong>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-row" *ngIf="form.salesId">
                        <span>Sales phụ trách</span>
                        <strong>{{ getSalesLabel(form.salesId) }}</strong>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-title" style="margin-bottom:0.75rem">Chi tiết mục đã chọn</div>

                    <div class="selection-detail-panel">
                        <div class="selection-detail-title">Món trong thực đơn</div>
                        <ng-container *ngIf="form.setMenuId; else rightPickSetMenuHint">
                            <div class="selection-detail-empty" *ngIf="setMenuItemsLoading">Đang tải danh sách món...</div>
                            <div class="selection-detail-empty" *ngIf="!setMenuItemsLoading && selectedSetMenuItems.length === 0">
                                Chưa có món trong set menu đã chọn.
                            </div>
                            <div class="selection-detail-list" *ngIf="!setMenuItemsLoading && selectedSetMenuItems.length > 0">
                                <div class="selection-detail-item" *ngFor="let item of selectedSetMenuItems; index as i">
                                    <span>{{ i + 1 }}. {{ item.name }} ({{ formatPrice(item.unitPrice) }} x {{ item.qty }})</span>
                                    <strong>{{ formatPrice(item.totalPrice) }}</strong>
                                </div>
                            </div>
                        </ng-container>
                        <ng-template #rightPickSetMenuHint>
                            <div class="selection-detail-empty">Chọn set menu để xem danh sách món.</div>
                        </ng-template>
                    </div>

                    <div class="selection-detail-panel">
                        <div class="selection-detail-title">Dịch vụ trong gói</div>
                        <ng-container *ngIf="form.packageId; else rightPickPackageHint">
                            <div class="selection-detail-empty" *ngIf="packageItemsLoading">Đang tải danh sách dịch vụ...</div>
                            <div class="selection-detail-empty" *ngIf="!packageItemsLoading && selectedPackageItems.length === 0">
                                Chưa có dịch vụ trong gói đã chọn.
                            </div>
                            <div class="selection-detail-list" *ngIf="!packageItemsLoading && selectedPackageItems.length > 0">
                                <div class="selection-detail-item" *ngFor="let item of selectedPackageItems; index as i">
                                    <span>{{ i + 1 }}. {{ item.name }} ({{ formatPrice(item.unitPrice) }} x {{ item.qty }})</span>
                                    <strong>{{ formatPrice(item.totalPrice) }}</strong>
                                </div>
                            </div>
                        </ng-container>
                        <ng-template #rightPickPackageHint>
                            <div class="selection-detail-empty">Chọn gói dịch vụ để xem danh sách dịch vụ.</div>
                        </ng-template>
                    </div>
                </div>
            </div>
        </div>
        </ng-container>

        <ng-template #detailLoading>
            <div class="loading-card">
                <i class="pi pi-spin pi-spinner"></i>
                <div style="font-weight:600; margin-bottom:0.35rem">Đang tải thông tin booking</div>
                <div style="font-size:0.86rem">Màn hình sẽ hiển thị khi dữ liệu chi tiết và các lựa chọn liên quan đã sẵn sàng.</div>
            </div>
        </ng-template>

    `,
})
export class BookingCreateComponent implements OnInit {
    private readonly createDraftStorageKey = 'bookingCreateFormDraft';

    bookingId: number | null = null;
    bookingCode = '';
    submitting = false;
    loading = false;
    statusSubmitting = false;
    today = new Date();
    loadedBookingState = 'DRAFT';
    currentStatus = 'ACTIVE';
    selectedBookingState = 'DRAFT';
    readonly loggedInUserId = Number(localStorage.getItem('userId')) || 0;
    readonly loggedInFullName = (localStorage.getItem('fullName') ?? '').trim();
    loggedInLocationId = Number(localStorage.getItem('locationId')) || 0;
    readonly codeRole = (localStorage.getItem('codeRole') ?? '').toUpperCase();
    readonly isSaleAccount = this.codeRole.includes('SALE');

    locationOptions: LocationOption[] = [];
    hallOptions: HallOption[] = [];
    setMenuOptions: SetMenuOption[] = [];
    packageOptions: ServicePackageOption[] = [];
    selectedSetMenuItems: SummaryDetailItem[] = [];
    selectedPackageItems: SummaryDetailItem[] = [];
    setMenuItemsLoading = false;
    packageItemsLoading = false;
    salesOptions: SalesOption[] = [];
    selectedCustomer: CustomerOption | null = null;
    matchedExistingCustomer: CustomerOption | null = null;
    isCustomerLookupLoading = false;
    customerPhoneLookupTimeout: any;
    customerDraft = {
        phone: '',
        fullName: '',
        citizenIdNumber: '',
        email: '',
        address: '',
    };
    salesNameMap: Record<number, string> = {};
    saleRoleIds = new Set<number>();
    tableLayoutRequestDraft: TableLayoutRequest | null = null;
    private readonly layoutColorStyleCache = new Map<number, { border: string; background: string }>();
    private readonly serviceNameCache = new Map<number, string>();
    private readonly servicePriceCache = new Map<number, number>();
    private readonly setMenuItemsCache = new Map<number, SummaryDetailItem[]>();
    private readonly packageItemsCache = new Map<number, SummaryDetailItem[]>();

    shiftOptions = [
        { label: 'Ca sáng (10:00 - 14:00)', value: 'SLOT_1' },
        { label: 'Ca chiều (17:00 - 21:00)', value: 'SLOT_2' },
        { label: 'Cả ngày (09:00 - 17:00)', value: 'SLOT_3' },
    ];

    form = {
        customerId: null as number | null,
        locationId: null as number | null,
        hallId: null as number | null,
        bookingDate: null as Date | null,
        bookingTime: 'SLOT_1',
        expectedTables: 20,
        expectedGuests: 200,
        packageId: Number(localStorage.getItem('packageId')) || null,
        setMenuId: null as number | null,
        salesId: Number(localStorage.getItem('userId')) || null,
        assignCoordinatorId: null as number | null,
        reservedUntil: null as Date | null,
        notes: '',
        brideName: '',
        brideAge: null as number | null,
        groomName: '',
        groomAge: null as number | null,
        brideFatherName: '',
        brideMotherName: '',
        groomFatherName: '',
        groomMotherName: '',
    };

    summary = {
        hallName: '',
        hallPrice: 0,
        setMenuName: '',
        setMenuPrice: 0,
        packageName: '',
        packagePrice: 0,
        estimatedTotal: 0,
    };

    get isEditMode(): boolean {
        return this.bookingId !== null;
    }

    get isSaleCreateMode(): boolean {
        return this.isSaleAccount && !this.isEditMode;
    }

    get layoutEntries() {
        return this.tableLayoutRequestDraft?.tableLayoutDetailRequestList ?? [];
    }

    get totalLayoutTables(): number {
        return this.layoutEntries.reduce((sum, item) => sum + Number(item.numberOfTables ?? 0), 0);
    }

    get seatLayoutDraftBooking(): Partial<Booking> {
        return {
            hallId: this.form.hallId ?? undefined,
            hallName: this.summary.hallName || undefined,
            bookingDate: this.toISODate(this.form.bookingDate),
            expectedTables: this.form.expectedTables,
            tableCount: this.form.expectedTables,
            brideName: this.form.brideName || undefined,
            groomName: this.form.groomName || undefined,
        };
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private bookingService: BookingService,
        private customerService: CustomerService,
        private hallService: HallService,
        private locationService: LocationService,
        private setMenuService: SetMenuService,
        private servicePackageService: ServicePackageService,
        private serviceService: ServiceService,
        private userService: UserService,
        private roleService: RoleService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        const navState = history.state ?? {};
        const stateLayout = navState?.tableLayoutRequest as TableLayoutRequest | undefined;

        let storageLayout: TableLayoutRequest | null = null;
        let storageSavedToDb = false;
        try {
            const rawLayout = sessionStorage.getItem('bookingCreateTableLayoutDraft');
            if (rawLayout) {
                storageLayout = JSON.parse(rawLayout) as TableLayoutRequest;
            }
            storageSavedToDb = sessionStorage.getItem('bookingCreateTableLayoutSavedToDb') === '1';
            sessionStorage.removeItem('bookingCreateTableLayoutDraft');
            sessionStorage.removeItem('bookingCreateTableLayoutSavedToDb');
        } catch {
            storageLayout = null;
        }

        const incomingLayout = stateLayout?.tableLayoutDetailRequestList?.length
            ? stateLayout
            : (storageLayout?.tableLayoutDetailRequestList?.length ? storageLayout : null);

        if (incomingLayout) {
            this.tableLayoutRequestDraft = incomingLayout;
            this.messageService.add({
                severity: 'success',
                summary: 'Lưu thành công',
                detail: (navState?.layoutSavedToDb || storageSavedToDb)
                    ? 'Đã lưu layout vào hệ thống và cập nhật lên hợp đồng.'
                    : 'Đã lưu layout tạm thời cho hợp đồng đang tạo.',
                life: 2600,
            });
        }

        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (Number.isFinite(id) && id > 0) {
            this.bookingId = id;
        }

        this.restoreFormDraft();

        this.loadLocations();
        this.loadCurrentUserContext();
        this.loadSalesOptions();

        if (this.bookingId) {
            this.loadBooking(this.bookingId);
        }
    }

    loadLocations() {
        this.locationService.searchLocations({ page: 0, size: 100 }).subscribe({
            next: (res) => {
                this.locationOptions = (res.data?.content ?? []).map((location) => ({
                    id: Number(location.id),
                    label: location.name ?? `Chi nhánh #${location.id}`,
                }));

                this.applySaleCreateDefaults();
            },
            error: () => {
                this.locationOptions = [];
            },
        });
    }

    private loadCurrentUserContext() {
        if (!this.loggedInUserId) {
            return;
        }

        this.userService.getUser(this.loggedInUserId).subscribe({
            next: (res) => {
                const user = res.data;
                if (!user) {
                    return;
                }

                const locationId = Number(user.locationId);
                if (Number.isFinite(locationId) && locationId > 0) {
                    this.loggedInLocationId = locationId;
                }

                const fullName = user.fullName?.trim();
                if (fullName) {
                    this.salesNameMap[this.loggedInUserId] = fullName;
                }

                this.applySaleCreateDefaults();
                this.cdr.detectChanges();
            },
            error: () => {
                // Keep localStorage fallback values if user profile cannot be loaded.
            },
        });
    }

    private applySaleCreateDefaults() {
        if (!this.isSaleCreateMode) {
            return;
        }

        if (this.loggedInUserId > 0) {
            this.form.salesId = this.loggedInUserId;
        }

        if (this.loggedInLocationId > 0) {
            const isDifferentLocation = this.form.locationId !== this.loggedInLocationId;
            this.form.locationId = this.loggedInLocationId;

            if (isDifferentLocation) {
                this.onLocationChange();
                return;
            }

            if (this.hallOptions.length === 0) {
                const selectedHallId = this.toNumberOrNull(this.form.hallId) ?? undefined;
                forkJoin([
                    this.loadHalls(this.loggedInLocationId, selectedHallId),
                    this.loadSetMenus(this.loggedInLocationId, this.toNumberOrNull(this.form.setMenuId)),
                    this.loadPackages(this.loggedInLocationId, this.toNumberOrNull(this.form.packageId)),
                ]).subscribe(() => this.cdr.detectChanges());
            }
        }
    }

    loadBooking(id: number) {
        this.loading = true;
        this.cdr.detectChanges();
        this.bookingService.getById(id).subscribe({
            next: (res) => {
                const booking = res.data;
                if (!booking) {
                    this.loading = false;
                    this.warn('Không tìm thấy booking');
                    this.goBack();
                    return;
                }

                this.patchFormFromBooking(booking);
                this.bookingCode = booking.contractNo ?? booking.bookingNo ?? '';
                this.currentStatus = booking.status ?? 'ACTIVE';
                this.loadedBookingState = booking.contractState ?? booking.bookingState ?? 'DRAFT';
                this.selectedBookingState = booking.contractState ?? booking.bookingState ?? 'DRAFT';

                const requests: Observable<void>[] = [];

                if (booking.customerId) {
                    requests.push(this.loadCustomerById(Number(booking.customerId)));
                }

                if (booking.hallId) {
                    requests.push(this.loadHallContext(Number(booking.hallId), booking.setMenuId ?? null, booking.packageId ?? null));
                }

                if (requests.length === 0) {
                    this.recalcEstimatedTotal();
                    this.loading = false;
                    this.cdr.detectChanges();
                    return;
                }

                forkJoin(requests).subscribe({
                    next: () => {
                        this.recalcEstimatedTotal();
                        this.loading = false;
                        this.cdr.detectChanges();
                    },
                    error: () => {
                        this.recalcEstimatedTotal();
                        this.loading = false;
                        this.cdr.detectChanges();
                    },
                });
            },
            error: (err) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: err?.error?.message ?? 'Không thể tải chi tiết booking',
                    life: 4000,
                });
                this.goBack();
            },
        });
    }

    private patchFormFromBooking(booking: Booking) {
        this.form.customerId = this.toNumberOrNull(booking.customerId);
        this.form.hallId = this.toNumberOrNull(booking.hallId);
        this.form.bookingDate = booking.bookingDate ? this.parseDate(booking.bookingDate) : null;
        this.form.bookingTime = booking.bookingTime ?? 'SLOT_1';
        this.form.expectedTables = this.toNumberOrDefault(booking.expectedTables ?? booking.tableCount, 20);
        this.form.expectedGuests = this.toNumberOrDefault(booking.expectedGuests ?? booking.guestCount, 200);
        this.form.packageId = this.toNumberOrNull(booking.packageId);
        this.form.setMenuId = this.toNumberOrNull(booking.setMenuId);
        this.form.salesId = this.toNumberOrNull(booking.salesId) ?? this.form.salesId;
        this.form.assignCoordinatorId = this.toNumberOrNull(booking.assignCoordinatorId);
        if (this.form.salesId) {
            this.ensureSalesName(this.form.salesId);
        }
        this.form.reservedUntil = booking.reservedUntil ? new Date(booking.reservedUntil) : null;
        this.form.notes = booking.notes ?? '';
        this.form.brideName = booking.brideName ?? '';
        this.form.brideAge = this.toNumberOrNull(booking.brideAge);
        this.form.groomName = booking.groomName ?? '';
        this.form.groomAge = this.toNumberOrNull(booking.groomAge);
        this.form.brideFatherName = booking.brideFatherName ?? '';
        this.form.brideMotherName = booking.brideMotherName ?? '';
        this.form.groomFatherName = booking.groomFatherName ?? '';
        this.form.groomMotherName = booking.groomMotherName ?? '';
        this.tableLayoutRequestDraft = this.extractTableLayoutRequestFromBooking(booking);
    }

    private loadSalesOptions() {
        this.roleService.searchRoles({ page: 0, size: 100, sort: 'updatedAt,DESC' }).subscribe({
            next: (res) => {
                const roles = res.data?.content ?? [];
                this.saleRoleIds = new Set(
                    roles
                        .filter((role: any) => this.isSaleRole(role))
                        .map((role: any) => Number(role.id))
                        .filter((id: number) => Number.isFinite(id) && id > 0)
                );
                this.fetchSalesUsers();
            },
            error: () => {
                this.saleRoleIds.clear();
                this.fetchSalesUsers();
            },
        });
    }

    private fetchSalesUsers() {
        this.userService.searchUsers({ page: 0, size: 200, sort: 'fullName,ASC' }).subscribe({
            next: (res) => {
                const users = res.data?.content ?? [];
                const salesUsers = users.filter((user: any) => this.isSaleUser(user));

                if (this.isSaleCreateMode && this.loggedInUserId > 0) {
                    const currentSalesUser = salesUsers.find((user: any) => Number(user.id) === this.loggedInUserId);
                    const fullName = currentSalesUser?.fullName?.trim()
                        || this.salesNameMap[this.loggedInUserId]
                        || `Sales #${this.loggedInUserId}`;

                    this.salesNameMap[this.loggedInUserId] = fullName;
                    this.salesOptions = [{ id: this.loggedInUserId, label: fullName }];
                    this.form.salesId = this.loggedInUserId;
                    this.cdr.detectChanges();
                    return;
                }

                this.salesOptions = salesUsers.map((user: any) => {
                    const id = Number(user.id);
                    const label = user.fullName ?? `Sales #${id}`;
                    this.salesNameMap[id] = label;
                    return { id, label };
                });

                if (this.form.salesId && !this.salesOptions.some((item) => item.id === Number(this.form.salesId))) {
                    this.form.salesId = null;
                }

                if (this.form.salesId) {
                    this.ensureSalesName(this.form.salesId);
                }
                this.cdr.detectChanges();
            },
            error: () => {
                this.salesOptions = [];
                this.cdr.detectChanges();
            },
        });
    }

    private ensureSalesName(salesId: number) {
        const id = Number(salesId);
        if (!Number.isFinite(id) || id <= 0 || this.salesNameMap[id]) {
            return;
        }

        this.userService.getUser(id).subscribe({
            next: (res) => {
                const fullName = res.data?.fullName?.trim() || `Sales #${id}`;
                this.salesNameMap[id] = fullName;

                if (this.isSaleUser(res.data) && !this.salesOptions.some((item) => item.id === id)) {
                    this.salesOptions = [{ id, label: fullName }, ...this.salesOptions];
                }
                this.cdr.detectChanges();
            },
            error: () => {
                this.salesNameMap[id] = `Sales #${id}`;
                this.cdr.detectChanges();
            },
        });
    }

    getSalesLabel(salesId?: number | null): string {
        const id = Number(salesId);
        if (!Number.isFinite(id) || id <= 0) {
            return '-';
        }
        if (id === this.loggedInUserId && this.loggedInFullName) {
            return this.salesNameMap[id] ?? this.loggedInFullName;
        }
        return this.salesNameMap[id] ?? `Sales #${id}`;
    }

    private isSaleUser(user: any): boolean {
        const roleId = Number(user?.roleId ?? user?.role?.id);
        if (Number.isFinite(roleId) && roleId > 0 && this.saleRoleIds.has(roleId)) {
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

        return roleCandidates.some((value) => value.includes('SALE'));
    }

    private isSaleRole(role: any): boolean {
        const code = String(role?.code ?? '').toUpperCase();
        const name = String(role?.name ?? '').toUpperCase();
        return code.includes('SALE') || name === 'SALE' || name.includes('SALE');
    }

    private loadCustomerById(customerId: number): Observable<void> {
        return this.customerService.getCustomerById(customerId).pipe(
            tap((res) => {
                const customer = res.data;
                this.selectedCustomer = customer ? {
                    id: Number(customer.id),
                    label: customer.fullName ?? `Khách hàng #${customer.id}`,
                    phone: customer.phone ?? '',
                } : null;
                this.matchedExistingCustomer = this.selectedCustomer;
                this.customerDraft = {
                    phone: customer?.phone ?? '',
                    fullName: customer?.fullName ?? this.selectedCustomer?.label ?? '',
                    citizenIdNumber: customer?.citizenIdNumber ?? '',
                    email: customer?.email ?? '',
                    address: customer?.address ?? '',
                };
                this.cdr.detectChanges();
            }),
            mapTo(void 0),
            catchError(() => {
                this.selectedCustomer = {
                    id: customerId,
                    label: `Khách hàng #${customerId}`,
                    phone: '',
                };
                this.matchedExistingCustomer = this.selectedCustomer;
                this.customerDraft = {
                    phone: '',
                    fullName: this.selectedCustomer.label,
                    citizenIdNumber: '',
                    email: '',
                    address: '',
                };
                this.cdr.detectChanges();
                return of(void 0);
            })
        );
    }

    private loadHallContext(hallId: number, setMenuId: number | null, packageId: number | null): Observable<void> {
        return this.hallService.getHallById(hallId).pipe(
            tap((res) => {
                const hall = res.data;
                this.form.locationId = hall?.locationId ?? null;
                this.summary.hallName = hall?.name ?? `Sảnh #${hallId}`;
                this.summary.hallPrice = Number(hall?.basePrice ?? 0) || 0;
                this.recalcEstimatedTotal();
                this.cdr.detectChanges();
            }),
            switchMap(() => {
                if (!this.form.locationId) {
                    return of(void 0);
                }

                return forkJoin([
                    this.loadHalls(this.form.locationId, hallId),
                    this.loadSetMenus(this.form.locationId, setMenuId),
                    this.loadPackages(this.form.locationId, packageId),
                ]).pipe(mapTo(void 0));
            }),
            catchError(() => {
                this.summary.hallName = `Sảnh #${hallId}`;
                this.cdr.detectChanges();
                return of(void 0);
            })
        );
    }

    onLocationChange() {
        if (this.isSaleCreateMode && this.loggedInLocationId > 0 && this.form.locationId !== this.loggedInLocationId) {
            this.form.locationId = this.loggedInLocationId;
        }

        const locationId = this.form.locationId;
        this.form.hallId = null;
        this.form.setMenuId = null;
        this.form.packageId = null;
        this.summary.hallName = '';
        this.summary.hallPrice = 0;
        this.summary.setMenuName = '';
        this.summary.setMenuPrice = 0;
        this.summary.packageName = '';
        this.summary.packagePrice = 0;
        this.hallOptions = [];
        this.setMenuOptions = [];
        this.packageOptions = [];
        this.selectedSetMenuItems = [];
        this.selectedPackageItems = [];
        this.setMenuItemsLoading = false;
        this.packageItemsLoading = false;

        if (!locationId) {
            this.recalcEstimatedTotal();
            return;
        }

        forkJoin([
            this.loadHalls(locationId),
            this.loadSetMenus(locationId),
            this.loadPackages(locationId),
        ]).subscribe(() => this.cdr.detectChanges());
    }

    private loadHalls(locationId: number, selectedHallId?: number): Observable<void> {
        return this.hallService.searchHalls({ locationId, page: 0, size: 100 }).pipe(
            tap((res) => {
                this.hallOptions = (res.data?.content ?? []).map((hall) => ({
                    id: Number(hall.id),
                    label: hall.name ?? `Sảnh #${hall.id}`,
                    basePrice: Number(hall.basePrice ?? 0) || 0,
                }));

                if (selectedHallId) {
                    this.form.hallId = selectedHallId;
                    this.syncHallSummary();
                }
                this.cdr.detectChanges();
            }),
            mapTo(void 0),
            catchError(() => {
                this.hallOptions = [];
                this.summary.hallPrice = 0;
                this.cdr.detectChanges();
                return of(void 0);
            })
        );
    }

    private loadSetMenus(locationId: number, selectedSetMenuId?: number | null): Observable<void> {
        return this.setMenuService.searchSetMenus({ locationId, page: 0, size: 100 }).pipe(
            map((res) => {
                return (res.data?.content ?? []).map((menu) => {
                    return {
                    id: Number(menu.id),
                    label: menu.name ?? `Set menu #${menu.id}`,
                    price: menu.setPrice ?? 0,
                    imageUrl: this.resolveSetMenuImageUrl(menu),
                    };
                });
            }),
            tap((menus) => {
                this.setMenuOptions = menus;

                if (selectedSetMenuId && this.setMenuOptions.some((menu) => menu.id === selectedSetMenuId)) {
                    this.form.setMenuId = selectedSetMenuId;
                } else if (selectedSetMenuId) {
                    this.form.setMenuId = null;
                }

                this.syncSetMenuSummary();
                this.cdr.detectChanges();
            }),
            mapTo(void 0),
            catchError(() => {
                this.setMenuOptions = [];
                this.form.setMenuId = null;
                this.syncSetMenuSummary();
                this.cdr.detectChanges();
                return of(void 0);
            })
        );
    }

    private resolveSetMenuImageUrl(menu: any): string | undefined {
        const direct = this.pickFirstNonEmptyUrl([
            menu?.imageUrls?.thumbnailUrl,
            menu?.imageUrls?.mediumUrl,
            menu?.imageUrls?.largeUrl,
            menu?.imageUrls?.originalUrl,
        ]);
        if (direct) {
            return direct;
        }

        const grouped = menu?.menuItemsByCategory ? Object.values(menu.menuItemsByCategory) : [];
        for (const group of grouped) {
            if (!Array.isArray(group)) continue;
            for (const item of group) {
                const itemImage = this.pickFirstNonEmptyUrl([
                    item?.imageUrls?.thumbnailUrl,
                    item?.imageUrls?.mediumUrl,
                    item?.imageUrls?.largeUrl,
                    item?.imageUrls?.originalUrl,
                ]);
                if (itemImage) {
                    return itemImage;
                }
            }
        }

        return undefined;
    }

    private pickFirstNonEmptyUrl(urls: Array<string | null | undefined>): string | undefined {
        for (const url of urls) {
            const value = String(url ?? '').trim();
            if (value) {
                return value;
            }
        }
        return undefined;
    }

    private loadPackages(locationId: number, selectedPackageId?: number | null): Observable<void> {
        return this.servicePackageService.searchServicePackages({ locationId, page: 0, size: 100 }).pipe(
            tap((res) => {
                const scopedPackages = (res.data?.content ?? []).filter((item: any) => {
                    const packageLocationId = Number(
                        item.locationId ?? item.branchId ?? item.locationResponse?.id ?? item.location?.id
                    );
                    return packageLocationId === Number(locationId);
                });

                this.packageOptions = scopedPackages.map((item) => ({
                    id: Number(item.id),
                    label: item.name ?? `Gói dịch vụ #${item.id}`,
                    price: item.basePrice ?? 0,
                }));

                if (selectedPackageId && this.packageOptions.some((pkg) => pkg.id === selectedPackageId)) {
                    this.form.packageId = selectedPackageId;
                } else if (selectedPackageId) {
                    this.form.packageId = null;
                }
                this.syncPackageSummary();
                this.cdr.detectChanges();
            }),
            mapTo(void 0),
            catchError(() => {
                this.packageOptions = [];
                this.syncPackageSummary();
                this.cdr.detectChanges();
                return of(void 0);
            })
        );
    }

    onHallChange() {
        this.syncHallSummary();
    }

    private syncHallSummary() {
        const selectedHall = this.hallOptions.find((hall) => hall.id === this.form.hallId);
        this.summary.hallName = selectedHall?.label ?? (this.form.hallId ? `Sảnh #${this.form.hallId}` : '');
        this.summary.hallPrice = selectedHall?.basePrice ?? 0;
        this.recalcEstimatedTotal();
    }

    onCustomerPhoneInput(value: string) {
        this.customerDraft.phone = (value ?? '').trim();
        this.syncSelectedCustomerLabel();

        const normalizedPhone = this.normalizePhoneNumber(this.customerDraft.phone);
        if (!normalizedPhone) {
            this.form.customerId = null;
            this.matchedExistingCustomer = null;
            this.selectedCustomer = null;
            this.isCustomerLookupLoading = false;
            return;
        }

        clearTimeout(this.customerPhoneLookupTimeout);
        this.customerPhoneLookupTimeout = setTimeout(() => {
            this.lookupExistingCustomerByPhone(this.customerDraft.phone);
        }, 350);
    }

    private lookupExistingCustomerByPhone(phone: string) {
        const keyword = phone.trim();
        if (!keyword) {
            return;
        }

        this.isCustomerLookupLoading = true;
        this.customerService.searchCustomers({ phone: keyword, page: 0, size: 20, sort: 'updatedAt,DESC' }).subscribe({
            next: (res) => {
                const customers = res.data?.content ?? [];
                const matched = this.findExactCustomerByPhone(customers, keyword);

                if (matched && matched.id != null) {
                    const customerId = Number(matched.id);
                    const label = matched.fullName?.trim() || `Khách hàng #${customerId}`;
                    const customerPhone = matched.phone?.trim() || keyword;

                    this.form.customerId = customerId;
                    this.selectedCustomer = { id: customerId, label, phone: customerPhone };
                    this.matchedExistingCustomer = this.selectedCustomer;
                    this.customerDraft = {
                        phone: customerPhone,
                        fullName: matched.fullName?.trim() || this.customerDraft.fullName,
                        citizenIdNumber: matched.citizenIdNumber?.trim() || '',
                        email: matched.email?.trim() || '',
                        address: matched.address?.trim() || '',
                    };
                } else {
                    this.form.customerId = null;
                    this.matchedExistingCustomer = null;
                    this.selectedCustomer = null;
                }

                this.isCustomerLookupLoading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.form.customerId = null;
                this.matchedExistingCustomer = null;
                this.selectedCustomer = null;
                this.isCustomerLookupLoading = false;
                this.cdr.detectChanges();
            },
        });
    }

    private findExactCustomerByPhone(customers: Customer[], phone: string): Customer | null {
        const normalizedTarget = this.normalizePhoneNumber(phone);
        if (!normalizedTarget) {
            return null;
        }

        return customers.find((customer) => {
            const normalizedCustomerPhone = this.normalizePhoneNumber(customer.phone ?? '');
            return !!normalizedCustomerPhone && normalizedCustomerPhone === normalizedTarget;
        }) ?? null;
    }

    private normalizePhoneNumber(phone: string): string {
        return String(phone ?? '').replace(/\D/g, '');
    }

    syncSelectedCustomerLabel() {
        if (this.selectedCustomer) {
            this.selectedCustomer = {
                ...this.selectedCustomer,
                label: this.customerDraft.fullName?.trim() || this.selectedCustomer.label,
                phone: this.customerDraft.phone?.trim() || this.selectedCustomer.phone,
            };
            return;
        }

        if (this.customerDraft.fullName?.trim()) {
            this.selectedCustomer = {
                id: Number(this.form.customerId ?? 0),
                label: this.customerDraft.fullName.trim(),
                phone: this.customerDraft.phone?.trim() || '',
            };
        }
    }

    onCitizenIdNumberInput(value: string) {
        this.customerDraft.citizenIdNumber = this.normalizeCitizenIdNumber(value);
    }

    selectSetMenu(menu: SetMenuOption) {
        this.form.setMenuId = menu.id;
        this.syncSetMenuSummary();
    }

    selectPackage(pkg: ServicePackageOption) {
        this.form.packageId = pkg.id;
        this.syncPackageSummary();
    }

    syncSetMenuSummary() {
        const selectedMenu = this.setMenuOptions.find((menu) => menu.id === this.form.setMenuId);
        this.summary.setMenuName = selectedMenu?.label ?? '';
        this.summary.setMenuPrice = selectedMenu?.price ?? 0;
        this.loadSelectedSetMenuItems();
        this.recalcEstimatedTotal();
    }

    syncPackageSummary() {
        const selectedPackage = this.packageOptions.find((item) => item.id === this.form.packageId);
        this.summary.packageName = selectedPackage?.label ?? '';
        this.summary.packagePrice = selectedPackage?.price ?? 0;
        this.loadSelectedPackageItems();
        this.recalcEstimatedTotal();
    }

    private loadSelectedSetMenuItems() {
        const setMenuId = this.toNumberOrNull(this.form.setMenuId);
        if (!setMenuId || setMenuId <= 0) {
            this.selectedSetMenuItems = [];
            this.setMenuItemsLoading = false;
            return;
        }

        const cached = this.setMenuItemsCache.get(setMenuId);
        if (cached) {
            this.selectedSetMenuItems = cached;
            this.setMenuItemsLoading = false;
            return;
        }

        this.setMenuItemsLoading = true;
        this.setMenuService.getById(setMenuId).pipe(
            map((res) => this.extractSetMenuItems(res.data)),
            catchError(() => of([] as SummaryDetailItem[]))
        ).subscribe((items) => {
            this.setMenuItemsCache.set(setMenuId, items);

            if (this.form.setMenuId === setMenuId) {
                this.selectedSetMenuItems = items;
            }

            this.setMenuItemsLoading = false;
            this.cdr.detectChanges();
        });
    }

    private loadSelectedPackageItems() {
        const packageId = this.toNumberOrNull(this.form.packageId);
        if (!packageId || packageId <= 0) {
            this.selectedPackageItems = [];
            this.packageItemsLoading = false;
            return;
        }

        const cached = this.packageItemsCache.get(packageId);
        if (cached) {
            this.selectedPackageItems = cached;
            this.packageItemsLoading = false;
            return;
        }

        this.packageItemsLoading = true;
        this.servicePackageService.getById(packageId).pipe(
            map((res) => this.extractPackageItems(res.data)),
            switchMap((items) => {
                const unresolvedIds = Array.from(new Set(
                    items
                        .map((item) => item.id)
                        .filter((id) => Number.isFinite(id) && id > 0 && !this.serviceNameCache.has(id))
                ));

                return this.resolveServiceNames(unresolvedIds).pipe(
                    map(() => items.map((item) => ({
                        ...item,
                        name: this.serviceNameCache.get(item.id) ?? item.name,
                        unitPrice: this.servicePriceCache.get(item.id) ?? item.unitPrice,
                        totalPrice: (this.servicePriceCache.get(item.id) ?? item.unitPrice) * item.qty,
                    })))
                );
            }),
            catchError(() => of([] as SummaryDetailItem[]))
        ).subscribe((items) => {
            this.packageItemsCache.set(packageId, items);

            if (this.form.packageId === packageId) {
                this.selectedPackageItems = items;
            }

            this.packageItemsLoading = false;
            this.cdr.detectChanges();
        });
    }

    private extractSetMenuItems(setMenu: any): SummaryDetailItem[] {
        const directItems = Array.isArray(setMenu?.menuItems) ? setMenu.menuItems : [];
        const groupedItems = setMenu?.menuItemsByCategory
            ? Object.values(setMenu.menuItemsByCategory).flatMap((items: any) => Array.isArray(items) ? items : [])
            : [];

        const source = directItems.length > 0 ? directItems : groupedItems;

        return source.map((item: any, index: number) => {
            const id = this.toNumberOrNull(item?.id) ?? (index + 1);
            const name = String(item?.name ?? item?.code ?? `Món #${index + 1}`).trim();
            const qty = this.toNumberOrDefault(item?.quantity, 1);
            const unitPrice = this.toNumberOrDefault(
                item?.unitPrice ?? item?.pricePerUnit ?? item?.price,
                0
            );

            return {
                id,
                name: name || `Món #${index + 1}`,
                qty: qty > 0 ? qty : 1,
                unitPrice,
                totalPrice: unitPrice * (qty > 0 ? qty : 1),
            };
        });
    }

    private extractPackageItems(servicePackage: any): SummaryDetailItem[] {
        const responseList = Array.isArray(servicePackage?.serviceResponseList)
            ? servicePackage.serviceResponseList
            : Array.isArray(servicePackage?.ServiceResponseList)
                ? servicePackage.ServiceResponseList
                : [];

        return responseList.map((item: any, index: number) => {
            const serviceId = this.toNumberOrDefault(item?.serviceId, 0);
            const qty = this.toNumberOrDefault(item?.qty, 1);
            const normalizedQty = qty > 0 ? qty : 1;
            const resolvedName = String(
                item?.serviceName
                ?? item?.service?.name
                ?? this.serviceNameCache.get(serviceId)
                ?? (serviceId > 0 ? `Dịch vụ #${serviceId}` : `Dịch vụ #${index + 1}`)
            ).trim();
            const resolvedUnitPrice = this.toNumberOrDefault(
                item?.service?.basePrice
                ?? item?.servicePrice
                ?? item?.unitPrice
                ?? this.servicePriceCache.get(serviceId),
                0
            );

            return {
                id: serviceId > 0 ? serviceId : 0,
                name: resolvedName || `Dịch vụ #${index + 1}`,
                qty: normalizedQty,
                unitPrice: resolvedUnitPrice,
                totalPrice: resolvedUnitPrice * normalizedQty,
            };
        });
    }

    private resolveServiceNames(serviceIds: number[]): Observable<void> {
        const pendingIds = serviceIds.filter((id) => Number.isFinite(id) && id > 0 && !this.serviceNameCache.has(id));
        if (!pendingIds.length) {
            return of(void 0);
        }

        return forkJoin(
            pendingIds.map((id) =>
                this.serviceService.getServiceById(id).pipe(
                    tap((res) => {
                        const name = String(res.data?.name ?? '').trim();
                        const unitPrice = this.toNumberOrDefault(res.data?.basePrice, 0);
                        if (name) {
                            this.serviceNameCache.set(id, name);
                        }
                        this.servicePriceCache.set(id, unitPrice);
                    }),
                    mapTo(void 0),
                    catchError(() => {
                        this.serviceNameCache.set(id, `Dịch vụ #${id}`);
                        this.servicePriceCache.set(id, 0);
                        return of(void 0);
                    })
                )
            )
        ).pipe(mapTo(void 0));
    }

    onBookingDateChange() {
        if (this.form.bookingDate && !this.form.reservedUntil) {
            const reservedUntil = new Date(this.form.bookingDate);
            reservedUntil.setHours(23, 59, 0, 0);
            this.form.reservedUntil = reservedUntil;
        }
    }

    recalcEstimatedTotal() {
        const tables = Number(this.form.expectedTables ?? 0);
        const safeTables = Number.isFinite(tables) && tables > 0 ? tables : 0;
        this.summary.estimatedTotal =
            (this.summary.setMenuPrice * safeTables) +
            this.summary.hallPrice +
            this.summary.packagePrice;
    }

    submit() {
        if (!this.validateForm()) {
            return;
        }
        this.submitting = true;

        this.resolveCustomerIdForSubmit().pipe(
            switchMap((customerId) => {
                this.form.customerId = customerId;
                const payload = this.buildPayload();
                return this.isEditMode && this.bookingId
                    ? this.bookingService.update(this.bookingId, payload)
                    : this.bookingService.create(payload);
            })
        ).subscribe({
            next: (res) => {
                const booking = res.data;
                this.submitting = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: this.isEditMode ? 'Đã cập nhật booking' : 'Đã tạo booking',
                    life: 3000,
                });

                if (!this.isEditMode) {
                    setTimeout(() => this.router.navigate(['/pages/booking']), 800);
                } else if (booking) {
                    this.patchFormFromBooking(booking);
                    this.bookingCode = booking.contractNo ?? booking.bookingNo ?? this.bookingCode;
                    this.currentStatus = booking.status ?? this.currentStatus;
                    this.loadedBookingState = booking.contractState ?? booking.bookingState ?? this.loadedBookingState;
                    this.selectedBookingState = booking.contractState ?? booking.bookingState ?? this.selectedBookingState;
                }
            },
            error: (err) => {
                this.submitting = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: err?.error?.message ?? err?.message ?? 'Không thể lưu booking',
                    life: 4000,
                });
            },
        });
    }

    private resolveCustomerIdForSubmit(): Observable<number> {
        const currentCustomerId = Number(this.form.customerId);
        if (Number.isFinite(currentCustomerId) && currentCustomerId > 0) {
            return of(currentCustomerId);
        }

        const phone = this.customerDraft.phone?.trim() ?? '';
        const normalizedPhone = this.normalizePhoneNumber(phone);
        if (!normalizedPhone) {
            return throwError(() => new Error('Vui lòng nhập số điện thoại khách hàng'));
        }

        return this.customerService.searchCustomers({ phone, page: 0, size: 20, sort: 'updatedAt,DESC' }).pipe(
            map((res) => this.findExactCustomerByPhone(res.data?.content ?? [], phone)),
            switchMap((matched) => {
                if (matched?.id != null) {
                    const customerId = Number(matched.id);
                    this.form.customerId = customerId;
                    this.selectedCustomer = {
                        id: customerId,
                        label: matched.fullName?.trim() || `Khách hàng #${customerId}`,
                        phone: matched.phone?.trim() || phone,
                    };
                    this.matchedExistingCustomer = this.selectedCustomer;
                    this.customerDraft = {
                        phone: matched.phone?.trim() || phone,
                        fullName: matched.fullName?.trim() || this.customerDraft.fullName,
                        citizenIdNumber: matched.citizenIdNumber?.trim() || this.customerDraft.citizenIdNumber,
                        email: matched.email?.trim() || this.customerDraft.email,
                        address: matched.address?.trim() || this.customerDraft.address,
                    };
                    return of(customerId);
                }

                const fullName = this.customerDraft.fullName?.trim();
                if (!fullName) {
                    return throwError(() => new Error('Vui lòng nhập tên khách hàng mới'));
                }

                const address = this.customerDraft.address?.trim();
                if (!address) {
                    return throwError(() => new Error('Vui lòng nhập địa chỉ khách hàng'));
                }

                const locationId = Number(this.form.locationId);
                if (!Number.isFinite(locationId) || locationId <= 0) {
                    return throwError(() => new Error('Vui lòng chọn chi nhánh trước khi tạo khách hàng'));
                }

                return this.customerService.createCustomer({
                    fullName,
                    citizenIdNumber: this.customerDraft.citizenIdNumber?.trim() || undefined,
                    phone,
                    email: this.customerDraft.email?.trim() || undefined,
                    address,
                    locationId,
                }).pipe(
                    map((createRes) => {
                        const createdId = Number(createRes.data?.id);
                        if (!Number.isFinite(createdId) || createdId <= 0) {
                            throw new Error('Không thể tạo khách hàng mới');
                        }

                        this.form.customerId = createdId;
                        this.selectedCustomer = {
                            id: createdId,
                            label: createRes.data?.fullName?.trim() || fullName,
                            phone: createRes.data?.phone?.trim() || phone,
                        };
                        this.matchedExistingCustomer = this.selectedCustomer;
                        return createdId;
                    })
                );
            })
        );
    }

    toggleStatus() {
        if (!this.bookingId) {
            return;
        }

        this.statusSubmitting = true;
        this.bookingService.changeStatus(this.bookingId).subscribe({
            next: (res) => {
                this.statusSubmitting = false;
                this.currentStatus = res.data?.status ?? this.currentStatus;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Đã đổi trạng thái kích hoạt',
                    life: 3000,
                });
            },
            error: (err) => {
                this.statusSubmitting = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: err?.error?.message ?? 'Không thể đổi trạng thái kích hoạt',
                    life: 4000,
                });
            },
        });
    }

    private validateForm(): boolean {
        if (!this.customerDraft.phone?.trim()) {
            this.warn('Vui lòng nhập số điện thoại khách hàng');
            return false;
        }
        if (!this.isValidCustomerPhone(this.customerDraft.phone)) {
            this.warn('Số điện thoại khách hàng không hợp lệ');
            return false;
        }
        if (!this.customerDraft.fullName?.trim()) {
            this.warn('Vui lòng nhập tên khách hàng');
            return false;
        }
        if (!this.customerDraft.citizenIdNumber?.trim()) {
            this.warn('Vui lòng nhập CMND/CCCD khách hàng');
            return false;
        }
        const citizenIdNumber = this.normalizeCitizenIdNumber(this.customerDraft.citizenIdNumber);
        this.customerDraft.citizenIdNumber = citizenIdNumber;
        if (!this.isValidCitizenIdNumber(citizenIdNumber)) {
            this.warn('CMND/CCCD phải gồm đúng 12 số, vui lòng nhập lại');
            return false;
        }
        if (!this.customerDraft.address?.trim()) {
            this.warn('Vui lòng nhập địa chỉ khách hàng');
            return false;
        }
        if (!this.form.locationId) {
            this.warn('Vui lòng chọn chi nhánh');
            return false;
        }
        if (!this.form.groomName || !this.form.brideName) {
            this.warn('Vui lòng nhập tên cô dâu và chú rể');
            return false;
        }
        if (!this.form.hallId) {
            this.warn('Vui lòng chọn sảnh cưới');
            return false;
        }
        if (!this.form.bookingDate) {
            this.warn('Vui lòng chọn ngày tổ chức');
            return false;
        }
        if (this.form.groomAge != null && (this.form.groomAge < 18 || this.form.groomAge > 100)) {
            this.warn('Tuổi của cô dâu/chú rể không hợp lệ, bạn vui lòng kiểm tra lại');
            return false;
        }
        if (this.form.brideAge != null && (this.form.brideAge < 18 || this.form.brideAge > 100)) {
            this.warn('Tuổi của cô dâu/chú rể không hợp lệ, bạn vui lòng kiểm tra lại');
            return false;
        }
        if (this.form.setMenuId != null && !this.setMenuOptions.some((menu) => menu.id === this.form.setMenuId)) {
            this.warn('Set menu đã chọn không hợp lệ với chi nhánh hiện tại');
            return false;
        }
        if (!this.form.expectedTables || !this.form.expectedGuests) {
            this.warn('Vui lòng nhập số bàn và số khách dự kiến');
            return false;
        }
        return true;
    }

    private isValidCustomerPhone(value: string): boolean {
        return /^(0|\+84)[0-9]{9,10}$/.test(value.trim());
    }

    private isValidCitizenIdNumber(value: string): boolean {
        return /^\d{12}$/.test(value.trim());
    }

    private normalizeCitizenIdNumber(value: string): string {
        return String(value ?? '').replace(/\D/g, '').slice(0, 12);
    }

    private buildPayload(): BookingUpsertPayload {
        const enforcedSalesId = this.isSaleCreateMode && this.loggedInUserId > 0
            ? this.loggedInUserId
            : this.form.salesId;
        const customerId = Number(this.form.customerId);
        const locationId = Number(this.form.locationId);
        const customerPhone = this.customerDraft.phone.trim();
        const customerName = this.customerDraft.fullName.trim();
        const customerAddress = this.customerDraft.address.trim();

        const payload = {
            customerId: Number.isFinite(customerId) && customerId > 0 ? customerId : null,
            customerRequest: {
                fullName: customerName,
                citizenIdNumber: this.normalizeCitizenIdNumber(this.customerDraft.citizenIdNumber || '') || undefined,
                phone: customerPhone,
                email: this.customerDraft.email?.trim() || undefined,
                address: customerAddress,
                notes: undefined,
                locationId,
            },
            hallId: this.form.hallId!,
            bookingDate: this.toISODate(this.form.bookingDate)!,
            bookingTime: this.form.bookingTime,
            expectedTables: this.form.expectedTables,
            expectedGuests: this.form.expectedGuests,
            packageId: this.form.packageId,
            setMenuId: this.form.setMenuId,
            salesId: enforcedSalesId,
            reservedUntil: this.toISOString(this.form.reservedUntil),
            notes: this.form.notes?.trim() || undefined,
            brideName: this.form.brideName.trim(),
            brideAge: this.form.brideAge,
            groomName: this.form.groomName.trim(),
            groomAge: this.form.groomAge,
            brideFatherName: this.form.brideFatherName?.trim() || undefined,
            brideMotherName: this.form.brideMotherName?.trim() || undefined,
            groomFatherName: this.form.groomFatherName?.trim() || undefined,
            groomMotherName: this.form.groomMotherName?.trim() || undefined,
        } as BookingUpsertPayload;

        payload.assignCoordinatorId = this.form.assignCoordinatorId ?? enforcedSalesId ?? null;
        if (this.tableLayoutRequestDraft?.tableLayoutDetailRequestList?.length) {
            payload.tableLayoutRequest = this.tableLayoutRequestDraft;
        }

        return payload;
    }

    goBack() {
        if (window.history.length > 1) {
            this.location.back();
            return;
        }
        this.router.navigate(['/pages/booking']);
    }

    openSeatLayout() {
        this.persistFormDraft();

        if (this.bookingId) {
            this.router.navigate(['/pages/seat-layout', this.bookingId], {
                state: {
                    returnUrl: this.router.url,
                    draftTableLayoutRequest: this.tableLayoutRequestDraft,
                }
            });
            return;
        }

        this.router.navigate(['/pages/seat-layout'], {
            state: {
                returnUrl: this.router.url,
                draftBooking: this.seatLayoutDraftBooking,
                draftCustomerName: this.customerDraft.fullName?.trim() || this.selectedCustomer?.label || '',
                draftHallName: this.summary.hallName || '',
                draftTableLayoutRequest: this.tableLayoutRequestDraft,
            }
        });
    }

    private persistFormDraft() {
        if (this.isEditMode) return;

        const draft = {
            ...this.form,
            bookingDate: this.form.bookingDate ? this.form.bookingDate.toISOString() : null,
            reservedUntil: this.form.reservedUntil ? this.form.reservedUntil.toISOString() : null,
            selectedCustomer: this.selectedCustomer,
            matchedExistingCustomer: this.matchedExistingCustomer,
            customerDraft: this.customerDraft,
            summary: this.summary,
        };

        try {
            sessionStorage.setItem(this.createDraftStorageKey, JSON.stringify(draft));
        } catch {
            // Ignore storage failures.
        }
    }

    private restoreFormDraft() {
        if (this.isEditMode) return;

        try {
            const raw = sessionStorage.getItem(this.createDraftStorageKey);
            if (!raw) return;

            const draft = JSON.parse(raw);
            sessionStorage.removeItem(this.createDraftStorageKey);

            this.form = {
                ...this.form,
                ...draft,
                bookingDate: draft?.bookingDate ? new Date(draft.bookingDate) : this.form.bookingDate,
                reservedUntil: draft?.reservedUntil ? new Date(draft.reservedUntil) : this.form.reservedUntil,
            };

            if (draft?.selectedCustomer) {
                this.selectedCustomer = draft.selectedCustomer;
            }

            if (draft?.matchedExistingCustomer) {
                this.matchedExistingCustomer = draft.matchedExistingCustomer;
            }

            if (draft?.customerDraft) {
                this.customerDraft = {
                    ...this.customerDraft,
                    ...draft.customerDraft,
                };
            }

            if (draft?.summary) {
                this.summary = { ...this.summary, ...draft.summary };
            }

            this.recalcEstimatedTotal();
            this.restoreDraftSelectionContext();
        } catch {
            // Ignore invalid draft payload.
        }
    }

    private restoreDraftSelectionContext() {
        if (this.isEditMode) return;

        const locationId = this.toNumberOrNull(this.form.locationId);
        if (!locationId) {
            return;
        }

        const hallId = this.toNumberOrNull(this.form.hallId);
        const setMenuId = this.toNumberOrNull(this.form.setMenuId);
        const packageId = this.toNumberOrNull(this.form.packageId);

        const requests: Observable<void>[] = [
            this.loadHalls(locationId, hallId ?? undefined),
            this.loadSetMenus(locationId, setMenuId),
            this.loadPackages(locationId, packageId),
        ];

        forkJoin(requests).subscribe({
            next: () => {
                this.syncHallSummary();
                this.syncSetMenuSummary();
                this.syncPackageSummary();
                this.recalcEstimatedTotal();
                this.cdr.detectChanges();
            },
            error: () => {
                this.recalcEstimatedTotal();
                this.cdr.detectChanges();
            },
        });
    }

    private extractTableLayoutRequestFromBooking(booking: Booking): TableLayoutRequest | null {
        const details = booking.tableLayoutResponse?.tableLayoutDetails;
        if (!details) return null;

        const knownOrder = ['SIDE_A', 'SIDE_B', 'SIDE_C', 'SIDE_D'];
        const knownList = knownOrder
            .flatMap((key) => (details[key] ?? []).map((item) => ({ key, item })));

        const fallbackList = Object.entries(details)
            .filter(([key]) => !knownOrder.includes(key))
            .flatMap(([, arr]) => arr.map((item) => ({ item })));

        const source = knownList.length > 0 ? knownList : fallbackList;
        if (source.length === 0) return null;

        const mapped = source.map((entry, index) => {
            const fallbackKey = knownOrder[index % knownOrder.length];
            const tableLayoutEnum = (entry as any).key ?? fallbackKey;
            const numberOfTables = Number(entry.item?.numberOfTables ?? 0);
            return {
                tableLayoutEnum,
                groupName: String(entry.item?.groupName ?? 'Khách mời'),
                numberOfTables: Number.isFinite(numberOfTables) ? Math.max(1, numberOfTables) : 1,
            };
        });

        return { tableLayoutDetailRequestList: mapped };
    }

    groupLayoutByZone() {
        const zones = ['SIDE_A', 'SIDE_B', 'SIDE_C', 'SIDE_D'];
        let seatCursor = 1;

        const grouped = zones.map((zoneEnum) => {
            const groups = this.layoutEntries
                .map((item, index) => ({ item, index }))
                .filter((entry) => String(entry.item.tableLayoutEnum ?? '').toUpperCase() === zoneEnum)
                .map((entry) => {
                    const numberOfTables = Math.max(1, Number(entry.item.numberOfTables ?? 1));
                    const startSeat = seatCursor;
                    const endSeat = seatCursor + numberOfTables - 1;
                    seatCursor = endSeat + 1;

                    return {
                        groupName: String(entry.item.groupName ?? 'Khách mời'),
                        numberOfTables,
                        startSeat,
                        endSeat,
                        colorIndex: entry.index,
                    };
                });

            return {
                zoneEnum,
                zoneLabel: this.getLayoutAreaLabel(zoneEnum),
                groups,
            };
        });
        return grouped;
    }

    layoutLegendDotStyle(colorIndex: number): Record<string, string> {
        const token = this.resolveLayoutColorToken(colorIndex);
        return {
            'border-color': token.border,
            background: token.background,
        };
    }

    private resolveLayoutColorToken(colorIndex: number): { border: string; background: string } {
        const key = this.normalizeLayoutColorIndex(colorIndex);
        const cached = this.layoutColorStyleCache.get(key);
        if (cached) {
            return cached;
        }

        const hue = (key * 137.508) % 360;
        const saturation = 70 + (key % 3) * 6;
        const lightness = 88 - (Math.floor(key / 3) % 3) * 8;
        const token = {
            border: `hsl(${hue} ${Math.min(94, saturation + 8)}% ${Math.max(34, lightness - 28)}%)`,
            background: `hsl(${hue} ${Math.min(90, saturation)}% ${Math.max(64, lightness)}%)`,
        };
        this.layoutColorStyleCache.set(key, token);
        return token;
    }

    private normalizeLayoutColorIndex(colorIndex: number): number {
        const value = Number(colorIndex);
        if (!Number.isFinite(value) || value < 0) {
            return 0;
        }
        return Math.floor(value);
    }

    getLayoutAreaLabel(value?: string): string {
        const key = String(value ?? '').toUpperCase();
        const map: Record<string, string> = {
            SIDE_A: 'Khu A',
            SIDE_B: 'Khu B',
            SIDE_C: 'Khu C',
            SIDE_D: 'Khu D',
        };
        return map[key] ?? (value || 'Khu');
    }

    private warn(detail: string) {
        this.messageService.add({ severity: 'warn', summary: 'Thiếu thông tin', detail, life: 3000 });
    }

    private parseDate(value: string): Date {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    private toISODate(date: Date | null): string | undefined {
        if (!date) {
            return undefined;
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private toISOString(date: Date | null): string | null {
        return date ? date.toISOString() : null;
    }

    private toNumberOrNull(value: unknown): number | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    private toNumberOrDefault(value: unknown, fallback: number): number {
        const parsed = this.toNumberOrNull(value);
        return parsed ?? fallback;
    }

    formatPrice(value?: number): string {
        if (value == null) {
            return '0 đ';
        }
        return `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
    }

    formatDateDisplay(date: Date | null): string {
        return date ? date.toLocaleDateString('vi-VN') : '-';
    }

    formatDateTimeDisplay(date: Date | null): string {
        return date ? date.toLocaleString('vi-VN') : '-';
    }

    getShiftLabel(value?: string): string {
        const labels: Record<string, string> = {
            SLOT_1: 'Ca sáng (10:00 - 14:00)',
            SLOT_2: 'Ca chiều (17:00 - 21:00)',
            SLOT_3: 'Cả ngày (09:00 - 17:00)',
            AFTERNOON: 'Ca sáng (10:00 - 14:00)',
            EVENING: 'Ca chiều (17:00 - 21:00)',
            FULL_DAY: 'Cả ngày (09:00 - 17:00)',
        };
        return labels[value ?? ''] ?? value ?? '-';
    }

    getBookingStateLabel(value?: string): string {
        const labels: Record<string, string> = {
            DRAFT: 'Nháp',
            ACTIVE: 'Khách hàng đóng cọc',
            LIQUIDATED: 'Thanh lý hợp đồng',
            CANCELLED: 'Hủy contract',
        };
        return labels[value ?? ''] ?? value ?? '-';
    }

    getStatusLabel(value?: string): string {
        const normalized = this.normalizeStatusValue(value);
        const labels: Record<string, string> = {
            ACTIVE: 'Đang hoạt động',
            INACTIVE: 'Ngưng hoạt động',
        };
        return labels[normalized] ?? value ?? '-';
    }

    getStatusColor(value?: string): string {
        const normalized = this.normalizeStatusValue(value);
        const colors: Record<string, string> = {
            ACTIVE: '#166534',
            INACTIVE: '#991b1b',
        };
        return colors[normalized] ?? '#475569';
    }

    getStatusBg(value?: string): string {
        const normalized = this.normalizeStatusValue(value);
        const colors: Record<string, string> = {
            ACTIVE: '#dcfce7',
            INACTIVE: '#fee2e2',
        };
        return colors[normalized] ?? '#e2e8f0';
    }

    private normalizeStatusValue(value?: string): string {
        const raw = (value ?? '').trim();
        if (!raw) return '';
        const normalized = raw.toUpperCase();
        if (normalized === 'ACTIVE' || normalized === 'INACTIVE') {
            return normalized;
        }
        if (raw.toLowerCase() === 'active' || raw === '1' || raw.toLowerCase() === 'true') {
            return 'ACTIVE';
        }
        if (raw.toLowerCase() === 'inactive' || raw === '0' || raw.toLowerCase() === 'false') {
            return 'INACTIVE';
        }
        return normalized;
    }
}