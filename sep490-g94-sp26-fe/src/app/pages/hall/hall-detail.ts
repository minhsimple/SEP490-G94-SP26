import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Hall, HallService } from '../service/hall.service';
import { LocationService } from '../service/location.service';

@Component({
    selector: 'app-hall-detail',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        ButtonModule, DialogModule, ToastModule, ConfirmDialogModule,
        InputTextModule, SelectModule, TextareaModule, ToggleSwitchModule
    ],
    providers: [MessageService, ConfirmationService, HallService, LocationService],
    template: `
        <div class="detail-page">
            <p-toast />
            <p-confirmdialog />

            <!-- Loading -->
            <div class="loading-state" *ngIf="loading">
                <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--primary-color)"></i>
            </div>

            <ng-container *ngIf="!loading && hall">
                <!-- Back button -->
                <button class="back-btn" (click)="goBack()">
                    <i class="pi pi-arrow-left"></i>
                    <span>Quay lại danh sách sảnh</span>
                </button>

                <!-- Hero Image Carousel -->
                <div class="hero-carousel">
                    <div class="carousel-main">
                        <img [src]="activeImage || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=400&fit=crop'"
                            [alt]="hall.name" class="main-img" />

                        <!-- Prev / Next -->
                        <button class="carousel-btn prev" (click)="prevImage()" *ngIf="images.length > 1">
                            <i class="pi pi-chevron-left"></i>
                        </button>
                        <button class="carousel-btn next" (click)="nextImage()" *ngIf="images.length > 1">
                            <i class="pi pi-chevron-right"></i>
                        </button>

                        <!-- Counter -->
                        <span class="img-counter" *ngIf="images.length > 1">
                            {{ activeIndex + 1 }}/{{ images.length }} · Ảnh đại diện
                        </span>

                        <!-- Overlay info -->
                        <div class="hero-overlay">
                            <h1>{{ hall.name }}</h1>
                            <div class="hero-sub">
                                <i class="pi pi-map-marker"></i>
                                <span>{{ hall.locationName || 'Chi nhánh #' + hall.locationId }}</span>
                            </div>
                        </div>

                        <span class="status-chip" [class.active]="hall.status === 'ACTIVE'">
                            <i class="pi pi-circle-fill" style="font-size:0.5rem"></i>
                            {{ hall.status === 'ACTIVE' ? 'Đang hoạt động' : 'Hoạt động' }}
                        </span>
                    </div>

                    <!-- Thumbnails -->
                    <div class="thumbnails" *ngIf="images.length > 1">
                        <div class="thumb" *ngFor="let img of images; let i = index"
                            [class.active]="i === activeIndex"
                            (click)="activeIndex = i; activeImage = img">
                            <img [src]="img" alt="thumb" />
                        </div>
                    </div>
                </div>

                <!-- Stats -->
                <div class="stats-row">
                    <div class="stat-card">
                        <i class="pi pi-users"></i>
                        <div class="stat-val">{{ hall.capacity }}</div>
                        <div class="stat-label">Khách tối đa</div>
                    </div>
                    <div class="stat-card" *ngIf="hall.minTable">
                        <i class="pi pi-table"></i>
                        <div class="stat-val">{{ hall.minTable }}</div>
                        <div class="stat-label">Bàn tối thiểu</div>
                    </div>
                    <div class="stat-card" *ngIf="hall.maxTable">
                        <i class="pi pi-table"></i>
                        <div class="stat-val">{{ hall.maxTable }}</div>
                        <div class="stat-label">Bàn tối đa</div>
                    </div>
                </div>

                <!-- Description -->
                <div class="info-card" *ngIf="hall.notes || hall.description">
                    <div class="info-card-header">
                        <i class="pi pi-file-edit"></i>
                        <h3>Giới thiệu sảnh</h3>
                    </div>
                    <p class="desc-text">{{ hall.notes || hall.description }}</p>
                </div>

                <!-- Detail table -->
                <div class="info-card">
                    <div class="info-card-header">
                        <i class="pi pi-info-circle"></i>
                        <h3>Thông tin chi tiết</h3>
                    </div>
                    <div class="detail-grid">
                        <div class="detail-row">
                            <span class="dl">Tên sảnh</span>
                            <span class="dv">{{ hall.name }}</span>
                            <span class="dl">Chi nhánh</span>
                            <span class="dv">{{ hall.locationName || 'Chi nhánh #' + hall.locationId }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="dl">Sức chứa</span>
                            <span class="dv">{{ hall.capacity }} khách</span>
                            <span class="dl">Số bàn</span>
                            <span class="dv">{{ hall.minTable && hall.maxTable ? hall.minTable + ' – ' + hall.maxTable + ' bàn' : '-' }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="dl">Trạng thái</span>
                            <span class="dv status-text" [class.active]="hall.status === 'ACTIVE'">
                                {{ hall.status != 'ACTIVE' ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
                            </span>
                            <span class="dl">Mã sảnh</span>
                            <span class="dv">{{ hall.code || '-' }}</span>
                        </div>
                    </div>
                </div>

                <!-- Footer actions -->
                <div class="detail-footer">
                    <p-button label="Quay lại" icon="pi pi-arrow-left" [outlined]="true" (click)="goBack()" />
                    <p-button label="Chỉnh sửa sảnh" icon="pi pi-pencil" (click)="openEdit()" />
                </div>
            </ng-container>

            <!-- Edit Dialog -->
            <p-dialog
                [(visible)]="hallDialog"
                [style]="{ width: '520px' }"
                header="Chỉnh sửa sảnh"
                [modal]="true"
                styleClass="p-fluid"
            >
                <ng-template #content>
                    <div class="form-grid">
                        <div class="form-field full">
                            <label>Tên sảnh <span class="req">*</span></label>
                            <input type="text" pInputText [(ngModel)]="editingHall.name" placeholder="VD: Sảnh Diamond" />
                            <small class="err" *ngIf="submitted && !editingHall.name">Tên sảnh là bắt buộc.</small>
                        </div>

                        <div class="form-field full">
                            <label>Mã sảnh <span class="req">*</span></label>
                            <input type="text" pInputText [(ngModel)]="editingHall.code" placeholder="VD: DIAMOND_01" />
                            <small class="err" *ngIf="submitted && !editingHall.code">Mã sảnh là bắt buộc.</small>
                        </div>

                        <div class="form-field full">
                            <label>Chi nhánh <span class="req">*</span></label>
                            <p-select
                                [options]="locationOptions"
                                [(ngModel)]="editingHall.locationId"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Chọn chi nhánh..."
                                fluid
                            />
                        </div>

                        <div class="form-field full">
                            <label>Sức chứa (khách) <span class="req">*</span></label>
                            <input type="number" pInputText [(ngModel)]="editingHall.capacity" placeholder="500" />
                        </div>

                        <div class="form-field">
                            <label>Số bàn tối thiểu</label>
                            <input type="number" pInputText [(ngModel)]="editingHall.minTable" placeholder="10" />
                        </div>

                        <div class="form-field">
                            <label>Số bàn tối đa</label>
                            <input type="number" pInputText [(ngModel)]="editingHall.maxTable" placeholder="50" />
                        </div>

                        <div class="form-field full">
                            <label>URL ảnh sảnh</label>
                            <input type="text" pInputText [(ngModel)]="editingHall.imageUrl" placeholder="https://..." />
                        </div>

                        <div class="form-field full">
                            <label>Mô tả</label>
                            <textarea pTextarea [(ngModel)]="editingHall.notes" rows="3"
                                placeholder="Mô tả chi tiết..." style="width:100%"></textarea>
                        </div>

                        <div class="form-field full toggle-row">
                            <label>Trạng thái hoạt động</label>
                            <p-toggleswitch [(ngModel)]="isActive" />
                        </div>
                    </div>
                </ng-template>

                <ng-template #footer>
                    <p-button label="Hủy" icon="pi pi-times" [text]="true" (click)="hideDialog()" />
                    <p-button label="Lưu thay đổi" icon="pi pi-check" [loading]="saving" (click)="saveEdit()" />
                </ng-template>
            </p-dialog>
        </div>
    `,
    styles: [`
        .detail-page {
            max-width: 760px;
            margin: 0 auto;
            padding: 1.5rem;
        }

        .loading-state {
            display: flex; justify-content: center; padding: 4rem;
        }

        /* Back button */
        .back-btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: none;
            border: none;
            cursor: pointer;
            color: var(--text-color-secondary);
            font-size: 0.875rem;
            margin-bottom: 1rem;
            padding: 0.25rem 0;
            transition: color 0.15s;

            &:hover { color: var(--primary-color); }
        }

        /* Carousel */
        .hero-carousel { margin-bottom: 1.25rem; }

        .carousel-main {
            position: relative;
            border-radius: 14px;
            overflow: hidden;
            height: 360px;
        }

        .main-img {
            width: 100%; height: 100%;
            object-fit: cover;
        }

        .carousel-btn {
            position: absolute;
            top: 50%; transform: translateY(-50%);
            width: 38px; height: 38px;
            border-radius: 50%;
            border: none;
            background: rgba(255,255,255,0.85);
            backdrop-filter: blur(4px);
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            color: var(--text-color);
            transition: background 0.15s;
            z-index: 2;

            &.prev { left: 12px; }
            &.next { right: 12px; }
            &:hover { background: white; }
        }

        .img-counter {
            position: absolute;
            top: 12px; right: 12px;
            background: rgba(0,0,0,0.55);
            color: white;
            font-size: 0.75rem;
            padding: 0.25rem 0.65rem;
            border-radius: 20px;
            backdrop-filter: blur(4px);
        }

        .hero-overlay {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            padding: 2rem 1.5rem 1.25rem;
            background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%);
            color: white;

            h1 {
                margin: 0 0 0.25rem;
                font-size: 1.6rem;
                font-weight: 800;
                text-shadow: 0 1px 4px rgba(0,0,0,0.4);
            }
        }

        .hero-sub {
            display: flex; align-items: center; gap: 0.4rem;
            font-size: 0.875rem; opacity: 0.9;
        }

        .status-chip {
            position: absolute;
            bottom: 1.25rem; right: 1.25rem;
            display: flex; align-items: center; gap: 0.4rem;
            padding: 0.35rem 0.85rem;
            border-radius: 20px;
            font-size: 0.8rem; font-weight: 600;
            background: rgba(100,100,100,0.85);
            color: white;
            backdrop-filter: blur(4px);

            &.active { background: rgba(59,130,246,0.9); }
        }

        .thumbnails {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }

        .thumb {
            width: 70px; height: 52px;
            border-radius: 8px;
            overflow: hidden;
            cursor: pointer;
            opacity: 0.6;
            transition: opacity 0.15s, transform 0.15s;
            border: 2px solid transparent;

            &.active {
                opacity: 1;
                border-color: var(--primary-color);
                transform: scale(1.05);
            }

            img { width: 100%; height: 100%; object-fit: cover; }
        }

        /* Stats */
        .stats-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
            margin-bottom: 1.25rem;
        }

        .stat-card {
            background: var(--surface-card, #fff);
            border-radius: 12px;
            padding: 1.25rem;
            text-align: center;
            box-shadow: 0 1px 4px rgba(0,0,0,0.06);

            i {
                font-size: 1.5rem;
                color: var(--primary-color);
                margin-bottom: 0.5rem;
                display: block;
            }
        }

        .stat-val {
            font-size: 1.75rem;
            font-weight: 800;
            color: var(--text-color);
            line-height: 1;
        }

        .stat-label {
            font-size: 0.75rem;
            color: var(--text-color-secondary);
            margin-top: 0.25rem;
        }

        /* Info card */
        .info-card {
            background: var(--surface-card, #fff);
            border-radius: 12px;
            padding: 1.25rem;
            box-shadow: 0 1px 4px rgba(0,0,0,0.06);
            margin-bottom: 1.25rem;
        }

        .info-card-header {
            display: flex; align-items: center; gap: 0.5rem;
            margin-bottom: 1rem;

            i { color: var(--primary-color); }

            h3 {
                margin: 0;
                font-size: 1rem;
                font-weight: 700;
            }
        }

        .desc-text {
            font-size: 0.9rem;
            color: var(--text-color-secondary);
            line-height: 1.6;
            margin: 0;
        }

        .detail-grid { display: flex; flex-direction: column; gap: 0.75rem; }

        .detail-row {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            gap: 0.5rem;
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--surface-border, #dee2e6);

            &:last-child { border-bottom: none; }
        }

        .dl {
            font-size: 0.8rem;
            color: var(--text-color-secondary);
        }

        .dv {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-color);
        }

        .status-text { color: #6c757d; }
        .status-text.active { color: #15803d; }

        /* Footer */
        .detail-footer {
            display: flex;
            justify-content: flex-end;
            gap: 0.75rem;
            padding-top: 0.5rem;
        }

        /* Form dialog */
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.25rem;
        }

        .form-field {
            display: flex; flex-direction: column; gap: 0.4rem;
            &.full { grid-column: 1 / -1; }
            label { font-weight: 600; font-size: 0.875rem; }
        }

        .req { color: var(--red-500); }
        .err { color: var(--red-500); font-size: 0.75rem; }

        .toggle-row {
            flex-direction: row !important;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem 1rem;
            background: var(--surface-ground, #f8f9fa);
            border-radius: 8px;
        }
    `]
})
export class HallDetailComponent implements OnInit {
    hall: Hall | null = null;
    loading = false;
    saving = false;
    hallDialog = false;
    submitted = false;
    isActive = true;
    editingHall: any = {};
    locationOptions: { label: string; value: number }[] = [];

    images: string[] = [];
    activeImage = '';
    activeIndex = 0;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private hallService: HallService,
        private locationService: LocationService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) this.loadHall(id);
        this.loadLocations();
    }

    loadHall(id: any) {
        this.loading = true;
        this.hallService.getHallById(id).subscribe({
            next: (res) => {
                if (res.code === 200) {
                    this.hall = res.data;
                    this.buildImages(res.data);
                }
                this.loading = false;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải thông tin sảnh', life: 3000 });
                this.loading = false;
            }
        });
    }

    buildImages(hall: Hall) {
        const imgs: string[] = [];
        if (hall.imageUrl) imgs.push(hall.imageUrl);
        if (hall.images?.length) imgs.push(...hall.images);
        // Fallback placeholder images for demo
        if (imgs.length === 0) {
            imgs.push(
                'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&h=400&fit=crop',
                'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&h=400&fit=crop',
                'https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&h=400&fit=crop',
                'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=400&fit=crop'
            );
        }
        this.images = imgs;
        this.activeImage = imgs[0];
        this.activeIndex = 0;
    }

    prevImage() {
        this.activeIndex = (this.activeIndex - 1 + this.images.length) % this.images.length;
        this.activeImage = this.images[this.activeIndex];
    }

    nextImage() {
        this.activeIndex = (this.activeIndex + 1) % this.images.length;
        this.activeImage = this.images[this.activeIndex];
    }

    loadLocations() {
        this.locationService.searchLocations({ page: 0, size: 100 }).subscribe({
            next: (res) => {
                if (res.code === 200) {
                    this.locationOptions = res.data.content.map(l => ({ label: l.name ?? '', value: l.id }));
                    this.cdr.markForCheck();
                }
            }
        });
    }

    openEdit() {
        this.editingHall = { ...this.hall };
        this.isActive = this.hall?.status === 'ACTIVE';
        this.submitted = false;
        this.hallDialog = true;
    }

    saveEdit() {
        this.submitted = true;
        if (!this.editingHall.name?.trim() || !this.editingHall.code?.trim() || !this.editingHall.locationId || !this.editingHall.capacity) return;

        this.saving = true;
        const payload = {
            code: this.editingHall.code,
            name: this.editingHall.name,
            locationId: this.editingHall.locationId,
            capacity: this.editingHall.capacity,
            notes: this.editingHall.notes
        };

        this.hallService.updateHall(this.editingHall.id, payload).subscribe({
            next: (res) => {
                if (res.code === 200) {
                    const currentActive = this.hall?.status === 'ACTIVE';
                    if (this.isActive !== currentActive) {
                        this.hallService.changeStatus(this.editingHall.id).subscribe(() => {
                            this.loadHall(this.editingHall.id);
                        });
                    } else {
                        this.loadHall(this.editingHall.id);
                    }
                    this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật sảnh', life: 3000 });
                    this.hideDialog();
                }
                this.saving = false;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || 'Cập nhật thất bại', life: 3000 });
                this.saving = false;
            }
        });
    }

    hideDialog() {
        this.hallDialog = false;
        this.submitted = false;
    }

    goBack() {
        this.router.navigate(['/pages/hall']);
    }
}