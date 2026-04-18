import { Component, OnInit, signal, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
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
import { CategoryMenuItem, CategoryMenuItemService } from '../service/category-menu-item.service';
import { MenuItemService } from '../service/menu-item.service';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface Column { field: string; header: string; }

@Component({
    selector: 'app-category-menu-item',
    standalone: true,
    imports: [
        CommonModule, TableModule, FormsModule,
        ButtonModule, RippleModule, ToastModule,
        InputTextModule, SelectModule, DialogModule,
        InputIconModule, IconFieldModule, ConfirmDialogModule,
        TextareaModule, TooltipModule
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
                        placeholder="Tìm kiếm danh mục món ăn..."
                        class="w-full"
                    />
                </p-iconfield>
                <p-button *ngIf="canManageCategory" label="Thêm danh mục" icon="pi pi-plus" severity="primary" (onClick)="openNew()" />
            </div>

            <!-- Table -->
            <div class="surface-card border-round-xl shadow-1 overflow-hidden">
                <div class="px-4 pt-4 pb-3 border-bottom-1 surface-border">
                    <div class="text-xl font-bold text-900">Danh sách danh mục món ăn</div>
                    <div class="text-sm text-500 mt-1">Quản lý các danh mục món ăn trong hệ thống</div>
                </div>

                <p-table
                    #dt
                    [value]="categories()"
                    [rows]="pageSize"
                    [columns]="cols"
                    [paginator]="true"
                    [totalRecords]="totalRecords"
                    [lazy]="true"
                    (onLazyLoad)="onLazyLoad($event)"
                    [tableStyle]="{ 'min-width': '40rem' }"
                    [rowHover]="true"
                    dataKey="id"
                    currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} danh mục"
                    [showCurrentPageReport]="true"
                    [rowsPerPageOptions]="[10, 20, 30]"
                    [loading]="loading"
                    styleClass="p-datatable-sm"
                >
                    <ng-template #header>
                        <tr>
                            <th style="min-width:20rem">Tên danh mục</th>
                            <th style="min-width:20rem">Mô tả</th>
                            <th style="min-width:8rem">Số món ăn</th>
                            <th style="min-width:8rem">Trạng thái</th>
                            <th style="min-width:8rem">Thao tác</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-category>
                        <tr>
                            <td>
                                <div class="flex items-center gap-3">
                                    <div class="flex items-center justify-center w-8 h-8 border-round-lg"
                                         style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #1d4ed8;">
                                        <i class="pi pi-tag text-sm"></i>
                                    </div>
                                    <div class="font-medium text-900">{{ category.name }}</div>
                                </div>
                            </td>
                            <td class="text-600 text-sm">{{ category.description || '-' }}</td>
                            <td>
                                <span class="px-2 py-1 border-round text-xs font-medium"
                                      style="background:#dbeafe; color:#1e40af;">
                                    {{ category.menuItemCount ?? 0 }} món
                                </span>
                            </td>
                            <td>
                                <span class="font-medium"
                                      [style.color]="category.status === 'inactive' ? '#ef4444' : '#22c55e'">
                                    {{ category.status === 'inactive' ? 'Không hoạt động' : 'Hoạt động' }}
                                </span>
                            </td>
                            <td>
                                <div class="flex gap-1">
                                    <p-button *ngIf="canManageCategory" icon="pi pi-pencil" [rounded]="true" [text]="true"
                                        severity="secondary" (click)="editCategory(category)"
                                        pTooltip="Chỉnh sửa" tooltipPosition="top" />
                                    <p-button *ngIf="canManageCategory"
                                        [icon]="category.status === 'inactive' ? 'pi pi-check-circle' : 'pi pi-ban'"
                                        [severity]="category.status === 'inactive' ? 'success' : 'warn'"
                                        [rounded]="true" [text]="true"
                                        (click)="toggleStatus(category)"
                                        [pTooltip]="category.status === 'inactive' ? 'Kích hoạt' : 'Vô hiệu hóa'"
                                        tooltipPosition="top" />
                                </div>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="5" class="text-center py-8 text-500">
                                <i class="pi pi-inbox text-4xl mb-3 block"></i>
                                Không có danh mục nào
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>

            <!-- Dialog Thêm / Sửa -->
            <p-dialog
                [(visible)]="categoryDialog"
                [style]="{ width: '480px' }"
                [header]="editingCategory?.id ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'"
                [modal]="true"
                styleClass="p-fluid"
            >
                <ng-template #content>
                    <div class="text-sm text-500 mb-5">
                        {{ editingCategory?.id ? 'Cập nhật thông tin danh mục món ăn' : 'Thêm danh mục món ăn mới vào hệ thống' }}
                    </div>
                    <div class="flex flex-col gap-5">

                        <!-- Tên -->
                        <div>
                            <label class="block font-semibold mb-2 text-sm">Tên danh mục <span class="text-red-500">*</span></label>
                            <input type="text" pInputText [(ngModel)]="editingCategory.name" fluid
                                placeholder="VD: Khai vị, Món chính, Tráng miệng..."
                                [class.ng-invalid]="submitted && !editingCategory.name"
                                [class.ng-dirty]="submitted && !editingCategory.name" />
                            <small class="text-red-500" *ngIf="submitted && !editingCategory.name">Tên danh mục là bắt buộc.</small>
                        </div>

                        <!-- Mô tả -->
                        <div>
                            <label class="block font-semibold mb-2 text-sm">Mô tả</label>
                            <textarea pTextarea [(ngModel)]="editingCategory.description"
                                rows="3" fluid class="w-full"
                                placeholder="Mô tả về danh mục món ăn..."></textarea>
                        </div>

                    </div>
                </ng-template>

                <ng-template #footer>
                    <div class="flex justify-end gap-2">
                        <p-button label="Hủy" icon="pi pi-times" text (click)="hideDialog()" />
                        <p-button
                            [label]="editingCategory?.id ? 'Cập nhật' : 'Thêm mới'"
                            icon="pi pi-check" severity="primary"
                            (click)="saveCategory()" [loading]="saving" />
                    </div>
                </ng-template>
            </p-dialog>

            <p-confirmdialog />
        </div>
    `,
    styles: [`
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
    providers: [MessageService, CategoryMenuItemService, ConfirmationService]
})
export class CategoryMenuItemComponent implements OnInit {
    readonly roleCode = (localStorage.getItem('codeRole') ?? '').toUpperCase();
    readonly canManageCategory = this.roleCode.includes('ADMIN') || this.roleCode.includes('MANAGER');

    categories = signal<CategoryMenuItem[]>([]);
    loading = false;
    saving = false;
    totalRecords = 0;
    pageSize = 20;
    currentPage = 0;
    searchKeyword = '';
    searchTimeout: any;

    categoryDialog = false;
    submitted = false;
    editingCategory: any = {};

    cols: Column[] = [];

    @ViewChild('dt') dt!: Table;
    private categoryService = inject(CategoryMenuItemService);
    private menuItemService = inject(MenuItemService);

    constructor(
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.cols = [
            { field: 'name', header: 'Tên danh mục' },
            { field: 'description', header: 'Mô tả' },
            { field: 'status', header: 'Trạng thái' }
        ];
        this.loadCategories();
    }

    loadCategories(page = 0, size = this.pageSize, name?: string) {
        this.loading = true;
        this.categoryService.search({ page, size, name }).subscribe({
            next: (res) => {
                if (res.data && res.data.content.length > 0) {
                    // Load count for each category
                    const countRequests = res.data.content.map(cat => 
                        this.menuItemService.search({ 
                            categoryMenuItemsId: cat.id, 
                            page: 0, 
                            size: 1 
                        }).pipe(
                            map(countRes => countRes.data?.totalElements ?? 0),
                            catchError(() => of(0))
                        )
                    );

                    forkJoin(countRequests).subscribe({
                        next: (counts) => {
                            const categoriesWithCount = res.data.content.map((cat, idx) => ({
                                ...cat,
                                menuItemCount: counts[idx]
                            }));
                            this.categories.set(categoriesWithCount);
                            this.totalRecords = res.data.totalElements;
                            this.loading = false;
                        },
                        error: () => {
                            this.categories.set(res.data.content);
                            this.totalRecords = res.data.totalElements;
                            this.loading = false;
                        }
                    });
                } else {
                    this.categories.set([]);
                    this.totalRecords = 0;
                    this.loading = false;
                }
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách danh mục', life: 3000 });
                this.loading = false;
            }
        });
    }

    onLazyLoad(event: any) {
        this.currentPage = event.first / event.rows;
        this.pageSize = event.rows;
        this.loadCategories(this.currentPage, event.rows, this.searchKeyword || undefined);
    }

    onSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.loadCategories(0, this.pageSize, this.searchKeyword || undefined);
        }, 400);
    }

    openNew() {
        if (!this.canManageCategory) return;
        this.editingCategory = {};
        this.submitted = false;
        this.categoryDialog = true;
    }

    editCategory(category: CategoryMenuItem) {
        if (!this.canManageCategory) return;
        this.categoryService.getById(category.id!).subscribe({
            next: (res) => {
                if (res.code === 200) {
                    this.editingCategory = { ...res.data };
                    this.submitted = false;
                    this.categoryDialog = true;
                }
            },
            error: () => {
                this.editingCategory = { ...category };
                this.submitted = false;
                this.categoryDialog = true;
            }
        });
    }

    hideDialog() {
        this.categoryDialog = false;
        this.submitted = false;
    }

    saveCategory() {
        this.submitted = true;
        if (!this.editingCategory.name?.trim()) return;

        this.saving = true;
        const payload = {
            name: this.editingCategory.name.trim(),
            description: this.editingCategory.description
        };

        if (this.editingCategory.id) {
            this.categoryService.update(this.editingCategory.id, payload).subscribe({
                next: () => this.afterSave('Đã cập nhật danh mục'),
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật danh mục', life: 3000 });
                    this.saving = false;
                }
            });
        } else {
            this.categoryService.create(payload).subscribe({
                next: () => this.afterSave('Đã thêm danh mục mới'),
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể thêm danh mục', life: 3000 });
                    this.saving = false;
                }
            });
        }
    }

    private afterSave(detail: string) {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail, life: 3000 });
        this.categoryDialog = false;
        this.saving = false;
        this.loadCategories(this.currentPage, this.pageSize);
    }

    toggleStatus(category: CategoryMenuItem) {
        if (!this.canManageCategory) return;
        const action = category.status === 'INACTIVE' ? 'kích hoạt' : 'vô hiệu hóa';
        this.confirmationService.confirm({
            message: `Bạn có chắc muốn ${action} danh mục "${category.name}"?`,
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có', rejectLabel: 'Không',
            accept: () => {
                this.categoryService.changeStatus(category.id!).subscribe({
                    next: () => {
                        this.loadCategories(this.currentPage, this.pageSize);
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã ${action} danh mục`, life: 3000 });
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || 'Thao tác thất bại', life: 3000 });
                    }
                });
            }
        });
    }
}