import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Service, ServiceService } from '../service/service.service';
import { LocationService } from '../service/location.service';

@Component({
    selector: 'app-service-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        ToastModule,
        DialogModule,
        InputTextModule,
        SelectModule,
        InputNumberModule,
        TextareaModule,
        ConfirmDialogModule,
        ToggleSwitchModule,
    ],
    template: `
        <div class="card" *ngIf="!loading">
            <p-toast />

            <div class="flex items-center gap-2 mb-4 cursor-pointer text-500 hover:text-700"
                 (click)="goBack()" style="width: fit-content;">
                <i class="pi pi-arrow-left"></i>
                <span class="text-sm font-medium">Quay lại danh sách dịch vụ</span>
            </div>

            <div *ngIf="service">
                <div class="detail-hero" [class.has-video]="!!service.videoUrl">
                    <video
                        *ngIf="service.videoUrl"
                        class="detail-hero-video"
                        [src]="service.videoUrl"
                        controls
                        preload="metadata"
                    ></video>

                    <div class="detail-hero-overlay" [class.no-image]="!service.videoUrl">
                        <h2 class="detail-hero-title">{{ service.name || '-' }}</h2>
                        <div class="flex gap-2 mt-2 flex-wrap items-center justify-end">
                            <span class="detail-tag">
                                <i class="pi pi-map-marker mr-1"></i>{{ getLocationName(service) }}
                            </span>
                            <span class="detail-tag">
                                <i class="pi pi-box mr-1"></i>{{ service.unit || '-' }}
                            </span>
                        </div>
                        <span class="detail-status-badge" [style.background]="isInactive(service.status) ? '#ef4444' : '#22c55e'">
                            <i [class]="isInactive(service.status) ? 'pi pi-times-circle' : 'pi pi-check-circle'" class="mr-1"></i>
                            {{ isInactive(service.status) ? 'Không hoạt động' : 'Đang cung cấp' }}
                        </span>
                    </div>
                </div>

                <div class="detail-content-grid mt-4">
                    <div class="detail-card">
                        <div class="font-semibold text-900 mb-3">
                            <i class="pi pi-info-circle mr-2" style="color: #3b82f6;"></i>Thông tin dịch vụ
                        </div>
                        <div class="detail-info-list">
                            <div class="detail-info-item">
                                <span class="text-500 text-sm">Tên dịch vụ</span>
                                <span class="font-semibold text-900">{{ service.name || '-' }}</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="text-500 text-sm">Chi nhánh</span>
                                <span class="font-semibold text-900">{{ getLocationName(service) }}</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="text-500 text-sm">Đơn giá</span>
                                <span class="font-bold" style="color: #3b82f6;">{{ formatPrice(service.basePrice) }}</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="text-500 text-sm">Đơn vị</span>
                                <span class="font-semibold text-900">{{ service.unit || '-' }}</span>
                            </div>
                            <div class="detail-info-item">
                                <span class="text-500 text-sm">Trạng thái</span>
                                <span class="font-semibold" [style.color]="isInactive(service.status) ? '#ef4444' : '#22c55e'">
                                    {{ isInactive(service.status) ? 'Không hoạt động' : 'Đang cung cấp' }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-card">
                        <div class="font-semibold text-900 mb-3">
                            <i class="pi pi-align-left mr-2" style="color: #3b82f6;"></i>Mô tả dịch vụ
                        </div>
                        <div class="text-600 text-sm" style="line-height: 1.8;">
                            {{ service.description || 'Chưa có mô tả' }}
                        </div>
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-5">
                    <p-button label="Quay lại" icon="pi pi-arrow-left" [outlined]="true" severity="secondary" (onClick)="goBack()" />
                    <p-button *ngIf="canManageService"
                        [label]="isInactive(service.status) ? 'Kích hoạt' : 'Vô hiệu hóa'"
                        [icon]="isInactive(service.status) ? 'pi pi-check-circle' : 'pi pi-ban'"
                        [severity]="isInactive(service.status) ? 'success' : 'warn'"
                        [outlined]="true"
                        (onClick)="toggleStatus()"
                        [loading]="togglingStatus" />
                    <p-button *ngIf="canManageService" label="Chỉnh sửa dịch vụ" icon="pi pi-pencil" severity="primary" (onClick)="openEdit()" />
                </div>
            </div>

            <div *ngIf="!service" class="text-center py-8 text-500">
                <i class="pi pi-info-circle text-4xl mb-3 block"></i>
                Không tìm thấy dịch vụ
            </div>

            <p-dialog
                [(visible)]="editDialog"
                [style]="{ width: '520px' }"
                header="Chỉnh sửa dịch vụ"
                [modal]="true"
                styleClass="p-fluid"
            >
                <ng-template #content>
                    <div class="text-sm text-500 mb-5">Cập nhật thông tin dịch vụ</div>
                    <div class="flex flex-col gap-5">
                        <div>
                            <label class="block font-semibold mb-2 text-sm">Tên dịch vụ <span class="text-red-500">*</span></label>
                            <input type="text" pInputText [(ngModel)]="editingService.name" fluid
                                [class.ng-invalid]="submitted && !editingService.name"
                                [class.ng-dirty]="submitted && !editingService.name" />
                            <small class="text-red-500" *ngIf="submitted && !editingService.name">Tên dịch vụ là bắt buộc.</small>
                        </div>

                        <div>
                            <label class="block font-semibold mb-2 text-sm">Chi nhánh <span class="text-red-500">*</span></label>
                            <p-select
                                [(ngModel)]="editingService.locationId"
                                [options]="locationOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Chọn chi nhánh..."
                                fluid
                                [class.ng-invalid]="submitted && !editingService.locationId"
                            />
                            <small class="text-red-500" *ngIf="submitted && !editingService.locationId">Chi nhánh là bắt buộc.</small>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                            <div>
                                <label class="block font-semibold mb-2 text-sm">Giá (VNĐ)</label>
                                <p-inputnumber [(ngModel)]="editingService.basePrice" [min]="0" fluid [useGrouping]="false" />
                            </div>
                            <div>
                                <label class="block font-semibold mb-2 text-sm">Đơn vị</label>
                                <input type="text" pInputText [(ngModel)]="editingService.unit" fluid />
                            </div>
                        </div>

                        <div>
                            <label class="block font-semibold mb-2 text-sm">Mô tả</label>
                            <textarea pTextarea [(ngModel)]="editingService.description" rows="3" fluid class="w-full"></textarea>
                        </div>

                        <div>
                            <label class="block font-semibold mb-2 text-sm">Video mới (mp4, không bắt buộc)</label>
                            <input
                                type="file"
                                accept="video/mp4"
                                (change)="onEditVideoSelected($event)"
                                class="w-full p-2 border-1 surface-border border-round"
                            />
                            <small class="text-500" *ngIf="selectedEditVideoName">Đã chọn: {{ selectedEditVideoName }}</small>
                        </div>

                        <div class="video-preview-grid">
                            <div class="video-preview-card" *ngIf="service?.videoUrl">
                                <div class="video-preview-title">Video hiện tại</div>
                                <video class="video-preview-player" [src]="service?.videoUrl" controls preload="metadata"></video>
                            </div>

                            <div class="video-preview-card" *ngIf="selectedEditVideoPreviewUrl">
                                <div class="video-preview-title">Video sau khi cập nhật</div>
                                <video class="video-preview-player" [src]="selectedEditVideoPreviewUrl" controls preload="metadata"></video>
                            </div>
                        </div>

                        <div class="flex items-center justify-between py-2 px-3 border-round"
                             style="background: #f8fafc; border: 1px solid #e2e8f0;">
                            <span class="font-semibold text-sm text-700">Trạng thái hoạt động</span>
                            <p-toggleswitch [(ngModel)]="editedServiceActive" />
                        </div>
                    </div>
                </ng-template>
                <ng-template #footer>
                    <div class="flex justify-end gap-2">
                        <p-button label="Hủy" icon="pi pi-times" text (click)="closeEditDialog()" />
                        <p-button label="Cập nhật" icon="pi pi-check" severity="primary" (click)="saveEdit()" [loading]="saving" />
                    </div>
                </ng-template>
            </p-dialog>

            <p-confirmdialog />
        </div>

        <div *ngIf="loading" class="card text-center py-8">
            <i class="pi pi-spin pi-spinner text-4xl text-500"></i>
            <div class="text-500 mt-3">Đang tải thông tin dịch vụ...</div>
        </div>
    `,
    styles: [`
        .detail-hero {
            border-radius: 12px;
            min-height: 180px;
            position: relative;
            display: flex;
            align-items: flex-end;
            overflow: hidden;
            background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #3b82a0 100%);
        }
        .detail-hero.has-video {
            min-height: 0;
            height: clamp(340px, 56vh, 560px);
            background: #020617;
        }
        .detail-hero-video {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: right center;
            background: #020617;
        }
        .detail-hero-overlay {
            width: 100%;
            height: 100%;
            padding: 4rem 1.5rem 4.4rem;
            background: linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.15) 35%, rgba(0,0,0,0.62) 100%);
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-end;
            text-align: right;
            z-index: 2;
            pointer-events: none;
        }
        .detail-hero-overlay.no-image {
            position: relative;
            height: auto;
            min-height: 180px;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-end;
            text-align: right;
            padding: 1.5rem;
            background: linear-gradient(transparent 0%, rgba(0,0,0,0.65) 100%);
        }
        .detail-hero-title {
            color: white;
            font-size: 1.75rem;
            font-weight: 700;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .detail-tag {
            display: inline-flex;
            align-items: center;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(4px);
            color: white;
            border-radius: 20px;
            padding: 4px 12px;
            font-size: 0.8rem;
        }
        .detail-status-badge {
            position: absolute;
            top: 1rem;
            right: 1rem;
            display: inline-flex;
            align-items: center;
            color: white;
            border-radius: 20px;
            padding: 6px 14px;
            font-size: 0.8rem;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 3;
        }
        .detail-content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        .detail-card {
            background: #f8fafc;
            border-radius: 12px;
            padding: 1.25rem;
            border: 1px solid #e2e8f0;
        }
        .detail-info-list {
            display: flex;
            flex-direction: column;
        }
        .detail-info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #e2e8f0;
            font-size: 0.85rem;
        }
        .detail-info-item:last-child {
            border-bottom: none;
        }
        .video-preview-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
        }
        .video-preview-card {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            background: white;
            padding: 0.6rem;
        }
        .video-preview-title {
            font-size: 0.78rem;
            font-weight: 600;
            color: #475569;
            margin-bottom: 0.45rem;
        }
        .video-preview-player {
            width: 100%;
            max-height: 140px;
            border-radius: 8px;
            background: #020617;
        }
        :host ::ng-deep {
            .p-dialog .p-dialog-header {
                padding: 1.25rem 1.5rem 0.5rem;
                font-weight: 700;
                font-size: 1.1rem;
            }
            .p-dialog .p-dialog-content {
                padding: 0 1.5rem 1rem;
            }
            .p-dialog .p-dialog-footer {
                padding: 0.75rem 1.5rem 1.25rem;
                border-top: 1px solid #f1f5f9;
            }
        }

        @media (max-width: 768px) {
            .detail-hero.has-video {
                height: clamp(240px, 42vh, 360px);
            }
            .detail-hero-overlay { padding: 3.5rem 1rem 3.8rem; }
            .detail-content-grid {
                grid-template-columns: 1fr;
            }
            .video-preview-grid {
                grid-template-columns: 1fr;
            }
        }
    `],
    providers: [MessageService, ServiceService, LocationService, ConfirmationService],
})
export class ServiceDetailComponent implements OnInit {
    readonly roleCode = (localStorage.getItem('codeRole') ?? '').toUpperCase();
    readonly canManageService = this.roleCode.includes('ADMIN') || this.roleCode.includes('MANAGER');

    service: Service | null = null;
    loading = true;
    saving = false;
    togglingStatus = false;

    editDialog = false;
    submitted = false;
    editingService: Partial<Service> = {};
    selectedEditVideoFile: File | null = null;
    selectedEditVideoName = '';
    selectedEditVideoPreviewUrl: string | null = null;
    editedServiceActive = true;

    locationOptions: { label: string; value: number }[] = [];

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private location = inject(Location);
    private serviceService = inject(ServiceService);
    private locationService = inject(LocationService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private cdr = inject(ChangeDetectorRef);

    ngOnInit() {
        this.loadLocations();

        const id = this.route.snapshot.paramMap.get('id');
        if (!id) {
            this.loading = false;
            return;
        }

        this.loadService(id);
    }

    loadService(id: string) {
        this.loading = true;
        this.serviceService.getServiceById(id).subscribe({
            next: (res) => {
                this.service = res?.data ?? null;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.service = null;
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Không thể tải thông tin dịch vụ',
                    life: 3000,
                });
                this.cdr.detectChanges();
            },
        });
    }

    loadLocations() {
        this.locationService.searchLocations({ page: 0, size: 100 }).subscribe({
            next: (res) => {
                this.locationOptions = (res?.data?.content ?? []).map((l: any) => ({
                    label: l.name ?? '',
                    value: Number(l.id),
                }));
                this.cdr.markForCheck();
            },
            error: () => {
                this.locationOptions = [];
            },
        });
    }

    getLocationName(service: Service): string {
        if (service.location?.name) return service.location.name;
        if (service.locationName) return service.locationName;
        if (!service.locationId) return '-';
        return this.locationOptions.find((l) => l.value === Number(service.locationId))?.label ?? '-';
    }

    isInactive(status?: string): boolean {
        return String(status ?? '').toUpperCase() === 'INACTIVE';
    }

    openEdit() {
        if (!this.canManageService) return;
        if (!this.service) return;
        this.editingService = { ...this.service };
        this.selectedEditVideoFile = null;
        this.selectedEditVideoName = '';
        this.clearEditVideoPreview();
        this.editedServiceActive = !this.isInactive(this.service.status);
        this.submitted = false;
        this.editDialog = true;
    }

    closeEditDialog() {
        this.editDialog = false;
        this.submitted = false;
        this.selectedEditVideoFile = null;
        this.selectedEditVideoName = '';
        this.clearEditVideoPreview();
    }

    onEditVideoSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] ?? null;
        this.selectedEditVideoFile = file;
        this.selectedEditVideoName = file?.name ?? '';
        this.clearEditVideoPreview();
        if (file) {
            this.selectedEditVideoPreviewUrl = URL.createObjectURL(file);
        }
    }

    private clearEditVideoPreview() {
        if (this.selectedEditVideoPreviewUrl) {
            URL.revokeObjectURL(this.selectedEditVideoPreviewUrl);
        }
        this.selectedEditVideoPreviewUrl = null;
    }

    saveEdit() {
        if (!this.canManageService) return;
        this.submitted = true;
        if (!this.service?.id || !this.editingService.name?.trim() || !this.editingService.locationId) {
            return;
        }

        this.saving = true;
        const payload = {
            code: this.editingService.code,
            name: this.editingService.name,
            description: this.editingService.description,
            unit: this.editingService.unit,
            basePrice: this.editingService.basePrice ?? 0,
            locationId: this.editingService.locationId,
        };

        const currentlyActive = !this.isInactive(this.service.status);
        const needsStatusChange = this.editedServiceActive !== currentlyActive;

        this.serviceService.updateService(
            this.service.id,
            payload,
            this.selectedEditVideoFile ?? undefined
        ).subscribe({
            next: () => {
                if (needsStatusChange) {
                    this.serviceService.changeStatus(this.service!.id).subscribe({
                        next: () => this.afterSaveEdit(),
                        error: () => this.afterSaveEdit(),
                    });
                    return;
                }
                this.afterSaveEdit();
            },
            error: () => {
                this.saving = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Không thể cập nhật dịch vụ',
                    life: 3000,
                });
            },
        });
    }

    private afterSaveEdit() {
        this.messageService.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã cập nhật dịch vụ',
            life: 3000,
        });
        this.closeEditDialog();
        this.saving = false;
        if (this.service?.id) {
            this.loadService(String(this.service.id));
        }
    }

    toggleStatus() {
        if (!this.canManageService) return;
        if (!this.service?.id) return;

        const action = this.isInactive(this.service.status) ? 'kích hoạt' : 'vô hiệu hóa';
        this.confirmationService.confirm({
            message: `Bạn có chắc muốn ${action} dịch vụ này?`,
            header: 'Xác nhận',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Đồng ý',
            rejectLabel: 'Hủy',
            accept: () => {
                this.togglingStatus = true;
                this.serviceService.changeStatus(this.service!.id).subscribe({
                    next: () => {
                        this.togglingStatus = false;
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Thành công',
                            detail: `Đã ${action} dịch vụ`,
                            life: 3000,
                        });
                        this.loadService(String(this.service!.id));
                    },
                    error: () => {
                        this.togglingStatus = false;
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Lỗi',
                            detail: `Không thể ${action} dịch vụ`,
                            life: 3000,
                        });
                    },
                });
            },
        });
    }

    formatPrice(value?: number): string {
        if (value == null) return '-';
        return new Intl.NumberFormat('vi-VN').format(Number(value)) + ' đ';
    }

    goBack() {
        if (window.history.length > 1) {
            this.location.back();
            return;
        }
        this.router.navigate(['/pages/service']);
    }
}
