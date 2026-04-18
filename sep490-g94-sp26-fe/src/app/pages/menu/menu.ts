import { Component, OnInit, signal, ViewChild, ChangeDetectorRef, inject } from '@angular/core';
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
import { TooltipModule } from 'primeng/tooltip';
import { LocationService } from '../service/location.service';
import { MenuItem, SetMenu, SetMenuService } from '../service/set-menu';
import { Router } from '@angular/router';

interface Column { field: string; header: string; }

@Component({
    selector: 'app-set-menu',
    standalone: true,
    imports: [
        CommonModule, TableModule, FormsModule,
        ButtonModule, RippleModule, ToastModule, ToolbarModule,
        InputTextModule, SelectModule, DialogModule, TagModule,
        InputIconModule, IconFieldModule, ConfirmDialogModule,
        TextareaModule, ToggleSwitchModule, InputNumberModule, TooltipModule
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
                        placeholder="Tìm kiếm set menu..."
                        class="w-full"
                    />
                </p-iconfield>
                <p-button *ngIf="canEditMenu" label="Thêm set menu" icon="pi pi-plus" severity="primary" (onClick)="openNew()" />
            </div>

            <!-- Table -->
            <div class="surface-card border-round-xl shadow-1 overflow-hidden">
                <div class="px-4 pt-4 pb-3 border-bottom-1 surface-border">
                    <div class="text-xl font-bold text-900">Danh sách set menu</div>
                    <div class="text-sm text-500 mt-1">Quản lý các set menu tiệc cưới</div>
                </div>

                <p-table
                    #dt
                    [value]="setMenus()"
                    [rows]="pageSize"
                    [columns]="cols"
                    [paginator]="true"
                    [totalRecords]="totalRecords"
                    [lazy]="true"
                    (onLazyLoad)="onLazyLoad($event)"
                    [tableStyle]="{ 'min-width': '60rem' }"
                    [rowHover]="true"
                    dataKey="id"
                    currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} set menu"
                    [showCurrentPageReport]="true"
                    [rowsPerPageOptions]="[10, 20, 30]"
                    [loading]="loading"
                    styleClass="p-datatable-sm"
                >
                    <ng-template #header>
                        <tr>
                            <th style="width:5rem">Ảnh</th>
                            <th style="min-width:20rem">Tên set menu</th>
                            <th style="min-width:12rem">Chi nhánh</th>
                            <th pSortableColumn="setPrice" style="min-width:10rem">
                                Giá <p-sortIcon field="setPrice" />
                            </th>
                            <th style="min-width:8rem">Số món</th>
                            <th style="min-width:8rem">Trạng thái</th>
                            <th style="min-width:8rem">Thao tác</th>
                        </tr>
                    </ng-template>

                    <ng-template #body let-menu>
                        <tr>
                            <td>
                                <div class="table-img-container shadow-2 border-round ml-2">
                                    <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&h=100&fit=crop" class="table-img" alt="Set Menu" />
                                </div>
                            </td>
                            <td>
                                <div class="flex items-center gap-3">
                                    <div>
                                        <div class="font-medium text-900">{{ menu.name }}</div>
                                        <div class="text-xs text-500 mt-1">{{ menu.description }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="text-600">{{ getLocationName(menu.locationId) || menu.locationName || '-' }}</td>
                            <td class="font-semibold text-900">{{ formatPrice(menu.setPrice) }}</td>
                            <td>
                                <span class="px-2 py-1 border-round text-xs font-medium"
                                      style="background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0;">
                                    {{ menu.menuItems?.length ?? 0 }} món
                                </span>
                            </td>
                            <td>
                                <span class="font-medium"
                                      [style.color]="menu.status === 'INACTIVE' ? '#ef4444' : '#22c55e'">
                                    {{ menu.status === 'INACTIVE' ? 'Không hoạt động' : 'Hoạt động' }}
                                </span>
                            </td>
                            <td>
                                <div class="flex gap-1">
                                    <p-button icon="pi pi-eye" [rounded]="true" [text]="true"
                                        severity="secondary" (click)="viewSetMenu(menu)"
                                        pTooltip="Xem chi tiết" tooltipPosition="top" />
                                    <p-button *ngIf="canEditMenu" icon="pi pi-pencil" [rounded]="true" [text]="true"
                                        severity="secondary" (click)="editSetMenu(menu)"
                                        pTooltip="Chỉnh sửa" tooltipPosition="top" />
                                    <p-button *ngIf="canEditMenu"
                                        [icon]="menu.status === 'INACTIVE' ? 'pi pi-check-circle' : 'pi pi-ban'"
                                        [severity]="menu.status === 'INACTIVE' ? 'success' : 'warn'"
                                        [rounded]="true" [text]="true"
                                        (click)="toggleStatus(menu)"
                                        [pTooltip]="menu.status === 'INACTIVE' ? 'Kích hoạt' : 'Vô hiệu hóa'"
                                        tooltipPosition="top" />
                                </div>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template #emptymessage>
                        <tr>
                            <td colspan="7" class="text-center py-8 text-500">
                                <i class="pi pi-inbox text-4xl mb-3 block"></i>
                                Không có set menu nào
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>

            <!-- Dialog Thêm / Sửa -->
            <p-dialog
                [(visible)]="menuDialog"
                [style]="{ width: '680px' }"
                [header]="editingMenu?.id ? 'Chỉnh sửa set menu' : 'Thêm set menu mới'"
                [modal]="true"
                styleClass="p-fluid"
            >
                <ng-template #content>
                    <div class="text-sm text-500 mb-5">
                        {{ editingMenu?.id ? 'Cập nhật thông tin set menu' : 'Thêm set menu mới vào hệ thống' }}
                    </div>
                    <div class="flex flex-col gap-5">

                        <!-- Tên -->
                        <div>
                            <label class="block font-semibold mb-2 text-sm">Tên set menu <span class="text-red-500">*</span></label>
                            <input type="text" pInputText [(ngModel)]="editingMenu.name" fluid
                                placeholder="VD: Set menu Hoàng Gia"
                                [class.ng-invalid]="submitted && !editingMenu.name"
                                [class.ng-dirty]="submitted && !editingMenu.name" />
                            <small class="text-red-500" *ngIf="submitted && !editingMenu.name">Tên set menu là bắt buộc.</small>
                        </div>

                        <!-- Chi nhánh -->
                        <div>
                            <label class="block font-semibold mb-2 text-sm">Chi nhánh <span class="text-red-500">*</span></label>
                            <p-select
                                [(ngModel)]="editingMenu.locationId"
                                [options]="locationOptions"
                                optionLabel="label" optionValue="value"
                                placeholder="Chọn chi nhánh..." fluid
                                [class.ng-invalid]="submitted && !editingMenu.locationId"
                            />
                            <small class="text-red-500" *ngIf="submitted && !editingMenu.locationId">Chi nhánh là bắt buộc.</small>
                        </div>

                        <!-- Mô tả -->
                        <div>
                            <label class="block font-semibold mb-2 text-sm">Mô tả</label>
                            <textarea pTextarea [(ngModel)]="editingMenu.description"
                                rows="2" fluid class="w-full"
                                placeholder="Mô tả về set menu..."></textarea>
                        </div>

                        <!-- Trạng thái -->
                        <div class="flex items-center justify-between py-2 px-3 border-round"
                             style="background: #f8fafc; border: 1px solid #e2e8f0;">
                            <span class="font-semibold text-sm text-700">Trạng thái hoạt động</span>
                            <p-toggleswitch [(ngModel)]="isActive" />
                        </div>

                        <!-- Danh sách món ăn -->
                        <div>
                            <div class="flex items-center justify-between mb-3">
                                <label class="font-semibold text-sm">Danh sách món ăn</label>
                                <p-button label="Thêm món" icon="pi pi-plus" size="small"
                                    severity="secondary" [outlined]="true" (click)="addMenuItem()" />
                            </div>

                            <div *ngIf="editingMenu.menuItems?.length === 0" class="text-center py-4 text-500 text-sm border-round"
                                 style="border: 1px dashed #e2e8f0;">
                                Chưa có món ăn. Nhấn "Thêm món" để bắt đầu.
                            </div>

                            <div class="flex flex-col gap-3" *ngIf="editingMenu.menuItems && editingMenu.menuItems.length > 0">
                                <!-- Header -->
                                <div class="grid gap-2 text-xs font-semibold text-500 uppercase px-1"
                                     style="grid-template-columns: 2fr 1fr 1fr 1fr 36px;">
                                    <span>Tên món</span>
                                    <span>Đơn giá (đ)</span>
                                    <span>Số lượng</span>
                                    <span>Thứ tự</span>
                                    <span></span>
                                </div>

                                <div *ngFor="let item of editingMenu.menuItems; let i = index"
                                     class="grid gap-2 items-center px-1"
                                     style="grid-template-columns: 2fr 1fr 1fr 1fr 36px;">
                                    <input type="text" pInputText [(ngModel)]="item.name"
                                        placeholder="Tên món..." style="font-size:0.85rem" />
                                    <p-inputnumber [(ngModel)]="item.unitPrice" [min]="0"
                                        [useGrouping]="false" placeholder="0" inputStyleClass="text-sm" />
                                    <p-inputnumber [(ngModel)]="item.quantity" [min]="1"
                                        [useGrouping]="false" placeholder="1" inputStyleClass="text-sm" />
                                    <p-inputnumber [(ngModel)]="item.courseOrder" [min]="1"
                                        [useGrouping]="false" placeholder="1" inputStyleClass="text-sm" />
                                    <p-button icon="pi pi-trash" [rounded]="true" [text]="true"
                                        severity="danger" (click)="removeMenuItem(i)"
                                        pTooltip="Xóa" tooltipPosition="top" />
                                </div>
                            </div>
                        </div>

                    </div>
                </ng-template>

                <ng-template #footer>
                    <div class="flex justify-end gap-2">
                        <p-button label="Hủy" icon="pi pi-times" text (click)="hideDialog()" />
                        <p-button
                            [label]="editingMenu?.id ? 'Cập nhật' : 'Thêm mới'"
                            icon="pi pi-check" severity="primary"
                            (click)="saveSetMenu()" [loading]="saving" />
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
    providers: [MessageService, SetMenuService, ConfirmationService, LocationService]
})
export class SetMenuComponent implements OnInit {
    readonly roleCode = (localStorage.getItem('codeRole') ?? '').toUpperCase();
    readonly canEditMenu = this.roleCode.includes('ADMIN') || this.roleCode.includes('MANAGER');

    setMenus = signal<SetMenu[]>([]);
    loading = false;
    saving = false;
    totalRecords = 0;
    pageSize = 20;
    currentPage = 0;
    searchKeyword = '';
    searchTimeout: any;

    menuDialog = false;
    submitted = false;
    isActive = true;
    editingMenu: any = { menuItems: [] };

    locationOptions: { label: string; value: number }[] = [];
    cols: Column[] = [];

    @ViewChild('dt') dt!: Table;
    private setMenuService = inject(SetMenuService)

    constructor(
        private locationService: LocationService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
        private router: Router
    ) { }

    ngOnInit() {
        this.cols = [
            { field: 'name', header: 'Tên set menu' },
            { field: 'locationId', header: 'Chi nhánh' },
            { field: 'setPrice', header: 'Giá' },
            { field: 'status', header: 'Trạng thái' }
        ];
        this.loadLocations();
        this.loadSetMenus();
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

    // ── Set Menus ──────────────────────────────────────────────────────────────
    loadSetMenus(page = 0, size = this.pageSize, name?: string) {
        this.loading = true;
        this.setMenuService.searchSetMenus({ page, size, name }).subscribe({
            next: (res) => {
                if (res.data) {
                    this.setMenus.set(res.data.content);
                    this.totalRecords = res.data.totalElements;
                }
                this.loading = false;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách set menu', life: 3000 });
                this.loading = false;
            }
        });
    }

    onLazyLoad(event: any) {
        this.currentPage = event.first / event.rows;
        this.pageSize = event.rows;
        this.loadSetMenus(this.currentPage, event.rows, this.searchKeyword || undefined);
    }

    onSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.loadSetMenus(0, this.pageSize, this.searchKeyword || undefined);
        }, 400);
    }

    viewSetMenu(menu: SetMenu) {
        this.router.navigate(['/pages/set-menu', menu.id]);
    }

    // ── Menu Items ─────────────────────────────────────────────────────────────
    addMenuItem() {
        if (!this.editingMenu.menuItems) this.editingMenu.menuItems = [];
        this.editingMenu.menuItems.push({
            name: '', unitPrice: 0, quantity: 1, courseOrder: this.editingMenu.menuItems.length + 1
        });
    }

    removeMenuItem(index: number) {
        this.editingMenu.menuItems.splice(index, 1);
    }

    // ── CRUD ───────────────────────────────────────────────────────────────────
    openNew() {
        if (!this.canEditMenu) return;
        this.editingMenu = { menuItems: [], code: this.generateUUID() };
        this.isActive = true;
        this.submitted = false;
        this.menuDialog = true;
    }

    editSetMenu(menu: SetMenu) {
        if (!this.canEditMenu) return;
        this.setMenuService.getById(menu.id).subscribe({
            next: (res) => {
                if (res.code === 200) {
                    this.editingMenu = { ...res.data, menuItems: res.data.menuItems ?? [] };
                    this.isActive = res.data.status !== 'INACTIVE';
                    this.submitted = false;
                    this.menuDialog = true;
                }
            },
            error: () => {
                // fallback nếu không có API getById
                this.editingMenu = { ...menu, menuItems: menu.menuItems ?? [] };
                this.isActive = menu.status !== 'INACTIVE';
                this.submitted = false;
                this.menuDialog = true;
            }
        });
    }

    hideDialog() {
        this.menuDialog = false;
        this.submitted = false;
    }

    saveSetMenu() {
        if (!this.canEditMenu) return;
        this.submitted = true;
        if (!this.editingMenu.name?.trim() || !this.editingMenu.locationId) return;

        this.saving = true;
        const payload = {
            code: this.editingMenu.code ?? this.generateUUID(),
            name: this.editingMenu.name,
            description: this.editingMenu.description,
            locationId: this.editingMenu.locationId,
            menuItems: (this.editingMenu.menuItems ?? []).filter((i: MenuItem) => i.name?.trim())
        };

        if (this.editingMenu.id) {
            const currentlyActive = this.editingMenu.status !== 'INACTIVE';
            const needsStatusChange = this.isActive !== currentlyActive;

            this.setMenuService.updateSetMenu(this.editingMenu.id, payload).subscribe({
                next: () => {
                    if (needsStatusChange) {
                        this.setMenuService.changeStatus(this.editingMenu.id).subscribe({
                            next: () => this.afterSave('Đã cập nhật set menu'),
                            error: () => this.afterSave('Đã cập nhật set menu')
                        });
                    } else {
                        this.afterSave('Đã cập nhật set menu');
                    }
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật set menu', life: 3000 });
                    this.saving = false;
                }
            });
        } else {
            this.setMenuService.createSetMenu(payload).subscribe({
                next: () => this.afterSave('Đã thêm set menu mới'),
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể thêm set menu', life: 3000 });
                    this.saving = false;
                }
            });
        }
    }

    private afterSave(detail: string) {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail, life: 3000 });
        this.menuDialog = false;
        this.saving = false;
        this.loadSetMenus(this.currentPage, this.pageSize);
    }

    toggleStatus(menu: SetMenu) {
        if (!this.canEditMenu) return;
        const action = menu.status === 'INACTIVE' ? 'kích hoạt' : 'vô hiệu hóa';
        this.confirmationService.confirm({
            message: `Bạn có chắc muốn ${action} set menu "${menu.name}"?`,
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có', rejectLabel: 'Không',
            accept: () => {
                this.setMenuService.changeStatus(menu.id).subscribe({
                    next: () => {
                        this.loadSetMenus(this.currentPage, this.pageSize);
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã ${action} set menu`, life: 3000 });
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || 'Thao tác thất bại', life: 3000 });
                    }
                });
            }
        });
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    formatPrice(price?: number): string {
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