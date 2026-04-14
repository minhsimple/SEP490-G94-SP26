import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DecimalPipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { SetMenuService } from '../service/set-menu';

@Component({
    selector: 'app-set-menu-detail',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, ToastModule,
        DialogModule, ConfirmDialogModule, TooltipModule
    ],
    template: `
        <div class="card" *ngIf="!loading">
            <p-toast />

            <!-- Back button -->
            <div class="flex items-center gap-2 mb-4 cursor-pointer text-500 hover:text-700"
                 (click)="goBack()" style="width: fit-content;">
                <i class="pi pi-arrow-left"></i>
                <span class="text-sm font-medium">Quay lại danh sách set menu</span>
            </div>

            <div *ngIf="item">
                <!-- Hero -->
                <div class="detail-hero">
                    <div class="hero-placeholder" *ngIf="!heroImage">
                        <i class="pi pi-image" style="font-size: 3rem; color: #94a3b8;"></i>
                        <div class="text-sm mt-2" style="color: #94a3b8;">Chưa có ảnh set menu</div>
                    </div>
                    <img *ngIf="heroImage" [src]="heroImage" [alt]="item.name" class="hero-image" />
                    <div class="detail-hero-overlay">
                        <h2 class="detail-hero-title">{{ item.name }}</h2>
                        <div class="flex gap-2 mt-2 flex-wrap items-center">
                            <span class="detail-tag">
                                <i class="pi pi-map-marker mr-1"></i>{{ item.location?.name || '-' }}
                            </span>
                        </div>
                        <span class="detail-status-badge"
                              [style.background]="item.status === 'inactive' ? '#ef4444' : '#3b82f6'">
                            <i [class]="item.status === 'inactive' ? 'pi pi-times-circle' : 'pi pi-check-circle'" class="mr-1"></i>
                            {{ item.status === 'inactive' ? 'Không hoạt động' : 'Đang áp dụng' }}
                        </span>
                    </div>
                </div>

                <!-- Stats cards -->
                <div class="stats-grid mt-4">
                    <div class="stat-card">
                        <div class="stat-icon" style="color: #3b82f6;">
                            <i class="pi pi-dollar"></i>
                        </div>
                        <div class="stat-value" style="color: #3b82f6;">{{ formatPrice(item.setPrice) }}</div>
                        <div class="stat-label">Giá / bàn</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="color: #8b5cf6;">
                            <i class="pi pi-list"></i>
                        </div>
                        <div class="stat-value">{{ totalDishes }}</div>
                        <div class="stat-label">Tổng số món</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="color: #f59e0b;">
                            <i class="pi pi-th-large"></i>
                        </div>
                        <div class="stat-value">{{ categoryCount }}</div>
                        <div class="stat-label">Danh mục</div>
                    </div>
                </div>

                <!-- Description -->
                <div class="detail-card mt-4" *ngIf="item.description">
                    <div class="flex items-center gap-2 mb-3">
                        <i class="pi pi-align-left" style="color: #3b82f6;"></i>
                        <span class="font-semibold text-900">Mô tả</span>
                    </div>
                    <div class="text-600 text-sm" style="line-height: 1.8;">
                        {{ item.description }}
                    </div>
                </div>

                <!-- Dishes list grouped by category -->
                <div class="detail-card mt-4">
                    <div class="flex items-center gap-2 mb-4">
                        <i class="pi pi-utensils" style="color: #3b82f6; font-size: 1.1rem;">🍴</i>
                        <span class="font-semibold text-900 text-lg">Danh sách món ăn</span>
                    </div>

                    <div *ngIf="categoryKeys.length === 0" class="text-center py-6 text-500">
                        <i class="pi pi-inbox text-3xl mb-2 block"></i>
                        Chưa có món ăn nào trong set menu này
                    </div>

                    <div *ngFor="let category of categoryKeys; let last = last">
                        <!-- Category header -->
                        <div class="category-header">
                            <span class="category-label">{{ category }}</span>
                            <div class="category-line"></div>
                        </div>

                        <!-- Items in category -->
                        <div *ngFor="let dish of item.menuItemsByCategory[category]"
                             class="dish-row">
                            <div class="dish-image-container flex items-center justify-center bg-gray-100 border-round">
                                <img *ngIf="dish.imageUrls?.thumbnailUrl" [src]="dish.imageUrls?.thumbnailUrl" [alt]="dish.name"
                                     class="dish-image" />
                                <div *ngIf="!dish.imageUrls?.thumbnailUrl" class="dish-image-placeholder">
                                    <span style="font-size: 1.5rem; color: #94a3b8;"><i class="pi pi-image text-400"></i></span>
                                </div>
                            </div>
                            <div class="flex-1">
                                <div class="font-semibold text-sm dish-name-link" (click)="viewDishDetail(dish.id)" pTooltip="Xem chi tiết món ăn" tooltipPosition="top">
                                    {{ dish.name }}
                                </div>
                                <div class="text-xs text-500 mt-1">{{ dish.quantity ?? 1 }} {{ dish.unit || 'đĩa' }}</div>
                            </div>
                            <div class="text-right">
                                <div class="font-bold text-sm" style="color: #ef4444;">{{ formatPrice(dish.unitPrice) }}</div>
                                <div class="text-xs text-400">/ {{ dish.unit || 'đĩa' }}</div>
                            </div>
                        </div>

                        <div *ngIf="!last" class="mb-3"></div>
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-5">
                    <p-button label="Quay lại" icon="pi pi-arrow-left" [outlined]="true" severity="secondary" (onClick)="goBack()" />
                    <p-button *ngIf="!isSale"
                        [label]="item.status === 'inactive' ? 'Kích hoạt' : 'Vô hiệu hóa'"
                        [icon]="item.status === 'inactive' ? 'pi pi-check-circle' : 'pi pi-ban'"
                        [severity]="item.status === 'inactive' ? 'success' : 'warn'"
                        [outlined]="true"
                        (onClick)="toggleStatus()"
                        [loading]="togglingStatus" />
                    <p-button *ngIf="!isSale" label="Chỉnh sửa" icon="pi pi-pencil" severity="primary"
                        (onClick)="goEdit()" />
                </div>
            </div>

            <!-- Not found -->
            <div *ngIf="!item" class="text-center py-8 text-500">
                <i class="pi pi-info-circle text-4xl mb-3 block"></i>
                Không tìm thấy set menu
            </div>

            <p-confirmdialog />
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="card text-center py-8">
            <i class="pi pi-spin pi-spinner text-4xl text-500"></i>
            <div class="text-500 mt-3">Đang tải thông tin set menu...</div>
        </div>
    `,
    styles: [`
        .detail-hero {
            border-radius: 12px;
            min-height: 360px;
            position: relative;
            display: flex;
            align-items: flex-end;
            overflow: hidden;
            background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
        }
        .hero-placeholder {
            position: absolute; inset: 0;
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
        }
        .hero-image {
            position: absolute; inset: 0;
            width: 100%; height: 100%; object-fit: cover;
        }
        .detail-hero-overlay {
            width: 100%; padding: 1.5rem;
            background: linear-gradient(transparent 0%, rgba(0,0,0,0.65) 100%);
            position: relative; z-index: 1;
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
            z-index: 2;
        }
        .stats-grid {
            display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;
        }
        .stat-card {
            background: #f8fafc; border-radius: 12px;
            padding: 1.25rem; border: 1px solid #e2e8f0;
            text-align: center;
        }
        .stat-icon { font-size: 1.25rem; margin-bottom: 0.5rem; }
        .stat-value { font-size: 1.5rem; font-weight: 700; color: #1e293b; }
        .stat-label { font-size: 0.8rem; color: #64748b; margin-top: 4px; }
        .detail-card {
            background: #f8fafc; border-radius: 12px;
            padding: 1.25rem; border: 1px solid #e2e8f0;
        }
        .category-header {
            display: flex; align-items: center; gap: 12px;
            margin-bottom: 12px; margin-top: 4px;
        }
        .category-label {
            font-size: 0.75rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.05em;
            color: #64748b; white-space: nowrap;
        }
        .category-line {
            flex: 1; height: 1px; background: #e2e8f0;
        }
        .dish-row {
            display: flex; align-items: center; gap: 12px;
            padding: 10px 12px; margin-bottom: 8px;
            background: white; border-radius: 10px;
            border: 1px solid #e2e8f0;
            transition: box-shadow 0.2s;
        }
        .dish-row:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .dish-image-container {
            width: 80px; height: 80px; border-radius: 8px;
            overflow: hidden; flex-shrink: 0;
        }
        .dish-image {
            width: 100%; height: 100%; object-fit: cover;
            transition: transform 0.2s;
        }
        .dish-image:hover { transform: scale(1.08); }
        .dish-name-link {
            cursor: pointer; color: #1e293b; transition: color 0.2s;
        }
        .dish-name-link:hover {
            color: #3b82f6; text-decoration: underline;
        }
        .dish-image-placeholder {
            width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            background: #f1f5f9;
        }
        @media (max-width: 768px) {
            .stats-grid { grid-template-columns: 1fr; }
        }
    `],
    providers: [MessageService, SetMenuService, ConfirmationService]
})
export class SetMenuDetailComponent implements OnInit {
    item: any = null;
    loading = true;
    isSale = localStorage.getItem('codeRole') === 'SALE';
    togglingStatus = false;

    heroImage: string | null = null;
    totalDishes = 0;
    categoryCount = 0;
    categoryKeys: string[] = [];

    // Image viewer
    imageViewerVisible = false;
    viewingImageUrl = '';
    viewingImageName = '';

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private location = inject(Location);
    private setMenuService = inject(SetMenuService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private cdr = inject(ChangeDetectorRef);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadItem(id);
        } else {
            this.loading = false;
        }
    }

    loadItem(id: any) {
        this.loading = true;
        this.setMenuService.getById(id).subscribe({
            next: (res: any) => {
                if (res?.code === 200 && res.data) {
                    this.item = res.data;
                    this.processData();
                } else {
                    this.item = null;
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.item = null;
                this.loading = false;
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải thông tin set menu', life: 3000 });
                this.cdr.detectChanges();
            }
        });
    }

    /** Reload data without showing loading spinner */
    refreshItem(id: any) {
        this.setMenuService.getById(id).subscribe({
            next: (res: any) => {
                if (res?.code === 200 && res.data) {
                    this.item = res.data;
                    this.processData();
                }
                this.cdr.detectChanges();
            }
        });
    }

    processData() {
        if (!this.item) return;

        // Hero Image
        this.heroImage = this.item.imageUrls?.mediumUrl || null;

        // Categories
        if (this.item.menuItemsByCategory) {
            this.categoryKeys = Object.keys(this.item.menuItemsByCategory);
            this.categoryCount = this.categoryKeys.length;
            this.totalDishes = 0;
            this.categoryKeys.forEach(cat => {
                const items = this.item.menuItemsByCategory[cat];
                if (Array.isArray(items)) {
                    this.totalDishes += items.reduce((sum: number, i: any) => sum + (i.quantity ?? 0), 0);
                }
            });
        } else if (this.item.menuItems && Array.isArray(this.item.menuItems)) {
            this.categoryKeys = [];
            this.categoryCount = 0;
            this.totalDishes = this.item.menuItems.reduce((sum: number, i: any) => sum + (i.quantity ?? 0), 0);
        }
    }

    toggleStatus() {
        if (!this.item) return;
        const action = this.item.status === 'inactive' ? 'kích hoạt' : 'vô hiệu hóa';
        this.confirmationService.confirm({
            message: `Bạn có chắc muốn ${action} set menu "${this.item.name}"?`,
            header: 'Xác nhận thay đổi trạng thái',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.togglingStatus = true;
                this.setMenuService.changeStatus(this.item.id).subscribe({
                    next: () => {
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã ${action} set menu`, life: 3000 });
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

    goEdit() {
        this.router.navigate(['/pages/set-menu/edit', this.item.id]);
    }

    goBack() {
        if (window.history.length > 1) {
            this.location.back();
            return;
        }
        this.router.navigate(['/pages/set-menu']);
    }

    viewDishDetail(dishId: any) {
        if (dishId) {
            this.router.navigate(['/pages/menu-item', dishId], {
                queryParams: { fromSetMenu: this.item.id }
            });
        }
    }

    formatPrice(price?: number): string {
        if (!price && price !== 0) return '-';
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    }
}
