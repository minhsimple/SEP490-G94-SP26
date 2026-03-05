import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MenuItemService } from '../service/menu-item.service';

@Component({
    selector: 'app-menu-item-detail',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, ToastModule,
        DialogModule, InputTextModule, SelectModule,
        InputNumberModule, TextareaModule, ConfirmDialogModule,
        TooltipModule, ToggleSwitchModule
    ],
    template: `
        <div class="card" *ngIf="!loading">
            <p-toast />

            <!-- Back button -->
            <div class="flex items-center gap-2 mb-4 cursor-pointer text-500 hover:text-700"
                 (click)="goBack()" style="width: fit-content;">
                <i class="pi pi-arrow-left"></i>
                <span class="text-sm font-medium">Quay lại danh sách món ăn</span>
            </div>

            <div *ngIf="item">
                <!-- Hero with image gallery -->
                <div class="detail-hero">
                    <div class="hero-gallery" *ngIf="images.length > 0">
                        <img [src]="images[currentImageIndex]" [alt]="item.name" class="hero-image" (click)="openImageViewer(currentImageIndex)" />
                        <div class="hero-nav" *ngIf="images.length > 1">
                            <button class="hero-nav-btn" (click)="prevImage($event)">
                                <i class="pi pi-chevron-left"></i>
                            </button>
                            <button class="hero-nav-btn" (click)="nextImage($event)">
                                <i class="pi pi-chevron-right"></i>
                            </button>
                        </div>
                        <div class="hero-counter" *ngIf="images.length > 1">
                            {{ currentImageIndex + 1 }} / {{ images.length }}
                        </div>
                    </div>
                    <div class="detail-hero-overlay" [class.no-image]="images.length === 0">
                        <h2 class="detail-hero-title">{{ item.name }}</h2>
                        <div class="flex gap-2 mt-2 flex-wrap items-center">
                            <span class="detail-tag">
                                <i class="pi pi-th-large mr-1"></i>{{ item.categoryMenuItem?.name || '-' }}
                            </span>
                            <span class="detail-tag">
                                <i class="pi pi-map-marker mr-1"></i>{{ item.location?.name || '-' }}
                            </span>
                        </div>
                        <span class="detail-status-badge"
                              [style.background]="item.status === 'inactive' ? '#ef4444' : '#22c55e'">
                            <i [class]="item.status === 'inactive' ? 'pi pi-times-circle' : 'pi pi-check-circle'" class="mr-1"></i>
                            {{ item.status === 'inactive' ? 'Không hoạt động' : 'Đang cung cấp' }}
                        </span>
                    </div>
                </div>

                <!-- Thumbnail strip -->
                <div class="thumb-strip mt-3" *ngIf="images.length > 1">
                    <div *ngFor="let img of images; let i = index"
                         class="thumb-item"
                         [class.active]="i === currentImageIndex"
                         (click)="currentImageIndex = i">
                        <img [src]="img" [alt]="'Ảnh ' + (i+1)" />
                    </div>
                </div>

                <!-- Info grid + Description side by side -->
                <div class="detail-content-grid mt-4">
                    <!-- Left: Info -->
                    <div class="detail-card">
                        <div class="font-semibold text-900 mb-3">
                            <i class="pi pi-info-circle mr-2" style="color: #3b82f6;"></i>Thông tin món ăn
                        </div>
                        <div class="detail-info-list">
                            <div class="detail-info-item">
                                <span class="text-500 text-sm">Mã món</span>
                                <span class="font-semibold text-900">{{ item.code || '-' }}</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="text-500 text-sm">Danh mục</span>
                                <span class="font-semibold text-900">{{ item.categoryMenuItem?.name || '-' }}</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="text-500 text-sm">Chi nhánh</span>
                                <span class="font-semibold text-900">{{ item.location?.name || '-' }}</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="text-500 text-sm">Đơn giá</span>
                                <span class="font-bold" style="color: #3b82f6;">{{ item.unitPrice != null ? (+item.unitPrice | number:'1.0-0') + ' đ' : '-' }}</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="text-500 text-sm">Đơn vị</span>
                                <span class="font-semibold text-900">{{ item.unit || '-' }}</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="text-500 text-sm">Trạng thái</span>
                                <span class="font-semibold"
                                      [style.color]="item.status === 'inactive' ? '#ef4444' : '#22c55e'">
                                    {{ item.status === 'inactive' ? 'Không hoạt động' : 'Đang cung cấp' }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Right: Description -->
                    <div class="detail-card">
                        <div class="font-semibold text-900 mb-3">
                            <i class="pi pi-align-left mr-2" style="color: #3b82f6;"></i>Mô tả món ăn
                        </div>
                        <div class="text-600 text-sm" style="line-height: 1.8;">
                            {{ item.description || 'Chưa có mô tả' }}
                        </div>
                    </div>
                </div>

                <!-- Footer buttons -->
                <div class="flex justify-end gap-2 mt-5">
                    <p-button label="Quay lại" icon="pi pi-arrow-left" [outlined]="true" severity="secondary" (onClick)="goBack()" />
                    <p-button
                        [label]="item.status === 'inactive' ? 'Kích hoạt' : 'Vô hiệu hóa'"
                        [icon]="item.status === 'inactive' ? 'pi pi-check-circle' : 'pi pi-ban'"
                        [severity]="item.status === 'inactive' ? 'success' : 'warn'"
                        [outlined]="true"
                        (onClick)="toggleStatus()"
                        [loading]="togglingStatus" />
                    <p-button label="Chỉnh sửa món ăn" icon="pi pi-pencil" severity="primary" (onClick)="openEdit()" />
                </div>
            </div>

            <!-- Not found state -->
            <div *ngIf="!item" class="text-center py-8 text-500">
                <i class="pi pi-info-circle text-4xl mb-3 block"></i>
                Không tìm thấy món ăn
            </div>

            <!-- Dialog Chỉnh sửa -->
            <p-dialog
                [(visible)]="editDialog"
                [style]="{ width: '540px' }"
                header="Chỉnh sửa món ăn"
                [modal]="true"
                styleClass="p-fluid"
            >
                <ng-template #content>
                    <div class="text-sm text-500 mb-5">Cập nhật thông tin món ăn</div>
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

                        <!-- Đơn giá & Đơn vị trên cùng hàng -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
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
                            <div>
                                <label class="block font-semibold mb-2 text-sm">Đơn vị <span class="text-red-500">*</span></label>
                                <input type="text" pInputText [(ngModel)]="editingItem.unit" fluid
                                    placeholder="VD: phần, tô, dĩa..."
                                    [class.ng-invalid]="submitted && !editingItem.unit"
                                    [class.ng-dirty]="submitted && !editingItem.unit" />
                                <small class="text-red-500" *ngIf="submitted && !editingItem.unit">Đơn vị là bắt buộc.</small>
                            </div>
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
                        <p-button label="Hủy" icon="pi pi-times" text (click)="editDialog = false" />
                        <p-button label="Cập nhật" icon="pi pi-check" severity="primary"
                            (click)="saveEdit()" [loading]="saving" />
                    </div>
                </ng-template>
            </p-dialog>

            <!-- Image Viewer Dialog -->
            <p-dialog
                [(visible)]="imageViewerVisible"
                [style]="{ width: '90vw', maxWidth: '900px' }"
                [modal]="true"
                [showHeader]="false"
                styleClass="image-viewer-dialog"
            >
                <ng-template #content>
                    <div class="image-viewer" *ngIf="images.length > 0">
                        <img [src]="images[viewerImageIndex]" [alt]="item?.name" class="viewer-image" />
                        <div class="viewer-nav" *ngIf="images.length > 1">
                            <button class="viewer-nav-btn" (click)="viewerPrev()">
                                <i class="pi pi-chevron-left text-xl"></i>
                            </button>
                            <button class="viewer-nav-btn" (click)="viewerNext()">
                                <i class="pi pi-chevron-right text-xl"></i>
                            </button>
                        </div>
                        <div class="viewer-counter">{{ viewerImageIndex + 1 }} / {{ images.length }}</div>
                        <button class="viewer-close" (click)="imageViewerVisible = false">
                            <i class="pi pi-times"></i>
                        </button>
                    </div>
                </ng-template>
            </p-dialog>

            <p-confirmdialog />
        </div>

        <!-- Full page loading -->
        <div *ngIf="loading" class="card text-center py-8">
            <i class="pi pi-spin pi-spinner text-4xl text-500"></i>
            <div class="text-500 mt-3">Đang tải thông tin món ăn...</div>
        </div>
    `,
    styles: [`
        .detail-hero {
            border-radius: 12px;
            min-height: 220px;
            position: relative;
            display: flex;
            align-items: flex-end;
            overflow: hidden;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #3b82a0 100%);
        }
        .hero-gallery {
            position: absolute; inset: 0;
        }
        .hero-image {
            width: 100%; height: 100%;
            object-fit: cover; cursor: pointer;
            transition: transform 0.3s ease;
        }
        .hero-image:hover { transform: scale(1.02); }
        .hero-nav {
            position: absolute; top: 50%; left: 0; right: 0;
            display: flex; justify-content: space-between;
            padding: 0 0.75rem; transform: translateY(-50%);
            pointer-events: none;
        }
        .hero-nav-btn {
            background: rgba(0,0,0,0.5); color: white; border: none;
            width: 36px; height: 36px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; pointer-events: auto;
            transition: background 0.2s;
        }
        .hero-nav-btn:hover { background: rgba(0,0,0,0.75); }
        .hero-counter {
            position: absolute; top: 1rem; left: 1rem;
            background: rgba(0,0,0,0.6); color: white;
            padding: 4px 12px; border-radius: 20px;
            font-size: 0.75rem; font-weight: 600;
        }
        .detail-hero-overlay {
            width: 100%; padding: 1.5rem;
            background: linear-gradient(transparent 0%, rgba(0,0,0,0.7) 100%);
            position: relative; z-index: 1;
        }
        .detail-hero-overlay.no-image {
            min-height: 180px; display: flex; flex-direction: column; justify-content: flex-end;
        }
        .detail-hero-title {
            color: white; font-size: 1.75rem; font-weight: 700; margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .detail-tag {
            display: inline-flex; align-items: center;
            background: rgba(255,255,255,0.2); backdrop-filter: blur(4px);
            color: white; border-radius: 20px;
            padding: 4px 12px; font-size: 0.8rem;
        }
        .detail-status-badge {
            position: absolute; top: 1.5rem; right: 1.5rem;
            display: inline-flex; align-items: center;
            color: white; border-radius: 20px;
            padding: 6px 14px; font-size: 0.8rem; font-weight: 600;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .thumb-strip {
            display: flex; gap: 8px; overflow-x: auto;
            padding-bottom: 4px;
        }
        .thumb-item {
            width: 64px; height: 48px; border-radius: 8px;
            overflow: hidden; cursor: pointer; flex-shrink: 0;
            border: 2px solid transparent;
            transition: border-color 0.2s, opacity 0.2s;
            opacity: 0.6;
        }
        .thumb-item.active { border-color: #3b82f6; opacity: 1; }
        .thumb-item:hover { opacity: 1; }
        .thumb-item img { width: 100%; height: 100%; object-fit: cover; }
        .detail-content-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
        }
        .detail-card {
            background: #f8fafc; border-radius: 12px;
            padding: 1.25rem; border: 1px solid #e2e8f0;
        }
        .detail-info-list {
            display: flex; flex-direction: column;
        }
        .detail-info-item {
            display: flex; justify-content: space-between; align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
            font-size: 0.85rem;
        }
        .detail-info-item:last-child { border-bottom: none; }
        /* Image Viewer */
        .image-viewer {
            position: relative; text-align: center;
            background: #000; border-radius: 8px; overflow: hidden;
        }
        .viewer-image {
            max-width: 100%; max-height: 75vh; object-fit: contain;
        }
        .viewer-nav {
            position: absolute; top: 50%; left: 0; right: 0;
            display: flex; justify-content: space-between;
            padding: 0 1rem; transform: translateY(-50%);
            pointer-events: none;
        }
        .viewer-nav-btn {
            background: rgba(255,255,255,0.2); color: white; border: none;
            width: 44px; height: 44px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; pointer-events: auto;
            transition: background 0.2s;
        }
        .viewer-nav-btn:hover { background: rgba(255,255,255,0.4); }
        .viewer-counter {
            position: absolute; bottom: 1rem; left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.6); color: white;
            padding: 4px 16px; border-radius: 20px;
            font-size: 0.85rem;
        }
        .viewer-close {
            position: absolute; top: 0.75rem; right: 0.75rem;
            background: rgba(0,0,0,0.5); color: white; border: none;
            width: 32px; height: 32px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
        }
        .viewer-close:hover { background: rgba(0,0,0,0.75); }
        :host ::ng-deep {
            .p-dialog .p-dialog-header { padding: 1.25rem 1.5rem 0.5rem; font-weight: 700; font-size: 1.1rem; }
            .p-dialog .p-dialog-content { padding: 0 1.5rem 1rem; }
            .p-dialog .p-dialog-footer { padding: 0.75rem 1.5rem 1.25rem; border-top: 1px solid #f1f5f9; }
            .image-viewer-dialog .p-dialog-content { padding: 0 !important; background: transparent !important; }
        }
        @media (max-width: 768px) {
            .detail-content-grid { grid-template-columns: 1fr; }
        }
    `],
    providers: [MessageService, MenuItemService, ConfirmationService]
})
export class MenuItemDetailComponent implements OnInit {
    item: any = null;
    loading = true;
    saving = false;
    togglingStatus = false;

    editDialog = false;
    submitted = false;
    editingItem: any = {};
    categories: any[] = [];
    locations: any[] = [];

    // Images
    images: string[] = [];
    currentImageIndex = 0;
    imageViewerVisible = false;
    viewerImageIndex = 0;

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private menuItemService = inject(MenuItemService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private cdr = inject(ChangeDetectorRef);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadItem(id);
            this.loadDropdowns();
        } else {
            this.loading = false;
        }
    }

    loadItem(id: any) {
        this.loading = true;
        this.menuItemService.getById(id).subscribe({
            next: (res: any) => {
                this.item = res?.data ?? null;
                this.buildImages();
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.item = null;
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải thông tin món ăn', life: 3000 });
                this.cdr.detectChanges();
            }
        });
    }

    /** Reload data without showing loading spinner */
    refreshItem(id: any) {
        this.menuItemService.getById(id).subscribe({
            next: (res: any) => {
                this.item = res?.data ?? null;
                this.buildImages();
                this.cdr.detectChanges();
            }
        });
    }

    buildImages() {
        // TODO: When backend supports images, populate from item.images
        // For now, use placeholder food images
        this.images = [
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop',
            'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
            'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=400&fit=crop'
        ];
        this.currentImageIndex = 0;
    }

    prevImage(event: Event) {
        event.stopPropagation();
        this.currentImageIndex = this.currentImageIndex > 0 ? this.currentImageIndex - 1 : this.images.length - 1;
    }

    nextImage(event: Event) {
        event.stopPropagation();
        this.currentImageIndex = this.currentImageIndex < this.images.length - 1 ? this.currentImageIndex + 1 : 0;
    }

    openImageViewer(index: number) {
        this.viewerImageIndex = index;
        this.imageViewerVisible = true;
    }

    viewerPrev() {
        this.viewerImageIndex = this.viewerImageIndex > 0 ? this.viewerImageIndex - 1 : this.images.length - 1;
    }

    viewerNext() {
        this.viewerImageIndex = this.viewerImageIndex < this.images.length - 1 ? this.viewerImageIndex + 1 : 0;
    }

    loadDropdowns() {
        this.menuItemService.getCategories().subscribe({
            next: (res: any) => { if (res?.data?.content) this.categories = res.data.content; }
        });
        this.menuItemService.getLocations().subscribe({
            next: (res: any) => { if (res?.data?.content) this.locations = res.data.content; }
        });
    }

    toggleStatus() {
        if (!this.item) return;
        const action = this.item.status === 'inactive' ? 'kích hoạt' : 'vô hiệu hóa';
        this.confirmationService.confirm({
            message: `Bạn có chắc muốn ${action} món ăn "${this.item.name}"?`,
            header: 'Xác nhận thay đổi trạng thái',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.togglingStatus = true;
                this.menuItemService.changeStatus(this.item.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã ${action} món ăn`, life: 3000 });
                        this.togglingStatus = false;
                        this.refreshItem(this.item.id);
                    },
                    error: (err: any) => {
                        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err?.error?.message || 'Không thể thay đổi trạng thái', life: 3000 });
                        this.togglingStatus = false;
                    }
                });
            }
        });
    }

    openEdit() {
        if (!this.item) return;
        this.editingItem = {
            ...this.item,
            categoryMenuItemsId: this.item.categoryMenuItem?.id,
            locationId: this.item.location?.id,
            unitPrice: parseFloat(this.item.unitPrice) || 0
        };
        this.submitted = false;
        this.editDialog = true;
    }

    saveEdit() {
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

        this.menuItemService.update(this.item.id, payload).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật món ăn', life: 3000 });
                this.editDialog = false;
                this.saving = false;
                this.refreshItem(this.item.id);
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể cập nhật món ăn', life: 3000 });
                this.saving = false;
            }
        });
    }

    goBack() {
        this.router.navigate(['/pages/menu-item']);
    }
}
