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
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PasswordModule } from 'primeng/password';
import { Customer, CustomerService } from '../service/customer.service';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-customers',
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
        PasswordModule
    ],
    template: `
        <div class="card">
            <p-toast />

            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <p-button
                        label="Thêm khách hàng mới"
                        icon="pi pi-plus"
                        severity="primary"
                        class="mr-2"
                        (onClick)="openNew()"
                    />
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
                [value]="customers()"
                [rows]="pageSize"
                [columns]="cols"
                [paginator]="true"
                [lazy]="true"
                [totalRecords]="totalRecords"
                [globalFilterFields]="['fullName', 'email', 'phone', 'status']"
                [tableStyle]="{ 'min-width': '75rem' }"
                [(selection)]="selectedCustomers"
                [rowHover]="true"
                dataKey="id"
                currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} khách hàng"
                [showCurrentPageReport]="true"
                [rowsPerPageOptions]="[10, 20, 30]"
                (onPage)="onPageChange($event)"
                [loading]="loading"
            >
                <ng-template #caption>
                    <div class="flex items-center justify-between">
                        <h2 class="m-0 text-2xl font-bold">Danh sách Khách hàng</h2>
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
                        <th pSortableColumn="fullName" style="min-width:14rem">
                            Họ và tên <p-sortIcon field="fullName" />
                        </th>
                        <th pSortableColumn="citizenIdNumber" style="min-width:14rem">
                            Số CCCD <p-sortIcon field="citizenIdNumber" />
                        </th>
                        <th pSortableColumn="email" style="min-width:16rem">
                            Email <p-sortIcon field="email" />
                        </th>
                        <th pSortableColumn="phone" style="min-width:12rem">
                            Số điện thoại <p-sortIcon field="phone" />
                        </th>
                        <th pSortableColumn="taxCode" style="min-width:12rem">
                            Mã số thuế <p-sortIcon field="taxCode" />
                        </th>
                        <th pSortableColumn="status" style="min-width:10rem">
                            Trạng thái <p-sortIcon field="status" />
                        </th>
                        <th style="min-width:10rem">Thao tác</th>
                    </tr>
                </ng-template>

                <ng-template #body let-customer>
                    <tr>
                        <td>
                            <p-tableCheckbox [value]="customer" />
                        </td>
                        <td>
                            <div class="flex items-center gap-3">
                                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold">
                                    {{ getInitials(customer.fullName) }}
                                </div>
                                <span class="font-medium">{{ customer.fullName }}</span>
                            </div>
                        </td>
                        <td>{{ customer.citizenIdNumber || '-' }}</td>
                        <td>
                            <i class="pi pi-envelope mr-2 text-gray-400"></i>
                            {{ customer.email || '-' }}
                        </td>
                        <td>
                            <i class="pi pi-phone mr-2 text-gray-400"></i>
                            {{ customer.phone || '-' }}
                        </td>
                        <td>{{ customer.taxCode || '-' }}</td>
                        <td>
                            <p-tag
                                [value]="getStatusLabel(customer.status)"
                                [severity]="getStatusSeverity(customer.status)"
                            />
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-pencil"
                                    [rounded]="true"
                                    [outlined]="true"
                                    severity="info"
                                    (click)="editCustomer(customer)"
                                    pTooltip="Chỉnh sửa"
                                    tooltipPosition="top"
                                />
                                <p-button
                                    [icon]="customer.status === 'active' ? 'pi pi-ban' : 'pi pi-check-circle'"
                                    [severity]="customer.status === 'active' ? 'warn' : 'success'"
                                    [rounded]="true"
                                    [outlined]="true"
                                    (click)="toggleStatus(customer)"
                                    tooltipPosition="top"
                                />
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <p-dialog
                [(visible)]="customerDialog"
                [style]="{ width: '540px' }"
                [header]="isEditing ? 'Chỉnh sửa khách hàng' : 'Thêm khách hàng mới'"
                [modal]="true"
                styleClass="p-fluid"
            >
                <ng-template #content>
                    <div class="flex flex-col gap-5">

                        <div>
                            <label for="fullName" class="block font-bold mb-2">
                                Họ và tên <span class="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                pInputText
                                id="fullName"
                                [(ngModel)]="customer.fullName"
                                required
                                autofocus
                                fluid
                                placeholder="Nguyễn Văn A"
                            />
                            <small class="text-red-500" *ngIf="submitted && !customer.fullName">
                                Họ và tên là bắt buộc.
                            </small>
                        </div>

                        <div>
                            <label for="citizenIdNumber" class="block font-bold mb-2">Số CCCD</label>
                            <input
                                type="number"
                                pInputText
                                id="citizenIdNumber"
                                [(ngModel)]="customer.citizenIdNumber"
                                fluid
                                placeholder="012345678901"
                                min="0"
                            />
                        </div>

                        <div>
                            <label for="email" class="block font-bold mb-2">Email</label>
                            <input
                                type="email"
                                pInputText
                                id="email"
                                [ngModel]="isEditing ? customer.email : newEmail"
                                (ngModelChange)="isEditing ? customer.email = $event : newEmail = $event"
                                fluid
                                placeholder="email@example.com"
                            />
                        </div>

                        <div>
                            <label for="phone" class="block font-bold mb-2">Số điện thoại</label>
                            <input
                                type="text"
                                pInputText
                                id="phone"
                                [ngModel]="isEditing ? customer.phone : newPhone"
                                (ngModelChange)="isEditing ? customer.phone = $event : newPhone = $event"
                                fluid
                                placeholder="0901234567"
                            />
                        </div>
                        <div>
    <label for="locationId" class="block font-bold mb-2">Chi nhánh</label>
    <p-select
        [(ngModel)]="customer.locationId"
        inputId="locationId"
        [options]="locations"
        optionLabel="name"
        optionValue="id"
        placeholder="Chọn chi nhánh"
        fluid
        [filter]="true"
        filterBy="name"
        emptyMessage="Không có dữ liệu"
    >
        <ng-template pTemplate="option" let-loc>
            <div class="flex flex-col">
                <span class="font-medium">{{ loc.name }}</span>
                <small class="text-gray-400">{{ loc.address }}</small>
            </div>
        </ng-template>
    </p-select>
</div>

                        <div>
                            <label for="taxCode" class="block font-bold mb-2">Mã số thuế</label>
                            <input
                                type="text"
                                pInputText
                                id="taxCode"
                                [(ngModel)]="customer.taxCode"
                                fluid
                                placeholder="0123456789"
                            />
                        </div>

                        <div>
                            <label for="address" class="block font-bold mb-2">Địa chỉ</label>
                            <input
                                type="text"
                                pInputText
                                id="address"
                                [(ngModel)]="customer.address"
                                fluid
                                placeholder="123 Đường ABC, TP.HCM"
                            />
                        </div>

                        <div>
                            <label for="notes" class="block font-bold mb-2">Ghi chú</label>
                            <input
                                type="text"
                                pInputText
                                id="notes"
                                [(ngModel)]="customer.notes"
                                fluid
                                placeholder="Ghi chú thêm..."
                            />
                        </div>

                        <div *ngIf="!isEditing">
                            <label for="password" class="block font-bold mb-2">
                                Mật khẩu <span class="text-red-500">*</span>
                            </label>
                            <p-password
                                [(ngModel)]="newPassword"
                                [toggleMask]="true"
                                fluid
                                placeholder="Nhập mật khẩu"
                            />
                            <small class="text-red-500" *ngIf="submitted && !isEditing && !newPassword">
                                Mật khẩu là bắt buộc.
                            </small>
                        </div>

                    </div>
                </ng-template>

                <ng-template #footer>
                    <p-button label="Hủy" icon="pi pi-times" text (click)="hideDialog()" />
                    <p-button
                        label="Lưu"
                        icon="pi pi-check"
                        (click)="saveCustomer()"
                        [loading]="saving"
                    />
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
    providers: [MessageService, ConfirmationService]
})
export class Customers implements OnInit {
    customerDialog = false;
    customers = signal<Customer[]>([]);
    customer!: Customer;

    newEmail = '';
    newPhone = '';
    newPassword = '';

    isEditing = false;
    selectedCustomers!: Customer[] | null;
    submitted = false;
    saving = false;
    loading = false;

    totalRecords = 0;
    currentPage = 0;
    pageSize = 20;

    cols!: Column[];

    @ViewChild('dt') dt!: Table;

    constructor(
        private customerService: CustomerService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}
locations: Location[] = [];

    ngOnInit() {
        this.cols = [
            { field: 'fullName', header: 'Họ và tên' },
            { field: 'citizenIdNumber', header: 'Số CCCD' },
            { field: 'email', header: 'Email' },
            { field: 'phone', header: 'Số điện thoại' },
            { field: 'taxCode', header: 'Mã số thuế' },
            { field: 'status', header: 'Trạng thái' }
        ];
        this.loadCustomers();
    this.loadCustomers();
    this.loadLocations();
    }

    loadCustomers() {
        this.loading = true;
        this.customerService.searchCustomers({ page: this.currentPage, size: this.pageSize }).subscribe({
            next: (res) => {
                this.customers.set(res.data.content);
                this.totalRecords = res.data.totalElements;
                this.loading = false;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách khách hàng', life: 3000 });
                this.loading = false;
            }
        });
    }

    onPageChange(event: any) {
        this.currentPage = event.first / event.rows;
        this.pageSize = event.rows;
        this.loadCustomers();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.customer = {};
        this.newEmail = '';
        this.newPhone = '';
        this.newPassword = '';
        this.isEditing = false;
        this.submitted = false;
        this.customerDialog = true;
    }

    editCustomer(customer: Customer) {
        this.customerService.getCustomerById(customer.id).subscribe({
            next: (res) => {
                this.customer = { ...res.data };
                this.isEditing = true;
                this.submitted = false;
                this.customerDialog = true;
            },
            error: () => {
                this.customer = { ...customer };
                this.isEditing = true;
                this.submitted = false;
                this.customerDialog = true;
            }
        });
    }

    toggleStatus(customer: Customer) {
        const nextStatus = customer.status === 'active' ? 'inactive' : 'active';
        const label = nextStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa';

        this.confirmationService.confirm({
            message: `Bạn có chắc muốn ${label} khách hàng "${customer.fullName}"?`,
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.customerService.changeStatus(customer.id).subscribe({
                    next: () => {
                        this.customers.update(list =>
                            list.map(c => c.id === customer.id ? { ...c, status: nextStatus } : c)
                        );
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã ${label} khách hàng`, life: 3000 });
                    },
                    error: () => {
                        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: `Không thể ${label} khách hàng`, life: 3000 });
                    }
                });
            }
        });
    }

    hideDialog() {
        this.customerDialog = false;
        this.submitted = false;
    }

    saveCustomer() {
        this.submitted = true;

        if (!this.customer.fullName?.trim()) return;

        if (!this.isEditing && !this.newPassword) {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Vui lòng nhập mật khẩu', life: 3000 });
            return;
        }

        this.saving = true;

        if (this.isEditing) {
            this.customerService.updateCustomer(this.customer.id, {
                fullName: this.customer.fullName,
                citizenIdNumber: this.customer.citizenIdNumber,
                phone: this.customer.phone,
                email: this.customer.email,
                taxCode: this.customer.taxCode,
                address: this.customer.address,
                notes: this.customer.notes,
                locationId: this.customer.locationId
            }).subscribe({
                next: (res) => {
                    this.customers.update(list =>
                        list.map(c => c.id === this.customer.id ? { ...c, ...res.data } : c)
                    );
                    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật khách hàng', life: 3000 });
                    this.customerDialog = false;
                    this.saving = false;
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Cập nhật thất bại', life: 3000 });
                    this.saving = false;
                }
            });
        } else {
            this.customerService.createCustomer({
                fullName: this.customer.fullName!,
                citizenIdNumber: this.customer.citizenIdNumber,
                phone: this.newPhone || undefined,
                email: this.newEmail || undefined,
                taxCode: this.customer.taxCode,
                address: this.customer.address,
                notes: this.customer.notes,
                locationId: this.customer.locationId,
                password: this.newPassword
            }).subscribe({
                next: (res) => {
                    this.customers.update(list => [res.data, ...list]);
                    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo khách hàng mới', life: 3000 });
                    this.customerDialog = false;
                    this.saving = false;
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Tạo khách hàng thất bại', life: 3000 });
                    this.saving = false;
                }
            });
        }
    }

    exportCSV() {
        this.dt.exportCSV();
    }

    getInitials(fullName: string | undefined): string {
        if (!fullName) return '?';
        const names = fullName.trim().split(' ');
        if (names.length >= 2) return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        return fullName.substring(0, 2).toUpperCase();
    }

    getStatusLabel(status: string | undefined): string {
        return status === 'active' ? 'Hoạt động' : 'Không hoạt động';
    }

    getStatusSeverity(status: string | undefined): 'success' | 'danger' {
        return status === 'active' ? 'success' : 'danger';
    }

    loadLocations() {
    this.customerService.searchLocations().subscribe({
        next: (res) => {
            this.locations = res.data.content;
        },
        error: () => {
            this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách chi nhánh', life: 3000 });
        }
    });
}


}