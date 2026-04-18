import { Component, OnInit, signal, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
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
import { Service, ServiceService } from '../service/service.service';
import { LocationService } from '../service/location.service';
import { Router } from '@angular/router';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-services',
    standalone: true,
    imports: [
        CommonModule,
        TableModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        SelectModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        TextareaModule,
        ToggleSwitchModule,
        InputNumberModule
    ],
    template: `
        <div class="card">
            <p-toast />

            <!-- Thanh tìm kiếm + nút thêm -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <p-iconfield class="flex-1" style="max-width: 420px;">
                        <p-inputicon styleClass="pi pi-search" />
                        <input
                            pInputText
                            type="text"
                            [(ngModel)]="searchKeyword"
                            (input)="onSearch()"
                            placeholder="Tìm kiếm dịch vụ..."
                            class="w-full"
                        />
                    </p-iconfield>
                    <p-select *ngIf="!isSale"
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
                    *ngIf="canEditService"
                    label="Thêm dịch vụ"
                    icon="pi pi-plus"
                    severity="primary"
                    (onClick)="openNew()"
                />
            </div>

            <!-- Bảng danh sách -->
            <div class="surface-card border-round-xl shadow-1 overflow-hidden">
                <div class="px-4 pt-4 pb-3 border-bottom-1 surface-border">
                    <div class="text-xl font-bold text-900">Danh sách dịch vụ</div>
                    <div class="text-sm text-500 mt-1">Quản lý các dịch vụ tiệc cưới</div>
                </div>

                <p-table
                    #dt
                    [value]="services()"
                    [rows]="pageSize"
                    [columns]="cols"
                    [paginator]="true"
                    [totalRecords]="totalRecords"
                    [lazy]="true"
                    (onLazyLoad)="onLazyLoad($event)"
                    [tableStyle]="{ 'min-width': '60rem' }"
                    [rowHover]="true"
                    dataKey="id"
                    currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} dịch vụ"
                    [showCurrentPageReport]="true"
                    [rowsPerPageOptions]="[10, 20, 30]"
                    [loading]="loading"
                    styleClass="p-datatable-sm"
                >
                    <ng-template #header>
                        <tr>
                            <th style="min-width:20rem">Tên dịch vụ</th>
                            <th style="min-width:10rem">Chi nhánh</th>
                            <th pSortableColumn="basePrice" style="min-width:10rem">
                                Giá <p-sortIcon field="basePrice" />
                            </th>
                            <th style="min-width:8rem">Đơn vị</th>
                            <th style="min-width:8rem">Trạng thái</th>
                            <th style="min-width:8rem">Thao tác</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-service>
                        <tr>
                            <td>
                                <div class="flex items-center gap-3">
                                    <div class="flex items-center justify-center w-8 h-8 border-round-lg"
                                         style="background: linear-gradient(135deg, #f3e8ff, #ede9fe); color: #7c3aed;">
                                        <i class="pi pi-sparkles text-sm"></i>
                                    </div>
                                    <span class="font-medium text-900">{{ service.name }}</span>
                                </div>
                            </td>
              
                            <td class="text-600">{{ service.locationName || getLocationName(service.locationId) }}</td>
                            <td class="font-semibold text-900">
                                {{ formatPrice(service.basePrice) }}
                            </td>
                            <td class="text-600">{{ service.unit || '-' }}</td>
                            <td>
                                <span class="font-medium"
                                                                            [style.color]="isInactiveStatus(service.status) ? '#ef4444' : '#22c55e'">
                                                                        {{ isInactiveStatus(service.status) ? 'Không hoạt động' : 'Hoạt động' }}
                                </span>
                            </td>
                            <td>
                                <p-button
                                    icon="pi pi-eye"
                                    [rounded]="true"
                                    [text]="true"
                                    severity="secondary"
                                    (click)="viewDetail(service)"
                                    pTooltip="Xem chi tiết"
                                    tooltipPosition="top"
                                />
                                <p-button
                                    *ngIf="canEditService"
                                    icon="pi pi-pencil"
                                    [rounded]="true"
                                    [text]="true"
                                    severity="secondary"
                                    (click)="editService(service)"
                                    pTooltip="Chỉnh sửa"
                                    tooltipPosition="top"
                                />
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="7" class="text-center py-8 text-500">
                                <i class="pi pi-inbox text-4xl mb-3 block"></i>
                                Không có dịch vụ nào
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>

            <!-- Dialog Thêm mới -->
            <p-dialog
                [(visible)]="createDialog"
                [style]="{ width: '520px' }"
                header="Thêm dịch vụ mới"
                [modal]="true"
                styleClass="p-fluid"
            >
                <ng-template #content>
                    <div class="text-sm text-500 mb-5">Thêm dịch vụ mới vào hệ thống</div>
                    <div class="flex flex-col gap-5">

                        <div>
                            <label class="block font-semibold mb-2 text-sm">
                                Tên dịch vụ <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                pInputText
                                [(ngModel)]="newService.name"
                                required
                                fluid
                                placeholder="VD: Trang trí bàn tiệc"
                                [class.ng-invalid]="submitted && !newService.name"
                                [class.ng-dirty]="submitted && !newService.name"
                            />
                            <small class="text-red-500" *ngIf="submitted && !newService.name">
                                Tên dịch vụ là bắt buộc.
                            </small>
                        </div>

                     

                        <div>
                            <label class="block font-semibold mb-2 text-sm">
                                Chi nhánh <span class="text-red-500">*</span>
                            </label>
                            <p-select
                                [(ngModel)]="newService.locationId"
                                [options]="locationOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Chọn chi nhánh..."
                                fluid
                                [class.ng-invalid]="submitted && !newService.locationId"
                            />
                            <small class="text-red-500" *ngIf="submitted && !newService.locationId">
                                Chi nhánh là bắt buộc.
                            </small>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-semibold mb-2 text-sm">Giá (VNĐ)</label>
                                <p-inputnumber
                                    [(ngModel)]="newService.basePrice"
                                    [min]="0"
                                    fluid
                                    [useGrouping]="false"
                                />
                            </div>
                            <div>
                                <label class="block font-semibold mb-2 text-sm">Đơn vị</label>
                                <input
                                    type="text"
                                    pInputText
                                    [(ngModel)]="newService.unit"
                                    fluid
                                    placeholder="gói, buổi, tiết mục..."
                                />
                            </div>
                        </div>

                        <div>
                            <label class="block font-semibold mb-2 text-sm">Mô tả</label>
                            <textarea
                                pTextarea
                                [(ngModel)]="newService.description"
                                rows="3"
                                fluid
                                placeholder="Mô tả chi tiết về dịch vụ..."
                                class="w-full"
                            ></textarea>
                        </div>

                        <div>
                            <label class="block font-semibold mb-2 text-sm">
                                File video (mp4) <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                accept="video/mp4"
                                (change)="onCreateVideoSelected($event)"
                                class="w-full p-2 border-1 surface-border border-round"
                            />
                            <small class="text-500" *ngIf="selectedCreateVideoName">Đã chọn: {{ selectedCreateVideoName }}</small>
                            <small class="text-red-500 block" *ngIf="submitted && !selectedCreateVideoFile">
                                Vui lòng chọn file video mp4.
                            </small>
                        </div>

                        <div class="flex items-center justify-between py-2 px-3 border-round"
                             style="background: #f8fafc; border: 1px solid #e2e8f0;">
                            <span class="font-semibold text-sm text-700">Trạng thái hoạt động</span>
                            <p-toggleswitch [(ngModel)]="newServiceActive" />
                        </div>
                    </div>
                </ng-template>

                <ng-template #footer>
                    <div class="flex justify-end gap-2">
                        <p-button label="Hủy" icon="pi pi-times" text (click)="hideCreateDialog()" />
                        <p-button
                            label="Thêm mới"
                            icon="pi pi-check"
                            severity="primary"
                            (click)="saveNewService()"
                            [loading]="saving"
                        />
                    </div>
                </ng-template>
            </p-dialog>

            <!-- Dialog Chỉnh sửa -->
            <p-dialog
                [(visible)]="editDialog"
                [style]="{ width: '520px' }"
                header="Chỉnh sửa dịch vụ"
                [modal]="true"
                styleClass="p-fluid"
            >
                <ng-template #content>
                    <div class="text-sm text-500 mb-5">Cập nhật thông tin dịch vụ</div>
                    <div class="flex flex-col gap-5">

                        <div>
                            <label class="block font-semibold mb-2 text-sm">
                                Tên dịch vụ <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                pInputText
                                [(ngModel)]="editedService.name"
                                required
                                fluid
                                [class.ng-invalid]="editSubmitted && !editedService.name"
                                [class.ng-dirty]="editSubmitted && !editedService.name"
                            />
                            <small class="text-red-500" *ngIf="editSubmitted && !editedService.name">
                                Tên dịch vụ là bắt buộc.
                            </small>
                        </div>


                        <div>
                            <label class="block font-semibold mb-2 text-sm">
                                Chi nhánh <span class="text-red-500">*</span>
                            </label>
                            <p-select
                                [(ngModel)]="editedService.locationId"
                                [options]="locationOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Chọn chi nhánh..."
                                fluid
                                [class.ng-invalid]="editSubmitted && !editedService.locationId"
                            />
                            <small class="text-red-500" *ngIf="editSubmitted && !editedService.locationId">
                                Chi nhánh là bắt buộc.
                            </small>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-semibold mb-2 text-sm">Giá (VNĐ)</label>
                                <p-inputnumber
                                    [(ngModel)]="editedService.basePrice"
                                    [min]="0"
                                    fluid
                                    [useGrouping]="false"
                                />
                            </div>
                            <div>
                                <label class="block font-semibold mb-2 text-sm">Đơn vị</label>
                                <input
                                    type="text"
                                    pInputText
                                    [(ngModel)]="editedService.unit"
                                    fluid
                                />
                            </div>
                        </div>

                        <div>
                            <label class="block font-semibold mb-2 text-sm">Mô tả</label>
                            <textarea
                                pTextarea
                                [(ngModel)]="editedService.description"
                                rows="3"
                                fluid
                                class="w-full"
                            ></textarea>
                        </div>

                        <div>
                            <label class="block font-semibold mb-2 text-sm">Video mới (mp4, không bắt buộc)</label>
                            <input
                                type="file"
                                accept="video/mp4"
                                (change)="onEditVideoSelected($event)"
                                class="w-full p-2 border-1 surface-border border-round"
                            />
                            <small class="text-500" *ngIf="selectedEditVideoName">Đã chọn: {{ selectedEditVideoName }}</small>
                        </div>

                        <div class="video-preview-grid">
                            <div class="video-preview-card" *ngIf="editedService?.videoUrl">
                                <div class="video-preview-title">Video hiện tại</div>
                                <video class="video-preview-player" [src]="editedService?.videoUrl" controls preload="metadata"></video>
                            </div>

                            <div class="video-preview-card" *ngIf="selectedEditVideoPreviewUrl">
                                <div class="video-preview-title">Video sau khi cập nhật</div>
                                <video class="video-preview-player" [src]="selectedEditVideoPreviewUrl" controls preload="metadata"></video>
                            </div>
                        </div>

                        <div class="flex items-center justify-between py-2 px-3 border-round"
                             style="background: #f8fafc; border: 1px solid #e2e8f0;">
                            <span class="font-semibold text-sm text-700">Trạng thái hoạt động</span>
                            <p-toggleswitch
                                [(ngModel)]="editedServiceActive"
                            />
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
                            (click)="saveEditService()"
                            [loading]="saving"
                        />
                    </div>
                </ng-template>
            </p-dialog>

            <p-confirmdialog />
        </div>
    `,
    styles: [`
        .video-preview-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
        }

        .video-preview-card {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: white;
            padding: 0.6rem;
        }

        .video-preview-title {
            font-size: 0.78rem;
            font-weight: 600;
            color: #475569;
            margin-bottom: 0.45rem;
        }

        .video-preview-player {
            width: 100%;
            max-height: 140px;
            border-radius: 8px;
            background: #020617;
        }

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

        @media (max-width: 768px) {
            .video-preview-grid {
                grid-template-columns: 1fr;
            }
        }
    `],
    providers: [MessageService, ServiceService, ConfirmationService, LocationService]
})
export class ServicesComponent implements OnInit {
    services = signal<Service[]>([]);
    loading = false;
    saving = false;
    totalRecords = 0;
    pageSize = 20;
    currentPage = 0;
    searchKeyword = '';
    searchTimeout: any;
    selectedLocationId: number | null = null;

    // Dialog states
    createDialog = false;
    editDialog = false;
    submitted = false;
    editSubmitted = false;

    // Form models
    newService: Partial<Service> = { basePrice: 0, unit: 'gói' };
    newServiceActive = true;
    selectedCreateVideoFile: File | null = null;
    selectedCreateVideoName = '';
    selectedEditVideoFile: File | null = null;
    selectedEditVideoName = '';
    selectedEditVideoPreviewUrl: string | null = null;
    editedService: Partial<Service> = {};
    editedServiceActive = true;
    readonly roleCode = (localStorage.getItem('codeRole') ?? '').toUpperCase();
    readonly canEditService = this.roleCode.includes('ADMIN') || this.roleCode.includes('MANAGER');
    isSale = localStorage.getItem('codeRole') === 'SALE';

    // Options
    locationOptions: { label: string; value: number }[] = [];

    cols: Column[] = [];

    categories = [
        { label: 'Trang trí',              value: 'trang_tri' },
        { label: 'Âm thanh & Ánh sáng',   value: 'am_thanh_anh_sang' },
        { label: 'MC & Ca sĩ',             value: 'mc_ca_si' },
        { label: 'Chụp ảnh & Quay phim',  value: 'chup_anh_quay_phim' },
        { label: 'Hoa tươi',               value: 'hoa_tuoi' },
        { label: 'Lễ vật',                 value: 'le_vat' },
        { label: 'Khác',                   value: 'khac' }
    ];

    @ViewChild('dt') dt!: Table;

    constructor(
        private serviceService: ServiceService,
        private locationService: LocationService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) {}

    ngOnInit() {
        if (this.isSale) {
            const locId = localStorage.getItem('locationId');
            if (locId) this.selectedLocationId = Number(locId);
        }
        this.cols = [
            { field: 'name',       header: 'Tên dịch vụ' },
            { field: 'locationId', header: 'Chi nhánh' },
            { field: 'basePrice',  header: 'Giá' },
            { field: 'unit',       header: 'Đơn vị' },
            { field: 'status',     header: 'Trạng thái' }
        ];
        this.loadLocations();
        this.loadServices();
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

    getLocationName(locationId?: number): string {
        if (!locationId) return '-';
        return this.locationOptions.find(l => l.value === locationId)?.label ?? '-';
    }

    getCategoryLabel(code?: string): string {
        if (!code) return '-';
        return this.categories.find(c => c.value === code)?.label ?? code;
    }

    // ── Services ───────────────────────────────────────────────────────────────
    loadServices(page = 0, size = this.pageSize, name?: string, locationId?: number | null) {
        this.loading = true;
        const params: any = { page, size, name };
        if (locationId) params.locationId = locationId;
        this.serviceService.searchServices(params).subscribe({
            next: (res) => {
                if (res.data) {
                    this.services.set(res.data.content);
                    this.totalRecords = res.data.totalElements;
                }
                this.loading = false;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách dịch vụ', life: 3000 });
                this.loading = false;
            }
        });
    }

    onLazyLoad(event: any) {
        const page = event.first / event.rows;
        this.currentPage = page;
        this.pageSize = event.rows;
        this.loadServices(page, event.rows, this.searchKeyword || undefined, this.selectedLocationId);
    }

    onSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.loadServices(0, this.pageSize, this.searchKeyword || undefined, this.selectedLocationId);
        }, 400);
    }

    onLocationChange(event: any) {
        this.selectedLocationId = event.value;
        this.loadServices(0, this.pageSize, this.searchKeyword || undefined, this.selectedLocationId);
        if (this.dt) {
            this.dt.reset();
        }
    }

    // ── Create ─────────────────────────────────────────────────────────────────
    openNew() {
    if (!this.canEditService) return;
    this.newService = { 
        basePrice: 0, 
        unit: 'gói',
        code: this.generateUUID()  // ← tự gen UUID
    };
    this.selectedCreateVideoFile = null;
    this.selectedCreateVideoName = '';
    this.newServiceActive = true;
    this.submitted = false;
    this.createDialog = true;
}
private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}

    hideCreateDialog() {
        this.createDialog = false;
        this.submitted = false;
        this.selectedCreateVideoFile = null;
        this.selectedCreateVideoName = '';
    }

    onCreateVideoSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        this.selectedCreateVideoFile = file;
        this.selectedCreateVideoName = file?.name ?? '';
    }

    saveNewService() {
        if (!this.canEditService) return;
        this.submitted = true;
        if (!this.newService.name?.trim() || !this.newService.locationId || !this.selectedCreateVideoFile) return;

        this.saving = true;
     // Payload trong saveNewService() — giữ nguyên, code đã có sẵn trong newService
const payload = {
    code:        this.newService.code,  // ← UUID đã được gen sẵn
    name:        this.newService.name!,
    description: this.newService.description,
    unit:        this.newService.unit,
    basePrice:   this.newService.basePrice ?? 0,
    locationId:  this.newService.locationId
};

        this.serviceService.createService(payload, this.selectedCreateVideoFile).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm dịch vụ mới', life: 3000 });
                this.createDialog = false;
                this.saving = false;
                this.selectedCreateVideoFile = null;
                this.selectedCreateVideoName = '';
                this.loadServices(this.currentPage, this.pageSize, this.searchKeyword || undefined, this.selectedLocationId);
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể thêm dịch vụ', life: 3000 });
                this.saving = false;
            }
        });
    }

    // ── Edit ───────────────────────────────────────────────────────────────────
    viewDetail(service: Service) {
        if (!service?.id) return;
        this.router.navigate(['/pages/service', service.id]);
    }

    editService(service: Service) {
        if (!this.canEditService) return;
        this.editedService = { ...service };
        this.selectedEditVideoFile = null;
        this.selectedEditVideoName = '';
        this.clearEditVideoPreview();
        this.editedServiceActive = !this.isInactiveStatus(service.status);
        this.editSubmitted = false;
        this.editDialog = true;
    }

    hideEditDialog() {
        this.editDialog = false;
        this.editSubmitted = false;
        this.selectedEditVideoFile = null;
        this.selectedEditVideoName = '';
        this.clearEditVideoPreview();
    }

    onEditVideoSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        this.selectedEditVideoFile = file;
        this.selectedEditVideoName = file?.name ?? '';
        this.clearEditVideoPreview();
        if (file) {
            this.selectedEditVideoPreviewUrl = URL.createObjectURL(file);
        }
    }

    private clearEditVideoPreview() {
        if (this.selectedEditVideoPreviewUrl) {
            URL.revokeObjectURL(this.selectedEditVideoPreviewUrl);
        }
        this.selectedEditVideoPreviewUrl = null;
    }

    saveEditService() {
        if (!this.canEditService) return;
        this.editSubmitted = true;
        if (!this.editedService.name?.trim() || !this.editedService.locationId) return;

        this.saving = true;

    const updatePayload = {
    code:        this.editedService.code ?? this.generateUUID(), // ← fallback nếu record cũ không có code
    name:        this.editedService.name,
    description: this.editedService.description,
    unit:        this.editedService.unit,
    basePrice:   this.editedService.basePrice,
    locationId:  this.editedService.locationId
};

        const currentlyActive = !this.isInactiveStatus(this.editedService.status);
        const needsStatusChange = this.editedServiceActive !== currentlyActive;

        this.serviceService.updateService(
            this.editedService.id,
            updatePayload,
            this.selectedEditVideoFile ?? undefined
        ).subscribe({
            next: () => {
                if (needsStatusChange) {
                    this.serviceService.changeStatus(this.editedService.id).subscribe({
                        next: () => this.afterSaveEdit(),
                        error: () => this.afterSaveEdit()
                    });
                } else {
                    this.afterSaveEdit();
                }
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật dịch vụ', life: 3000 });
                this.saving = false;
            }
        });
    }

    private afterSaveEdit() {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật dịch vụ', life: 3000 });
        this.editDialog = false;
        this.selectedEditVideoFile = null;
        this.selectedEditVideoName = '';
        this.clearEditVideoPreview();
        this.saving = false;
        this.loadServices(this.currentPage, this.pageSize, this.searchKeyword || undefined, this.selectedLocationId);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    formatPrice(price: number | undefined): string {
        if (!price && price !== 0) return '-';
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    }

    isInactiveStatus(status?: string): boolean {
        return String(status ?? '').toUpperCase() === 'INACTIVE';
    }
}