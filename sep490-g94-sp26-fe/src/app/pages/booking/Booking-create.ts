import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Booking, BookingService, BookingUpsertPayload } from '../service/booking.service';
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

interface SummarySetMenuItem {
    name: string;
    quantity: number;
    unitPrice: number;
    unit?: string;
}

interface SummaryPackageServiceItem {
    name: string;
    quantity: number;
    unitPrice: number;
    unit?: string;
}

interface BookingSummary {
    hallName: string;
    hallPrice: number;
    setMenuName: string;
    setMenuPrice: number;
    setMenuItems: SummarySetMenuItem[];
    packageName: string;
    packagePrice: number;
    packageServices: SummaryPackageServiceItem[];
    estimatedTotal: number;
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
        .customer-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 0.5rem;
            flex-wrap: wrap;
        }
        .customer-card-title {
            margin-bottom: 0;
        }
        .customer-upload-trigger {
            flex-shrink: 0;
        }
        .customer-upload-popup-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.45);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1200;
            padding: 1rem;
        }
        .customer-upload-popup {
            width: min(1160px, 96vw);
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(15, 23, 42, 0.25);
            border: 1px solid #e2e8f0;
            padding: 1.15rem;
        }
        .customer-upload-popup-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.75rem;
            margin-bottom: 0.85rem;
        }
        .customer-upload-popup-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: #1e293b;
        }
        .customer-upload-popup-close {
            background: transparent;
            border: none;
            color: #64748b;
            width: 28px;
            height: 28px;
            border-radius: 999px;
            cursor: pointer;
        }
        .customer-upload-popup-close:hover {
            background: #f1f5f9;
        }
        .customer-upload-title {
            font-size: 0.8rem;
            font-weight: 600;
            color: #334155;
            margin-bottom: 0.55rem;
        }
        .customer-upload-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.6rem;
        }
        .customer-upload-item {
            min-width: 0;
        }
        .customer-upload-btn {
            width: 100%;
            justify-content: center;
        }
        .customer-upload-file {
            margin-top: 0.35rem;
            font-size: 0.74rem;
            color: #64748b;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .customer-upload-error {
            margin-top: 0.45rem;
            font-size: 0.75rem;
            color: #b91c1c;
        }
        .customer-upload-preview-image {
            width: 100%;
            height: 350px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            object-fit: cover;
            display: block;
            background: #ffffff;
        }
        .hidden-file-input {
            display: none;
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
        .menu-card-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.85rem;
        }
        .menu-card-text {
            min-width: 0;
            flex: 1;
        }
        .menu-card:hover {
            border-color: #94a3b8;
        }
        .menu-card.selected {
            border: 2px solid #10b981;
            background: #f0fdf4;
        }
        .menu-card-thumb {
            width: 72px;
            height: 56px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            background: #f8fafc;
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        .menu-card-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .menu-card-thumb i {
            color: #94a3b8;
            font-size: 1rem;
        }
        .menu-name {
            font-weight: 600;
            color: #1e293b;
            font-size: 0.9rem;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
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
        .summary-column {
            position: sticky;
            top: 1rem;
            align-self: start;
        }
        .summary-card {
            position: static;
        }
        .summary-detail-card {
            margin-top: 1rem;
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
        .summary-detail-list {
            margin: -0.2rem 0 0.7rem;
            display: flex;
            flex-direction: column;
            gap: 0.35rem;
        }
        .summary-detail-row {
            display: flex;
            justify-content: space-between;
            gap: 0.6rem;
            font-size: 0.76rem;
            color: #64748b;
        }
        .summary-detail-name {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .summary-detail-price {
            font-weight: 600;
            color: #334155;
            white-space: nowrap;
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
            .summary-column {
                position: static;
                top: auto;
            }
            .two-col,
            .three-col,
            .menu-grid,
            .person-grid {
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
                    <h1>{{ isEditMode ? 'Chi tiết hợp đồng' : 'Hợp đồng mới' }}</h1>
                    <p>{{ isEditMode ? 'Xem và cập nhật hợp đồng' : 'Tạo hợp đồng' }}</p>
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
                    label="Tạo hợp đồng"
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
                    <div class="customer-card-header">
                        <div class="section-title customer-card-title">Khách hàng và điều phối</div>
                        <p-button
                            label="Tải ảnh CCCD"
                            icon="pi pi-upload"
                            severity="secondary"
                            styleClass="customer-upload-trigger"
                            (onClick)="openCitizenCardUploadPopup()"
                        />
                    </div>
                    <div class="customer-upload-error" *ngIf="!isEditMode && submitting && (!citizenCardImages.front || !citizenCardImages.back)">
                        Vui lòng tải lên đủ ảnh CCCD mặt trước và mặt sau.
                    </div>
                    <div [class.two-col]="!shouldHideSalesAssigneeField">
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

                        @if (!shouldHideSalesAssigneeField) {
                            <div class="field-wrap">
                                <label class="field-label">Sales phụ trách</label>
                                @if (isSaleCreateMode) {
                                    <input
                                        pInputText
                                        [ngModel]="getSalesLabel(form.salesId || loggedInUserId)"
                                        readonly
                                        style="width:100%; background:#f8fafc; color:#334155"
                                    />
                                } @else {
                                    <p-select
                                        [options]="salesOptions"
                                        [(ngModel)]="form.salesId"
                                        optionLabel="label"
                                        optionValue="id"
                                        placeholder="Chọn sales phụ trách"
                                        [showClear]="true"
                                        styleClass="w-full"
                                    />
                                }
                            </div>
                        }
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

                <div class="customer-upload-popup-backdrop" *ngIf="showCitizenCardUploadPopup" (click)="closeCitizenCardUploadPopup()">
                    <div class="customer-upload-popup" (click)="$event.stopPropagation()">
                        <div class="customer-upload-popup-header">
                            <div class="customer-upload-popup-title">Tải ảnh CCCD khách hàng</div>
                            <button class="customer-upload-popup-close" type="button" (click)="closeCitizenCardUploadPopup()">
                                <i class="pi pi-times"></i>
                            </button>
                        </div>

                        <div class="customer-upload-title">Vui lòng tải đủ 2 ảnh: mặt trước và mặt sau <span class="req">*</span></div>
                        <div class="customer-upload-grid">
                            <div class="customer-upload-item">
                                <input
                                    #citizenCardFrontInput
                                    class="hidden-file-input"
                                    type="file"
                                    accept="image/*"
                                    (change)="onCitizenCardImageSelected($event, 'front')"
                                />
                                <p-button
                                    label="Mặt trước"
                                    icon="pi pi-upload"
                                    severity="secondary"
                                    styleClass="customer-upload-btn"
                                    (onClick)="citizenCardFrontInput.click()"
                                />
                                <div class="customer-upload-file">{{ citizenCardImages.front?.name || 'Chưa chọn ảnh' }}</div>
                                <img
                                    *ngIf="citizenCardPreviewUrls.front"
                                    class="customer-upload-preview-image"
                                    [src]="citizenCardPreviewUrls.front"
                                    alt="Preview CCCD mặt trước"
                                />
                            </div>

                            <div class="customer-upload-item">
                                <input
                                    #citizenCardBackInput
                                    class="hidden-file-input"
                                    type="file"
                                    accept="image/*"
                                    (change)="onCitizenCardImageSelected($event, 'back')"
                                />
                                <p-button
                                    label="Mặt sau"
                                    icon="pi pi-upload"
                                    severity="secondary"
                                    styleClass="customer-upload-btn"
                                    (onClick)="citizenCardBackInput.click()"
                                />
                                <div class="customer-upload-file">{{ citizenCardImages.back?.name || 'Chưa chọn ảnh' }}</div>
                                <img
                                    *ngIf="citizenCardPreviewUrls.back"
                                    class="customer-upload-preview-image"
                                    [src]="citizenCardPreviewUrls.back"
                                    alt="Preview CCCD mặt sau"
                                />
                            </div>
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

                    <div class="field-wrap" style="max-width: 320px; margin-top: 0.75rem;">
                        <label class="field-label">Phần trăm cọc hợp đồng (%) <span class="req">*</span></label>
                        <p-inputnumber
                            [(ngModel)]="form.paymentPercent"
                            [min]="10"
                            [max]="100"
                            [minFractionDigits]="0"
                            [maxFractionDigits]="0"
                            styleClass="w-full"
                            inputStyleClass="w-full"
                        />
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-title">Thực đơn</div>
                    <div *ngIf="setMenuOptions.length === 0" class="empty-state">
                        <i class="pi pi-times-circle"></i>
                        <span>Chọn chi nhánh để tải danh sách thực đơn</span>
                    </div>

                    <div *ngIf="setMenuOptions.length > 0" class="menu-grid">
                        <div
                            *ngFor="let menu of setMenuOptions"
                            class="menu-card"
                            [class.selected]="form.setMenuId === menu.id"
                            (click)="selectSetMenu(menu)"
                        >
                            <div class="menu-card-content">
                                <div class="menu-card-text">
                                    <div class="menu-name">{{ menu.label }}</div>
                                    <div class="menu-price">{{ formatPrice(menu.price) }}/bàn</div>
                                </div>
                                <div class="menu-card-thumb">
                                    <img
                                        *ngIf="menu.imageUrl"
                                        [src]="menu.imageUrl"
                                        alt="Ảnh set menu"
                                        (error)="onSetMenuImageError(menu)"
                                    />
                                    <i *ngIf="!menu.imageUrl" class="pi pi-image"></i>
                                </div>
                            </div>
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
                    <div class="section-title">Ghi chú</div>
                    <textarea
                        pTextarea
                        [(ngModel)]="form.notes"
                        placeholder="Nhập ghi chú cho hợp đồng..."
                        [rows]="4"
                        style="width:100%;resize:vertical"
                    ></textarea>
                </div>
            </div>

            <div class="summary-column">
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
                    <div class="summary-row">
                        <span>Phần trăm cọc</span>
                        <strong>{{ form.paymentPercent }}%</strong>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-row" *ngIf="summary.setMenuName">
                        <span>Thực đơn</span>
                        <strong>{{ summary.setMenuName }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="summary.packageName">
                        <span>Gói dịch vụ</span>
                        <strong>{{ summary.packageName }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="summary.packagePrice > 0">
                        <span>Giá gói dịch vụ</span>
                        <strong>{{ formatPrice(summary.packagePrice) }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="summary.estimatedTotal > 0">
                        <span>Tổng ước tính</span>
                        <strong>{{ formatPrice(summary.estimatedTotal) }}</strong>
                    </div>
                    <div class="summary-divider"></div>
                    @if (form.salesId && !shouldHideSalesAssigneeField) {
                        <div class="summary-row">
                            <span>Sales phụ trách</span>
                            <strong>{{ getSalesLabel(form.salesId) }}</strong>
                        </div>
                    }
                </div>

                <div class="section-card summary-detail-card" *ngIf="summary.setMenuItems.length > 0 || summary.packageServices.length > 0">
                    <div class="section-title">Chi tiết thực đơn và gói dịch vụ</div>

                    <div class="summary-row" *ngIf="summary.setMenuItems.length > 0">
                        <span>Thực đơn</span>
                        <strong>{{ summary.setMenuName }}</strong>
                    </div>
                    <div class="summary-detail-list" *ngIf="summary.setMenuItems.length > 0">
                        <div class="summary-detail-row" *ngFor="let item of summary.setMenuItems">
                            <span class="summary-detail-name">{{ item.name }} x{{ item.quantity }}{{ item.unit ? ' ' + item.unit : '' }}</span>
                            <span class="summary-detail-price">{{ formatPrice(item.unitPrice) }}</span>
                        </div>
                    </div>

                    <div class="summary-divider" *ngIf="summary.setMenuItems.length > 0 && summary.packageServices.length > 0"></div>

                    <div class="summary-row" *ngIf="summary.packageServices.length > 0">
                        <span>Gói dịch vụ</span>
                        <strong>{{ summary.packageName }}</strong>
                    </div>
                    <div class="summary-detail-list" *ngIf="summary.packageServices.length > 0">
                        <div class="summary-detail-row" *ngFor="let item of summary.packageServices">
                            <span class="summary-detail-name">{{ item.name }} x{{ item.quantity }}{{ item.unit ? ' ' + item.unit : '' }}</span>
                            <span class="summary-detail-price">{{ formatPrice(item.unitPrice) }}</span>
                        </div>
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
    citizenCardImages: { front: File | null; back: File | null } = {
        front: null,
        back: null,
    };
    citizenCardPreviewUrls: { front: string | null; back: string | null } = {
        front: null,
        back: null,
    };
    showCitizenCardUploadPopup = false;
    salesNameMap: Record<number, string> = {};
    saleRoleIds = new Set<number>();
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
        paymentPercent: 10,
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

    summary: BookingSummary = {
        hallName: '',
        hallPrice: 0,
        setMenuName: '',
        setMenuPrice: 0,
        setMenuItems: [],
        packageName: '',
        packagePrice: 0,
        packageServices: [],
        estimatedTotal: 0,
    };

    get isEditMode(): boolean {
        return this.bookingId !== null;
    }

    get isSaleCreateMode(): boolean {
        return this.isSaleAccount && !this.isEditMode;
    }

    get shouldHideSalesAssigneeField(): boolean {
        if (this.isSaleAccount) {
            return true;
        }

        if (!this.isEditMode || this.loggedInUserId <= 0) {
            return false;
        }

        return Number(this.form.salesId) === this.loggedInUserId;
    }

    constructor(
        private http: HttpClient,
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

                const locationFromArray = Array.isArray((user as any).locationIds)
                    ? Number((user as any).locationIds[0])
                    : NaN;
                const locationId = Number.isFinite(locationFromArray) && locationFromArray > 0
                    ? locationFromArray
                    : Number(user.locationId);
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

            const selectedHallId = this.toNumberOrNull(this.form.hallId) ?? undefined;
            const selectedSetMenuId = this.toNumberOrNull(this.form.setMenuId);
            const selectedPackageId = this.toNumberOrNull(this.form.packageId);
            const requests: Observable<void>[] = [];

            if (this.hallOptions.length === 0) {
                requests.push(this.loadHalls(this.loggedInLocationId, selectedHallId));
            }
            if (this.setMenuOptions.length === 0) {
                requests.push(this.loadSetMenus(this.loggedInLocationId, selectedSetMenuId));
            }
            if (this.packageOptions.length === 0) {
                requests.push(this.loadPackages(this.loggedInLocationId, selectedPackageId));
            }

            if (requests.length > 0) {
                forkJoin(requests).subscribe(() => this.cdr.detectChanges());
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
        this.form.paymentPercent = this.normalizePaymentPercent(booking.paymentPercent);
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
        this.summary.setMenuItems = [];
        this.summary.packageName = '';
        this.summary.packagePrice = 0;
        this.summary.packageServices = [];
        this.hallOptions = [];
        this.setMenuOptions = [];
        this.packageOptions = [];

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
                const selectedId = Number(selectedHallId ?? this.form.hallId ?? 0);
                this.hallOptions = (res.data?.content ?? [])
                    .filter((hall) => {
                        const hallId = Number(hall.id);
                        return this.isSelectableResourceStatus(hall.status) || (selectedId > 0 && hallId === selectedId);
                    })
                    .map((hall) => ({
                    id: Number(hall.id),
                    label: hall.name ?? `Sảnh #${hall.id}`,
                    basePrice: Number(hall.basePrice ?? 0) || 0,
                    }));

                if (selectedId > 0 && this.hallOptions.some((hall) => hall.id === selectedId)) {
                    this.form.hallId = selectedId;
                } else if (this.form.hallId && !this.hallOptions.some((hall) => hall.id === this.form.hallId)) {
                    this.form.hallId = null;
                }

                this.syncHallSummary();
                this.cdr.detectChanges();
            }),
            mapTo(void 0),
            catchError(() => {
                this.hallOptions = [];
                this.form.hallId = null;
                this.summary.hallPrice = 0;
                this.cdr.detectChanges();
                return of(void 0);
            })
        );
    }

    private loadSetMenus(locationId: number, selectedSetMenuId?: number | null): Observable<void> {
        return this.setMenuService.searchSetMenus({ locationId, page: 0, size: 100 }).pipe(
            switchMap((res) => {
                const selectedId = Number(selectedSetMenuId ?? this.form.setMenuId ?? 0);
                const rawLocationMenus = res.data?.content ?? [];
                const locationMenus = rawLocationMenus
                    .filter((menu) => {
                        const menuId = Number(menu.id);
                        return this.isSelectableResourceStatus(menu.status) || (selectedId > 0 && menuId === selectedId);
                    })
                    .map((menu) => ({
                        id: Number(menu.id),
                        label: menu.name ?? `Set menu #${menu.id}`,
                        price: menu.setPrice ?? 0,
                        imageUrl: this.extractSetMenuImageUrl(menu),
                    }));

                // Keep branch-based behavior; fallback to hall endpoint if branch query is empty.
                if (rawLocationMenus.length > 0 || !this.form.hallId) {
                    return of(locationMenus);
                }

                return this.http.get<any>('http://localhost:8080/api/v1/set-menu', {
                    params: new HttpParams().set('hallId', this.form.hallId)
                }).pipe(
                    map((hallRes) => (hallRes.data ?? [])
                        .filter((menu: any) => {
                            const menuId = Number(menu.id);
                            return this.isSelectableResourceStatus(menu?.status) || (selectedId > 0 && menuId === selectedId);
                        })
                        .map((menu: any) => ({
                            id: Number(menu.id),
                            label: menu.name ?? `Set menu #${menu.id}`,
                            price: menu.pricePerTable ?? menu.setPrice ?? menu.price ?? 0,
                            imageUrl: this.extractSetMenuImageUrl(menu),
                        })))
                );
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

    private loadPackages(locationId: number, selectedPackageId?: number | null): Observable<void> {
        return this.servicePackageService.searchServicePackages({ locationId, page: 0, size: 100 }).pipe(
            tap((res) => {
                const selectedId = Number(selectedPackageId ?? this.form.packageId ?? 0);
                const scopedPackages = (res.data?.content ?? []).filter((item: any) => {
                    const packageLocationId = Number(
                        item.locationId ?? item.branchId ?? item.locationResponse?.id ?? item.location?.id
                    );
                    if (packageLocationId !== Number(locationId)) {
                        return false;
                    }

                    const packageId = Number(item.id);
                    return this.isSelectableResourceStatus(item.status) || (selectedId > 0 && packageId === selectedId);
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

        if (!this.form.locationId) {
            return;
        }

        // Keep options scoped by location. Only retry set menu fallback by hall when branch query returned empty.
        if (this.form.hallId && this.setMenuOptions.length === 0) {
            this.loadSetMenus(this.form.locationId, this.form.setMenuId).subscribe(() => this.cdr.detectChanges());
        }
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
        const normalizedMatchedPhone = this.normalizePhoneNumber(this.matchedExistingCustomer?.phone ?? '');
        if (this.matchedExistingCustomer && normalizedMatchedPhone && normalizedPhone !== normalizedMatchedPhone) {
            this.form.customerId = null;
            this.matchedExistingCustomer = null;
            this.selectedCustomer = null;
            this.customerDraft.fullName = '';
            this.customerDraft.citizenIdNumber = '';
            this.customerDraft.email = '';
            this.customerDraft.address = '';
        }

        if (!normalizedPhone) {
            this.form.customerId = null;
            this.matchedExistingCustomer = null;
            this.selectedCustomer = null;
            this.isCustomerLookupLoading = false;
            this.customerDraft.fullName = '';
            this.customerDraft.citizenIdNumber = '';
            this.customerDraft.email = '';
            this.customerDraft.address = '';
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

    private extractSetMenuImageUrl(menu: any): string | undefined {
        const pickValid = (...candidates: any[]): string | undefined => {
            for (const candidate of candidates) {
                if (typeof candidate === 'string' && candidate.trim()) {
                    return candidate.trim();
                }
            }
            return undefined;
        };

        const imageUrls = menu?.imageUrls;
        if (Array.isArray(imageUrls)) {
            for (const image of imageUrls) {
                const found = pickValid(
                    image?.thumbnailUrl,
                    image?.mediumUrl,
                    image?.largeUrl,
                    image?.originalUrl,
                    image?.url,
                    image?.imageUrl
                );
                if (found) {
                    return found;
                }
            }
        } else if (imageUrls && typeof imageUrls === 'object') {
            const found = pickValid(
                imageUrls.thumbnailUrl,
                imageUrls.mediumUrl,
                imageUrls.largeUrl,
                imageUrls.originalUrl,
                imageUrls.url,
                imageUrls.imageUrl
            );
            if (found) {
                return found;
            }
        }

        return pickValid(
            menu?.thumbnailUrl,
            menu?.mediumUrl,
            menu?.largeUrl,
            menu?.originalUrl,
            menu?.imageUrl,
            menu?.image
        );
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

    openCitizenCardUploadPopup() {
        this.showCitizenCardUploadPopup = true;
    }

    closeCitizenCardUploadPopup() {
        this.showCitizenCardUploadPopup = false;
    }

    onCitizenCardImageSelected(event: Event, side: 'front' | 'back') {
        const input = event.target as HTMLInputElement | null;
        const file = input?.files?.[0] ?? null;
        const oldPreviewUrl = this.citizenCardPreviewUrls[side];

        if (!file) {
            this.citizenCardImages[side] = null;
            this.citizenCardPreviewUrls[side] = null;
            if (oldPreviewUrl) {
                URL.revokeObjectURL(oldPreviewUrl);
            }
            return;
        }

        if (!file.type.startsWith('image/')) {
            this.warn('Chỉ chấp nhận tệp ảnh cho CCCD');
            this.citizenCardImages[side] = null;
            this.citizenCardPreviewUrls[side] = null;
            if (oldPreviewUrl) {
                URL.revokeObjectURL(oldPreviewUrl);
            }
            if (input) {
                input.value = '';
            }
            return;
        }

        if (oldPreviewUrl) {
            URL.revokeObjectURL(oldPreviewUrl);
        }
        this.citizenCardImages[side] = file;
        this.citizenCardPreviewUrls[side] = URL.createObjectURL(file);

        if (side === 'front') {
            this.extractCCCDInfo(file);
        }
    }

    isExtractingCCCD = false;

    private extractCCCDInfo(file: File) {
        this.isExtractingCCCD = true;
        this.messageService.add({
            severity: 'info',
            summary: 'Đang xử lý',
            detail: 'Đang trích xuất thông tin CCCD mặt trước...',
            life: 2000,
        });

        const formData = new FormData();
        formData.append('file', file);
        
        this.http.post<any>('http://localhost:8000/api/ocr/extract-cccd', formData).subscribe({
            next: (res) => {
                this.isExtractingCCCD = false;
                if (res.status === 'success') {
                    let updated = false;
                    if (res.cccd_number) {
                        this.customerDraft.citizenIdNumber = res.cccd_number;
                        updated = true;
                    }
                    if (res.name) {
                        this.customerDraft.fullName = res.name;
                        updated = true;
                    }
                    
                    if (updated) {
                        this.syncSelectedCustomerLabel();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Thành công',
                            detail: 'Đã trích xuất thông tin CCCD',
                            life: 3000,
                        });
                    } else {
                        this.messageService.add({
                            severity: 'info',
                            summary: 'Lưu ý',
                            detail: 'Không tìm thấy thông tin trên ảnh, vui lòng kiểm tra lại.',
                            life: 3000,
                        });
                    }
                } else {
                    this.messageService.add({
                        severity: 'warn',
                        summary: 'Lưu ý',
                        detail: 'Không tìm thấy thông tin trên ảnh, vui lòng nhập tay',
                        life: 3000,
                    });
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.isExtractingCCCD = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Lỗi khi kết nối đến dịch vụ OCR',
                    life: 4000,
                });
                this.cdr.detectChanges();
            }
        });
    }

    selectSetMenu(menu: SetMenuOption) {
        this.form.setMenuId = menu.id;
        this.syncSetMenuSummary();
    }

    onSetMenuImageError(menu: SetMenuOption) {
        menu.imageUrl = undefined;
    }

    selectPackage(pkg: ServicePackageOption) {
        this.form.packageId = pkg.id;
        this.syncPackageSummary();
    }

    syncSetMenuSummary() {
        const selectedMenu = this.setMenuOptions.find((menu) => menu.id === this.form.setMenuId);
        this.summary.setMenuName = selectedMenu?.label ?? '';
        this.summary.setMenuPrice = selectedMenu?.price ?? 0;

        if (!selectedMenu?.id) {
            this.summary.setMenuItems = [];
            this.recalcEstimatedTotal();
            return;
        }

        this.loadSetMenuDetailForSummary(selectedMenu.id);
        this.recalcEstimatedTotal();
    }

    syncPackageSummary() {
        const selectedPackage = this.packageOptions.find((item) => item.id === this.form.packageId);
        this.summary.packageName = selectedPackage?.label ?? '';
        this.summary.packagePrice = selectedPackage?.price ?? 0;

        if (!selectedPackage?.id) {
            this.summary.packageServices = [];
            this.recalcEstimatedTotal();
            return;
        }

        this.loadPackageDetailForSummary(selectedPackage.id);
        this.recalcEstimatedTotal();
    }

    private loadSetMenuDetailForSummary(setMenuId: number) {
        this.setMenuService.getById(setMenuId).subscribe({
            next: (res: any) => {
                const groupedSource = res?.data?.menuItemsByCategory;
                const groupedItems = Array.isArray(groupedSource)
                    ? groupedSource.map((group: any) => Array.isArray(group?.menuItems) ? group.menuItems : [])
                    : Object.values(groupedSource ?? {});

                const mappedItems: SummarySetMenuItem[] = groupedItems.flatMap((group: any) => {
                    const menuItems = Array.isArray(group) ? group : [];
                    return menuItems.map((item: any) => ({
                        name: String(item?.name ?? item?.menuItemName ?? '').trim(),
                        quantity: Number(item?.quantity ?? 1) || 1,
                        unitPrice: Number(item?.price ?? item?.unitPrice ?? 0) || 0,
                        unit: String(item?.unit ?? '').trim() || undefined,
                    }));
                });

                this.summary.setMenuItems = mappedItems.filter((item) => !!item.name);
                this.cdr.detectChanges();
            },
            error: () => {
                this.summary.setMenuItems = [];
                this.cdr.detectChanges();
            },
        });
    }

    private loadPackageDetailForSummary(packageId: number) {
        this.servicePackageService.getById(packageId).pipe(
            switchMap((res: any) => {
                const serviceRows = Array.isArray(res?.data?.serviceResponseList)
                    ? res.data.serviceResponseList
                    : [];

                if (!serviceRows.length) {
                    return of([] as SummaryPackageServiceItem[]);
                }

                const detailRequests = serviceRows.map((item: any) => {
                    const quantity = Number(item?.quantity ?? item?.qty ?? 1) || 1;
                    const fallbackName = String(item?.serviceName ?? item?.name ?? '').trim();
                    const fallbackPrice = Number(item?.price ?? item?.unitPrice ?? item?.basePrice ?? 0) || 0;
                    const fallbackUnit = String(item?.unit ?? '').trim() || undefined;

                    const serviceId = Number(item?.serviceId ?? item?.id ?? 0);
                    if (!serviceId) {
                        return of({
                            name: fallbackName || 'Dich vu',
                            quantity,
                            unitPrice: fallbackPrice,
                            unit: fallbackUnit,
                        } as SummaryPackageServiceItem);
                    }

                    return this.serviceService.getServiceById(serviceId).pipe(
                        map((serviceRes: any) => {
                            const serviceData = serviceRes?.data;
                            return {
                                name: String(serviceData?.name ?? fallbackName ?? `Dich vu #${serviceId}`),
                                quantity,
                                unitPrice: Number(item?.price ?? item?.unitPrice ?? item?.basePrice ?? serviceData?.basePrice ?? serviceData?.price ?? 0) || 0,
                                unit: String(serviceData?.unit ?? fallbackUnit ?? '').trim() || undefined,
                            } as SummaryPackageServiceItem;
                        }),
                        catchError(() => of({
                            name: fallbackName || `Dich vu #${serviceId}`,
                            quantity,
                            unitPrice: fallbackPrice,
                            unit: fallbackUnit,
                        } as SummaryPackageServiceItem))
                    );
                });

                return forkJoin(detailRequests) as Observable<SummaryPackageServiceItem[]>;
            })
        ).subscribe({
            next: (services: SummaryPackageServiceItem[]) => {
                this.summary.packageServices = services.filter((item) => !!item?.name);
                this.cdr.detectChanges();
            },
            error: () => {
                this.summary.packageServices = [];
                this.cdr.detectChanges();
            },
        });
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
            (this.summary.hallPrice * safeTables) +
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
                    ? this.bookingService.update(this.bookingId, payload, this.getCitizenCardImageFiles())
                    : this.bookingService.create(payload, this.getCitizenCardImageFiles());
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
                }, this.getCitizenCardImageFiles()).pipe(
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
        if (!this.isEditMode && (!this.citizenCardImages.front || !this.citizenCardImages.back)) {
            this.warn('Vui lòng tải ảnh CCCD mặt trước và mặt sau');
            return false;
        }
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
        if (!this.hallOptions.some((hall) => hall.id === this.form.hallId)) {
            this.warn('Sảnh đã chọn hiện không còn hoạt động, vui lòng chọn sảnh khác');
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
            this.warn('Set menu đã chọn hiện không còn hoạt động hoặc không thuộc chi nhánh hiện tại');
            return false;
        }
        if (this.form.packageId != null && !this.packageOptions.some((pkg) => pkg.id === this.form.packageId)) {
            this.warn('Combo dịch vụ đã chọn hiện không còn hoạt động hoặc không thuộc chi nhánh hiện tại');
            return false;
        }
        if (!this.form.expectedTables || !this.form.expectedGuests) {
            this.warn('Vui lòng nhập số bàn và số khách dự kiến');
            return false;
        }
        if (this.form.paymentPercent == null || this.form.paymentPercent < 10 || this.form.paymentPercent > 100) {
            this.warn('Phần trăm cọc phải từ 10% đến 100%');
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

    private getCitizenCardImageFiles(): File[] {
        const { front, back } = this.citizenCardImages;
        return [front, back].filter((file): file is File => file instanceof File);
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
            paymentPercent: this.form.paymentPercent,
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

        return payload;
    }

    goBack() {
        if (window.history.length > 1) {
            this.location.back();
            return;
        }
        this.router.navigate(['/pages/booking']);
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

    private normalizePaymentPercent(value: unknown): number {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) {
            return 10;
        }

        return Math.min(100, Math.max(10, Math.round(parsed)));
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

    private isSelectableResourceStatus(value?: string): boolean {
        const normalized = this.normalizeStatusValue(value);
        if (!normalized) {
            return true;
        }
        return normalized !== 'INACTIVE';
    }
}