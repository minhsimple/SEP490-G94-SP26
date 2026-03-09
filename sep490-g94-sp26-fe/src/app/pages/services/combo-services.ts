import {
    Component, OnInit, signal, ViewChild, ChangeDetectorRef
} from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { RouterModule, Router } from '@angular/router';
import { LocationService } from '../service/location.service';
import { Combo, ComboService, ServiceItem } from '../service/combo.services';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-combos',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        InputTextModule,
        SelectModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        TextareaModule,
        ToggleSwitchModule,
        InputNumberModule,
        CheckboxModule,
        RouterModule,
    ],
    template: `
        <div class="card">
            <p-toast />

            <!-- Toolbar: search + filter + add button -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <p-iconfield style="max-width: 420px;">
                        <p-inputicon styleClass="pi pi-search" />
                        <input
                            pInputText
                            type="text"
                            [(ngModel)]="searchKeyword"
                            (input)="onSearch()"
                            placeholder="Tìm kiếm combo..."
                            class="w-full"
                        />
                    </p-iconfield>
                    <p-select
                        [options]="locationOptions"
                        [(ngModel)]="selectedLocationId"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Lọc chi nhánh"
                        (onChange)="onLocationChange($event)"
                        [showClear]="true"
                        style="width: 200px"
                    />
                </div>
                <p-button
                    label="Thêm combo"
                    icon="pi pi-plus"
                    severity="primary"
                    (onClick)="openNew()"
                />
            </div>

            <!-- Table card -->
            <div class="surface-card border-round-xl shadow-1 overflow-hidden">
                <div class="px-4 pt-4 pb-3 border-bottom-1 surface-border">
                    <div class="text-xl font-bold text-900">Danh sách combo dịch vụ</div>
                    <div class="text-sm text-500 mt-1">Quản lý các combo dịch vụ tiệc cưới</div>
                </div>

                <p-table
                    #dt
                    [value]="combos()"
                    [rows]="pageSize"
                    [columns]="cols"
                    [paginator]="true"
                    [totalRecords]="totalRecords"
                    [lazy]="true"
                    (onLazyLoad)="onLazyLoad($event)"
                    [tableStyle]="{ 'min-width': '60rem' }"
                    [rowHover]="true"
                    dataKey="id"
                    currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} combo"
                    [showCurrentPageReport]="true"
                    [rowsPerPageOptions]="[10, 20, 30]"
                    [loading]="loading"
                    styleClass="p-datatable-sm"
                >
                    <ng-template #header>
                        <tr>
                            <th style="min-width:22rem">Tên combo</th>
                            <th style="min-width:10rem">Chi nhánh</th>
                            <th style="min-width:12rem">Giá combo</th>
                            <th style="min-width:9rem">Số dịch vụ</th>
                            <th style="min-width:9rem">Trạng thái</th>
                            <th style="min-width:8rem">Thao tác</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-combo>
                        <tr>
                            <!-- Tên combo -->
                            <td>
                                <div class="flex items-center gap-3">
                                    <div
                                        class="flex items-center justify-center border-round-lg"
                                        style="width:38px; height:38px; background: linear-gradient(135deg, #dbeafe, #ede9fe); color: #4f46e5; flex-shrink:0;"
                                    >
                                        <i class="pi pi-box text-sm"></i>
                                    </div>
                                    <div>
                                        <div class="font-semibold text-900">{{ combo.name }}</div>
                                        <div class="text-sm text-500 mt-1"
                                             style="max-width:280px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                            {{ combo.description || '' }}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            <!-- Chi nhánh -->
                            <td class="text-600">{{ combo.locationName || '—' }}</td>

                            <!-- Giá -->
                            <td class="font-semibold text-900">
                                {{ formatPrice(combo.totalPrice) }}
                            </td>

                            <!-- Số dịch vụ -->
                            <td>
                                <span
                                    class="px-3 py-1 border-round-xl text-sm font-semibold"
                                    style="background:#eff6ff; color:#3b82f6;"
                                >
                                    {{ combo.serviceCount ?? 0 }} dịch vụ
                                </span>
                            </td>

                            <!-- Trạng thái -->
                            <td>
                                <span class="font-medium"
                                      [style.color]="combo.status === 'INACTIVE' ? '#ef4444' : '#22c55e'">
                                    {{ combo.status === 'INACTIVE' ? 'Không hoạt động' : 'Cung cấp' }}
                                </span>
                            </td>

                            <!-- Thao tác -->
                            <td>
                                <div class="flex items-center gap-1">
                                    <p-button
                                        icon="pi pi-eye"
                                        [rounded]="true"
                                        [text]="true"
                                        severity="secondary"
                                        (click)="viewDetail(combo)"
                                        pTooltip="Xem chi tiết"
                                        tooltipPosition="top"
                                    />
                                    <p-button
                                        icon="pi pi-pencil"
                                        [rounded]="true"
                                        [text]="true"
                                        severity="secondary"
                                        (click)="editCombo(combo)"
                                        pTooltip="Chỉnh sửa"
                                        tooltipPosition="top"
                                    />
                                    <p-button
                                        icon="pi pi-trash"
                                        [rounded]="true"
                                        [text]="true"
                                        severity="danger"
                                        (click)="confirmDelete(combo)"
                                        pTooltip="Xoá"
                                        tooltipPosition="top"
                                    />
                                </div>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="6" class="text-center py-8 text-500">
                                <i class="pi pi-inbox text-4xl mb-3 block"></i>
                                Không có combo nào
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>

            <!-- ═══════════════ Dialog Thêm combo mới ═══════════════ -->
            <p-dialog
                [(visible)]="createDialog"
                [style]="{ width: '900px' }"
                header="Thêm combo dịch vụ mới"
                [modal]="true"
                styleClass="p-fluid"
            >
                <ng-template #content>
                    <div class="text-sm text-500 mb-5">Tạo combo mới với danh sách dịch vụ</div>
                    <div class="grid grid-cols-2 gap-6" style="align-items:start;">

                        <!-- LEFT: form info -->
                        <div class="flex flex-col gap-4">
                            <div class="text-base font-bold text-900 mb-1">Thông tin combo</div>

                            <div>
                                <label class="block font-semibold mb-2 text-sm">
                                    Tên combo <span class="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    pInputText
                                    [(ngModel)]="newCombo.name"
                                    fluid
                                    placeholder="VD: Combo trang trí cao cấp"
                                    [class.ng-invalid]="submitted && !newCombo.name"
                                    [class.ng-dirty]="submitted && !newCombo.name"
                                />
                                <small class="text-red-500" *ngIf="submitted && !newCombo.name">
                                    Tên combo là bắt buộc.
                                </small>
                            </div>

                            <div>
                                <label class="block font-semibold mb-2 text-sm">Chi nhánh</label>
                                <p-select
                                    [(ngModel)]="newCombo.locationId"
                                    [options]="locationOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="-- Không chọn --"
                                    fluid
                                    [showClear]="true"
                                />
                            </div>

                            <div>
                                <label class="block font-semibold mb-2 text-sm">Mô tả</label>
                                <textarea
                                    pTextarea
                                    [(ngModel)]="newCombo.description"
                                    rows="4"
                                    fluid
                                    placeholder="Mô tả combo..."
                                    class="w-full"
                                ></textarea>
                            </div>

                            <div>
                                <label class="block font-semibold mb-2 text-sm">Ảnh đại diện (URL)</label>
                                <input
                                    type="text"
                                    pInputText
                                    [(ngModel)]="newCombo.imageUrl"
                                    fluid
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div class="flex items-center justify-between py-2 px-3 border-round"
                                 style="background:#f8fafc; border:1px solid #e2e8f0;">
                                <span class="font-semibold text-sm text-700">Đang cung cấp</span>
                                <p-toggleswitch [(ngModel)]="newComboActive" />
                            </div>

                            <!-- Summary -->
                            <div class="border-round p-3" style="background:#f8fafc; border:1px solid #e2e8f0;">
                                <div class="flex justify-between text-sm mb-2">
                                    <span class="text-600">Số dịch vụ đã chọn</span>
                                    <span class="font-semibold text-primary">
                                        {{ newSelectedServiceIds.size }} dịch vụ
                                    </span>
                                </div>
                                <div class="border-top-1 surface-border pt-2 flex justify-between">
                                    <span class="font-bold text-sm">Tổng giá combo</span>
                                    <span class="font-bold text-xl text-primary">
                                        {{ formatPrice(calcSelectedTotal(newSelectedServiceIds)) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- RIGHT: service picker -->
                        <div class="flex flex-col" style="max-height:500px;">
                            <div class="text-base font-bold text-900 mb-3">Chọn dịch vụ</div>
                            <p-iconfield class="mb-3">
                                <p-inputicon styleClass="pi pi-search" />
                                <input
                                    pInputText
                                    type="text"
                                    [(ngModel)]="serviceSearchKeyword"
                                    (input)="onServiceSearch()"
                                    placeholder="Tìm dịch vụ..."
                                    class="w-full"
                                />
                            </p-iconfield>
                            <div class="overflow-y-auto flex-1 border-round"
                                 style="border:1px solid #e2e8f0; max-height:400px;">
                                <div *ngFor="let svc of filteredServices()"
                                     class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                                     [style.background]="newSelectedServiceIds.has(svc.id) ? '#eff6ff' : 'white'"
                                     style="border-bottom:1px solid #f1f5f9;"
                                     (click)="toggleServiceNew(svc)">
                                    <div class="flex items-center justify-center border-round-lg flex-shrink-0"
                                         style="width:32px; height:32px; background:#ede9fe; color:#7c3aed;">
                                        <i class="pi pi-sparkles text-xs"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="font-medium text-900 text-sm">{{ svc.name }}</div>
                                        <div class="text-xs text-500 mt-0.5" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                            {{ svc.description || '' }}
                                        </div>
                                    </div>
                                    <div class="text-right flex-shrink-0">
                                        <div class="font-semibold text-sm text-primary">{{ formatPrice(svc.basePrice) }}</div>
                                        <div class="text-xs text-500">/ {{ svc.unit || 'gói' }}</div>
                                    </div>
                                    <div class="flex items-center justify-center border-round flex-shrink-0"
                                         style="width:20px;height:20px;"
                                         [style.background]="newSelectedServiceIds.has(svc.id) ? '#3b82f6' : 'transparent'"
                                         [style.border]="newSelectedServiceIds.has(svc.id) ? 'none' : '2px solid #cbd5e1'">
                                        <i *ngIf="newSelectedServiceIds.has(svc.id)" class="pi pi-check text-white" style="font-size:10px;"></i>
                                    </div>
                                </div>
                                <div *ngIf="filteredServices().length === 0"
                                     class="text-center py-8 text-500 text-sm">
                                    <i class="pi pi-inbox text-2xl mb-2 block"></i>
                                    Không tìm thấy dịch vụ
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>

                <ng-template #footer>
                    <div class="flex justify-end gap-2">
                        <p-button label="Hủy" icon="pi pi-times" text (click)="hideCreateDialog()" />
                        <p-button
                            label="Tạo combo"
                            icon="pi pi-check"
                            severity="primary"
                            (click)="saveNewCombo()"
                            [loading]="saving"
                        />
                    </div>
                </ng-template>
            </p-dialog>

            <!-- ═══════════════ Dialog Chỉnh sửa ═══════════════ -->
            <p-dialog
                [(visible)]="editDialog"
                [style]="{ width: '900px' }"
                header="Chỉnh sửa combo dịch vụ"
                [modal]="true"
                styleClass="p-fluid"
            >
                <ng-template #content>
                    <div class="text-sm text-500 mb-5">Cập nhật thông tin combo dịch vụ</div>
                    <div class="grid grid-cols-2 gap-6" style="align-items:start;">

                        <!-- LEFT: form -->
                        <div class="flex flex-col gap-4">
                            <div class="text-base font-bold text-900 mb-1">Thông tin combo</div>

                            <div>
                                <label class="block font-semibold mb-2 text-sm">
                                    Tên combo <span class="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    pInputText
                                    [(ngModel)]="editedCombo.name"
                                    fluid
                                    [class.ng-invalid]="editSubmitted && !editedCombo.name"
                                    [class.ng-dirty]="editSubmitted && !editedCombo.name"
                                />
                                <small class="text-red-500" *ngIf="editSubmitted && !editedCombo.name">
                                    Tên combo là bắt buộc.
                                </small>
                            </div>

                            <div>
                                <label class="block font-semibold mb-2 text-sm">Chi nhánh</label>
                                <p-select
                                    [(ngModel)]="editedCombo.locationId"
                                    [options]="locationOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="-- Không chọn --"
                                    fluid
                                    [showClear]="true"
                                />
                            </div>

                            <div>
                                <label class="block font-semibold mb-2 text-sm">Mô tả</label>
                                <textarea
                                    pTextarea
                                    [(ngModel)]="editedCombo.description"
                                    rows="4"
                                    fluid
                                    class="w-full"
                                ></textarea>
                            </div>

                            <div>
                                <label class="block font-semibold mb-2 text-sm">Ảnh đại diện (URL)</label>
                                <input
                                    type="text"
                                    pInputText
                                    [(ngModel)]="editedCombo.imageUrl"
                                    fluid
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div class="flex items-center justify-between py-2 px-3 border-round"
                                 style="background:#f8fafc; border:1px solid #e2e8f0;">
                                <span class="font-semibold text-sm text-700">Đang cung cấp</span>
                                <p-toggleswitch [(ngModel)]="editedComboActive" />
                            </div>

                            <!-- Summary -->
                            <div class="border-round p-3" style="background:#f8fafc; border:1px solid #e2e8f0;">
                                <div class="flex justify-between text-sm mb-2">
                                    <span class="text-600">Số dịch vụ đã chọn</span>
                                    <span class="font-semibold text-primary">
                                        {{ editSelectedServiceIds.size }} dịch vụ
                                    </span>
                                </div>
                                <div class="border-top-1 surface-border pt-2 flex justify-between">
                                    <span class="font-bold text-sm">Tổng giá combo</span>
                                    <span class="font-bold text-xl text-primary">
                                        {{ formatPrice(calcSelectedTotal(editSelectedServiceIds)) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- RIGHT: service picker -->
                        <div class="flex flex-col" style="max-height:500px;">
                            <div class="text-base font-bold text-900 mb-3">Chọn dịch vụ</div>
                            <p-iconfield class="mb-3">
                                <p-inputicon styleClass="pi pi-search" />
                                <input
                                    pInputText
                                    type="text"
                                    [(ngModel)]="serviceSearchKeyword"
                                    (input)="onServiceSearch()"
                                    placeholder="Tìm dịch vụ..."
                                    class="w-full"
                                />
                            </p-iconfield>
                            <div class="overflow-y-auto flex-1 border-round"
                                 style="border:1px solid #e2e8f0; max-height:400px;">
                                <div *ngFor="let svc of filteredServices()"
                                     class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                                     [style.background]="editSelectedServiceIds.has(svc.id) ? '#eff6ff' : 'white'"
                                     style="border-bottom:1px solid #f1f5f9;"
                                     (click)="toggleServiceEdit(svc)">
                                    <div class="flex items-center justify-center border-round-lg flex-shrink-0"
                                         style="width:32px; height:32px; background:#ede9fe; color:#7c3aed;">
                                        <i class="pi pi-sparkles text-xs"></i>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <div class="font-medium text-900 text-sm">{{ svc.name }}</div>
                                        <div class="text-xs text-500 mt-0.5" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                                            {{ svc.description || '' }}
                                        </div>
                                    </div>
                                    <div class="text-right flex-shrink-0">
                                        <div class="font-semibold text-sm text-primary">{{ formatPrice(svc.basePrice) }}</div>
                                        <div class="text-xs text-500">/ {{ svc.unit || 'gói' }}</div>
                                    </div>
                                    <div class="flex items-center justify-center border-round flex-shrink-0"
                                         style="width:20px;height:20px;"
                                         [style.background]="editSelectedServiceIds.has(svc.id) ? '#3b82f6' : 'transparent'"
                                         [style.border]="editSelectedServiceIds.has(svc.id) ? 'none' : '2px solid #cbd5e1'">
                                        <i *ngIf="editSelectedServiceIds.has(svc.id)" class="pi pi-check text-white" style="font-size:10px;"></i>
                                    </div>
                                </div>
                                <div *ngIf="filteredServices().length === 0"
                                     class="text-center py-8 text-500 text-sm">
                                    <i class="pi pi-inbox text-2xl mb-2 block"></i>
                                    Không tìm thấy dịch vụ
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-template>

                <ng-template #footer>
                    <div class="flex justify-end gap-2">
                        <p-button label="Hủy" icon="pi pi-times" text (click)="hideEditDialog()" />
                        <p-button
                            label="Cập nhật"
                            icon="pi pi-check"
                            severity="primary"
                            (click)="saveEditCombo()"
                            [loading]="saving"
                        />
                    </div>
                </ng-template>
            </p-dialog>

            <!-- ═══════════════ Dialog Chi tiết ═══════════════ -->
            <p-dialog
                [(visible)]="detailDialog"
                [style]="{ width: '680px' }"
                [header]="detailCombo?.name ?? 'Chi tiết combo'"
                [modal]="true"
            >
                <ng-template #content>
                    <div *ngIf="detailCombo">
                        <!-- Hero image -->
                        <div class="border-round-xl overflow-hidden mb-4"
                             style="height:180px; background:linear-gradient(135deg,#1e3a8a,#3b82f6,#93c5fd); position:relative;">
                            <img *ngIf="detailCombo.imageUrl"
                                 [src]="detailCombo.imageUrl"
                                 class="w-full h-full"
                                 style="object-fit:cover; position:absolute; inset:0;"
                                 alt="combo image" />
                            <div *ngIf="!detailCombo.imageUrl"
                                 class="flex flex-col items-center justify-center h-full"
                                 style="color:rgba(255,255,255,0.45);">
                                <i class="pi pi-image text-4xl mb-2"></i>
                                <span class="text-sm">Chưa có ảnh combo</span>
                            </div>
                            <div style="position:absolute; bottom:0; left:0; right:0;
                                        background:linear-gradient(transparent,rgba(0,0,0,0.65));
                                        padding:16px 20px;"
                                 class="flex items-end justify-between">
                                <span class="text-white font-bold text-xl">{{ detailCombo.name }}</span>
                                <span class="px-3 py-1 border-round-xl text-xs font-semibold text-white"
                                      style="background:rgba(255,255,255,0.18); backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.3);">
                                    ⊙ Đang áp dụng
                                </span>
                            </div>
                        </div>

                        <!-- Stats -->
                        <div class="grid grid-cols-2 gap-3 mb-4">
                            <div class="surface-card border-round-xl p-4 text-center shadow-1">
                                <div class="text-primary text-2xl mb-1">💲</div>
                                <div class="font-bold text-xl text-900">{{ formatPrice(detailCombo.totalPrice) }}</div>
                                <div class="text-500 text-sm mt-1">Giá combo</div>
                            </div>
                            <div class="surface-card border-round-xl p-4 text-center shadow-1">
                                <div class="text-primary text-2xl mb-1">📦</div>
                                <div class="font-bold text-xl text-900">{{ detailCombo.serviceCount ?? 0 }}</div>
                                <div class="text-500 text-sm mt-1">Tổng dịch vụ</div>
                            </div>
                        </div>

                        <!-- Description -->
                        <div class="surface-card border-round-xl p-4 shadow-1 mb-3" *ngIf="detailCombo.description">
                            <div class="flex items-center gap-2 font-bold text-sm mb-3">
                                <span>📦</span> Mô tả
                            </div>
                            <div class="text-600 text-sm line-height-3">{{ detailCombo.description }}</div>
                        </div>

                        <!-- Services list -->
                        <div class="surface-card border-round-xl p-4 shadow-1" *ngIf="detailCombo.services?.length">
                            <div class="flex items-center gap-2 font-bold text-sm mb-3">
                                <span>✨</span> Danh sách dịch vụ
                            </div>
                            <div *ngFor="let svc of detailCombo.services"
                                 class="flex items-center gap-3 py-3"
                                 style="border-bottom:1px solid #f1f5f9;">
                                <div class="flex items-center justify-center border-round-lg flex-shrink-0"
                                     style="width:36px;height:36px;background:#ede9fe;color:#7c3aed;">
                                    <i class="pi pi-sparkles text-sm"></i>
                                </div>
                                <div class="flex-1">
                                    <div class="font-medium text-900 text-sm">{{ svc.name }}</div>
                                    <div class="text-xs text-500 mt-0.5">{{ svc.description }}</div>
                                </div>
                                <div class="font-bold text-sm text-primary">
                                    {{ formatPrice(svc.basePrice) }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div *ngIf="loadingDetail" class="flex items-center justify-center py-8">
                        <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
                    </div>
                </ng-template>

                <ng-template #footer>
                    <div class="flex justify-end gap-2">
                        <p-button label="Đóng" icon="pi pi-times" text (click)="detailDialog = false" />
                        <p-button
                            label="Chỉnh sửa"
                            icon="pi pi-pencil"
                            severity="primary"
                            (click)="detailDialog = false; editCombo(detailCombo!)"
                        />
                    </div>
                </ng-template>
            </p-dialog>

            <p-confirmdialog />
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
            .p-datatable .p-datatable-tbody > tr:hover > td {
                background: #f8fafc;
            }
            .p-datatable .p-datatable-tbody > tr:last-child > td {
                border-bottom: none;
            }
            .p-dialog .p-dialog-header {
                padding: 1.25rem 1.5rem 0.5rem;
                font-weight: 700;
                font-size: 1.1rem;
            }
            .p-dialog .p-dialog-content {
                padding: 0 1.5rem 1rem;
            }
            .p-dialog .p-dialog-footer {
                padding: 0.75rem 1.5rem 1.25rem;
                border-top: 1px solid #f1f5f9;
            }
        }
    `],
    providers: [MessageService, ComboService, ConfirmationService, LocationService]
})
export class CombosComponent implements OnInit {

    combos = signal<Combo[]>([]);
    loading = false;
    loadingDetail = false;
    saving = false;
    totalRecords = 0;
    pageSize = 20;
    currentPage = 0;
    searchKeyword = '';
    searchTimeout: any;
    serviceSearchTimeout: any;
    selectedLocationId: number | null = null;

    // Dialog states
    createDialog = false;
    editDialog = false;
    detailDialog = false;
    submitted = false;
    editSubmitted = false;

    // Form models
    newCombo: Partial<Combo> = {};
    newComboActive = true;
    newSelectedServiceIds = new Set<number>();

    editedCombo: Partial<Combo> = {};
    editedComboActive = true;
    editSelectedServiceIds = new Set<number>();

    detailCombo: Combo | null = null;

    // Services for picker
    allServices = signal<ServiceItem[]>([]);
    serviceSearchKeyword = '';
    _filteredServices: ServiceItem[] = [];

    locationOptions: { label: string; value: number }[] = [];
    cols: Column[] = [];

    @ViewChild('dt') dt!: Table;

    constructor(
        private comboService: ComboService,
        private locationService: LocationService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {}

    ngOnInit() {
        this.cols = [
            { field: 'name',         header: 'Tên combo' },
            { field: 'locationName', header: 'Chi nhánh' },
            { field: 'totalPrice',   header: 'Giá combo' },
            { field: 'serviceCount', header: 'Số dịch vụ' },
            { field: 'status',       header: 'Trạng thái' },
        ];
        this.loadLocations();
        this.loadCombos();
        this.loadAllServices();
    }

    // ── Locations ──────────────────────────────────────────────────────────────
    loadLocations() {
        this.locationService.searchLocations({ page: 0, size: 100 }).subscribe({
            next: (res) => {
                if (res.code === 200) {
                    this.locationOptions = res.data.content.map(l => ({
                        label: l.name ?? '',
                        value: l.id
                    }));
                    this.cdr.markForCheck();
                }
            }
        });
    }

    // ── Combos ─────────────────────────────────────────────────────────────────
    loadCombos(page = 0, size = this.pageSize, name?: string, locationId?: number | null) {
        this.loading = true;
        this.comboService.searchCombos({ page, size, name, locationId }).subscribe({
            next: (res) => {
                if (res.data) {
                    this.combos.set(res.data.content);
                    this.totalRecords = res.data.totalElements;
                }
                this.loading = false;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách combo', life: 3000 });
                this.loading = false;
            }
        });
    }

    onLazyLoad(event: any) {
        const page = event.first / event.rows;
        this.currentPage = page;
        this.pageSize = event.rows;
        this.loadCombos(page, event.rows, this.searchKeyword || undefined, this.selectedLocationId);
    }

    onSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.loadCombos(0, this.pageSize, this.searchKeyword || undefined, this.selectedLocationId);
        }, 400);
    }

    onLocationChange(event: any) {
        this.selectedLocationId = event.value;
        this.loadCombos(0, this.pageSize, this.searchKeyword || undefined, this.selectedLocationId);
        if (this.dt) this.dt.reset();
    }

    // ── Services (picker) ──────────────────────────────────────────────────────
    loadAllServices() {
        this.comboService.searchServices({ page: 0, size: 200 }).subscribe({
            next: (res) => {
                if (res.data) {
                    this.allServices.set(res.data.content);
                    this._filteredServices = res.data.content;
                }
            }
        });
    }

    filteredServices(): ServiceItem[] {
        const kw = this.serviceSearchKeyword.toLowerCase().trim();
        if (!kw) return this.allServices();
        return this.allServices().filter(s => s.name.toLowerCase().includes(kw));
    }

    onServiceSearch() {
        // filteredServices() is computed so just trigger CD
        this.cdr.markForCheck();
    }

    toggleServiceNew(svc: ServiceItem) {
        if (this.newSelectedServiceIds.has(svc.id)) {
            this.newSelectedServiceIds.delete(svc.id);
        } else {
            this.newSelectedServiceIds.add(svc.id);
        }
        this.newSelectedServiceIds = new Set(this.newSelectedServiceIds); // trigger change detection
    }

    toggleServiceEdit(svc: ServiceItem) {
        if (this.editSelectedServiceIds.has(svc.id)) {
            this.editSelectedServiceIds.delete(svc.id);
        } else {
            this.editSelectedServiceIds.add(svc.id);
        }
        this.editSelectedServiceIds = new Set(this.editSelectedServiceIds);
    }

    calcSelectedTotal(ids: Set<number>): number {
        return this.allServices()
            .filter(s => ids.has(s.id))
            .reduce((sum, s) => sum + (s.basePrice ?? 0), 0);
    }

    // ── Create ─────────────────────────────────────────────────────────────────
    openNew() {
        this.newCombo = { code: this.generateUUID() };
        this.newComboActive = true;
        this.newSelectedServiceIds = new Set();
        this.serviceSearchKeyword = '';
        this.submitted = false;
        this.createDialog = true;
    }

    hideCreateDialog() {
        this.createDialog = false;
        this.submitted = false;
    }

    saveNewCombo() {
        this.submitted = true;
        if (!this.newCombo.name?.trim()) return;

        this.saving = true;
        const payload = {
            code:        this.newCombo.code!,
            name:        this.newCombo.name!,
            description: this.newCombo.description,
            imageUrl:    this.newCombo.imageUrl,
            locationId:  this.newCombo.locationId,
            serviceIds:  [...this.newSelectedServiceIds],
            status:      this.newComboActive ? 'ACTIVE' : 'INACTIVE'
        };

        this.comboService.createCombo(payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm combo mới', life: 3000 });
                this.createDialog = false;
                this.saving = false;
                this.loadCombos(this.currentPage, this.pageSize, this.searchKeyword || undefined, this.selectedLocationId);
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể thêm combo', life: 3000 });
                this.saving = false;
            }
        });
    }

    // ── Edit ───────────────────────────────────────────────────────────────────
    editCombo(combo: Combo) {
        this.editedCombo = { ...combo };
        this.editedComboActive = combo.status !== 'INACTIVE';
        this.editSelectedServiceIds = new Set(combo.services?.map(s => s.id) ?? []);
        this.serviceSearchKeyword = '';
        this.editSubmitted = false;
        this.editDialog = true;
    }

    hideEditDialog() {
        this.editDialog = false;
        this.editSubmitted = false;
    }

    saveEditCombo() {
        this.editSubmitted = true;
        if (!this.editedCombo.name?.trim()) return;

        this.saving = true;
        const payload = {
            code:        this.editedCombo.code ?? this.generateUUID(),
            name:        this.editedCombo.name!,
            description: this.editedCombo.description,
            imageUrl:    this.editedCombo.imageUrl,
            locationId:  this.editedCombo.locationId,
            serviceIds:  [...this.editSelectedServiceIds],
        };

        const currentlyActive = this.editedCombo.status !== 'INACTIVE';
        const needsStatusChange = this.editedComboActive !== currentlyActive;

        this.comboService.updateCombo(this.editedCombo.id!, payload).subscribe({
            next: () => {
                if (needsStatusChange) {
                    this.comboService.changeStatus(this.editedCombo.id!).subscribe({
                        next: () => this.afterSaveEdit(),
                        error: () => this.afterSaveEdit()
                    });
                } else {
                    this.afterSaveEdit();
                }
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật combo', life: 3000 });
                this.saving = false;
            }
        });
    }

    private afterSaveEdit() {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật combo', life: 3000 });
        this.editDialog = false;
        this.saving = false;
        this.loadCombos(this.currentPage, this.pageSize, this.searchKeyword || undefined, this.selectedLocationId);
    }

    // ── Detail ─────────────────────────────────────────────────────────────────
    viewDetail(combo: Combo) {
        this.detailCombo = null;
        this.loadingDetail = true;
        this.detailDialog = true;

        this.comboService.getComboById(combo.id).subscribe({
            next: (res) => {
                if (res.data) this.detailCombo = res.data;
                this.loadingDetail = false;
            },
            error: () => {
                // Fallback: show data from list
                this.detailCombo = combo;
                this.loadingDetail = false;
            }
        });
    }

    // ── Delete ─────────────────────────────────────────────────────────────────
    confirmDelete(combo: Combo) {
        this.confirmationService.confirm({
            message: `Bạn có chắc muốn xoá combo <strong>${combo.name}</strong>?`,
            header: 'Xác nhận xoá',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Xoá',
            rejectLabel: 'Hủy',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => {
                this.comboService.deleteCombo(combo.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xoá combo', life: 3000 });
                        this.loadCombos(this.currentPage, this.pageSize, this.searchKeyword || undefined, this.selectedLocationId);
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể xoá combo', life: 3000 });
                    }
                });
            }
        });
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    formatPrice(price: number | undefined): string {
        if (!price && price !== 0) return '-';
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    }

    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
}