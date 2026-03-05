import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LocationService } from '../service/location.service';
import { SetMenuService, MenuItem } from '../service/set-menu';

interface CategoryGroup {
    categoryName: string;
    items: any[];
    expanded: boolean;
}

@Component({
    selector: 'app-set-menu-edit',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        ButtonModule, InputTextModule, SelectModule,
        TextareaModule, ToggleSwitchModule, ToastModule,
        CheckboxModule, TooltipModule
    ],
    template: `
        <p-toast />

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 surface-card border-bottom-1 surface-border">
            <div class="flex items-center gap-3">
                <p-button icon="pi pi-arrow-left" [rounded]="true" [text]="true"
                    severity="secondary" (click)="goBack()" />
                <div>
                    <div class="text-xl font-bold text-900">
                        {{ isEditing ? 'Chỉnh sửa set menu' : 'Thêm set menu mới' }}
                    </div>
                    <div class="text-sm text-500">
                        {{ isEditing ? 'Cập nhật thông tin và danh sách món ăn' : 'Tạo set menu mới với danh sách món ăn' }}
                    </div>
                </div>
            </div>
            <p-button
                [label]="isEditing ? 'Cập nhật' : 'Tạo set menu'"
                icon="pi pi-save"
                severity="primary"
                (click)="save()"
                [loading]="saving"
            />
        </div>

        <!-- Body -->
        <div class="p-6">
            <div class="grid gap-5" style="grid-template-columns: 380px 1fr;">

                <!-- Cột trái -->
                <div class="flex flex-col gap-4">

                    <div class="surface-card border-round-xl p-4" style="border:1px solid #e2e8f0;">
                        <div class="font-semibold text-900 mb-4">Thông tin set menu</div>

                        <div class="flex flex-col gap-4">
                            <div>
                                <label class="block text-sm font-medium mb-2">
                                    Tên set menu <span class="text-red-500">*</span>
                                </label>
                                <input type="text" pInputText [(ngModel)]="form.name" fluid
                                    placeholder="VD: Set menu A - Thượng hạng"
                                    [class.ng-invalid]="submitted && !form.name"
                                    [class.ng-dirty]="submitted && !form.name" />
                                <small class="text-red-500" *ngIf="submitted && !form.name">
                                    Tên set menu là bắt buộc.
                                </small>
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-2">Chi nhánh</label>
                                <p-select
                                    [(ngModel)]="form.locationId"
                                    [options]="locationOptions"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="-- Không chọn --"
                                    fluid
                                    [showClear]="true"
                                    (onChange)="onLocationChange()"
                                />
                            </div>

                            <div>
                                <label class="block text-sm font-medium mb-2">Mô tả</label>
                                <textarea pTextarea [(ngModel)]="form.description"
                                    rows="3" fluid
                                    placeholder="Mô tả set menu..."></textarea>
                            </div>

                            <div class="flex items-center justify-between py-2 px-3 border-round"
                                 style="background:#f8fafc; border:1px solid #e2e8f0;">
                                <span class="text-sm font-medium text-700">Đang cung cấp</span>
                                <p-toggleswitch [(ngModel)]="isActive" />
                            </div>
                        </div>
                    </div>

                    <!-- Tổng kết -->
                    <div class="surface-card border-round-xl p-4" style="border:1px solid #e2e8f0;">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-sm text-600">Số món đã chọn</span>
                            <span class="text-sm font-medium">{{ selectedItems.length }} món</span>
                        </div>
                        <div class="flex items-center justify-between">
                            <span class="font-semibold text-900">Tổng giá / bàn</span>
                            <span class="font-bold text-primary text-lg">{{ formatPrice(totalPrice) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Cột phải: Chọn món ăn -->
                <div class="surface-card border-round-xl p-4" style="border:1px solid #e2e8f0; min-height: 400px;">
                    <div class="font-semibold text-900 mb-3">Chọn món ăn</div>

                    <!-- Chưa chọn chi nhánh -->
                    <div *ngIf="!form.locationId"
                         class="flex flex-col items-center justify-center py-16 text-500">
                        <span class="text-5xl mb-3" style="opacity:0.3;">🍴</span>
                        <div class="text-base">Vui lòng chọn chi nhánh để hiển thị danh sách món ăn</div>
                        <div class="text-sm mt-1 text-400">Chọn chi nhánh để xem danh sách món ăn</div>
                    </div>

                    <!-- Đã chọn chi nhánh -->
                    <div *ngIf="form.locationId">

                        <!-- Search box -->
                        <div class="mb-4" style="position:relative;">
                            <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:#94a3b8;">
                                <i class="pi pi-search"></i>
                            </span>
                            <input
                                type="text"
                                pInputText
                                [(ngModel)]="searchKeyword"
                                (ngModelChange)="onSearch()"
                                placeholder="Tìm món ăn..."
                                style="padding-left: 2.2rem; width:100%;"
                            />
                        </div>

                        <!-- Loading -->
                        <div *ngIf="loadingItems" class="text-center py-8 text-500">
                            <i class="pi pi-spin pi-spinner text-2xl"></i>
                        </div>

                        <!-- Không có món -->
                        <div *ngIf="!loadingItems && !filteredCategories.length"
                             class="flex flex-col items-center justify-center py-16 text-500">
                            <span class="text-4xl mb-3" style="opacity:0.3;">🍴</span>
                            <div>Chưa có món ăn nào trong chi nhánh này</div>
                        </div>

                        <!-- Danh sách theo category -->
                        <div *ngIf="!loadingItems && filteredCategories.length"
                             class="flex flex-col gap-2">

                            <div *ngFor="let group of filteredCategories"
                                 class="border-round overflow-hidden"
                                 style="border:1px solid #e2e8f0;">

                                <!-- Category header -->
                                <div class="flex items-center justify-between px-4 py-3 cursor-pointer"
                                     style="background:#f8fafc;"
                                     (click)="toggleCategory(group)">
                                    <div class="flex items-center gap-2">
                                        <i class="pi text-xs text-400"
                                           [class.pi-chevron-right]="!group.expanded"
                                           [class.pi-chevron-down]="group.expanded"></i>
                                        <span class="font-semibold text-sm text-800 uppercase">
                                            {{ group.categoryName }}
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-2 text-xs text-500">
                                        <span *ngIf="countSelectedInCategory(group) > 0"
                                              class="text-primary font-medium">
                                            {{ countSelectedInCategory(group) }} đã chọn
                                        </span>
                                        <span>{{ group.items.length }} món</span>
                                    </div>
                                </div>

                                <!-- Items -->
                                <div *ngIf="group.expanded" class="flex flex-col">
                                    <div *ngFor="let item of group.items"
                                         class="flex items-center justify-between px-4 py-3 cursor-pointer"
                                         [style]="isSelected(item)
                                            ? 'background:#eff6ff; border-top:1px solid #e2e8f0;'
                                            : 'background:#fff; border-top:1px solid #e2e8f0;'"
                                         (click)="toggleItem(item)">
                                        <div class="flex items-center gap-3">
                                            <p-checkbox
                                                [binary]="true"
                                                [ngModel]="isSelected(item)"
                                                (click)="$event.stopPropagation()"
                                                (onChange)="toggleItem(item)"
                                            />
                                            <div class="flex items-center justify-center border-round"
                                                 style="width:32px;height:32px;background:#f1f5f9;border:1px solid #e2e8f0;">
                                                <span style="font-size:14px;">🍽️</span>
                                            </div>
                                            <div>
                                                <div class="font-medium text-sm text-900">{{ item.name }}</div>
                                                <div class="text-xs text-400" *ngIf="item.description">
                                                    {{ item.description }}
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Right side: quantity controls (if selected) or price -->
                                        <div class="flex items-center gap-3" (click)="$event.stopPropagation()">
                                            <!-- Quantity stepper - shown only when selected -->
                                            <div *ngIf="isSelected(item)"
                                                 class="flex items-center gap-1"
                                                 style="border:1px solid #d1d5db; border-radius:6px; overflow:hidden;">
                                                <button
                                                    type="button"
                                                    class="flex items-center justify-center cursor-pointer"
                                                    style="width:28px;height:28px;background:#f3f4f6;border:none;color:#374151;font-size:16px;line-height:1;"
                                                    (click)="decreaseQuantity(item); $event.stopPropagation()"
                                                >−</button>
                                                <span
                                                    style="min-width:32px;text-align:center;font-size:13px;font-weight:600;color:#111827;">
                                                    {{ getQuantity(item) }}
                                                </span>
                                                <button
                                                    type="button"
                                                    class="flex items-center justify-center cursor-pointer"
                                                    style="width:28px;height:28px;background:#f3f4f6;border:none;color:#374151;font-size:16px;line-height:1;"
                                                    (click)="increaseQuantity(item); $event.stopPropagation()"
                                                >+</button>
                                            </div>

                                            <div class="text-right" style="min-width:80px;">
                                                <div class="font-semibold text-sm text-primary">
                                                    {{ formatPrice(item.unitPrice) }}
                                                </div>
                                                <div class="text-xs text-400">/ bàn</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `,
    styles: [`
        :host ::ng-deep {
            .p-toggleswitch { transform: scale(0.9); }
        }
        button:hover {
            background: #e5e7eb !important;
        }
    `],
    providers: [MessageService]
})
export class SetMenuEditComponent implements OnInit {
    isEditing = false;
    menuId: any = null;
    saving = false;
    submitted = false;
    isActive = true;
    loadingItems = false;
    searchKeyword = '';

    form: any = {
        name: '',
        locationId: null,
        description: '',
        code: '',
        currentStatus: 'active'
    };

    locationOptions: { label: string; value: number }[] = [];
    categoryGroups: CategoryGroup[] = [];
    filteredCategories: CategoryGroup[] = [];
    selectedItems: any[] = [];

    get totalPrice(): number {
        return this.selectedItems.reduce((sum, i) => sum + (i.unitPrice ?? 0) * (i.quantity ?? 1), 0);
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private setMenuService: SetMenuService,
        private locationService: LocationService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.locationService.searchLocations({ page: 0, size: 100 }).subscribe({
            next: (res: any) => {
                if (res.code === 200) {
                    this.locationOptions = res.data.content.map((l: any) => ({
                        label: l.name ?? '',
                        value: l.id
                    }));
                }
            }
        });

        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.isEditing = true;
            this.menuId = id;
            this.loadDetail(id);
        } else {
            this.form.code = this.generateUUID();
        }
    }

    loadDetail(id: any) {
        this.setMenuService.getById(id).subscribe({
            next: (res: any) => {
                if (res.code === 200) {
                    const data = res.data;
                    this.form = {
                        name: data.name,
                        description: data.description ?? '',
                        locationId: data.location?.id ?? data.locationId ?? null,
                        code: data.code ?? this.generateUUID(),
                        currentStatus: data.status ?? 'active'
                    };
                    this.isActive = data.status !== 'inactive';

                    if (data.menuItemsByCategory) {
                        const allItems: any[] = [];
                        Object.values(data.menuItemsByCategory).forEach((items: any) => {
                            allItems.push(...items);
                        });
                        this.selectedItems = allItems;
                    } else {
                        this.selectedItems = (data.menuItems ?? []).map((i: any) => ({
                            ...i,
                            quantity: i.quantity ?? 1
                        }));
                    }

                    if (this.form.locationId) this.loadAvailableItems();
                }
            }
        });
    }

    onLocationChange() {
        this.categoryGroups = [];
        this.filteredCategories = [];
        this.selectedItems = [];
        this.searchKeyword = '';
        if (this.form.locationId) this.loadAvailableItems();
    }

    loadAvailableItems() {
        this.loadingItems = true;
        const token = localStorage.getItem('accessToken');
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });

        const params = new HttpParams()
            .set('page', '0')
            .set('size', '200')
            .set('locationId', this.form.locationId)
            .set('sort', 'name,ASC');

        this.http.get<any>('http://localhost:8080/api/v1/menu-item/search', { headers, params })
            .subscribe({
                next: (res: any) => {
                    this.loadingItems = false;
                    if (res.code === 200) {
                        this.buildCategoryGroups(res.data.content ?? []);
                    }
                },
                error: () => {
                    this.loadingItems = false;
                    this.categoryGroups = [];
                    this.filteredCategories = [];
                }
            });
    }

    private buildCategoryGroups(items: any[]) {
        const map = new Map<string, any[]>();
        items.forEach(item => {
            const catName: string =
                item.categoryMenuItem?.name ??
                item.categoryName ??
                item.category?.name ??
                'Khác';
            if (!map.has(catName)) map.set(catName, []);
            map.get(catName)!.push(item);
        });

        this.categoryGroups = Array.from(map.entries()).map(([categoryName, groupItems]) => ({
            categoryName,
            items: groupItems,
            expanded: true
        }));
        this.filteredCategories = [...this.categoryGroups];
        this.cdr.markForCheck();
    }

    onSearch() {
        const kw = this.searchKeyword.trim().toLowerCase();
        if (!kw) {
            this.filteredCategories = this.categoryGroups.map(g => ({ ...g, items: [...g.items] }));
            return;
        }
        this.filteredCategories = this.categoryGroups
            .map(g => ({
                ...g,
                expanded: true,
                items: g.items.filter(i =>
                    (i.name ?? '').toLowerCase().includes(kw) ||
                    (i.description ?? '').toLowerCase().includes(kw)
                )
            }))
            .filter(g => g.items.length > 0);
    }

    toggleCategory(group: CategoryGroup) {
        group.expanded = !group.expanded;
    }

    countSelectedInCategory(group: CategoryGroup): number {
        return group.items.filter(i => this.isSelected(i)).length;
    }

    isSelected(item: any): boolean {
        return this.selectedItems.some(s => s.id === item.id);
    }

    toggleItem(item: any) {
        const idx = this.selectedItems.findIndex(s => s.id === item.id);
        if (idx >= 0) {
            this.selectedItems.splice(idx, 1);
        } else {
            this.selectedItems.push({ ...item, quantity: 1 });
        }
    }

    getQuantity(item: any): number {
        const found = this.selectedItems.find(s => s.id === item.id);
        return found?.quantity ?? 1;
    }

    increaseQuantity(item: any) {
        const found = this.selectedItems.find(s => s.id === item.id);
        if (found) {
            found.quantity = (found.quantity ?? 1) + 1;
        }
    }

    decreaseQuantity(item: any) {
        const found = this.selectedItems.find(s => s.id === item.id);
        if (found) {
            if (found.quantity <= 1) {
                // Remove item if quantity would go to 0
                const idx = this.selectedItems.findIndex(s => s.id === item.id);
                this.selectedItems.splice(idx, 1);
            } else {
                found.quantity -= 1;
            }
        }
    }

    save() {
        this.submitted = true;
        if (!this.form.name?.trim()) return;

        this.saving = true;

        // Payload matches: { id, quantity } per item
        const menuItems: { id: number; quantity: number }[] = this.selectedItems.map(item => ({
            id:       item.id,
            quantity: item.quantity ?? 1
        }));

        const payload = {
            code:        this.form.code ?? this.generateUUID(),
            name:        this.form.name.trim(),
            description: this.form.description ?? '',
            locationId:  this.form.locationId,
            menuItems
        };

        if (this.isEditing) {
            const needsStatusChange = this.isActive !== (this.form.currentStatus !== 'inactive');
            this.setMenuService.updateSetMenu(this.menuId, payload).subscribe({
                next: () => {
                    if (needsStatusChange) {
                        this.setMenuService.changeStatus(this.menuId).subscribe({
                            next: () => this.afterSave(),
                            error: () => this.afterSave()
                        });
                    } else {
                        this.afterSave();
                    }
                },
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Cập nhật thất bại', life: 3000 });
                    this.saving = false;
                }
            });
        } else {
            this.setMenuService.createSetMenu(payload).subscribe({
                next: () => this.afterSave(),
                error: () => {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Tạo thất bại', life: 3000 });
                    this.saving = false;
                }
            });
        }
    }

    private afterSave() {
        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã lưu set menu', life: 2000 });
        this.saving = false;
        setTimeout(() => this.goBack(), 1500);
    }

    goBack() {
        this.router.navigate(['/pages/set-menu']);
    }

    formatPrice(price?: number): string {
        if (!price && price !== 0) return '0 đ';
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    }

    private generateUUID(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
}