import { Component, OnInit, ChangeDetectorRef, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { catchError, map, of, forkJoin } from 'rxjs';
import { ServicePackageService, ServicePackage } from '../service/service-package.service';
import { ServiceService, Service } from '../service/service.service';
import { LocationService, Location } from '../service/location.service';

@Component({
    selector: 'app-combo-service-detail',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ButtonModule, ToastModule,
        ConfirmDialogModule, TooltipModule
    ],
    template: `
        <div class="card" *ngIf="!loading">
            <p-toast />

            <!-- Back button -->
            <div class="flex items-center gap-2 mb-4 cursor-pointer text-500 hover:text-700"
                 (click)="goBack()" style="width: fit-content;">
                <i class="pi pi-arrow-left"></i>
                <span class="text-sm font-medium">Quay lại danh sách combo dịch vụ</span>
            </div>

            <div *ngIf="item">
                <div class="detail-hero">
                    <div class="detail-hero-overlay">
                        <h2 class="detail-hero-title">{{ item.name }}</h2>
                        <div class="flex gap-2 mt-2 flex-wrap items-center">
                            <span class="detail-tag" *ngIf="item.locationId">
                                <i class="pi pi-map-marker mr-1"></i>{{ getLocationName(item.locationId) }}
                            </span>
                        </div>
                        <span class="detail-status-badge"
                              [style.background]="item.status === 'inactive' ? '#ef4444' : '#3b82f6'">
                            <i [class]="item.status === 'inactive' ? 'pi pi-times-circle' : 'pi pi-check-circle'" class="mr-1"></i>
                            {{ item.status === 'inactive' ? 'Không hoạt động' : 'Đang áp dụng' }}
                        </span>
                    </div>
                </div>

                <div class="stats-grid mt-4">
                    <div class="stat-card">
                        <div class="stat-icon" style="color: #3b82f6;">
                            <i class="pi pi-dollar"></i>
                        </div>
                        <div class="stat-value" style="color: #3b82f6;">{{ formatPrice(item.basePrice) }}</div>
                        <div class="stat-label">Tổng giá trị</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon" style="color: #8b5cf6;">
                            <i class="pi pi-briefcase"></i>
                        </div>
                        <div class="stat-value">{{ item.serviceResponseList?.length ?? 0 }}</div>
                        <div class="stat-label">Tổng dịch vụ</div>
                    </div>
                </div>
                <div class="detail-card mt-4" *ngIf="item.description">
                    <div class="flex items-center gap-2 mb-3">
                        <i class="pi pi-align-left" style="color: #3b82f6;"></i>
                        <span class="font-semibold text-900">Mô tả</span>
                    </div>
                    <div class="text-600 text-sm" style="line-height: 1.8;">
                        {{ item.description }}
                    </div>
                </div>

                <div class="detail-card mt-4">
                    <div class="flex items-center gap-2 mb-4">
                        <i class="pi pi-sparkles" style="color: #3b82f6; font-size: 1.1rem;"></i>
                        <span class="font-semibold text-900 text-lg">Danh sách dịch vụ</span>
                    </div>

                    <div *ngIf="getServices().length === 0" class="text-center py-6 text-500">
                        <i class="pi pi-inbox text-3xl mb-2 block"></i>
                        Chưa có dịch vụ nào trong combo này
                    </div>

                    <div *ngFor="let svc of getServices()"
                         class="service-row">
                        
                        <div class="flex-1">
                            <div class="font-semibold text-sm service-name">
                                {{ svc.name }}
                            </div>
                            <div class="text-xs text-500 mt-1" *ngIf="svc.description">{{ svc.description }}</div>
                        </div>
                        <div class="text-right">
                            <div class="font-bold text-sm" style="color: #ef4444;">{{ formatPrice(svc.basePrice) }}</div>
                            <div class="text-xs text-400">/ {{ svc.unit || 'dịch vụ' }}</div>
                        </div>
                    </div>
                </div>
                <div class="flex justify-end gap-2 mt-5">
                    <p-button label="Quay lại" icon="pi pi-arrow-left" [outlined]="true" severity="secondary" (onClick)="goBack()" />
                    <p-button
                        [label]="item.status === 'inactive' ? 'Kích hoạt' : 'Vô hiệu hóa'"
                        [icon]="item.status === 'inactive' ? 'pi pi-check-circle' : 'pi pi-ban'"
                        [severity]="item.status === 'inactive' ? 'success' : 'warn'"
                        [outlined]="true"
                        (onClick)="toggleStatus()"
                        [loading]="togglingStatus" />
                    <p-button label="Chỉnh sửa" icon="pi pi-pencil" severity="primary"
                        (onClick)="goEdit()" />
                </div>
            </div>
            <div *ngIf="!item" class="text-center py-8 text-500">
                <i class="pi pi-info-circle text-4xl mb-3 block"></i>
                Không tìm thấy combo dịch vụ
            </div>

            <p-confirmdialog />
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="card text-center py-8">
            <i class="pi pi-spin pi-spinner text-4xl text-500"></i>
            <div class="text-500 mt-3">Đang tải thông tin combo dịch vụ...</div>
        </div>
    `,
    styles: [`
        .detail-hero {
            border-radius: 12px;
            min-height: 200px;
            position: relative;
            display: flex;
            align-items: flex-end;
            overflow: hidden;
            background: linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%);
        }
        .detail-hero-overlay {
            width: 100%; padding: 1.5rem;
            position: relative; z-index: 1;
        }
        .detail-hero-title {
            color: #1e293b; font-size: 1.75rem; font-weight: 700; margin: 0;
        }
        .detail-tag {
            display: inline-flex; align-items: center;
            background: rgba(255,255,255,0.9);
            color: #475569; border-radius: 20px;
            padding: 4px 12px; font-size: 0.8rem;
            border: 1px solid #e2e8f0;
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
            display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
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
        .service-row {
            display: flex; align-items: center; gap: 12px;
            padding: 12px; margin-bottom: 8px;
            background: white; border-radius: 10px;
            border: 1px solid #e2e8f0;
            transition: box-shadow 0.2s;
        }
        .service-row:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
        .service-row:last-child { margin-bottom: 0; }
        .service-icon-container {
            width: 48px; height: 48px; border-radius: 8px;
            flex-shrink: 0; background: #f3f4f6;
        }
        .service-name {
            color: #1e293b;
        }
        @media (max-width: 768px) {
            .stats-grid { grid-template-columns: 1fr; }
        }
    `],
    providers: [MessageService, ServicePackageService, ServiceService, LocationService, ConfirmationService]
})
export class ComboServiceDetailComponent implements OnInit {
    item: ServicePackage | null = null;
    loading = true;
    togglingStatus = false;
    
    allServices = signal<Service[]>([]);
    packageServices = signal<Service[]>([]);
    locations = signal<Location[]>([]);

    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private servicePackageService = inject(ServicePackageService);
    private serviceService = inject(ServiceService);
    private locationService = inject(LocationService);
    private messageService = inject(MessageService);
    private confirmationService = inject(ConfirmationService);
    private cdr = inject(ChangeDetectorRef);

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        console.log('Detail page - Route param ID:', id);
        if (id) {
            this.loadLocations();
            this.loadServices();
            this.loadItem(+id);
        } else {
            this.loading = false;
        }
    }

    loadLocations() {
        this.locationService.searchLocations({ page: 0, size: 100 }).subscribe({
            next: (res) => {
                if (res?.code === 200 && res.data?.content) {
                    this.locations.set(res.data.content);
                }
            }
        });
    }

    loadServices() {
        this.serviceService.searchServices({ page: 0, size: 500 }).subscribe({
            next: (res) => {
                if (res?.data?.content) {
                    this.allServices.set(res.data.content);
                    this.loadPackageServices();
                }
            }
        });
    }

    loadItem(id: number) {
        console.log('Loading service package with ID:', id);
        this.loading = true;
        this.servicePackageService.getById(id).subscribe({
            next: (res) => {
                console.log('Service package response:', res);
                if (res?.code === 200 && res.data) {
                    this.item = res.data;
                    this.loadPackageServices();
                } else {
                    this.item = null;
                    this.packageServices.set([]);
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading service package:', err);
                this.item = null;
                this.packageServices.set([]);
                this.loading = false;
                this.messageService.add({ 
                    severity: 'error', 
                    summary: 'Lỗi', 
                    detail: err?.error?.message || 'Không thể tải thông tin combo dịch vụ', 
                    life: 3000 
                });
                this.cdr.detectChanges();
            }
        });
    }

    /** Reload data without showing loading spinner */
    refreshItem(id: number) {
        this.servicePackageService.getById(id).subscribe({
            next: (res) => {
                if (res?.code === 200 && res.data) {
                    this.item = res.data;
                    this.loadPackageServices();
                }
                this.cdr.detectChanges();
            }
        });
    }

    getServices(): Service[] {
        if (this.packageServices().length > 0) {
            return this.packageServices();
        }

        if (!this.item?.serviceResponseList) return [];
        const serviceIdSet = new Set(this.item.serviceResponseList.map(sr => Number(sr.serviceId)));
        return this.allServices().filter(s => serviceIdSet.has(Number(s.id)));
    }

    toggleStatus() {
        if (!this.item) return;
        const action = this.item.status === 'inactive' ? 'kích hoạt' : 'vô hiệu hóa';
        this.confirmationService.confirm({
            message: `Bạn có chắc muốn ${action} combo dịch vụ "${this.item.name}"?`,
            header: 'Xác nhận thay đổi trạng thái',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Có',
            rejectLabel: 'Không',
            accept: () => {
                this.togglingStatus = true;
                this.servicePackageService.changeStatus(this.item!.id).subscribe({
                    next: () => {
                        this.messageService.add({ 
                            severity: 'success', 
                            summary: 'Thành công', 
                            detail: `Đã ${action} combo dịch vụ`, 
                            life: 3000 
                        });
                        this.togglingStatus = false;
                        // Navigate back to list after status change
                        this.goBack();
                    },
                    error: (err: any) => {
                        this.messageService.add({ 
                            severity: 'error', 
                            summary: 'Lỗi', 
                            detail: err?.error?.message || 'Không thể thay đổi trạng thái', 
                            life: 3000 
                        });
                        this.togglingStatus = false;
                    }
                });
            }
        });
    }

    goEdit() {
        this.router.navigate(['/pages/combo-services'], {
            queryParams: { edit: this.item?.id }
        });
    }

    goBack() {
        this.router.navigate(['/pages/combo-services']);
    }

    formatPrice(price?: number): string {
        if (!price && price !== 0) return '-';
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    }

    getLocationName(locationId: number): string {
        const location = this.locations().find(l => l.id === locationId);
        return location?.name ?? '-';
    }

    private loadPackageServices() {
        const serviceResponses = this.item?.serviceResponseList ?? [];
        if (serviceResponses.length === 0) {
            this.packageServices.set([]);
            return;
        }

        const serviceIds = Array.from(new Set(
            serviceResponses
                .map(sr => Number(sr.serviceId))
                .filter(id => Number.isFinite(id) && id > 0)
        ));

        if (serviceIds.length === 0) {
            this.packageServices.set([]);
            return;
        }

        const allServicesMap = new Map<number, Service>();
        this.allServices().forEach((service) => {
            const id = Number(service.id);
            if (Number.isFinite(id)) {
                allServicesMap.set(id, service);
            }
        });

        const foundServices = serviceIds
            .map(id => allServicesMap.get(id))
            .filter((service): service is Service => !!service);

        const missingIds = serviceIds.filter(id => !allServicesMap.has(id));
        if (missingIds.length === 0) {
            this.packageServices.set(foundServices);
            return;
        }

        forkJoin(
            missingIds.map(id =>
                this.serviceService.getServiceById(id).pipe(
                    map(res => res?.data ?? null),
                    catchError(() => of(null))
                )
            )
        ).subscribe((loadedServices) => {
            const loadedMap = new Map<number, Service>();
            loadedServices.forEach((service) => {
                if (!service) return;
                const id = Number(service.id);
                if (Number.isFinite(id)) {
                    loadedMap.set(id, service);
                }
            });

            const orderedServices = serviceIds
                .map(id => allServicesMap.get(id) ?? loadedMap.get(id))
                .filter((service): service is Service => !!service);

            this.packageServices.set(orderedServices);
            this.cdr.markForCheck();
        });
    }
}
