import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Customer, CustomerService } from '../service/customer.service';
import { Booking, BookingService } from '../service/booking.service';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { LocationService } from '../service/location.service';
import { AuthService } from '../service/auth.service';

@Component({
    selector: 'app-customer-detail',
    standalone: true,
    imports: [
        CommonModule, 
        RouterModule, 
        ButtonModule, 
        TableModule, 
        TagModule, 
        ToastModule, 
        DialogModule, 
        InputTextModule, 
        FileUploadModule, 
        FormsModule,
        SelectModule
    ],
    providers: [MessageService, BookingService, LocationService],
    template: `
        <p-toast />

        <div class="page-header">
            <div class="page-title-wrap">
                <h2>Chi tiết khách hàng</h2>
                <span class="page-subtitle">Thông tin khách hàng và danh sách hợp đồng liên quan</span>
            </div>
            <div class="flex gap-2">
                <p-button label="Chỉnh sửa" icon="pi pi-pencil" severity="info" [outlined]="true" (onClick)="editCustomer()" />
                <p-button label="Quay lại" icon="pi pi-arrow-left" severity="secondary" [outlined]="true" (onClick)="goBack()" />
            </div>
        </div>

        <div class="grid-wrap" *ngIf="!loadingCustomer; else customerLoadingTpl">
            <div class="summary-card">
                <div class="summary-head">
                    <div class="avatar">{{ getInitials(customer?.fullName) }}</div>
                    <div>
                        <div class="name">{{ customer?.fullName || '-' }}</div>
                        <div class="meta">ID: {{ customer?.id || '-' }}</div>
                    </div>
                </div>

                <div class="summary-content">
                    <div class="row"><span>Email</span><strong>{{ customer?.email || '-' }}</strong></div>
                    <div class="row"><span>Số điện thoại</span><strong>{{ customer?.phone || '-' }}</strong></div>
                    <div class="row"><span>Số CMND/CCCD</span><strong>{{ customer?.citizenIdNumber || '-' }}</strong></div>
                    <div class="row"><span>Chi nhánh</span><strong>{{ customer?.locationName || customer?.location?.name || '-' }}</strong></div>
                    <div class="row"><span>Địa chỉ</span><strong>{{ customer?.address || '-' }}</strong></div>
                    <div class="row"><span>Ghi chú</span><strong>{{ customer?.notes || '-' }}</strong></div>
                    <div class="row"><span>Trạng thái</span>
                        <p-tag [value]="statusLabel(customer?.status)" [severity]="statusSeverity(customer?.status)"></p-tag>
                    </div>
                </div>
                
                <button class="btn-cccd" *ngIf="customerImageUrls.length > 0" (click)="cccdDialogVisible = true">
                    <i class="pi pi-id-card"></i> Xem ảnh CCCD
                </button>
            </div>

            <div class="contracts-card">
                <div class="contracts-head">
                    <h3>Hợp đồng của khách hàng</h3>
                    <span>Tổng: {{ totalContracts }}</span>
                </div>

                <p-table
                    [value]="contracts()"
                    [rows]="pageSize"
                    [paginator]="true"
                    [lazy]="true"
                    [totalRecords]="totalContracts"
                    [rowsPerPageOptions]="[10, 20, 30]"
                    [loading]="loadingContracts"
                    currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} hợp đồng"
                    [showCurrentPageReport]="true"
                    (onPage)="onPageChange($event)"
                    dataKey="id"
                >
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Mã hợp đồng</th>
                            <th>Ngày đặt</th>
                            <th>Ngày tiệc</th>
                            <th>Sảnh</th>
                            <th>Số bàn</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="body" let-contract>
                        <tr>
                            <td>{{ contract.contractNo || contract.bookingNo || ('#' + contract.id) }}</td>
                            <td>{{ formatDate(contract.bookingDate) }}</td>
                            <td>{{ formatDate(contract.eventDate || contract.bookingDate) }}</td>
                            <td>{{ contract.hallName || '-' }}</td>
                            <td>{{ contract.expectedTables || contract.tableCount || '-' }}</td>
                            <td>
                                <p-tag
                                    [value]="bookingStateLabel(contract.contractState || contract.bookingState || '-')"
                                    [severity]="bookingStateSeverity(contract.contractState || contract.bookingState || '-')"
                                ></p-tag>
                            </td>
                            <td>
                                <p-button
                                    icon="pi pi-eye"
                                    [rounded]="true"
                                    [outlined]="true"
                                    severity="info"
                                    pTooltip="Xem chi tiết hợp đồng"
                                    tooltipPosition="top"
                                    (onClick)="viewContract(contract)"
                                ></p-button>
                            </td>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="7" class="empty-cell">Khách hàng này chưa có hợp đồng nào.</td>
                        </tr>
                    </ng-template>
                </p-table>
            </div>
        </div>

        <!-- CCCD Dialog -->
        <div class="cccd-overlay" *ngIf="cccdDialogVisible" (click)="cccdDialogVisible = false">
            <div class="cccd-modal" (click)="$event.stopPropagation()">
                <div class="cccd-modal-header">
                    <div class="cccd-modal-title">
                        <i class="pi pi-id-card"></i> Ảnh CCCD - {{ customer?.fullName || 'Khách hàng' }}
                    </div>
                    <p-button icon="pi pi-times" [rounded]="true" [text]="true" severity="secondary" (onClick)="cccdDialogVisible = false" />
                </div>
                <div class="cccd-modal-body">
                    <div class="cccd-card" *ngIf="customerImageUrls.length >= 1">
                        <div class="cccd-card-label"><i class="pi pi-image"></i> Mặt trước</div>
                        <img [src]="getCcImage(0)" alt="CCCD mặt trước" />
                    </div>
                    <div class="cccd-card" *ngIf="customerImageUrls.length >= 2">
                        <div class="cccd-card-label"><i class="pi pi-image"></i> Mặt sau</div>
                        <img [src]="getCcImage(1)" alt="CCCD mặt sau" />
                    </div>
                    <div class="cccd-empty" *ngIf="customerImageUrls.length === 0">
                        Chưa có ảnh CCCD cho khách hàng này.
                    </div>
                </div>
            </div>
        </div>
        <ng-template #customerLoadingTpl>
            <div class="loading-wrap">
                <i class="pi pi-spin pi-spinner"></i>
                <span>Đang tải thông tin khách hàng...</span>
            </div>
        </ng-template>

        <!-- Edit Customer Dialog -->
        <p-dialog
            [(visible)]="editDialogVisible"
            [style]="{ width: '540px', maxHeight: '90vh' }"
            [contentStyle]="{ overflow: 'auto', maxHeight: 'calc(90vh - 9rem)' }"
            header="Chỉnh sửa khách hàng"
            [modal]="true"
            appendTo="body"
            [draggable]="false"
            [resizable]="false"
            [breakpoints]="{ '960px': '92vw', '640px': '96vw' }"
            styleClass="p-fluid"
        >
            <div class="flex flex-col gap-5">
                <div>
                    <label for="fullName" class="block font-bold mb-2">
                        Họ và tên <span class="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        pInputText
                        id="fullName"
                        [(ngModel)]="editCustomerData.fullName"
                        required
                        autofocus
                        fluid
                        placeholder="Nguyễn Văn A"
                    />
                    <small class="text-red-500" *ngIf="submitted && !editCustomerData.fullName">
                        Họ và tên là bắt buộc.
                    </small>
                </div>

                <div>
                    <label for="citizenIdNumber" class="block font-bold mb-2">Số CMND/CCCD</label>
                    <input
                        type="text"
                        pInputText
                        id="citizenIdNumber"
                        [(ngModel)]="editCustomerData.citizenIdNumber"
                        fluid
                        placeholder="012345678901"
                    />
                </div>

                <div>
                    <label for="email" class="block font-bold mb-2">Email</label>
                    <input
                        type="email"
                        pInputText
                        id="email"
                        [(ngModel)]="editCustomerData.email"
                        fluid
                        placeholder="email@example.com"
                    />
                </div>

                <div>
                    <label for="phone" class="block font-bold mb-2">Số điện thoại</label>
                    <input
                        type="text"
                        pInputText
                        id="phone"
                        [(ngModel)]="editCustomerData.phone"
                        fluid
                        placeholder="0901234567"
                    />
                </div>

                <div>
                    <label for="locationId" class="block font-bold mb-2">Chi nhánh</label>
                    <p-select
                        [(ngModel)]="editCustomerData.locationId"
                        inputId="locationId"
                        [options]="locationOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Chọn chi nhánh"
                        fluid
                        [filter]="true"
                        filterBy="label"
                        emptyMessage="Không có dữ liệu"
                        [disabled]="isLocationLocked"
                    />
                </div>

                <div>
                    <label for="address" class="block font-bold mb-2">Địa chỉ</label>
                    <input
                        type="text"
                        pInputText
                        id="address"
                        [(ngModel)]="editCustomerData.address"
                        fluid
                        placeholder="123 Đường ABC, TP.HCM"
                    />
                </div>

                <div>
                    <label for="notes" class="block font-bold mb-2">Ghi chú</label>
                    <input
                        type="text"
                        pInputText
                        id="notes"
                        [(ngModel)]="editCustomerData.notes"
                        fluid
                        placeholder="Ghi chú thêm..."
                    />
                </div>

                <div *ngIf="customerImageUrls.length > 0">
                    <label class="block font-bold mb-2">Ảnh CCCD hiện tại</label>
                    <div class="flex gap-4 overflow-x-auto pb-2">
                        <div *ngFor="let img of customerImageUrls; let i = index" class="relative group">
                            <img [src]="getCcImage(i)" alt="CCCD" class="h-32 w-48 object-cover rounded border" />
                            <div class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                                {{ i === 0 ? 'Mặt trước' : 'Mặt sau' }}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block font-bold mb-2">
                        Cập nhật ảnh CCCD <span class="font-normal text-sm text-gray-500">(Tải ảnh mới nếu muốn thay đổi)</span>
                    </label>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <span class="text-sm font-medium text-gray-600">Mặt trước</span>
                            <p-fileupload 
                                mode="basic" 
                                chooseLabel="Chọn mặt trước" 
                                chooseIcon="pi pi-image"
                                accept="image/*" 
                                [maxFileSize]="5000000" 
                                (onSelect)="onFrontFileSelect($event)"
                                styleClass="p-button-outlined w-full"
                            />
                            <div *ngIf="frontPreview" class="mt-2 relative">
                                <img [src]="frontPreview" alt="Front Preview" class="h-24 w-full object-cover rounded border border-green-500" />
                                <div class="absolute top-0 right-0 bg-green-500 text-white p-1 rounded-bl">
                                    <i class="pi pi-check text-[10px]"></i>
                                </div>
                            </div>
                            <div *ngIf="frontFile && !frontPreview" class="text-xs text-green-600 font-medium truncate">
                                <i class="pi pi-check mr-1"></i>{{ frontFile.name }}
                            </div>
                        </div>
                        <div class="flex flex-col gap-2">
                            <span class="text-sm font-medium text-gray-600">Mặt sau</span>
                            <p-fileupload 
                                mode="basic" 
                                chooseLabel="Chọn mặt sau" 
                                chooseIcon="pi pi-image"
                                accept="image/*" 
                                [maxFileSize]="5000000" 
                                (onSelect)="onBackFileSelect($event)"
                                styleClass="p-button-outlined w-full"
                            />
                            <div *ngIf="backPreview" class="mt-2 relative">
                                <img [src]="backPreview" alt="Back Preview" class="h-24 w-full object-cover rounded border border-green-500" />
                                <div class="absolute top-0 right-0 bg-green-500 text-white p-1 rounded-bl">
                                    <i class="pi pi-check text-[10px]"></i>
                                </div>
                            </div>
                            <div *ngIf="backFile && !backPreview" class="text-xs text-green-600 font-medium truncate">
                                <i class="pi pi-check mr-1"></i>{{ backFile.name }}
                            </div>
                        </div>
                    </div>
                    <small class="text-gray-500 block mt-2">
                        Yêu cầu tải lên cả 2 mặt nếu bạn muốn thay đổi ảnh CCCD.
                    </small>
                </div>
            </div>

            <ng-template #footer>
                <p-button label="Hủy" icon="pi pi-times" [text]="true" (onClick)="editDialogVisible = false" />
                <p-button label="Lưu" icon="pi pi-check" [loading]="saving" (onClick)="saveCustomer()" />
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 1rem;
            gap: 1rem;
            flex-wrap: wrap;
        }
        .page-title-wrap h2 {
            margin: 0;
            font-size: 1.5rem;
            color: #1f2937;
        }
        .page-subtitle {
            color: #6b7280;
            font-size: 0.9rem;
        }
        .grid-wrap {
            display: grid;
            grid-template-columns: 320px minmax(0, 1fr);
            gap: 1rem;
            align-items: start;
        }
        .summary-card,
        .contracts-card {
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            padding: 1rem;
        }
        .summary-head {
            display: flex;
            gap: 0.75rem;
            align-items: center;
            margin-bottom: 1rem;
        }
        .avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: grid;
            place-items: center;
            background: #dbeafe;
            color: #1d4ed8;
            font-weight: 700;
        }
        .name {
            font-weight: 700;
            color: #111827;
        }
        .meta {
            color: #6b7280;
            font-size: 0.85rem;
        }
        .summary-content .row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 0.75rem;
            padding: 0.5rem 0;
            border-bottom: 1px dashed #e5e7eb;
            font-size: 0.92rem;
        }
        .summary-content .row:last-child {
            border-bottom: none;
        }
        .summary-content .row span {
            color: #6b7280;
        }
        .summary-content .row strong {
            font-weight: 600;
            color: #111827;
            text-align: right;
        }
        .contracts-head {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.8rem;
        }
        .contracts-head h3 {
            margin: 0;
            color: #111827;
        }
        .contracts-head span {
            color: #6b7280;
            font-size: 0.9rem;
        }
        .empty-cell {
            text-align: center;
            color: #6b7280;
            padding: 1rem;
        }
        .loading-wrap {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            color: #4b5563;
        }
        .loading-wrap .pi-spinner {
            font-size: 1.2rem;
        }

        /* ── CCCD Dialog ── */
        .cccd-overlay {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1200;
            padding: 1rem;
        }
        .cccd-modal {
            width: min(95vw, 780px);
            max-height: calc(100vh - 2rem);
            background: #fff;
            border-radius: 14px;
            border: 1px solid #cbd5e1;
            box-shadow: 0 24px 48px rgba(15, 23, 42, 0.35);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .cccd-modal-header {
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            padding: 0.85rem 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .cccd-modal-title {
            font-size: 1rem;
            font-weight: 600;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .cccd-modal-body {
            padding: 1.25rem;
            overflow: auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .cccd-card {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            overflow: hidden;
        }
        .cccd-card-label {
            font-size: 0.85rem;
            font-weight: 600;
            color: #334155;
            padding: 0.55rem 0.85rem;
            background: #f8fafc;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 0.35rem;
        }
        .cccd-card img {
            width: 100%;
            display: block;
            object-fit: contain;
            max-height: 340px;
            background: #f1f5f9;
        }
        .cccd-empty {
            text-align: center;
            color: #94a3b8;
            padding: 2rem 1rem;
            font-size: 0.92rem;
        }
        .btn-cccd {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            margin-top: 1rem;
            padding: 0.45rem 0.85rem;
            font-size: 0.85rem;
            font-weight: 600;
            color: #3b82f6;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.15s, border-color 0.15s;
            width: 100%;
            justify-content: center;
        }
        .btn-cccd:hover {
            background: #dbeafe;
            border-color: #93c5fd;
        }

        @media (max-width: 992px) {
            .grid-wrap {
                grid-template-columns: 1fr;
            }
        }
    `]
})
export class CustomerDetailComponent implements OnInit {
    customer: Customer | null = null;
    contracts = signal<Booking[]>([]);

    loadingCustomer = false;
    loadingContracts = false;

    customerId: number | null = null;
    totalContracts = 0;
    currentPage = 0;
    pageSize = 10;
    
    customerImageUrls: any[] = [];
    cccdDialogVisible = false;

    editDialogVisible = false;
    editCustomerData: any = {};
    frontFile: File | null = null;
    backFile: File | null = null;
    frontPreview: string | null = null;
    backPreview: string | null = null;
    saving = false;
    locationOptions: any[] = [];
    isLocationLocked = false;
    submitted = false;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private customerService: CustomerService,
        private bookingService: BookingService,
        private locationService: LocationService,
        private authService: AuthService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isFinite(id) || id <= 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: 'ID khách hàng không hợp lệ',
                life: 3000
            });
            this.goBack();
            return;
        }

        this.customerId = id;
        this.loadCustomer();
        this.loadContracts();
    }

    loadCustomer(): void {
        if (!this.customerId) return;
        this.loadingCustomer = true;

        this.customerService.getCustomerById(this.customerId).subscribe({
            next: (res) => {
                this.customer = res.data;
                this.customerImageUrls = (res.data as any)?.imageUrls ?? [];
                if (this.customerImageUrls.length > 2) {
                    this.customerImageUrls = this.customerImageUrls.slice(-2);
                }
                this.loadingCustomer = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.loadingCustomer = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Không thể tải thông tin khách hàng',
                    life: 3000
                });
                this.cdr.markForCheck();
            }
        });
    }

    loadLocationOptions(): void {
        this.locationService.searchLocations({ page: 0, size: 100 }).subscribe({
            next: (res) => {
                this.locationOptions = res.data.content.map(l => ({ label: l.name, value: l.id }));
                this.checkLocationLock();
            }
        });
    }

    checkLocationLock(): void {
        const role = (localStorage.getItem('codeRole') ?? '').toUpperCase();
        const isAdmin = role.includes('ADMIN');
        if (!isAdmin) {
            const locId = localStorage.getItem('locationId');
            if (locId) {
                this.isLocationLocked = true;
                this.editCustomerData.locationId = Number(locId);
            }
        }
    }

    editCustomer(): void {
        if (!this.customer) return;
        this.editCustomerData = { ...this.customer };
        this.clearFilePreviews();
        this.submitted = false;
        this.editDialogVisible = true;
        this.loadLocationOptions();
    }

    clearFilePreviews(): void {
        if (this.frontPreview) URL.revokeObjectURL(this.frontPreview);
        if (this.backPreview) URL.revokeObjectURL(this.backPreview);
        this.frontPreview = null;
        this.backPreview = null;
        this.frontFile = null;
        this.backFile = null;
    }

    onFrontFileSelect(event: any): void {
        if (this.frontPreview) URL.revokeObjectURL(this.frontPreview);
        this.frontFile = event.currentFiles[0];
        if (this.frontFile) {
            this.frontPreview = URL.createObjectURL(this.frontFile);
        }
    }

    onBackFileSelect(event: any): void {
        if (this.backPreview) URL.revokeObjectURL(this.backPreview);
        this.backFile = event.currentFiles[0];
        if (this.backFile) {
            this.backPreview = URL.createObjectURL(this.backFile);
        }
    }

    saveCustomer(): void {
        this.submitted = true;
        if (!this.editCustomerData.fullName?.trim()) {
            return;
        }

        const imageFiles: File[] = [];
        if (this.frontFile && this.backFile) {
            imageFiles.push(this.frontFile, this.backFile);
        } else if (this.frontFile || this.backFile) {
            this.messageService.add({ severity: 'warn', summary: 'Thông báo', detail: 'Vui lòng chọn đủ cả 2 mặt ảnh CCCD' });
            return;
        }

        this.saving = true;
        this.customerService.updateCustomer(this.customerId, {
            fullName: this.editCustomerData.fullName,
            citizenIdNumber: this.editCustomerData.citizenIdNumber,
            email: this.editCustomerData.email,
            phone: this.editCustomerData.phone,
            address: this.editCustomerData.address,
            notes: this.editCustomerData.notes,
            locationId: this.editCustomerData.locationId
        }, imageFiles).subscribe({
            next: () => {
                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật thông tin khách hàng thành công' });
                this.editDialogVisible = false;
                this.saving = false;
                this.clearFilePreviews();
                this.loadCustomer();
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({ severity: 'error', summary: 'Lỗi', detail: err.error?.message || 'Cập nhật thất bại' });
            }
        });
    }

    loadContracts(page = this.currentPage, size = this.pageSize): void {
        if (!this.customerId) return;
        this.loadingContracts = true;

        this.bookingService.searchBookings({
            customerId: this.customerId,
            page,
            size,
            sort: 'updatedAt,DESC'
        }).subscribe({
            next: (res) => {
                const data = res?.data;
                this.contracts.set(data?.content ?? []);
                this.totalContracts = data?.totalElements ?? 0;
                this.currentPage = page;
                this.pageSize = size;
                this.loadingContracts = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.contracts.set([]);
                this.totalContracts = 0;
                this.loadingContracts = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: 'Không thể tải danh sách hợp đồng',
                    life: 3000
                });
                this.cdr.markForCheck();
            }
        });
    }

    onPageChange(event: any): void {
        const page = Math.floor((event?.first ?? 0) / (event?.rows ?? this.pageSize));
        const size = event?.rows ?? this.pageSize;
        this.loadContracts(page, size);
    }

    viewContract(contract: Booking): void {
        if (!contract?.id) return;
        const backUrl = this.router.url;
        this.router.navigate(['/pages/booking', contract.id, 'view'], {
            state: { returnUrl: backUrl },
            queryParams: { returnUrl: backUrl }
        });
    }

    goBack(): void {
        if (window.history.length > 1) {
            this.location.back();
            return;
        }
        this.router.navigate(['/pages/customers']);
    }

    formatDate(value?: string): string {
        if (!value) return '-';
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return '-';
        return new Intl.DateTimeFormat('vi-VN').format(date);
    }

    getInitials(fullName?: string): string {
        if (!fullName) return '?';
        const names = fullName.trim().split(' ').filter(Boolean);
        if (names.length >= 2) return (names[0][0] + names[names.length - 1][0]).toUpperCase();
        return fullName.slice(0, 2).toUpperCase();
    }

    statusLabel(status?: string): string {
        return status === 'active' ? 'Hoạt động' : 'Không hoạt động';
    }

    statusSeverity(status?: string): 'success' | 'danger' {
        return status === 'active' ? 'success' : 'danger';
    }

    bookingStateLabel(state?: string): string {
        const map: Record<string, string> = {
            DRAFT: 'Nháp',
            ACTIVE: 'Đang hiệu lực',
            LIQUIDATED: 'Đã thanh lý',
            CANCELLED: 'Đã hủy'
        };
        return map[state ?? ''] ?? state ?? '-';
    }

    bookingStateSeverity(state?: string): 'success' | 'warn' | 'danger' | 'secondary' {
        const map: Record<string, 'success' | 'warn' | 'danger' | 'secondary'> = {
            DRAFT: 'warn',
            ACTIVE: 'success',
            LIQUIDATED: 'secondary',
            CANCELLED: 'danger'
        };
        return map[state ?? ''] ?? 'secondary';
    }

    getCcImage(index: number): string {
        if (!this.customerImageUrls || this.customerImageUrls.length <= index) return '';
        const img = this.customerImageUrls[index];
        if (!img) return '';
        if (typeof img === 'string') return img;
        return img.originalUrl || img.original_url || img.mediumUrl || img.medium_url || img.url || '';
    }
}
