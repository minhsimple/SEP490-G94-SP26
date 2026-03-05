import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Hall, HallService } from '../service/hall.service';
import { LocationService } from '../service/location.service';

@Component({
    selector: 'app-hall',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        ButtonModule, InputTextModule, SelectModule, DialogModule,
        ToastModule, ConfirmDialogModule, InputIconModule, IconFieldModule,
        TooltipModule, TextareaModule, ToggleSwitchModule
    ],
    providers: [MessageService, ConfirmationService, HallService, LocationService],
    template: `
        <div class="hall-page">
            <p-toast />
            <p-confirmdialog />

            <!-- Toolbar -->
            <div class="hall-toolbar">
                <div class="toolbar-left">
                    <p-iconfield>
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText type="text" [(ngModel)]="searchName"
                            (input)="onSearch()" placeholder="Tìm kiếm sảnh..." />
                    </p-iconfield>

                    <p-select
                        [options]="locationFilterOptions"
                        [(ngModel)]="selectedLocationId"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Tất cả chi nhánh"
                        (onChange)="onLocationFilter()"
                        [showClear]="true"
                        styleClass="location-select"
                    >
                        <ng-template #dropdownicon>
                            <i class="pi pi-map-marker"></i>
                        </ng-template>
                    </p-select>

                    <div class="view-toggle">
                        <button class="view-btn" [class.active]="viewMode === 'grid'" (click)="viewMode = 'grid'">
                            <i class="pi pi-th-large"></i>
                        </button>
                        <button class="view-btn" [class.active]="viewMode === 'list'" (click)="viewMode = 'list'">
                            <i class="pi pi-list"></i>
                        </button>
                    </div>
                </div>

                <p-button label="Thêm sảnh" icon="pi pi-plus" (onClick)="openNew()" />
            </div>

            <!-- Loading -->
            <div class="loading-state" *ngIf="loading">
                <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:var(--primary-color)"></i>
            </div>

            <!-- Content grouped by location -->
            <div class="hall-content" *ngIf="!loading">
                <ng-container *ngFor="let group of groupedHalls">
                    <div class="location-group">
                        <div class="location-header">
                            <i class="pi pi-map-marker"></i>
                            <h3>{{ group.locationName }}</h3>
                            <span class="hall-count">{{ group.halls.length }} sảnh</span>
                        </div>

                        <!-- Grid view -->
                        <div class="halls-grid" *ngIf="viewMode === 'grid'">
                            <div class="hall-card" *ngFor="let hall of group.halls">
                                <div class="card-image" (click)="viewDetail(hall)">
                                    <img [src]="hall.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=250&fit=crop'"
                                        [alt]="hall.name" />
                                    <span class="status-badge" [class.active]="hall.status === 'ACTIVE'">
                                        {{ hall.status != 'ACTIVE' ? 'Hoạt động' : 'Ngừng hoạt động' }}
                                    </span>
                                </div>
                                <div class="card-body">
                                    <h4 (click)="viewDetail(hall)">{{ hall.name }}</h4>
                                    <p class="card-desc">{{ hall.notes || hall.description || 'Chưa có mô tả' }}</p>
                                    <div class="card-meta">
                                        <span><i class="pi pi-users"></i> {{ hall.capacity }} khách</span>
                                        <span *ngIf="hall.minTable && hall.maxTable">
                                            {{ hall.minTable }}–{{ hall.maxTable }} bàn
                                        </span>
                                    </div>
                                    <div class="card-actions">
                                        <button class="btn-detail" (click)="viewDetail(hall)">
                                            <i class="pi pi-eye"></i> Chi tiết
                                        </button>
                                        <button class="btn-edit" (click)="editHall(hall)" pTooltip="Chỉnh sửa">
                                            <i class="pi pi-pencil"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- List view -->
                        <div class="halls-list" *ngIf="viewMode === 'list'">
                            <div class="hall-row" *ngFor="let hall of group.halls">
                                <div class="row-img">
                                    <img [src]="hall.imageUrl || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=80&h=60&fit=crop'"
                                        [alt]="hall.name" />
                                </div>
                                <div class="row-info">
                                    <span class="row-name">{{ hall.name }}</span>
                                    <span class="row-desc">{{ hall.notes || hall.description || '-' }}</span>
                                </div>
                                <div class="row-meta">
                                    <span><i class="pi pi-users"></i> {{ hall.capacity }} khách</span>
                                </div>
                                <span class="status-pill" [class.active]="hall.status === 'ACTIVE'">
                                    {{ hall.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng' }}
                                </span>
                                <div class="row-actions">
                                    <p-button icon="pi pi-eye" [rounded]="true" [outlined]="true" severity="info"
                                        (click)="viewDetail(hall)" pTooltip="Chi tiết" tooltipPosition="top" />
                                    <p-button icon="pi pi-pencil" [rounded]="true" [outlined]="true" severity="secondary"
                                        (click)="editHall(hall)" pTooltip="Chỉnh sửa" tooltipPosition="top" />
                                    <p-button
                                        [icon]="hall.status === 'ACTIVE' ? 'pi pi-ban' : 'pi pi-check-circle'"
                                        [severity]="hall.status === 'ACTIVE' ? 'warn' : 'success'"
                                        [rounded]="true" [outlined]="true"
                                        (click)="toggleStatus(hall)" tooltipPosition="top" />
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-container>

                <div class="empty-state" *ngIf="groupedHalls.length === 0">
                    <i class="pi pi-building"></i>
                    <p>Không có sảnh nào</p>
                </div>
            </div>

            <!-- Dialog thêm/sửa sảnh -->
            <p-dialog
                [(visible)]="hallDialog"
                [style]="{ width: '520px' }"
                [header]="editingHall?.id ? 'Chỉnh sửa sảnh' : 'Thêm sảnh mới'"
                [modal]="true"
                styleClass="p-fluid hall-dialog"
            >
                <ng-template #content>
                    <div class="dialog-subtitle" *ngIf="!editingHall?.id">Thêm sảnh cưới mới vào hệ thống</div>
                    <div class="form-grid">
                        <div class="form-field full">
                            <label>Tên sảnh <span class="req">*</span></label>
                            <input type="text" pInputText [(ngModel)]="editingHall.name"
                                placeholder="VD: Sảnh Diamond" />
                            <small class="err" *ngIf="submitted && !editingHall.name">Tên sảnh là bắt buộc.</small>
                        </div>

                        <div class="form-field full">
                            <label>Mã sảnh <span class="req">*</span></label>
                            <input type="text" pInputText [(ngModel)]="editingHall.code"
                                placeholder="VD: DIAMOND_01" />
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
                            <small class="err" *ngIf="submitted && !editingHall.locationId">Chi nhánh là bắt buộc.</small>
                        </div>

                        <div class="form-field full">
                            <label>Sức chứa (khách) <span class="req">*</span></label>
                            <input type="number" pInputText [(ngModel)]="editingHall.capacity" placeholder="500" />
                            <small class="err" *ngIf="submitted && !editingHall.capacity">Sức chứa là bắt buộc.</small>
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
                                placeholder="Mô tả chi tiết về sảnh..." style="width:100%"></textarea>
                        </div>

                        <div class="form-field full toggle-row" *ngIf="editingHall?.id">
                            <label>Trạng thái hoạt động</label>
                            <p-toggleswitch [(ngModel)]="isActive" />
                        </div>

                        <div class="form-field full toggle-row" *ngIf="!editingHall?.id">
                            <label>Trạng thái hoạt động</label>
                            <p-toggleswitch [(ngModel)]="isActive" />
                        </div>
                    </div>
                </ng-template>

                <ng-template #footer>
                    <p-button label="Hủy" icon="pi pi-times" [text]="true" (click)="hideDialog()" />
                    <p-button [label]="editingHall?.id ? 'Lưu thay đổi' : 'Thêm mới'" icon="pi pi-check"
                        [loading]="saving" (click)="saveHall()" />
                </ng-template>
            </p-dialog>
        </div>
    `,
    styles: [`
        .hall-page {
            padding: 1.5rem;
            background: var(--surface-ground, #f8f9fa);
            min-height: 100%;
        }

        /* Toolbar */
        .hall-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 2rem;
            background: var(--surface-card, #fff);
            padding: 1rem 1.25rem;
            border-radius: 12px;
            box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }

        .toolbar-left {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex: 1;
        }

        :host ::ng-deep .location-select .p-select {
            min-width: 200px;
        }

        .view-toggle {
            display: flex;
            gap: 2px;
            background: var(--surface-border, #dee2e6);
            border-radius: 8px;
            padding: 2px;
        }

        .view-btn {
            width: 34px; height: 34px;
            border: none;
            background: transparent;
            border-radius: 6px;
            cursor: pointer;
            color: var(--text-color-secondary);
            display: flex; align-items: center; justify-content: center;
            transition: all 0.15s;

            &.active {
                background: var(--surface-card, #fff);
                color: var(--primary-color);
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
        }

        /* Loading */
        .loading-state {
            display: flex; justify-content: center; padding: 4rem;
        }

        /* Location group */
        .location-group { margin-bottom: 2.5rem; }

        .location-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;

            i { color: var(--primary-color); font-size: 1rem; }

            h3 {
                margin: 0;
                font-size: 1.1rem;
                font-weight: 700;
                color: var(--text-color);
            }
        }

        .hall-count {
            font-size: 0.8rem;
            color: var(--text-color-secondary);
            background: var(--surface-border, #dee2e6);
            padding: 0.15rem 0.6rem;
            border-radius: 20px;
        }

        /* Grid */
        .halls-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.25rem;
        }

        .hall-card {
            background: var(--surface-card, #fff);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 1px 6px rgba(0,0,0,0.07);
            transition: box-shadow 0.2s, transform 0.2s;

            &:hover {
                box-shadow: 0 6px 20px rgba(0,0,0,0.12);
                transform: translateY(-2px);
            }
        }

        .card-image {
            position: relative;
            height: 180px;
            cursor: pointer;
            overflow: hidden;

            img {
                width: 100%; height: 100%;
                object-fit: cover;
                transition: transform 0.3s;
            }

            &:hover img { transform: scale(1.04); }
        }

        .status-badge {
            position: absolute;
            top: 10px; right: 10px;
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            background: #6c757d;
            color: white;

            &.active {
                background: var(--primary-color, #3b82f6);
            }
        }

        .card-body { padding: 1rem; }

        .card-body h4 {
            margin: 0 0 0.4rem;
            font-size: 0.95rem;
            font-weight: 700;
            cursor: pointer;
            color: var(--text-color);

            &:hover { color: var(--primary-color); }
        }

        .card-desc {
            font-size: 0.8rem;
            color: var(--text-color-secondary);
            margin: 0 0 0.75rem;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        .card-meta {
            display: flex;
            gap: 1rem;
            font-size: 0.8rem;
            color: var(--text-color-secondary);
            margin-bottom: 0.75rem;

            i { margin-right: 4px; }
        }

        .card-actions {
            display: flex;
            gap: 0.5rem;
            align-items: center;
            border-top: 1px solid var(--surface-border, #dee2e6);
            padding-top: 0.75rem;
        }

        .btn-detail {
            flex: 1;
            padding: 0.4rem 0;
            border: 1px solid var(--surface-border, #dee2e6);
            border-radius: 8px;
            background: transparent;
            cursor: pointer;
            font-size: 0.8rem;
            color: var(--text-color);
            display: flex; align-items: center; justify-content: center; gap: 6px;
            transition: all 0.15s;

            &:hover { background: var(--surface-hover); }
        }

        .btn-edit {
            width: 32px; height: 32px;
            border: 1px solid var(--surface-border, #dee2e6);
            border-radius: 8px;
            background: transparent;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            color: var(--text-color-secondary);
            transition: all 0.15s;

            &:hover { background: var(--surface-hover); color: var(--primary-color); }
        }

        /* List view */
        .halls-list { display: flex; flex-direction: column; gap: 0.5rem; }

        .hall-row {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.75rem 1rem;
            background: var(--surface-card, #fff);
            border-radius: 10px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .row-img img {
            width: 64px; height: 48px;
            object-fit: cover;
            border-radius: 6px;
        }

        .row-info {
            flex: 1;
            display: flex; flex-direction: column;
        }

        .row-name { font-weight: 600; font-size: 0.875rem; }
        .row-desc { font-size: 0.75rem; color: var(--text-color-secondary); }

        .row-meta {
            font-size: 0.8rem;
            color: var(--text-color-secondary);
            white-space: nowrap;
        }

        .status-pill {
            padding: 0.2rem 0.65rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 600;
            background: var(--surface-border);
            color: var(--text-color-secondary);
            white-space: nowrap;

            &.active { background: #dcfce7; color: #15803d; }
        }

        .row-actions { display: flex; gap: 0.4rem; }

        /* Empty */
        .empty-state {
            text-align: center; padding: 4rem;
            color: var(--text-color-secondary);

            i { font-size: 3rem; margin-bottom: 1rem; display: block; }
        }

        /* Dialog */
        .dialog-subtitle {
            font-size: 0.85rem;
            color: var(--text-color-secondary);
            margin-bottom: 1.5rem;
        }

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
export class HallComponent implements OnInit {
    halls = signal<Hall[]>([]);
    groupedHalls: { locationName: string; halls: Hall[] }[] = [];
    locationOptions: { label: string; value: number }[] = [];
    locationFilterOptions: { label: string; value: number }[] = [];

    loading = false;
    saving = false;
    hallDialog = false;
    submitted = false;
    viewMode: 'grid' | 'list' = 'grid';

    searchName = '';
    selectedLocationId: number | null = null;
    isActive = true;

    editingHall: any = {};

    constructor(
        private hallService: HallService,
        private locationService: LocationService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private router: Router,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.loadLocations();
        this.loadHalls();
    }

    loadLocations() {
        this.locationService.searchLocations({ page: 0, size: 100 }).subscribe({
            next: (res) => {
                if (res.code === 200) {
                    this.locationOptions = res.data.content.map(l => ({ label: l.name ?? '', value: l.id }));
                    this.locationFilterOptions = [{ label: 'Tất cả chi nhánh', value: null as any }, ...this.locationOptions];
                    this.cdr.markForCheck();
                }
            }
        });
    }

    loadHalls() {
        this.loading = true;
        const params: any = { page: 0, size: 100 };
        if (this.searchName) params.name = this.searchName;
        if (this.selectedLocationId) params.locationId = this.selectedLocationId;

        this.hallService.searchHalls(params).subscribe({
            next: (res) => {
                if (res.code === 200) {
                    this.halls.set(res.data.content);
                    this.buildGroups(res.data.content);
                    this.cdr.markForCheck();
                }
                this.loading = false;
            },
            error: () => {
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải danh sách sảnh', life: 3000 });
                this.loading = false;
            }
        });
    }

    buildGroups(halls: Hall[]) {
        const map = new Map<string, Hall[]>();
        halls.forEach(h => {
            const key = h.locationName || `Chi nhánh #${h.locationId}`;
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(h);
        });
        this.groupedHalls = Array.from(map.entries()).map(([locationName, hs]) => ({ locationName, halls: hs }));
    }

    onSearch() { this.loadHalls(); }
    onLocationFilter() { this.loadHalls(); }

    openNew() {
        this.editingHall = {};
        this.isActive = true;
        this.submitted = false;
        this.hallDialog = true;
    }

    editHall(hall: Hall) {
        this.editingHall = { ...hall };
        this.isActive = hall.status === 'ACTIVE';
        this.submitted = false;
        this.hallDialog = true;
    }

    viewDetail(hall: Hall) {
        this.router.navigate(['/pages/hall', hall.id]);
    }

    saveHall() {
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

        if (this.editingHall.id) {
            this.hallService.updateHall(this.editingHall.id, payload).subscribe({
                next: (res) => {
                    if (res.code === 200) {
                        // toggle status nếu cần
                        const currentActive = this.editingHall.status === 'ACTIVE';
                        if (this.isActive !== currentActive) {
                            this.hallService.changeStatus(this.editingHall.id).subscribe(() => this.loadHalls());
                        } else {
                            this.loadHalls();
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
        } else {
            this.hallService.createHall(payload).subscribe({
                next: (res) => {
                    if (res.code === 200) {
                        this.loadHalls();
                        this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm sảnh mới', life: 3000 });
                        this.hideDialog();
                    }
                    this.saving = false;
                },
                error: (err) => {
                    this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || 'Thêm sảnh thất bại', life: 3000 });
                    this.saving = false;
                }
            });
        }
    }

    toggleStatus(hall: Hall) {
        const action = hall.status === 'ACTIVE' ? 'kích hoạt' : 'kích hoạt';
        this.confirmationService.confirm({
            message: `Bạn có chắc muốn ${action} sảnh ${hall.name}?`,
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có', rejectLabel: 'Không',
            accept: () => {
                this.hallService.changeStatus(hall.id).subscribe({
                    next: (res) => {
                        if (res.code === 200) {
                            this.loadHalls();
                            this.messageService.add({ severity: 'success', summary: 'Thành công', detail: `Đã ${action} sảnh`, life: 3000 });
                        }
                    },
                    error: (err) => {
                        this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || 'Thất bại', life: 3000 });
                    }
                });
            }
        });
    }

    hideDialog() {
        this.hallDialog = false;
        this.submitted = false;
    }
}