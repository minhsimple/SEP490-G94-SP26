import { Component, OnInit, signal, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
import { Router } from '@angular/router';
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
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { MenuItemService } from '../service/menu-item.service';

@Component({
    selector: 'app-menu-item',
    standalone: true,
    imports: [
        CommonModule, TableModule, FormsModule,
        ButtonModule, RippleModule, ToastModule,
        InputTextModule, SelectModule, DialogModule,
        InputIconModule, IconFieldModule, ConfirmDialogModule,
        TextareaModule, TooltipModule, InputNumberModule
    ],
    template: `
        <div class="card">
            <p-toast />

            <!-- Toolbar -->
            <div class="flex items-center justify-between mb-6">
                <p-iconfield class="flex-1 mr-4" style="max-width: 420px;">
                    <p-inputicon styleClass="pi pi-search" />
                    <input
                        pInputText type="text"
                        [(ngModel)]="searchKeyword"
                        (input)="onSearch()"
                        placeholder="Tìm kiếm món ăn..."
                        class="w-full"
                    />
                </p-iconfield>
                <p-button label="Thêm món ăn" icon="pi pi-plus" severity="primary" (onClick)="openNew()" />
            </div>

            <!-- Table -->
            <div class="surface-card border-round-xl shadow-1 overflow-hidden">
                <div class="px-4 pt-4 pb-3 border-bottom-1 surface-border">
                    <div class="text-xl font-bold text-900">Danh sách món ăn</div>
                    <div class="text-sm text-500 mt-1">Quản lý các món ăn trong hệ thống</div>
                </div>

                <p-table
                    #dt
                    [value]="menuItems()"
                    [rows]="pageSize"
                    [paginator]="true"
                    [totalRecords]="totalRecords"
                    [lazy]="true"
                    (onLazyLoad)="onLazyLoad($event)"
                    [tableStyle]="{ 'min-width': '60rem' }"
                    [rowHover]="true"
                    dataKey="id"
                    currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} món ăn"
                    [showCurrentPageReport]="true"
                    [rowsPerPageOptions]="[10, 20, 30]"
                    [loading]="loading"
                    styleClass="p-datatable-sm"
                >
                    <ng-template #header>
                        <tr>
                            <th style="min-width:6rem">Mã</th>
                            <th style="width:5rem">Ảnh</th>
                            <th style="min-width:16rem">Tên món ăn</th>
                            <th style="min-width:14rem">Danh mục</th>
                            <th style="min-width:14rem">Chi nhánh</th>
                            <th style="min-width:10rem">Đơn giá</th>
                            <th style="min-width:8rem">Đơn vị</th>
                            <th style="min-width:10rem">Trạng thái</th>
                            <th style="min-width:8rem">Thao tác</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-item>
                        <tr>
                            <td class="text-600 text-sm font-mono">{{ item.code || '-' }}</td>
                            <td>
                                <div class="table-img-container shadow-2 border-round mr-2">
                                    <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop" class="table-img" alt="Món ăn" />
                                </div>
                            </td>
                            <td>
                                <div class="flex items-center gap-3">
                                    <div>
                                        <div class="font-medium text-900">{{ item.name }}</div>
                                        <div class="text-xs text-500 mt-1" *ngIf="item.description">{{ item.description }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="text-600 text-sm">{{ item.categoryMenuItem?.name || '-' }}</td>
                            <td class="text-600 text-sm">{{ item.locationName || item.location?.name || '-' }}</td>
                            <td>
                                <span class="font-semibold text-900">
                                    {{ item.unitPrice != null ? (+item.unitPrice | number:'1.0-0') + ' đ' : '-' }}
                                </span>
                            </td>
                            <td class="text-600 text-sm">{{ item.unit || '-' }}</td>
                            <td>
                                <span class="font-medium"
                                      [style.color]="item.status === 'inactive' ? '#ef4444' : '#22c55e'">
                                    {{ item.status === 'inactive' ? 'Không hoạt động' : 'Hoạt động' }}
                                </span>
                            </td>
                            <td>
                                <div class="flex gap-1">
                                    <p-button icon="pi pi-eye" [rounded]="true" [text]="true"
                                        severity="info" (click)="viewItem(item)"
                                        pTooltip="Xem chi tiết" tooltipPosition="top" />
                                    <p-button icon="pi pi-pencil" [rounded]="true" [text]="true"
                                        severity="secondary" (click)="editItem(item)"
                                        pTooltip="Chỉnh sửa" tooltipPosition="top" />
                                    <p-button
                                        [icon]="item.status === 'inactive' ? 'pi pi-check-circle' : 'pi pi-ban'"
                                        [severity]="item.status === 'inactive' ? 'success' : 'warn'"
                                        [rounded]="true" [text]="true"
                                        (click)="toggleStatus(item)"
                                        [pTooltip]="item.status === 'inactive' ? 'Kích hoạt' : 'Vô hiệu hóa'"
                                        tooltipPosition="top" />
                                </div>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="9" class="text-center py-8 text-500">
                                <i class="pi pi-inbox text-4xl mb-3 block"></i>
                                Không có món ăn nào
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>

            <!-- Dialog Thêm / Sửa -->
            <p-dialog
                [(visible)]="itemDialog"
                [style]="{ width: '540px' }"
                [header]="editingItem?.id ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'"
                [modal]="true"
                styleClass="p-fluid"
            >
                <ng-template #content>
                    <div class="text-sm text-500 mb-5">
                        {{ editingItem?.id ? 'Cập nhật thông tin món ăn' : 'Thêm món ăn mới vào hệ thống' }}
                    </div>
                    <div class="flex flex-col gap-5">

                        <!-- Mã -->
                        <div>
                            <label class="block font-semibold mb-2 text-sm">Mã món ăn</label>
                            <input type="text" pInputText [(ngModel)]="editingItem.code" fluid
                                placeholder="VD: MI001, PHO001..." />
                        </div>

                        <!-- Tên -->
                        <div>
                            <label class="block font-semibold mb-2 text-sm">Tên món ăn <span class="text-red-500">*</span></label>
                            <input type="text" pInputText [(ngModel)]="editingItem.name" fluid
                                placeholder="VD: Phở bò, Cơm chiên, Bánh mì..."
                                [class.ng-invalid]="submitted && !editingItem.name"
                                [class.ng-dirty]="submitted && !editingItem.name" />
                            <small class="text-red-500" *ngIf="submitted && !editingItem.name">Tên món ăn là bắt buộc.</small>
                        </div>

                        <!-- Danh mục -->
                        <div>
                            <label class="block font-semibold mb-2 text-sm">Danh mục <span class="text-red-500">*</span></label>
                            <p-select
                                [(ngModel)]="editingItem.categoryMenuItemsId"
                                [options]="categories"
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Chọn danh mục"
                                [fluid]="true"
                                [class.ng-invalid]="submitted && !editingItem.categoryMenuItemsId"
                                [class.ng-dirty]="submitted && !editingItem.categoryMenuItemsId"
                            />
                            <small class="text-red-500" *ngIf="submitted && !editingItem.categoryMenuItemsId">Danh mục là bắt buộc.</small>
                        </div>

                        <!-- Chi nhánh -->
                        <div>
                            <label class="block font-semibold mb-2 text-sm">Chi nhánh <span class="text-red-500">*</span></label>
                            <p-select
                                [(ngModel)]="editingItem.locationId"
                                [options]="locations"
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Chọn chi nhánh"
                                [fluid]="true"
                                [class.ng-invalid]="submitted && !editingItem.locationId"
                                [class.ng-dirty]="submitted && !editingItem.locationId"
                            />
                            <small class="text-red-500" *ngIf="submitted && !editingItem.locationId">Chi nhánh là bắt buộc.</small>
                        </div>

                        <!-- Đơn giá -->
                        <div>
                            <label class="block font-semibold mb-2 text-sm">Đơn giá (đ) <span class="text-red-500">*</span></label>
                            <p-inputnumber
                                [(ngModel)]="editingItem.unitPrice"
                                [fluid]="true"
                                [min]="0"
                                placeholder="VD: 50000"
                                [class.ng-invalid]="submitted && editingItem.unitPrice == null"
                                [class.ng-dirty]="submitted && editingItem.unitPrice == null"
                            />
                            <small class="text-red-500" *ngIf="submitted && editingItem.unitPrice == null">Đơn giá là bắt buộc.</small>
                        </div>

                        <!-- Đơn vị -->
                        <div>
                            <label class="block font-semibold mb-2 text-sm">Đơn vị <span class="text-red-500">*</span></label>
                            <input type="text" pInputText [(ngModel)]="editingItem.unit" fluid
                                placeholder="VD: phần, tô, dĩa, ly..."
                                [class.ng-invalid]="submitted && !editingItem.unit"
                                [class.ng-dirty]="submitted && !editingItem.unit" />
                            <small class="text-red-500" *ngIf="submitted && !editingItem.unit">Đơn vị là bắt buộc.</small>
                        </div>

                        <!-- Mô tả -->
                        <div>
                            <label class="block font-semibold mb-2 text-sm">Mô tả</label>
                            <textarea pTextarea [(ngModel)]="editingItem.description"
                                rows="3" fluid class="w-full"
                                placeholder="Mô tả về món ăn..."></textarea>
                        </div>

                    </div>
                </ng-template>

                <ng-template #footer>
                    <div class="flex justify-end gap-2">
                        <p-button label="Hủy" icon="pi pi-times" text (click)="hideDialog()" />
                        <p-button
                            [label]="editingItem?.id ? 'Cập nhật' : 'Thêm mới'"
                            icon="pi pi-check" severity="primary"
                            (click)="saveItem()" [loading]="saving" />
                    </div>
                </ng-template>
            </p-dialog>

            <p-confirmdialog />
        </div>
    `,
    styles: [`
        .table-img-container {
            width: 48px; height: 48px;
            border-radius: 8px; overflow: hidden;
            flex-shrink: 0; background-color: #f1f5f9;
        }
        .table-img {
            width: 100%; height: 100%; object-fit: cover;
        }
        :host ::ng-deep {
            .p-datatable .p-datatable-thead > tr > th {
                background: #f8fafc; font-weight: 600; color: #64748b;
                font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.03em;
                padding: 0.75rem 1rem; border-bottom: 1px solid #e2e8f0;
            }
            .p-datatable .p-datatable-tbody > tr > td {
                padding: 0.85rem 1rem; border-bottom: 1px solid #f1f5f9;
            }
            .p-datatable .p-datatable-tbody > tr:hover > td { background: #f8fafc; }
            .p-datatable .p-datatable-tbody > tr:last-child > td { border-bottom: none; }
            .p-dialog .p-dialog-header { padding: 1.25rem 1.5rem 0.5rem; font-weight: 700; font-size: 1.1rem; }
            .p-dialog .p-dialog-content { padding: 0 1.5rem 1rem; }
            .p-dialog .p-dialog-footer { padding: 0.75rem 1.5rem 1.25rem; border-top: 1px solid #f1f5f9; }
        }
    `],
    providers: [MessageService, MenuItemService, ConfirmationService]
})
export class MenuItemComponent implements OnInit {
    menuItems = signal<any[]>([]);
    categories: any[] = [];
    locations: any[] = [];
    loading = false;
    saving = false;
    totalRecords = 0;
    pageSize = 20;
    currentPage = 0;
    searchKeyword = '';
    searchTimeout: any;

    itemDialog = false;
    submitted = false;
    editingItem: any = {};

    @ViewChild('dt') dt!: Table;
    private menuItemService = inject(MenuItemService);
    private router = inject(Router);

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadDropdowns();
        this.loadItems();
    }

    loadDropdowns() {
        this.menuItemService.getCategories().subscribe({
            next: (res: any) => { if (res?.data?.content) this.categories = res.data.content; }
        });
        this.menuItemService.getLocations().subscribe({
            next: (res: any) => { if (res?.data?.content) this.locations = res.data.content; }
        });
    }

    loadItems(page = 0, size = this.pageSize, name?: string) {
        this.loading = true;
        this.menuItemService.search({ page, size, name }).subscribe({
            next: (res: any) => {
                if (res?.data) {
                    this.menuItems.set(res.data.content);
                    this.totalRecords = res.data.totalElements;
                }
                this.loading = false;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách món ăn', life: 3000 });
                this.loading = false;
            }
        });
    }

    onLazyLoad(event: any) {
        this.currentPage = event.first / event.rows;
        this.pageSize = event.rows;
        this.loadItems(this.currentPage, event.rows, this.searchKeyword || undefined);
    }

    onSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.loadItems(0, this.pageSize, this.searchKeyword || undefined);
        }, 400);
    }

    openNew() {
        this.editingItem = {};
        this.submitted = false;
        this.itemDialog = true;
    }

    editItem(item: any) {
        this.menuItemService.getById(item.id).subscribe({
            next: (res: any) => {
                const data = res?.data ?? item;
                this.editingItem = {
                    ...data,
                    categoryMenuItemsId: data.categoryMenuItem?.id ?? data.categoryMenuItemsId,
                    locationId: data.location?.id ?? data.locationId,
                    unitPrice: parseFloat(data.unitPrice) || 0
                };
                this.submitted = false;
                this.itemDialog = true;
            },
            error: () => {
                this.editingItem = {
                    ...item,
                    categoryMenuItemsId: item.categoryMenuItem?.id,
                    locationId: item.location?.id,
                    unitPrice: parseFloat(item.unitPrice) || 0
                };
                this.submitted = false;
                this.itemDialog = true;
            }
        });
    }

    viewItem(item: any) {
        this.router.navigate(['/pages/menu-item', item.id]);
    }

    hideDialog() {
        this.itemDialog = false;
        this.submitted = false;
    }

    saveItem() {
        this.submitted = true;
        if (!this.editingItem.name?.trim()) return;
        if (!this.editingItem.categoryMenuItemsId) return;
        if (!this.editingItem.locationId) return;
        if (this.editingItem.unitPrice == null) return;
        if (!this.editingItem.unit?.trim()) return;

        this.saving = true;
        const payload: any = {
            code: this.editingItem.code,
            name: this.editingItem.name.trim(),
            categoryMenuItemsId: this.editingItem.categoryMenuItemsId,
            locationId: this.editingItem.locationId,
            unitPrice: this.editingItem.unitPrice,
            unit: this.editingItem.unit.trim(),
            description: this.editingItem.description
        };

        if (this.editingItem.id) {
            this.menuItemService.update(this.editingItem.id, payload).subscribe({
                next: () => this.afterSave('Đã cập nhật món ăn'),
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật món ăn', life: 3000 });
                    this.saving = false;
                }
            });
        } else {
            this.menuItemService.create(payload).subscribe({
                next: () => this.afterSave('Đã thêm món ăn mới'),
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể thêm món ăn', life: 3000 });
                    this.saving = false;
                }
            });
        }
    }

    private afterSave(detail: string) {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail, life: 3000 });
        this.itemDialog = false;
        this.saving = false;
        this.loadItems(this.currentPage, this.pageSize);
    }

    toggleStatus(item: any) {
        const action = item.status === 'inactive' ? 'kích hoạt' : 'vô hiệu hóa';
        this.confirmationService.confirm({
            message: `Bạn có chắc muốn ${action} món ăn "${item.name}"?`,
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có', rejectLabel: 'Không',
            accept: () => {
                this.menuItemService.changeStatus(item.id).subscribe({
                    next: () => {
                        this.loadItems(this.currentPage, this.pageSize);
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã ${action} món ăn`, life: 3000 });
                    },
                    error: (err: any) => {
                        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err?.error?.message || 'Thao tác thất bại', life: 3000 });
                    }
                });
            }
        });
    }
}