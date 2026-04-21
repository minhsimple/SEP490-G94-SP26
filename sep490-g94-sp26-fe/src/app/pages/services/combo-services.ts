import {
    Component, OnInit, signal, computed, ViewChild, ChangeDetectorRef
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
import { TooltipModule } from 'primeng/tooltip';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { LocationService } from '../service/location.service';
import { ServicePackage, ServicePackageService, ServiceResponse } from '../service/service-package.service';
import { ServiceService, Service } from '../service/service.service';

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
        TooltipModule,
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
                        *ngIf="!isSingleLocation"
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
                    *ngIf="canEditCombo"
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
                            <td class="text-600">{{ combo.locationName || getLocationName(combo.locationId) }}</td>

                            <!-- Giá -->
                            <td class="font-semibold text-900">
                                {{ formatPrice(combo.basePrice) }}
                            </td>

                            <!-- Số dịch vụ -->
                            <td>
                                <span
                                    class="px-3 py-1 border-round-xl text-sm font-semibold"
                                    style="background:#eff6ff; color:#3b82f6;"
                                >
                                    {{ combo.serviceResponseList?.length ?? 0 }} dịch vụ
                                </span>
                            </td>

                            <!-- Trạng thái -->
                            <td>
                                <span class="font-medium"
                                      [style.color]="combo.status === 'active' ? '#22c55e' : '#ef4444'">
                                    {{ combo.status === 'active' ? 'Cung cấp' : 'Không hoạt động' }}
                                </span>
                            </td>

                            <!-- Thao tác -->
                            <td>
                                <div class="flex items-center gap-1">
                                    <p-button
                                        *ngIf="combo.status === 'active'"
                                        icon="pi pi-eye"
                                        [rounded]="true"
                                        [text]="true"
                                        severity="secondary"
                                        (click)="viewDetail(combo)"
                                        pTooltip="Xem chi tiết"
                                        tooltipPosition="top"
                                    />
                                    <p-button
                                        *ngIf="combo.status === 'active' && canEditCombo"
                                        icon="pi pi-pencil"
                                        [rounded]="true"
                                        [text]="true"
                                        severity="secondary"
                                        (click)="editCombo(combo)"
                                        pTooltip="Chỉnh sửa"
                                        tooltipPosition="top"
                                    />
                                    <p-button
                                        *ngIf="canEditCombo"
                                        [icon]="combo.status === 'active' ? 'pi pi-ban' : 'pi pi-check-circle'"
                                        [rounded]="true"
                                        [text]="true"
                                        [severity]="combo.status === 'active' ? 'danger' : 'success'"
                                        (click)="confirmChangeStatus(combo)"
                                        [pTooltip]="combo.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'"
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
                                    (ngModelChange)="onCreateLocationChange()"
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
                                    [ngModel]="serviceSearchKeyword()"
                                    (ngModelChange)="onServiceSearchChange($event)"
                                    placeholder="Tìm dịch vụ..."
                                    class="w-full"
                                />
                            </p-iconfield>
                            <div class="overflow-y-auto flex-1 border-round"
                                 style="border:1px solid #e2e8f0; max-height:400px;">
                                <div *ngFor="let svc of filteredServicesForCreate()"
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
                                <div *ngIf="filteredServicesForCreate().length === 0"
                                     class="text-center py-8 text-500 text-sm">
                                    <i class="pi pi-inbox text-2xl mb-2 block"></i>
                                    <div *ngIf="!newCombo.locationId">Vui lòng chọn chi nhánh để xem danh sách dịch vụ</div>
                                    <div *ngIf="newCombo.locationId">Không tìm thấy dịch vụ</div>
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
                                    (ngModelChange)="onEditLocationChange()"
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
                                    [ngModel]="serviceSearchKeyword()"
                                    (ngModelChange)="onServiceSearchChange($event)"
                                    placeholder="Tìm dịch vụ..."
                                    class="w-full"
                                />
                            </p-iconfield>
                            <div class="overflow-y-auto flex-1 border-round"
                                 style="border:1px solid #e2e8f0; max-height:400px;">
                                <div *ngFor="let svc of filteredServicesForEdit()"
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
                                <div *ngIf="filteredServicesForEdit().length === 0"
                                     class="text-center py-8 text-500 text-sm">
                                    <i class="pi pi-inbox text-2xl mb-2 block"></i>
                                    <div *ngIf="!editedCombo.locationId">Vui lòng chọn chi nhánh để xem danh sách dịch vụ</div>
                                    <div *ngIf="editedCombo.locationId">Không tìm thấy dịch vụ</div>
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
    providers: [MessageService, ServiceService, ConfirmationService, LocationService]
})
export class CombosComponent implements OnInit {
    readonly roleCode = (localStorage.getItem('codeRole') ?? '').toUpperCase();
    readonly isAdmin = this.roleCode.includes('ADMIN');
    readonly isManager = this.roleCode.includes('MANAGER');
    readonly canEditCombo = this.isAdmin || this.isManager;
    readonly isSingleLocation = !this.isAdmin && !this.isManager;
    readonly myLocationId = this.isSingleLocation ? this.getPrimaryLocationIdFromStorage() : null;
    readonly managerLocationIds: number[] = (() => {
        if (!this.isManager) return [];
        return this.getLocationIdsFromStorage();
    })();

    combos = signal<ServicePackage[]>([]);
    loading = false;
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
    submitted = false;
    editSubmitted = false;

    // Form models
    newCombo: Partial<ServicePackage> = {};
    newComboActive = true;
    newSelectedServiceIds = new Set<number>();

    editedCombo: Partial<ServicePackage> = {};
    editedComboActive = true;
    editSelectedServiceIds = new Set<number>();

    // Services for picker
    allServices = signal<Service[]>([]);
    serviceSearchKeyword = signal('');
    _filteredServices: Service[] = [];

    locationOptions: { label: string; value: number }[] = [];
    cols: Column[] = [];

    @ViewChild('dt') dt!: Table;

    constructor(
        private servicePackageService: ServicePackageService,
        private serviceService: ServiceService,
        private locationService: LocationService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        if (this.isSingleLocation && this.myLocationId) {
            this.selectedLocationId = this.myLocationId;
        } else if (this.isManager && this.managerLocationIds.length > 0) {
            this.selectedLocationId = this.managerLocationIds[0];
        }

        this.cols = [
            { field: 'name',         header: 'Tên combo' },
            { field: 'locationName', header: 'Chi nhánh' },
            { field: 'basePrice',    header: 'Giá combo' },
            { field: 'serviceCount', header: 'Số dịch vụ' },
            { field: 'status',       header: 'Trạng thái' },
        ];
        this.loadLocations();
        this.loadCombos();
        this.loadAllServices();

        // Check for edit query param (e.g., from detail page)
        this.route.queryParams.subscribe(params => {
            if (params['edit']) {
                const editId = +params['edit'];
                // Wait for combos to load, then open edit dialog
                setTimeout(() => {
                    const comboToEdit = this.combos().find(c => c.id === editId);
                    if (comboToEdit && this.canEditCombo) {
                        this.editCombo(comboToEdit);
                        // Clear query param
                        this.router.navigate([], { 
                            relativeTo: this.route, 
                            queryParams: {}, 
                            replaceUrl: true 
                        });
                    }
                }, 500);
            }
        });
    }

    // ── Locations ──────────────────────────────────────────────────────────────
    loadLocations() {
        this.locationService.searchLocations({ page: 0, size: 100 }).subscribe({
            next: (res) => {
                if (res.code === 200) {
                    const allLocOpts = res.data.content.map(l => ({ label: l.name ?? '', value: l.id }));
                    this.locationOptions = this.isManager
                        ? allLocOpts.filter(l => this.managerLocationIds.includes(Number(l.value)))
                        : allLocOpts;
                    if (this.isManager && this.managerLocationIds.length > 0 && !this.selectedLocationId) {
                        this.selectedLocationId = this.managerLocationIds[0];
                    }
                    this.cdr.markForCheck();
                }
            }
        });
    }

    // ── Combos ─────────────────────────────────────────────────────────────────
    loadCombos(page = 0, size = this.pageSize, name?: string, locationId?: number | null) {
        this.loading = true;
        const effectiveLocationId = this.isSingleLocation
            ? (this.myLocationId ?? undefined)
            : this.isManager
                ? (locationId ?? this.managerLocationIds[0] ?? undefined)
                : (locationId ?? undefined);
        this.servicePackageService.searchServicePackages({ 
            page, 
            size, 
            name, 
            locationId: effectiveLocationId ?? undefined,
            status: undefined // can filter by status if needed
        }).subscribe({
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
        if (this.isSingleLocation) {
            return;
        }
        this.selectedLocationId = event.value;
        if (this.isManager && !this.selectedLocationId) {
            this.selectedLocationId = this.managerLocationIds[0] ?? null;
        }
        this.loadCombos(0, this.pageSize, this.searchKeyword || undefined, this.selectedLocationId);
        if (this.dt) this.dt.reset();
    }

    // ── Services (picker) ──────────────────────────────────────────────────────
    loadAllServices() {
        const effectiveLocationId = this.isSingleLocation
            ? this.myLocationId
            : this.isManager
                ? (this.selectedLocationId ?? this.managerLocationIds[0] ?? null)
                : null;

        this.serviceService.searchServices({
            page: 0,
            size: 200,
            locationId: effectiveLocationId ?? undefined,
        }).subscribe({
            next: (res) => {
                if (res.data) {
                    this.allServices.set(res.data.content);
                    this._filteredServices = res.data.content;
                }
            }
        });
    }

    // When location changes in create dialog, remove services from other locations
    onCreateLocationChange() {
        if (!this.newCombo.locationId) {
            // If location cleared, clear all selected services
            this.newSelectedServiceIds.clear();
            this.cdr.markForCheck();
            return;
        }
        
        // Filter out services that don't belong to the selected location
        const validServiceIds = this.allServices()
            .filter(s => s.locationId === this.newCombo.locationId)
            .map(s => s.id!);
        
        this.newSelectedServiceIds = new Set(
            [...this.newSelectedServiceIds].filter(id => validServiceIds.includes(id))
        );
        this.cdr.markForCheck();
    }

    // When location changes in edit dialog, remove services from other locations
    onEditLocationChange() {
        if (!this.editedCombo.locationId) {
            // If location cleared, clear all selected services
            this.editSelectedServiceIds.clear();
            this.cdr.markForCheck();
            return;
        }
        
        // Filter out services that don't belong to the selected location
        const validServiceIds = this.allServices()
            .filter(s => s.locationId === this.editedCombo.locationId)
            .map(s => s.id!);
        
        this.editSelectedServiceIds = new Set(
            [...this.editSelectedServiceIds].filter(id => validServiceIds.includes(id))
        );
        this.cdr.markForCheck();
    }

    // Getter for filtered services in CREATE dialog
    filteredServicesForCreate(): Service[] {
        if (!this.newCombo.locationId) {
            return [];
        }
        
        const kw = this.serviceSearchKeyword().toLowerCase().trim();
        let services = this.allServices().filter(s => s.locationId === this.newCombo.locationId);
        
        if (kw) {
            services = services.filter(s => s.name?.toLowerCase().includes(kw));
        }
        
        return services;
    }

    // Getter for filtered services in EDIT dialog
    filteredServicesForEdit(): Service[] {
        if (!this.editedCombo.locationId) {
            return [];
        }
        
        const kw = this.serviceSearchKeyword().toLowerCase().trim();
        let services = this.allServices().filter(s => s.locationId === this.editedCombo.locationId);
        
        if (kw) {
            services = services.filter(s => s.name?.toLowerCase().includes(kw));
        }
        
        return services;
    }

    // Handle service search keyword change with change detection
    onServiceSearchChange(keyword: string) {
        this.serviceSearchKeyword.set(keyword);
        // Force immediate change detection with setTimeout
        setTimeout(() => {
            this.cdr.detectChanges();
        }, 0);
    }

    toggleServiceNew(svc: Service) {
        if (this.newSelectedServiceIds.has(svc.id!)) {
            this.newSelectedServiceIds.delete(svc.id!);
        } else {
            this.newSelectedServiceIds.add(svc.id!);
        }
        this.newSelectedServiceIds = new Set(this.newSelectedServiceIds); // trigger change detection
        this.cdr.markForCheck();
    }

    toggleServiceEdit(svc: Service) {
        if (this.editSelectedServiceIds.has(svc.id!)) {
            this.editSelectedServiceIds.delete(svc.id!);
        } else {
            this.editSelectedServiceIds.add(svc.id!);
        }
        this.editSelectedServiceIds = new Set(this.editSelectedServiceIds);
        this.cdr.markForCheck();
    }

    calcSelectedTotal(ids: Set<number>): number {
        return this.allServices()
            .filter(s => ids.has(s.id))
            .reduce((sum, s) => sum + (s.basePrice ?? 0), 0);
    }

    // ── Create ─────────────────────────────────────────────────────────────────
    openNew() {
        if (!this.canEditCombo) return;
        this.newCombo = { code: this.generateUUID() };
        this.newComboActive = true;
        this.newSelectedServiceIds = new Set();
        this.serviceSearchKeyword.set('');
        this.submitted = false;
        this.createDialog = true;
    }

    hideCreateDialog() {
        this.createDialog = false;
        this.submitted = false;
    }

    saveNewCombo() {
        if (!this.canEditCombo) return;
        this.submitted = true;
        if (!this.newCombo.name?.trim()) return;

        // Validate at least one service is selected
        if (this.newSelectedServiceIds.size === 0) {
            this.messageService.add({ 
                severity: 'warn', 
                summary: 'Cảnh báo', 
                detail: 'Vui lòng chọn ít nhất một dịch vụ', 
                life: 3000 
            });
            return;
        }

        this.saving = true;
        
        // Convert selected service IDs to serviceList with qty = 1 (default)
        const serviceList = [...this.newSelectedServiceIds].map(serviceId => ({
            serviceId,
            qty: 1 // Default quantity to 1 since UI doesn't allow editing
        }));

        const payload = {
            code:        this.newCombo.code,
            name:        this.newCombo.name!,
            description: this.newCombo.description,
            locationId:  this.newCombo.locationId,
            serviceList
        };

        this.servicePackageService.createServicePackage(payload).subscribe({
            next: (res) => {
                // After creating, change status if needed
                if (res.data && !this.newComboActive) {
                    // If user wants it inactive, call change-status
                    this.servicePackageService.changeStatus(res.data.id).subscribe({
                        next: (statusRes) => {
                            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm combo mới', life: 3000 });
                            this.createDialog = false;
                            this.saving = false;
                            this.loadCombos(this.currentPage, this.pageSize, this.searchKeyword || undefined, this.selectedLocationId);
                        },
                        error: (err) => {
                            console.error('Change status error:', err);
                            const errorMsg = err?.error?.message || 'Không thể thay đổi trạng thái combo';
                            this.messageService.add({ severity: 'warning', summary: 'Cảnh báo', detail: `Đã thêm combo nhưng ${errorMsg}`, life: 4000 });
                            this.createDialog = false;
                            this.saving = false;
                            this.loadCombos(this.currentPage, this.pageSize, this.searchKeyword || undefined, this.selectedLocationId);
                        }
                    });
                } else {
                    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm combo mới', life: 3000 });
                    this.createDialog = false;
                    this.saving = false;
                    this.loadCombos(this.currentPage, this.pageSize, this.searchKeyword || undefined, this.selectedLocationId);
                }
            },
            error: (err) => {
                console.error('Create combo error:', err);
                const errorMsg = err?.error?.message || 'Không thể thêm combo';
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: errorMsg, life: 3000 });
                this.saving = false;
            }
        });
    }

    // ── Edit ───────────────────────────────────────────────────────────────────
    editCombo(combo: ServicePackage) {
        if (!this.canEditCombo) return;
        this.editedCombo = { ...combo };
        this.editedComboActive = combo.status === 'active';
        this.editSelectedServiceIds = new Set(combo.serviceResponseList?.map(s => s.serviceId) ?? []);
        this.serviceSearchKeyword.set('');
        this.editSubmitted = false;
        this.editDialog = true;
    }

    hideEditDialog() {
        this.editDialog = false;
        this.editSubmitted = false;
    }

    saveEditCombo() {
        if (!this.canEditCombo) return;
        this.editSubmitted = true;
        if (!this.editedCombo.name?.trim()) return;

        this.saving = true;
        
        // Convert selected service IDs to serviceList with qty = 1
        const serviceList = [...this.editSelectedServiceIds].map(serviceId => ({
            serviceId,
            qty: 1
        }));

        const payload = {
            code:        this.editedCombo.code ?? this.generateUUID(),
            name:        this.editedCombo.name!,
            description: this.editedCombo.description,
            locationId:  this.editedCombo.locationId,
            serviceList
        };

        const currentlyActive = this.editedCombo.status === 'active';
        const needsStatusChange = this.editedComboActive !== currentlyActive;

        this.servicePackageService.updateServicePackage(this.editedCombo.id!, payload).subscribe({
            next: () => {
                if (needsStatusChange) {
                    this.servicePackageService.changeStatus(this.editedCombo.id!).subscribe({
                        next: (statusRes) => {
                            this.afterSaveEdit();
                        },
                        error: (err) => {
                            console.error('Change status error:', err);
                            const errorMsg = err?.error?.message || 'Không thể thay đổi trạng thái';
                            this.messageService.add({ severity: 'warning', summary: 'Cảnh báo', detail: `Đã cập nhật combo nhưng ${errorMsg}`, life: 4000 });
                            this.editDialog = false;
                            this.saving = false;
                            this.loadCombos(this.currentPage, this.pageSize, this.searchKeyword || undefined, this.selectedLocationId);
                        }
                    });
                } else {
                    this.afterSaveEdit();
                }
            },
            error: (err) => {
                console.error('Update combo error:', err);
                const errorMsg = err?.error?.message || 'Không thể cập nhật combo';
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: errorMsg, life: 3000 });
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
    viewDetail(combo: ServicePackage) {
        console.log('View detail combo:', combo);
        console.log('Navigating to ID:', combo.id);
        this.router.navigate(['/pages/combo-services', combo.id]);
    }

    // ── Change Status ──────────────────────────────────────────────────────────
    confirmChangeStatus(combo: ServicePackage) {
        if (!this.canEditCombo) return;
        if (!combo || !combo.id) {
            this.messageService.add({ 
                severity: 'error', 
                summary: 'Lỗi', 
                detail: 'Không tìm thấy thông tin combo', 
                life: 3000 
            });
            return;
        }

        const isActive = combo.status === 'active';
        const action = isActive ? 'vô hiệu hóa' : 'kích hoạt';
        const actionCap = isActive ? 'Vô hiệu hóa' : 'Kích hoạt';
        
        this.confirmationService.confirm({
            message: `Bạn có chắc muốn ${action} combo <strong>${combo.name}</strong>?`,
            header: `Xác nhận ${action}`,
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: actionCap,
            rejectLabel: 'Hủy',
            acceptButtonStyleClass: isActive ? 'p-button-danger' : 'p-button-success',
            accept: () => {
                this.servicePackageService.changeStatus(combo.id).subscribe({
                    next: (response) => {
                        // Backend returns updated combo with correct status
                        const newStatus = response.data.status;
                        this.messageService.add({ 
                            severity: 'success', 
                            summary: 'Thành công', 
                            detail: `Đã ${action} combo thành công`, 
                            life: 3000 
                        });
                        // Reload to ensure UI is in sync with backend
                        this.loadCombos(this.currentPage, this.pageSize, this.searchKeyword || undefined, this.selectedLocationId);
                    },
                    error: (err) => {
                        console.error('Change status error:', err);
                        const errorMsg = err?.error?.message || `Không thể ${action} combo`;
                        this.messageService.add({ 
                            severity: 'error', 
                            summary: 'Lỗi', 
                            detail: errorMsg, 
                            life: 3000 
                        });
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

    private getLocationIdsFromStorage(): number[] {
        const fromPrimary = Number(localStorage.getItem('locationId') ?? 0);
        if (Number.isFinite(fromPrimary) && fromPrimary > 0) {
            return [fromPrimary];
        }

        try {
            const parsed = JSON.parse(localStorage.getItem('locationIds') ?? '[]');
            if (!Array.isArray(parsed)) {
                return [];
            }
            const normalized = parsed
                .map((id) => Number(id))
                .filter((id) => Number.isFinite(id) && id > 0);
            return Array.from(new Set(normalized));
        } catch {
            return [];
        }
    }

    private getPrimaryLocationIdFromStorage(): number | null {
        const ids = this.getLocationIdsFromStorage();
        return ids[0] ?? null;
    }

    getLocationName(locationId?: number): string {
        if (!locationId) return '—';
        const location = this.locationOptions.find(l => l.value === locationId);
        return location?.label ?? '—';
    }

    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
}