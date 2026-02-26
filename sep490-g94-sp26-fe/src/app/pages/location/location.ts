import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';
import { Location, LocationService } from '../service/location.service';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-location',
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
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        TextareaModule
    ],
    template: `
        <div class="card">
            <p-toast />

            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <p-button
                        label="Thêm chi nhánh mới"
                        icon="pi pi-plus"
                        severity="primary"
                        class="mr-2"
                        (onClick)="openNew()"
                    />
                    <!-- <p-button
                        severity="danger"
                        label="Xóa"
                        icon="pi pi-trash"
                        outlined
                        (onClick)="deleteSelectedLocations()"
                        [disabled]="!selectedLocations || !selectedLocations.length"
                    /> -->
                </ng-template>

                <ng-template #end>
                    <p-button
                        label="Xuất Excel"
                        icon="pi pi-file-excel"
                        severity="success"
                        (onClick)="exportCSV()"
                    />
                </ng-template>
            </p-toolbar>

            <p-table
                #dt
                [value]="locations()"
                [rows]="pageSize"
                [columns]="cols"
                [paginator]="true"
                [totalRecords]="totalRecords"
                [lazy]="true"
                (onLazyLoad)="onLazyLoad($event)"
                [globalFilterFields]="['code', 'name', 'address', 'notes', 'status']"
                [tableStyle]="{ 'min-width': '75rem' }"
                [(selection)]="selectedLocations"
                [rowHover]="true"
                dataKey="id"
                currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} chi nhánh"
                [showCurrentPageReport]="true"
                [rowsPerPageOptions]="[10, 20, 30]"
                [loading]="loading"
            >
                <ng-template #caption>
                    <div class="flex items-center justify-between">
                        <h2 class="m-0 text-2xl font-bold">Danh sách chi nhánh</h2>
                        <p-iconfield>
                            <p-inputicon styleClass="pi pi-search" />
                            <input
                                pInputText
                                type="text"
                                (input)="onGlobalFilter(dt, $event)"
                                placeholder="Tìm kiếm..."
                            />
                        </p-iconfield>
                    </div>
                </ng-template>

                <ng-template #header>
                    <tr>
                        <th style="width: 3rem">
                            <p-tableHeaderCheckbox />
                        </th>
                        <th pSortableColumn="code" style="min-width:10rem">
                            Mã chi nhánh <p-sortIcon field="code" />
                        </th>
                        <th pSortableColumn="name" style="min-width:14rem">
                            Tên chi nhánh <p-sortIcon field="name" />
                        </th>
                        <th pSortableColumn="address" style="min-width:18rem">
                            Địa chỉ <p-sortIcon field="address" />
                        </th>
                        <th style="min-width:14rem">Ghi chú</th>
                        <th pSortableColumn="status" style="min-width:10rem">
                            Trạng thái <p-sortIcon field="status" />
                        </th>
                        <th pSortableColumn="createdAt" style="min-width:12rem">
                            Ngày tạo <p-sortIcon field="createdAt" />
                        </th>
                        <th style="min-width:12rem">Thao tác</th>
                    </tr>
                </ng-template>

                <ng-template #body let-location>
                    <tr>
                        <td><p-tableCheckbox [value]="location" /></td>
                        <td>
                            <span class="font-mono font-semibold text-blue-600">{{ location.code }}</span>
                        </td>
                        <td>
                            <div class="flex items-center gap-3">
                                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 font-semibold">
                                    <i class="pi pi-map-marker"></i>
                                </div>
                                <span class="font-medium">{{ location.name }}</span>
                            </div>
                        </td>
                        <td>
                            <i class="pi pi-home mr-2 text-gray-400"></i>{{ location.address || '-' }}
                        </td>
                        <td>{{ location.notes || '-' }}</td>
                        <td>
                            <p-tag
                                [value]="getStatusLabel(location.status)"
                                [severity]="getStatusSeverity(location.status)"
                            />
                        </td>
                        <td>{{ location.createdAt | date:'dd/MM/yyyy' }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-pencil"
                                    [rounded]="true"
                                    [outlined]="true"
                                    severity="info"
                                    (click)="editLocation(location)"
                                    pTooltip="Chỉnh sửa"
                                    tooltipPosition="top"
                                />
                                <p-button
                                    [icon]="location.status === 'ACTIVE' ? 'pi pi-ban' : 'pi pi-check-circle'"
                                    [severity]="location.status === 'ACTIVE' ? 'warn' : 'success'"
                                    [rounded]="true"
                                    [outlined]="true"
                                    (click)="toggleStatus(location)"
                                    tooltipPosition="top"
                                />
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    [rounded]="true"
                                    [outlined]="true"
                                    (click)="deleteLocation(location)"
                                    pTooltip="Xóa"
                                    tooltipPosition="top"
                                />
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <!-- Dialog thêm/sửa chi nhánh -->
            <p-dialog
                [(visible)]="locationDialog"
                [style]="{ width: '500px' }"
                [header]="location?.id ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh mới'"
                [modal]="true"
                styleClass="p-fluid"
            >
                <ng-template #content>
                    <div class="flex flex-col gap-6">
                        <div>
                            <label class="block font-bold mb-3">Mã chi nhánh <span class="text-red-500">*</span></label>
                            <input type="text" pInputText [(ngModel)]="location.code" required autofocus fluid placeholder="VD: CN001" />
                            <small class="text-red-500" *ngIf="submitted && !location.code">Mã chi nhánh là bắt buộc.</small>
                        </div>

                        <div>
                            <label class="block font-bold mb-3">Tên chi nhánh <span class="text-red-500">*</span></label>
                            <input type="text" pInputText [(ngModel)]="location.name" required fluid placeholder="VD: Chi nhánh Hà Nội" />
                            <small class="text-red-500" *ngIf="submitted && !location.name">Tên chi nhánh là bắt buộc.</small>
                        </div>

                        <div>
                            <label class="block font-bold mb-3">Địa chỉ</label>
                            <input type="text" pInputText [(ngModel)]="location.address" fluid placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM" />
                        </div>

                        <div>
                            <label class="block font-bold mb-3">Ghi chú</label>
                            <textarea
                                pTextarea
                                [(ngModel)]="location.notes"
                                rows="3"
                                fluid
                                placeholder="Nhập ghi chú (nếu có)..."
                                style="width:100%"
                            ></textarea>
                        </div>
                    </div>
                </ng-template>

                <ng-template #footer>
                    <p-button label="Hủy" icon="pi pi-times" text (click)="hideDialog()" />
                    <p-button label="Lưu" icon="pi pi-check" [loading]="saving" (click)="saveLocation()" />
                </ng-template>
            </p-dialog>

            <p-confirmdialog />
        </div>
    `,
    styles: [`
        :host ::ng-deep {
            .p-toolbar { border-radius: 8px; padding: 1rem; }
            .p-datatable { border-radius: 8px; overflow: hidden; }
            .p-datatable .p-datatable-header { background: #f8f9fa; padding: 1.5rem; border-bottom: 1px solid #dee2e6; }
            .p-datatable-thead > tr > th { background: #f8f9fa; font-weight: 600; padding: 1rem; }
            .p-datatable-tbody > tr { transition: all 0.2s; }
            .p-datatable-tbody > tr:hover { background: #f8f9fa; }
            .p-dialog .p-dialog-header { padding: 1.5rem; }
            .p-dialog .p-dialog-content { padding: 0 1.5rem 1.5rem 1.5rem; }
        }
    `],
    providers: [MessageService, LocationService, ConfirmationService]
})
export class LocationComponent implements OnInit {
    locationDialog = false;
    locations = signal<Location[]>([]);
    location!: Location;
    selectedLocations!: Location[] | null;
    submitted = false;
    saving = false;
    loading = false;
    totalRecords = 0;
    pageSize = 20;
    currentPage = 0;
    cols!: Column[];

    @ViewChild('dt') dt!: Table;

    constructor(
        private locationService: LocationService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.cols = [
            { field: 'code', header: 'Mã chi nhánh' },
            { field: 'name', header: 'Tên chi nhánh' },
            { field: 'address', header: 'Địa chỉ' },
            { field: 'notes', header: 'Ghi chú' },
            { field: 'status', header: 'Trạng thái' },
            { field: 'createdAt', header: 'Ngày tạo' }
        ];
    }

    loadLocations(page = 0, size = this.pageSize) {
        this.loading = true;
        this.locationService.searchLocations({ page, size }).subscribe({
            next: (res) => {
                if (res.code === 200) {
                    this.locations.set(res.data.content);
                    this.totalRecords = res.data.totalElements;
                }
                this.loading = false;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách chi nhánh', life: 3000 });
                this.loading = false;
            }
        });
    }

    onLazyLoad(event: any) {
        const page = event.first / event.rows;
        this.pageSize = event.rows;
        this.currentPage = page;
        this.loadLocations(page, event.rows);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.location = {};
        this.submitted = false;
        this.locationDialog = true;
    }

    editLocation(loc: Location) {
        this.location = { ...loc };
        this.locationDialog = true;
    }

    saveLocation() {
        this.submitted = true;

        if (!this.location.code?.trim() || !this.location.name?.trim()) return;

        this.saving = true;
        const payload = {
            code: this.location.code,
            name: this.location.name,
            address: this.location.address,
            notes: this.location.notes
        };

        if (this.location.id) {
            // Cập nhật
            this.locationService.updateLocation(this.location.id, payload).subscribe({
                next: (res) => {
                    if (res.code === 200) {
                        this.loadLocations(this.currentPage, this.pageSize);
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật chi nhánh', life: 3000 });
                        this.hideDialog();
                    }
                    this.saving = false;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || 'Cập nhật thất bại', life: 3000 });
                    this.saving = false;
                }
            });
        } else {
            // Tạo mới
            this.locationService.createLocation({
                code: this.location.code!,
                name: this.location.name!,
                address: this.location.address,
                notes: this.location.notes
            }).subscribe({
                next: (res) => {
                    if (res.code === 200) {
                        this.loadLocations(this.currentPage, this.pageSize);
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo chi nhánh mới', life: 3000 });
                        this.hideDialog();
                    }
                    this.saving = false;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || 'Tạo chi nhánh thất bại', life: 3000 });
                    this.saving = false;
                }
            });
        }
    }

    toggleStatus(loc: Location) {
        const action = loc.status === 'ACTIVE' ? 'vô hiệu hóa' : 'kích hoạt';
        this.confirmationService.confirm({
            message: `Bạn có chắc muốn ${action} chi nhánh ${loc.name}?`,
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.locationService.changeStatus(loc.id).subscribe({
                    next: (res) => {
                        if (res.code === 200) {
                            this.loadLocations(this.currentPage, this.pageSize);
                            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã ${action} chi nhánh`, life: 3000 });
                        }
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || 'Thao tác thất bại', life: 3000 });
                    }
                });
            }
        });
    }

    deleteLocation(loc: Location) {
        this.confirmationService.confirm({
            message: `Bạn có chắc chắn muốn xóa chi nhánh ${loc.name}?`,
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.locations.set(this.locations().filter(v => v.id !== loc.id));
                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa chi nhánh', life: 3000 });
            }
        });
    }

    deleteSelectedLocations() {
        this.confirmationService.confirm({
            message: 'Bạn có chắc chắn muốn xóa các chi nhánh đã chọn?',
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.locations.set(this.locations().filter(v => !this.selectedLocations?.includes(v)));
                this.selectedLocations = null;
                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa chi nhánh', life: 3000 });
            }
        });
    }

    hideDialog() {
        this.locationDialog = false;
        this.submitted = false;
    }

    exportCSV() { this.dt.exportCSV(); }

    getStatusLabel(status?: string): string {
        return status === 'ACTIVE' ? 'Hoạt động' : 'Hoạt động';
    }

    getStatusSeverity(status?: string): any {
        return status === 'ACTIVE' ? 'success' : 'danger';
    }
}