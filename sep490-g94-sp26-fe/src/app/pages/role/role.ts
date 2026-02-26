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
import { HttpClient } from '@angular/common/http';

const BASE_URL = 'http://localhost:8080/api/v1/role';

@Component({
    selector: 'app-role',
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
        ConfirmDialogModule
    ],
    template: `
        <div class="card">
            <p-toast />

            <p-toolbar styleClass="mb-6">
                <ng-template #start>
                    <p-button
                        label="Thêm vai trò mới"
                        icon="pi pi-plus"
                        severity="primary"
                        class="mr-2"
                        (onClick)="openNew()"
                    />
                    <p-button
                        severity="danger"
                        label="Xóa"
                        icon="pi pi-trash"
                        outlined
                        (onClick)="deleteSelectedRoles()"
                        [disabled]="!selectedRoles || !selectedRoles.length"
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
                [value]="roles()"
                [rows]="pageSize"
                [columns]="cols"
                [paginator]="true"
                [totalRecords]="totalRecords"
                [lazy]="true"
                (onLazyLoad)="onLazyLoad($event)"
                [globalFilterFields]="['code', 'name', 'status']"
                [tableStyle]="{ 'min-width': '60rem' }"
                [(selection)]="selectedRoles"
                [rowHover]="true"
                dataKey="id"
                currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} vai trò"
                [showCurrentPageReport]="true"
                [rowsPerPageOptions]="[10, 20, 30]"
                [loading]="loading"
            >
                <ng-template #caption>
                    <div class="flex items-center justify-between">
                        <h2 class="m-0 text-2xl font-bold">Danh sách vai trò</h2>
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
                        <th pSortableColumn="code" style="min-width:12rem">
                            Mã vai trò <p-sortIcon field="code" />
                        </th>
                        <th pSortableColumn="name" style="min-width:16rem">
                            Tên vai trò <p-sortIcon field="name" />
                        </th>
                        <th pSortableColumn="status" style="min-width:10rem">
                            Trạng thái <p-sortIcon field="status" />
                        </th>
                        <th pSortableColumn="createdAt" style="min-width:12rem">
                            Ngày tạo <p-sortIcon field="createdAt" />
                        </th>
                        <th style="min-width:12rem">Thao tác</th>
                    </tr>
                </ng-template>

                <ng-template #body let-role>
                    <tr>
                        <td><p-tableCheckbox [value]="role" /></td>
                        <td>
                            <span class="font-mono font-semibold text-blue-600">{{ role.code }}</span>
                        </td>
                        <td>
                            <div class="flex items-center gap-3">
                                <div class="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-semibold">
                                    <i class="pi pi-shield"></i>
                                </div>
                                <span class="font-medium">{{ role.name }}</span>
                            </div>
                        </td>
                        <td>
                            <p-tag
                                [value]="getStatusLabel(role.status)"
                                [severity]="getStatusSeverity(role.status)"
                            />
                        </td>
                        <td>{{ role.createdAt | date:'dd/MM/yyyy' }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-pencil"
                                    [rounded]="true"
                                    [outlined]="true"
                                    severity="info"
                                    (click)="editRole(role)"
                                    pTooltip="Chỉnh sửa"
                                    tooltipPosition="top"
                                />
                                <p-button
                                    [icon]="role.status === 'ACTIVE' ? 'pi pi-ban' : 'pi pi-check-circle'"
                                    [severity]="role.status === 'ACTIVE' ? 'warn' : 'success'"
                                    [rounded]="true"
                                    [outlined]="true"
                                    (click)="toggleStatus(role)"
                                    tooltipPosition="top"
                                />
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    [rounded]="true"
                                    [outlined]="true"
                                    (click)="deleteRole(role)"
                                    pTooltip="Xóa"
                                    tooltipPosition="top"
                                />
                            </div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>

            <!-- Dialog thêm/sửa vai trò -->
            <p-dialog
                [(visible)]="roleDialog"
                [style]="{ width: '450px' }"
                [header]="role?.id ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'"
                [modal]="true"
                styleClass="p-fluid"
            >
                <ng-template #content>
                    <div class="flex flex-col gap-6">
                        <div>
                            <label class="block font-bold mb-3">Mã vai trò <span class="text-red-500">*</span></label>
                            <input type="text" pInputText [(ngModel)]="role.code" required autofocus fluid placeholder="VD: ADMIN" />
                            <small class="text-red-500" *ngIf="submitted && !role.code">Mã vai trò là bắt buộc.</small>
                        </div>

                        <div>
                            <label class="block font-bold mb-3">Tên vai trò <span class="text-red-500">*</span></label>
                            <input type="text" pInputText [(ngModel)]="role.name" required fluid placeholder="VD: Quản trị viên" />
                            <small class="text-red-500" *ngIf="submitted && !role.name">Tên vai trò là bắt buộc.</small>
                        </div>
                    </div>
                </ng-template>

                <ng-template #footer>
                    <p-button label="Hủy" icon="pi pi-times" text (click)="hideDialog()" />
                    <p-button label="Lưu" icon="pi pi-check" [loading]="saving" (click)="saveRole()" />
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
export class RoleComponent implements OnInit {
    roleDialog = false;
    roles = signal<any[]>([]);
    role: any = {};
    selectedRoles: any[] | null = null;
    submitted = false;
    saving = false;
    loading = false;
    totalRecords = 0;
    pageSize = 20;
    currentPage = 0;
    cols: any[] = [];

    @ViewChild('dt') dt!: Table;

    constructor(
        private http: HttpClient,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.cols = [
            { field: 'code', header: 'Mã vai trò' },
            { field: 'name', header: 'Tên vai trò' },
            { field: 'status', header: 'Trạng thái' },
            { field: 'createdAt', header: 'Ngày tạo' }
        ];
    }

    loadRoles(page = 0, size = this.pageSize) {
        this.loading = true;
        this.http.get<any>(`${BASE_URL}/search`, {
            params: { page, size, sort: 'updatedAt,DESC' }
        }).subscribe({
            next: (res) => {
                if (res.code === 200) {
                    this.roles.set(res.data.content);
                    this.totalRecords = res.data.totalElements;
                }
                this.loading = false;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách vai trò', life: 3000 });
                this.loading = false;
            }
        });
    }

    onLazyLoad(event: any) {
        const page = event.first / event.rows;
        this.pageSize = event.rows;
        this.currentPage = page;
        this.loadRoles(page, event.rows);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    openNew() {
        this.role = {};
        this.submitted = false;
        this.roleDialog = true;
    }

    editRole(r: any) {
        this.role = { ...r };
        this.roleDialog = true;
    }

    saveRole() {
        this.submitted = true;

        if (!this.role.code?.trim() || !this.role.name?.trim()) return;

        this.saving = true;
        const payload = {
            code: this.role.code,
            name: this.role.name
        };

        if (this.role.id) {
            this.http.put<any>(`${BASE_URL}/update`, payload, {
                params: { roleId: this.role.id }
            }).subscribe({
                next: (res) => {
                    if (res.code === 200) {
                        this.loadRoles(this.currentPage, this.pageSize);
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật vai trò', life: 3000 });
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
            this.http.post<any>(`${BASE_URL}/create`, payload).subscribe({
                next: (res) => {
                    if (res.code === 200) {
                        this.loadRoles(this.currentPage, this.pageSize);
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo vai trò mới', life: 3000 });
                        this.hideDialog();
                    }
                    this.saving = false;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || 'Tạo vai trò thất bại', life: 3000 });
                    this.saving = false;
                }
            });
        }
    }

    toggleStatus(r: any) {
        const action = r.status === 'ACTIVE' ? 'vô hiệu hóa' : 'kích hoạt';
        this.confirmationService.confirm({
            message: `Bạn có chắc muốn ${action} vai trò ${r.name}?`,
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.http.patch<any>(`${BASE_URL}/${r.id}/change-status`, {}).subscribe({
                    next: (res) => {
                        if (res.code === 200) {
                            this.loadRoles(this.currentPage, this.pageSize);
                            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã ${action} vai trò`, life: 3000 });
                        }
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || 'Thao tác thất bại', life: 3000 });
                    }
                });
            }
        });
    }

    deleteRole(r: any) {
        this.confirmationService.confirm({
            message: `Bạn có chắc chắn muốn xóa vai trò ${r.name}?`,
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.roles.set(this.roles().filter((v: any) => v.id !== r.id));
                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa vai trò', life: 3000 });
            }
        });
    }

    deleteSelectedRoles() {
        this.confirmationService.confirm({
            message: 'Bạn có chắc chắn muốn xóa các vai trò đã chọn?',
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.roles.set(this.roles().filter((v: any) => !this.selectedRoles?.includes(v)));
                this.selectedRoles = null;
                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa các vai trò', life: 3000 });
            }
        });
    }

    hideDialog() {
        this.roleDialog = false;
        this.submitted = false;
    }

    exportCSV() { this.dt.exportCSV(); }

    getStatusLabel(status?: string): string {
        return status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động';
    }

    getStatusSeverity(status?: string): any {
        return status === 'ACTIVE' ? 'success' : 'danger';
    }
}