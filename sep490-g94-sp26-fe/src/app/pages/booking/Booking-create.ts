import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Booking, BookingService, BookingUpsertPayload } from '../service/booking.service';
import { CustomerService } from '../service/customer.service';
import { HallService } from '../service/hall.service';
import { LocationService } from '../service/location.service';
import { ServicePackageService } from '../service/service-package.service';
import { SetMenuService } from '../service/set-menu';
import { UserService } from '../service/users.service';
import { RoleService } from '../service/role.service';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, mapTo, switchMap, tap } from 'rxjs/operators';

interface CustomerOption {
    id: number;
    label: string;
    phone: string;
}

interface HallOption {
    id: number;
    label: string;
}

interface LocationOption {
    id: number;
    label: string;
}

interface SetMenuOption {
    id: number;
    label: string;
    price: number;
}

interface ServicePackageOption {
    id: number;
    label: string;
    price: number;
}

interface SalesOption {
    id: number;
    label: string;
}

@Component({
    selector: 'app-booking-create',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        AutoCompleteModule,
        DatePickerModule,
        TextareaModule,
        InputNumberModule,
        ToastModule,
    ],
    providers: [MessageService, BookingService],
    styles: [`
        .page-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 1rem;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
        }
        .page-header-left {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
        }
        .page-header h1 {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0;
        }
        .page-header p {
            font-size: 0.82rem;
            color: #64748b;
            margin: 0.15rem 0 0;
        }
        .header-actions {
            display: flex;
            gap: 0.75rem;
            flex-wrap: wrap;
            justify-content: flex-end;
        }
        .create-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 310px;
            gap: 1.5rem;
            align-items: start;
        }
        .section-card,
        .summary-card {
            background: #fff;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
        }
        .section-card {
            margin-bottom: 1.25rem;
        }
        .section-title,
        .summary-title {
            font-weight: 600;
            font-size: 0.95rem;
            color: #1e293b;
            margin-bottom: 1rem;
        }
        .field-wrap {
            margin-bottom: 1rem;
        }
        .field-wrap:last-child {
            margin-bottom: 0;
        }
        .field-label {
            font-size: 0.82rem;
            font-weight: 500;
            color: #475569;
            margin-bottom: 0.35rem;
            display: block;
        }
        .field-label .req {
            color: #ef4444;
        }
        .two-col {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        .three-col {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 1rem;
        }
        .menu-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
        }
        .person-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }
        .person-panel {
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 1rem;
            background: #fcfdff;
        }
        .person-title {
            font-size: 0.9rem;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 0.85rem;
        }
        .menu-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 0.85rem 1rem;
            cursor: pointer;
            transition: all 0.15s;
        }
        .menu-card:hover {
            border-color: #94a3b8;
        }
        .menu-card.selected {
            border: 2px solid #10b981;
            background: #f0fdf4;
        }
        .menu-name {
            font-weight: 600;
            color: #1e293b;
            font-size: 0.9rem;
        }
        .menu-price {
            color: #10b981;
            font-weight: 700;
            font-size: 0.85rem;
            margin-top: 0.2rem;
        }
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            color: #94a3b8;
            gap: 0.5rem;
            text-align: center;
        }
        .empty-state i {
            font-size: 1.75rem;
        }
        .empty-state span {
            font-size: 0.82rem;
        }
        .summary-card {
            position: sticky;
            top: 1rem;
        }
        .summary-row {
            display: flex;
            justify-content: space-between;
            gap: 0.75rem;
            font-size: 0.85rem;
            margin-bottom: 0.65rem;
            color: #475569;
        }
        .summary-row strong {
            color: #1e293b;
            text-align: right;
        }
        .summary-divider {
            border-top: 1px solid #e2e8f0;
            margin: 0.75rem 0;
        }
        .state-chip {
            display: inline-flex;
            align-items: center;
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.3rem 0.55rem;
            border-radius: 999px;
        }
        .loading-card {
            background: #fff;
            border-radius: 12px;
            padding: 3rem 1.5rem;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
            text-align: center;
            color: #64748b;
        }
        .loading-card i {
            font-size: 1.75rem;
            margin-bottom: 0.75rem;
            color: #94a3b8;
        }
        @media (max-width: 960px) {
            .create-layout {
                grid-template-columns: 1fr;
            }
            .two-col,
            .three-col,
            .menu-grid,
            .person-grid {
                grid-template-columns: 1fr;
            }
        }
    `],
    template: `
        <p-toast />

        <div class="page-header">
            <div class="page-header-left">
                <p-button icon="pi pi-arrow-left" [text]="true" severity="secondary" (onClick)="goBack()" />
                <div>
                    <h1>{{ isEditMode ? 'Chi tiết đặt tiệc' : 'Đặt tiệc mới' }}</h1>
                    <p>{{ isEditMode ? 'Xem và cập nhật đơn đặt tiệc theo API mới' : 'Tạo đơn đặt tiệc theo đúng contract backend' }}</p>
                </div>
            </div>

            <div class="header-actions">
                <p-button
                    *ngIf="isEditMode"
                    label="Lưu cập nhật"
                    icon="pi pi-save"
                    [loading]="submitting"
                    (onClick)="submit()"
                />
                <p-button
                    *ngIf="!isEditMode"
                    label="Tạo đơn đặt tiệc"
                    icon="pi pi-save"
                    [style]="{ 'background': '#10b981', 'border-color': '#10b981' }"
                    [loading]="submitting"
                    (onClick)="submit()"
                />
            </div>
        </div>

        <ng-container *ngIf="!isEditMode || !loading; else detailLoading">
        <div class="create-layout">
            <div>
                <div class="section-card">
                    <div class="section-title">Khách hàng và điều phối</div>
                    <div class="two-col">
                        <div class="field-wrap">
                            <label class="field-label">Khách hàng <span class="req">*</span></label>
                            <p-autoComplete
                                [(ngModel)]="selectedCustomer"
                                [suggestions]="customerSuggestions"
                                (completeMethod)="searchCustomer($event)"
                                (onSelect)="onCustomerSelect($event)"
                                optionLabel="label"
                                placeholder="Tìm theo số điện thoại"
                                [style]="{ width: '100%' }"
                                [inputStyle]="{ width: '100%' }"
                                [forceSelection]="true"
                            >
                                <ng-template let-c pTemplate="item">
                                    <div>
                                        <div style="font-weight:600">{{ c.label }}</div>
                                        <div style="font-size:0.78rem;color:#64748b">{{ c.phone || 'Chưa có SĐT' }}</div>
                                    </div>
                                </ng-template>
                            </p-autoComplete>
                        </div>

                        <div class="field-wrap">
                            <label class="field-label">Sales phụ trách</label>
                            <ng-container *ngIf="isSaleCreateMode; else salesSelectTpl">
                                <input
                                    pInputText
                                    [ngModel]="getSalesLabel(form.salesId || loggedInUserId)"
                                    readonly
                                    style="width:100%; background:#f8fafc; color:#334155"
                                />
                            </ng-container>
                            <ng-template #salesSelectTpl>
                                <p-select
                                    [options]="salesOptions"
                                    [(ngModel)]="form.salesId"
                                    optionLabel="label"
                                    optionValue="id"
                                    placeholder="Chọn sales phụ trách"
                                    [showClear]="true"
                                    styleClass="w-full"
                                />
                            </ng-template>
                        </div>
                    </div>

                </div>

                <div class="section-card">
                    <div class="section-title">Thông tin cô dâu chú rể</div>
                    <div class="person-grid">
                        <div class="person-panel">
                            <div class="person-title">Thông tin cô dâu</div>
                            <div class="field-wrap">
                                <label class="field-label">Họ tên cô dâu <span class="req">*</span></label>
                                <input pInputText [(ngModel)]="form.brideName" placeholder="Trần Thị B" style="width:100%" />
                            </div>
                            <div class="field-wrap">
                                <label class="field-label">Tuổi cô dâu</label>
                                <p-inputnumber [(ngModel)]="form.brideAge" [min]="1" [max]="120" styleClass="w-full" inputStyleClass="w-full" />
                            </div>
                            <div class="field-wrap">
                                <label class="field-label">Tên cha cô dâu</label>
                                <input pInputText [(ngModel)]="form.brideFatherName" placeholder="Trần Văn..." style="width:100%" />
                            </div>
                            <div class="field-wrap" style="margin-bottom:0">
                                <label class="field-label">Tên mẹ cô dâu</label>
                                <input pInputText [(ngModel)]="form.brideMotherName" placeholder="Lê Thị..." style="width:100%" />
                            </div>
                        </div>

                        <div class="person-panel">
                            <div class="person-title">Thông tin chú rể</div>
                            <div class="field-wrap">
                                <label class="field-label">Họ tên chú rể <span class="req">*</span></label>
                                <input pInputText [(ngModel)]="form.groomName" placeholder="Nguyễn Văn A" style="width:100%" />
                            </div>
                            <div class="field-wrap">
                                <label class="field-label">Tuổi chú rể</label>
                                <p-inputnumber [(ngModel)]="form.groomAge" [min]="1" [max]="120" styleClass="w-full" inputStyleClass="w-full" />
                            </div>
                            <div class="field-wrap">
                                <label class="field-label">Tên cha chú rể</label>
                                <input pInputText [(ngModel)]="form.groomFatherName" placeholder="Nguyễn Văn..." style="width:100%" />
                            </div>
                            <div class="field-wrap" style="margin-bottom:0">
                                <label class="field-label">Tên mẹ chú rể</label>
                                <input pInputText [(ngModel)]="form.groomMotherName" placeholder="Trần Thị..." style="width:100%" />
                            </div>
                        </div>
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-title">Thông tin tiệc cưới</div>
                    <div class="field-wrap">
                        <label class="field-label">Chi nhánh</label>
                        <p-select
                            [options]="locationOptions"
                            [(ngModel)]="form.locationId"
                            optionLabel="label"
                            optionValue="id"
                            placeholder="Chọn chi nhánh"
                            [showClear]="!isSaleCreateMode"
                            [disabled]="isSaleCreateMode"
                            (onChange)="onLocationChange()"
                            styleClass="w-full"
                        />
                    </div>

                    <div class="two-col">
                        <div class="field-wrap">
                            <label class="field-label">Sảnh cưới <span class="req">*</span></label>
                            <p-select
                                [options]="hallOptions"
                                [(ngModel)]="form.hallId"
                                optionLabel="label"
                                optionValue="id"
                                placeholder="Chọn sảnh"
                                [showClear]="true"
                                (onChange)="onHallChange()"
                                styleClass="w-full"
                            />
                        </div>
                        <div class="field-wrap">
                            <label class="field-label">Ca tổ chức <span class="req">*</span></label>
                            <p-select
                                [options]="shiftOptions"
                                [(ngModel)]="form.bookingTime"
                                optionLabel="label"
                                optionValue="value"
                                styleClass="w-full"
                            />
                        </div>
                    </div>

                    <div class="three-col">
                        <div class="field-wrap">
                            <label class="field-label">Ngày tổ chức <span class="req">*</span></label>
                            <p-datepicker
                                [(ngModel)]="form.bookingDate"
                                dateFormat="dd/mm/yy"
                                [showIcon]="true"
                                [minDate]="today"
                                (ngModelChange)="onBookingDateChange()"
                                placeholder="Chọn ngày"
                                styleClass="w-full"
                            />
                        </div>
                        <div class="field-wrap">
                            <label class="field-label">Số bàn dự kiến <span class="req">*</span></label>
                            <p-inputnumber
                                [(ngModel)]="form.expectedTables"
                                [min]="1"
                                [max]="500"
                                (ngModelChange)="recalcEstimatedTotal()"
                                styleClass="w-full"
                                inputStyleClass="w-full"
                            />
                        </div>
                        <div class="field-wrap">
                            <label class="field-label">Số khách dự kiến <span class="req">*</span></label>
                            <p-inputnumber
                                [(ngModel)]="form.expectedGuests"
                                [min]="1"
                                styleClass="w-full"
                                inputStyleClass="w-full"
                            />
                        </div>
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-title">Set menu</div>
                    <div *ngIf="setMenuOptions.length === 0" class="empty-state">
                        <i class="pi pi-times-circle"></i>
                        <span>Chọn chi nhánh hoặc sảnh để tải danh sách set menu</span>
                    </div>

                    <div *ngIf="setMenuOptions.length > 0" class="menu-grid">
                        <div
                            *ngFor="let menu of setMenuOptions"
                            class="menu-card"
                            [class.selected]="form.setMenuId === menu.id"
                            (click)="selectSetMenu(menu)"
                        >
                            <div class="menu-name">{{ menu.label }}</div>
                            <div class="menu-price">{{ formatPrice(menu.price) }}/bàn</div>
                        </div>
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-title">Gói dịch vụ</div>

                    <div *ngIf="!form.hallId" class="empty-state">
                        <i class="pi pi-briefcase"></i>
                        <span>Chọn sảnh cưới để xem danh sách gói dịch vụ</span>
                    </div>

                    <div *ngIf="form.hallId && packageOptions.length === 0" class="empty-state">
                        <i class="pi pi-briefcase"></i>
                        <span>Chưa có gói dịch vụ cho sảnh đã chọn</span>
                    </div>

                    <div *ngIf="form.hallId && packageOptions.length > 0" class="menu-grid">
                        <div
                            *ngFor="let pkg of packageOptions"
                            class="menu-card"
                            [class.selected]="form.packageId === pkg.id"
                            (click)="selectPackage(pkg)"
                        >
                            <div class="menu-name">{{ pkg.label }}</div>
                            <div class="menu-price">{{ formatPrice(pkg.price) }}</div>
                        </div>
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-title">Ghi chú</div>
                    <textarea
                        pTextarea
                        [(ngModel)]="form.notes"
                        placeholder="Nhập ghi chú cho đơn đặt tiệc..."
                        [rows]="4"
                        style="width:100%;resize:vertical"
                    ></textarea>
                </div>
            </div>

            <div>
                <div class="summary-card">
                    <div class="summary-title">Tóm tắt booking</div>

                    <div class="summary-row" *ngIf="bookingCode">
                        <span>Mã đơn</span>
                        <strong>{{ bookingCode }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="isEditMode">
                        <span>Trạng thái kích hoạt</span>
                        <strong>
                            <span
                                class="state-chip"
                                [style.background]="getStatusBg(currentStatus)"
                                [style.color]="getStatusColor(currentStatus)"
                            >
                                {{ getStatusLabel(currentStatus) }}
                            </span>
                        </strong>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-row" *ngIf="selectedCustomer">
                        <span>Khách hàng</span>
                        <strong>{{ selectedCustomer.label }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="summary.hallName">
                        <span>Sảnh</span>
                        <strong>{{ summary.hallName }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="form.bookingDate">
                        <span>Ngày tổ chức</span>
                        <strong>{{ formatDateDisplay(form.bookingDate) }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="form.bookingTime">
                        <span>Ca</span>
                        <strong>{{ getShiftLabel(form.bookingTime) }}</strong>
                    </div>
                    <div class="summary-row">
                        <span>Số bàn / khách</span>
                        <strong>{{ form.expectedTables }} bàn / {{ form.expectedGuests }} khách</strong>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-row" *ngIf="summary.setMenuName">
                        <span>Set menu</span>
                        <strong>{{ summary.setMenuName }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="summary.packageName">
                        <span>Gói dịch vụ</span>
                        <strong>{{ summary.packageName }}</strong>
                    </div>
                    <div class="summary-row" *ngIf="summary.estimatedTotal > 0">
                        <span>Tổng ước tính</span>
                        <strong>{{ formatPrice(summary.estimatedTotal) }}</strong>
                    </div>
                    <div class="summary-divider"></div>
                    <div class="summary-row" *ngIf="form.salesId">
                        <span>Sales phụ trách</span>
                        <strong>{{ getSalesLabel(form.salesId) }}</strong>
                    </div>
                </div>
            </div>
        </div>
        </ng-container>

        <ng-template #detailLoading>
            <div class="loading-card">
                <i class="pi pi-spin pi-spinner"></i>
                <div style="font-weight:600; margin-bottom:0.35rem">Đang tải thông tin booking</div>
                <div style="font-size:0.86rem">Màn hình sẽ hiển thị khi dữ liệu chi tiết và các lựa chọn liên quan đã sẵn sàng.</div>
            </div>
        </ng-template>
    `,
})
export class BookingCreateComponent implements OnInit {
    bookingId: number | null = null;
    bookingCode = '';
    submitting = false;
    loading = false;
    stateSubmitting = false;
    statusSubmitting = false;
    today = new Date();
    loadedBookingState = 'DRAFT';
    currentStatus = 'ACTIVE';
    selectedBookingState = 'DRAFT';
    readonly loggedInUserId = Number(localStorage.getItem('userId')) || 0;
    readonly loggedInFullName = (localStorage.getItem('fullName') ?? '').trim();
    loggedInLocationId = Number(localStorage.getItem('locationId')) || 0;
    readonly codeRole = (localStorage.getItem('codeRole') ?? '').toUpperCase();
    readonly isSaleAccount = this.codeRole.includes('SALE');

    locationOptions: LocationOption[] = [];
    hallOptions: HallOption[] = [];
    setMenuOptions: SetMenuOption[] = [];
    packageOptions: ServicePackageOption[] = [];
    salesOptions: SalesOption[] = [];
    customerSuggestions: CustomerOption[] = [];
    selectedCustomer: CustomerOption | null = null;
    salesNameMap: Record<number, string> = {};
    saleRoleIds = new Set<number>();

    shiftOptions = [
        { label: 'Ca sáng (10:00 - 14:00)', value: 'SLOT_1' },
        { label: 'Ca chiều (17:00 - 21:00)', value: 'SLOT_2' },
        { label: 'Cả ngày (09:00 - 17:00)', value: 'SLOT_3' },
    ];

    bookingStateOptions = [
        { label: 'Nháp', value: 'DRAFT' },
        { label: 'Hết hạn', value: 'EXPIRED' },
        { label: 'Đã duyệt', value: 'APPROVED' },
        { label: 'Chưa duyệt', value: 'UNAPPROVED' },
        { label: 'Đã hủy', value: 'CANCELLED' },
        { label: 'Đã chuyển đổi', value: 'CONVERTED' },
    ];

    form = {
        customerId: null as number | null,
        locationId: null as number | null,
        hallId: null as number | null,
        bookingDate: null as Date | null,
        bookingTime: 'SLOT_1',
        expectedTables: 20,
        expectedGuests: 200,
        packageId: Number(localStorage.getItem('packageId')) || null,
        setMenuId: null as number | null,
        salesId: Number(localStorage.getItem('userId')) || null,
        reservedUntil: null as Date | null,
        notes: '',
        brideName: '',
        brideAge: null as number | null,
        groomName: '',
        groomAge: null as number | null,
        brideFatherName: '',
        brideMotherName: '',
        groomFatherName: '',
        groomMotherName: '',
    };

    summary = {
        hallName: '',
        setMenuName: '',
        setMenuPrice: 0,
        packageName: '',
        packagePrice: 0,
        estimatedTotal: 0,
    };

    get isEditMode(): boolean {
        return this.bookingId !== null;
    }

    get isSaleCreateMode(): boolean {
        return this.isSaleAccount && !this.isEditMode;
    }

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router,
        private bookingService: BookingService,
        private customerService: CustomerService,
        private hallService: HallService,
        private locationService: LocationService,
        private setMenuService: SetMenuService,
        private servicePackageService: ServicePackageService,
        private userService: UserService,
        private roleService: RoleService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (Number.isFinite(id) && id > 0) {
            this.bookingId = id;
        }

        this.loadLocations();
        this.loadCurrentUserContext();
        this.loadSalesOptions();

        if (this.bookingId) {
            this.loadBooking(this.bookingId);
        } else {
            this.applySaleCreateDefaults();
        }
    }

    loadLocations() {
        this.locationService.searchLocations({ page: 0, size: 100 }).subscribe({
            next: (res) => {
                this.locationOptions = (res.data?.content ?? []).map((location) => ({
                    id: Number(location.id),
                    label: location.name ?? `Chi nhánh #${location.id}`,
                }));

                this.applySaleCreateDefaults();
            },
            error: () => {
                this.locationOptions = [];
            },
        });
    }

    private loadCurrentUserContext() {
        if (!this.loggedInUserId) {
            return;
        }

        this.userService.getUser(this.loggedInUserId).subscribe({
            next: (res) => {
                const user = res.data;
                if (!user) {
                    return;
                }

                const locationId = Number(user.locationId);
                if (Number.isFinite(locationId) && locationId > 0) {
                    this.loggedInLocationId = locationId;
                }

                const fullName = user.fullName?.trim();
                if (fullName) {
                    this.salesNameMap[this.loggedInUserId] = fullName;
                }

                this.applySaleCreateDefaults();
                this.cdr.detectChanges();
            },
            error: () => {
                // Keep localStorage fallback values if user profile cannot be loaded.
            },
        });
    }

    private applySaleCreateDefaults() {
        if (!this.isSaleCreateMode) {
            return;
        }

        if (this.loggedInUserId > 0) {
            this.form.salesId = this.loggedInUserId;
        }

        if (this.loggedInLocationId > 0) {
            const needsReload = this.form.locationId !== this.loggedInLocationId || this.hallOptions.length === 0;
            this.form.locationId = this.loggedInLocationId;
            if (needsReload) {
                this.onLocationChange();
            }
        }
    }

    loadBooking(id: number) {
        this.loading = true;
        this.cdr.detectChanges();
        this.bookingService.getById(id).subscribe({
            next: (res) => {
                const booking = res.data;
                if (!booking) {
                    this.loading = false;
                    this.warn('Không tìm thấy booking');
                    this.goBack();
                    return;
                }

                this.patchFormFromBooking(booking);
                this.bookingCode = booking.bookingNo ?? '';
                this.currentStatus = booking.status ?? 'ACTIVE';
                this.loadedBookingState = booking.bookingState ?? 'DRAFT';
                this.selectedBookingState = booking.bookingState ?? 'DRAFT';

                const requests: Observable<void>[] = [];

                if (booking.customerId) {
                    requests.push(this.loadCustomerById(Number(booking.customerId)));
                }

                if (booking.hallId) {
                    requests.push(this.loadHallContext(Number(booking.hallId), booking.setMenuId ?? null, booking.packageId ?? null));
                }

                if (requests.length === 0) {
                    this.recalcEstimatedTotal();
                    this.loading = false;
                    this.cdr.detectChanges();
                    return;
                }

                forkJoin(requests).subscribe({
                    next: () => {
                        this.recalcEstimatedTotal();
                        this.loading = false;
                        this.cdr.detectChanges();
                    },
                    error: () => {
                        this.recalcEstimatedTotal();
                        this.loading = false;
                        this.cdr.detectChanges();
                    },
                });
            },
            error: (err) => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: err?.error?.message ?? 'Không thể tải chi tiết booking',
                    life: 4000,
                });
                this.goBack();
            },
        });
    }

    private patchFormFromBooking(booking: Booking) {
        this.form.customerId = this.toNumberOrNull(booking.customerId);
        this.form.hallId = this.toNumberOrNull(booking.hallId);
        this.form.bookingDate = booking.bookingDate ? this.parseDate(booking.bookingDate) : null;
        this.form.bookingTime = booking.bookingTime ?? 'SLOT_1';
        this.form.expectedTables = this.toNumberOrDefault(booking.expectedTables ?? booking.tableCount, 20);
        this.form.expectedGuests = this.toNumberOrDefault(booking.expectedGuests ?? booking.guestCount, 200);
        this.form.packageId = this.toNumberOrNull(booking.packageId);
        this.form.setMenuId = this.toNumberOrNull(booking.setMenuId);
        this.form.salesId = this.toNumberOrNull(booking.salesId) ?? this.form.salesId;
        if (this.form.salesId) {
            this.ensureSalesName(this.form.salesId);
        }
        this.form.reservedUntil = booking.reservedUntil ? new Date(booking.reservedUntil) : null;
        this.form.notes = booking.notes ?? '';
        this.form.brideName = booking.brideName ?? '';
        this.form.brideAge = this.toNumberOrNull(booking.brideAge);
        this.form.groomName = booking.groomName ?? '';
        this.form.groomAge = this.toNumberOrNull(booking.groomAge);
        this.form.brideFatherName = booking.brideFatherName ?? '';
        this.form.brideMotherName = booking.brideMotherName ?? '';
        this.form.groomFatherName = booking.groomFatherName ?? '';
        this.form.groomMotherName = booking.groomMotherName ?? '';
    }

    private loadSalesOptions() {
        this.roleService.searchRoles({ page: 0, size: 100, sort: 'updatedAt,DESC' }).subscribe({
            next: (res) => {
                const roles = res.data?.content ?? [];
                this.saleRoleIds = new Set(
                    roles
                        .filter((role: any) => this.isSaleRole(role))
                        .map((role: any) => Number(role.id))
                        .filter((id: number) => Number.isFinite(id) && id > 0)
                );
                this.fetchSalesUsers();
            },
            error: () => {
                this.saleRoleIds.clear();
                this.fetchSalesUsers();
            },
        });
    }

    private fetchSalesUsers() {
        this.userService.searchUsers({ page: 0, size: 200, sort: 'fullName,ASC' }).subscribe({
            next: (res) => {
                const users = res.data?.content ?? [];
                const salesUsers = users.filter((user: any) => this.isSaleUser(user));

                if (this.isSaleCreateMode && this.loggedInUserId > 0) {
                    const currentSalesUser = salesUsers.find((user: any) => Number(user.id) === this.loggedInUserId);
                    const fullName = currentSalesUser?.fullName?.trim()
                        || this.salesNameMap[this.loggedInUserId]
                        || `Sales #${this.loggedInUserId}`;

                    this.salesNameMap[this.loggedInUserId] = fullName;
                    this.salesOptions = [{ id: this.loggedInUserId, label: fullName }];
                    this.form.salesId = this.loggedInUserId;
                    this.cdr.detectChanges();
                    return;
                }

                this.salesOptions = salesUsers.map((user: any) => {
                    const id = Number(user.id);
                    const label = user.fullName ?? `Sales #${id}`;
                    this.salesNameMap[id] = label;
                    return { id, label };
                });

                if (this.form.salesId && !this.salesOptions.some((item) => item.id === Number(this.form.salesId))) {
                    this.form.salesId = null;
                }

                if (this.form.salesId) {
                    this.ensureSalesName(this.form.salesId);
                }
                this.cdr.detectChanges();
            },
            error: () => {
                this.salesOptions = [];
                this.cdr.detectChanges();
            },
        });
    }

    private ensureSalesName(salesId: number) {
        const id = Number(salesId);
        if (!Number.isFinite(id) || id <= 0 || this.salesNameMap[id]) {
            return;
        }

        this.userService.getUser(id).subscribe({
            next: (res) => {
                const fullName = res.data?.fullName?.trim() || `Sales #${id}`;
                this.salesNameMap[id] = fullName;

                if (this.isSaleUser(res.data) && !this.salesOptions.some((item) => item.id === id)) {
                    this.salesOptions = [{ id, label: fullName }, ...this.salesOptions];
                }
                this.cdr.detectChanges();
            },
            error: () => {
                this.salesNameMap[id] = `Sales #${id}`;
                this.cdr.detectChanges();
            },
        });
    }

    getSalesLabel(salesId?: number | null): string {
        const id = Number(salesId);
        if (!Number.isFinite(id) || id <= 0) {
            return '-';
        }
        if (id === this.loggedInUserId && this.loggedInFullName) {
            return this.salesNameMap[id] ?? this.loggedInFullName;
        }
        return this.salesNameMap[id] ?? `Sales #${id}`;
    }

    private isSaleUser(user: any): boolean {
        const roleId = Number(user?.roleId ?? user?.role?.id);
        if (Number.isFinite(roleId) && roleId > 0 && this.saleRoleIds.has(roleId)) {
            return true;
        }

        const roleCandidates = [
            user?.role,
            user?.roleCode,
            user?.codeRole,
            user?.roleName,
            user?.role?.code,
            user?.role?.name,
        ]
            .filter((value) => value != null)
            .map((value) => String(value).toUpperCase());

        return roleCandidates.some((value) => value.includes('SALE'));
    }

    private isSaleRole(role: any): boolean {
        const code = String(role?.code ?? '').toUpperCase();
        const name = String(role?.name ?? '').toUpperCase();
        return code.includes('SALE') || name === 'SALE' || name.includes('SALE');
    }

    private loadCustomerById(customerId: number): Observable<void> {
        return this.customerService.getCustomerById(customerId).pipe(
            tap((res) => {
                const customer = res.data;
                this.selectedCustomer = customer ? {
                    id: Number(customer.id),
                    label: customer.fullName ?? `Khách hàng #${customer.id}`,
                    phone: customer.phone ?? '',
                } : null;
                this.cdr.detectChanges();
            }),
            mapTo(void 0),
            catchError(() => {
                this.selectedCustomer = {
                    id: customerId,
                    label: `Khách hàng #${customerId}`,
                    phone: '',
                };
                this.cdr.detectChanges();
                return of(void 0);
            })
        );
    }

    private loadHallContext(hallId: number, setMenuId: number | null, packageId: number | null): Observable<void> {
        return this.hallService.getHallById(hallId).pipe(
            tap((res) => {
                const hall = res.data;
                this.form.locationId = hall?.locationId ?? null;
                this.summary.hallName = hall?.name ?? `Sảnh #${hallId}`;
                this.cdr.detectChanges();
            }),
            switchMap(() => {
                if (!this.form.locationId) {
                    return of(void 0);
                }

                return forkJoin([
                    this.loadHalls(this.form.locationId, hallId),
                    this.loadSetMenus(this.form.locationId, setMenuId),
                    this.loadPackages(this.form.locationId, packageId),
                ]).pipe(mapTo(void 0));
            }),
            catchError(() => {
                this.summary.hallName = `Sảnh #${hallId}`;
                this.cdr.detectChanges();
                return of(void 0);
            })
        );
    }

    onLocationChange() {
        if (this.isSaleCreateMode && this.loggedInLocationId > 0 && this.form.locationId !== this.loggedInLocationId) {
            this.form.locationId = this.loggedInLocationId;
        }

        const locationId = this.form.locationId;
        this.form.hallId = null;
        this.form.setMenuId = null;
        this.form.packageId = null;
        this.summary.hallName = '';
        this.summary.setMenuName = '';
        this.summary.setMenuPrice = 0;
        this.summary.packageName = '';
        this.summary.packagePrice = 0;
        this.hallOptions = [];
        this.setMenuOptions = [];
        this.packageOptions = [];

        if (!locationId) {
            this.recalcEstimatedTotal();
            return;
        }

        this.loadHalls(locationId).subscribe(() => this.cdr.detectChanges());
    }

    private loadHalls(locationId: number, selectedHallId?: number): Observable<void> {
        return this.hallService.searchHalls({ locationId, page: 0, size: 100 }).pipe(
            tap((res) => {
                this.hallOptions = (res.data?.content ?? []).map((hall) => ({
                    id: Number(hall.id),
                    label: hall.name ?? `Sảnh #${hall.id}`,
                }));

                if (selectedHallId) {
                    this.form.hallId = selectedHallId;
                    this.syncHallSummary();
                }
                this.cdr.detectChanges();
            }),
            mapTo(void 0),
            catchError(() => {
                this.hallOptions = [];
                this.cdr.detectChanges();
                return of(void 0);
            })
        );
    }

    private loadSetMenus(locationId: number, selectedSetMenuId?: number | null): Observable<void> {
        return this.setMenuService.searchSetMenus({ locationId, page: 0, size: 100 }).pipe(
            switchMap((res) => {
                const locationMenus = (res.data?.content ?? []).map((menu) => ({
                    id: Number(menu.id),
                    label: menu.name ?? `Set menu #${menu.id}`,
                    price: menu.setPrice ?? 0,
                }));

                // Keep branch-based behavior; fallback to hall endpoint if branch query is empty.
                if (locationMenus.length > 0 || !this.form.hallId) {
                    return of(locationMenus);
                }

                return this.http.get<any>('http://localhost:8080/api/v1/set-menu', {
                    params: new HttpParams().set('hallId', this.form.hallId)
                }).pipe(
                    map((hallRes) => (hallRes.data ?? []).map((menu: any) => ({
                        id: Number(menu.id),
                        label: menu.name ?? `Set menu #${menu.id}`,
                        price: menu.pricePerTable ?? menu.setPrice ?? menu.price ?? 0,
                    })))
                );
            }),
            tap((menus) => {
                this.setMenuOptions = menus;

                if (selectedSetMenuId && this.setMenuOptions.some((menu) => menu.id === selectedSetMenuId)) {
                    this.form.setMenuId = selectedSetMenuId;
                } else if (selectedSetMenuId) {
                    this.form.setMenuId = null;
                }

                this.syncSetMenuSummary();
                this.cdr.detectChanges();
            }),
            mapTo(void 0),
            catchError(() => {
                this.setMenuOptions = [];
                this.form.setMenuId = null;
                this.syncSetMenuSummary();
                this.cdr.detectChanges();
                return of(void 0);
            })
        );
    }

    private loadPackages(locationId: number, selectedPackageId?: number | null): Observable<void> {
        return this.servicePackageService.searchServicePackages({ locationId, page: 0, size: 100 }).pipe(
            tap((res) => {
                const scopedPackages = (res.data?.content ?? []).filter((item: any) => {
                    const packageLocationId = Number(
                        item.locationId ?? item.branchId ?? item.locationResponse?.id ?? item.location?.id
                    );
                    return packageLocationId === Number(locationId);
                });

                this.packageOptions = scopedPackages.map((item) => ({
                    id: Number(item.id),
                    label: item.name ?? `Gói dịch vụ #${item.id}`,
                    price: item.basePrice ?? 0,
                }));

                if (selectedPackageId && this.packageOptions.some((pkg) => pkg.id === selectedPackageId)) {
                    this.form.packageId = selectedPackageId;
                } else if (selectedPackageId) {
                    this.form.packageId = null;
                }
                this.syncPackageSummary();
                this.cdr.detectChanges();
            }),
            mapTo(void 0),
            catchError(() => {
                this.packageOptions = [];
                this.syncPackageSummary();
                this.cdr.detectChanges();
                return of(void 0);
            })
        );
    }

    onHallChange() {
        this.syncHallSummary();

        this.form.setMenuId = null;
        this.form.packageId = null;
        this.summary.setMenuName = '';
        this.summary.setMenuPrice = 0;
        this.summary.packageName = '';
        this.summary.packagePrice = 0;
        this.setMenuOptions = [];
        this.packageOptions = [];

        if (!this.form.hallId || !this.form.locationId) {
            this.recalcEstimatedTotal();
            return;
        }

        forkJoin([
            this.loadSetMenus(this.form.locationId),
            this.loadPackages(this.form.locationId),
        ]).subscribe(() => this.cdr.detectChanges());
    }

    private syncHallSummary() {
        const selectedHall = this.hallOptions.find((hall) => hall.id === this.form.hallId);
        this.summary.hallName = selectedHall?.label ?? (this.form.hallId ? `Sảnh #${this.form.hallId}` : '');
    }

    searchCustomer(event: { query?: string }) {
        const query = (event.query ?? '').trim();

        if (!query) {
            this.customerSuggestions = [];
            return;
        }

        const params = { phone: query, page: 0, size: 10 };

        this.customerService.searchCustomers(params).subscribe({
            next: (res) => {
                this.customerSuggestions = (res.data?.content ?? []).map((customer) => ({
                    id: Number(customer.id),
                    label: customer.fullName ?? `Khách hàng #${customer.id}`,
                    phone: customer.phone ?? '',
                }));
            },
            error: () => {
                this.customerSuggestions = [];
            },
        });
    }

    onCustomerSelect(event: AutoCompleteSelectEvent) {
        const customer = event.value as CustomerOption;
        this.form.customerId = customer.id;
    }

    selectSetMenu(menu: SetMenuOption) {
        this.form.setMenuId = menu.id;
        this.syncSetMenuSummary();
    }

    selectPackage(pkg: ServicePackageOption) {
        this.form.packageId = pkg.id;
        this.syncPackageSummary();
    }

    syncSetMenuSummary() {
        const selectedMenu = this.setMenuOptions.find((menu) => menu.id === this.form.setMenuId);
        this.summary.setMenuName = selectedMenu?.label ?? '';
        this.summary.setMenuPrice = selectedMenu?.price ?? 0;
        this.recalcEstimatedTotal();
    }

    syncPackageSummary() {
        const selectedPackage = this.packageOptions.find((item) => item.id === this.form.packageId);
        this.summary.packageName = selectedPackage?.label ?? '';
        this.summary.packagePrice = selectedPackage?.price ?? 0;
        this.recalcEstimatedTotal();
    }

    onBookingDateChange() {
        if (this.form.bookingDate && !this.form.reservedUntil) {
            const reservedUntil = new Date(this.form.bookingDate);
            reservedUntil.setHours(23, 59, 0, 0);
            this.form.reservedUntil = reservedUntil;
        }
    }

    recalcEstimatedTotal() {
        this.summary.estimatedTotal = (this.summary.setMenuPrice * this.form.expectedTables) + this.summary.packagePrice;
    }

    submit() {
        if (!this.validateForm()) {
            return;
        }

        const payload = this.buildPayload();
        this.submitting = true;

        const request$ = this.isEditMode && this.bookingId
            ? this.bookingService.update(this.bookingId, payload)
            : this.bookingService.create(payload);

        request$.subscribe({
            next: (res) => {
                const booking = res.data;
                this.submitting = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: this.isEditMode ? 'Đã cập nhật booking' : 'Đã tạo booking',
                    life: 3000,
                });

                if (!this.isEditMode && booking?.id) {
                    setTimeout(() => this.router.navigate(['/pages/booking', booking.id]), 800);
                } else if (booking) {
                    this.patchFormFromBooking(booking);
                    this.bookingCode = booking.bookingNo ?? this.bookingCode;
                    this.currentStatus = booking.status ?? this.currentStatus;
                    this.loadedBookingState = booking.bookingState ?? this.loadedBookingState;
                    this.selectedBookingState = booking.bookingState ?? this.selectedBookingState;
                }
            },
            error: (err) => {
                this.submitting = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: err?.error?.message ?? 'Không thể lưu booking',
                    life: 4000,
                });
            },
        });
    }

    saveBookingState() {
        if (!this.bookingId) {
            return;
        }

        this.stateSubmitting = true;
        this.bookingService.updateState({
            bookingId: this.bookingId,
            bookingState: this.selectedBookingState,
        }).subscribe({
            next: (res) => {
                this.stateSubmitting = false;
                this.loadedBookingState = res.data?.bookingState ?? this.selectedBookingState;
                this.selectedBookingState = this.loadedBookingState;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Đã cập nhật trạng thái xử lý',
                    life: 3000,
                });
            },
            error: (err) => {
                this.stateSubmitting = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: err?.error?.message ?? 'Không thể cập nhật trạng thái xử lý',
                    life: 4000,
                });
            },
        });
    }

    toggleStatus() {
        if (!this.bookingId) {
            return;
        }

        this.statusSubmitting = true;
        this.bookingService.changeStatus(this.bookingId).subscribe({
            next: (res) => {
                this.statusSubmitting = false;
                this.currentStatus = res.data?.status ?? this.currentStatus;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Thành công',
                    detail: 'Đã đổi trạng thái kích hoạt',
                    life: 3000,
                });
            },
            error: (err) => {
                this.statusSubmitting = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: err?.error?.message ?? 'Không thể đổi trạng thái kích hoạt',
                    life: 4000,
                });
            },
        });
    }

    private validateForm(): boolean {
        if (!this.form.customerId) {
            this.warn('Vui lòng chọn khách hàng');
            return false;
        }
        if (!this.form.groomName || !this.form.brideName) {
            this.warn('Vui lòng nhập tên cô dâu và chú rể');
            return false;
        }
        if (!this.form.hallId) {
            this.warn('Vui lòng chọn sảnh cưới');
            return false;
        }
        if (!this.form.bookingDate) {
            this.warn('Vui lòng chọn ngày tổ chức');
            return false;
        }
        if (this.form.groomAge != null && (this.form.groomAge < 18 || this.form.groomAge > 100)) {
            this.warn('Tuổi của cô dâu/chú rể không hợp lệ, bạn vui lòng kiểm tra lại');
            return false;
        }
        if (this.form.brideAge != null && (this.form.brideAge < 18 || this.form.brideAge > 100)) {
            this.warn('Tuổi của cô dâu/chú rể không hợp lệ, bạn vui lòng kiểm tra lại');
            return false;
        }
        if (this.form.setMenuId != null && !this.setMenuOptions.some((menu) => menu.id === this.form.setMenuId)) {
            this.warn('Set menu đã chọn không hợp lệ với chi nhánh hiện tại');
            return false;
        }
        if (!this.form.expectedTables || !this.form.expectedGuests) {
            this.warn('Vui lòng nhập số bàn và số khách dự kiến');
            return false;
        }
        return true;
    }

    private buildPayload(): BookingUpsertPayload {
        const enforcedSalesId = this.isSaleCreateMode && this.loggedInUserId > 0
            ? this.loggedInUserId
            : this.form.salesId;

        return {
            customerId: this.form.customerId!,
            hallId: this.form.hallId!,
            bookingDate: this.toISODate(this.form.bookingDate)!,
            bookingTime: this.form.bookingTime,
            expectedTables: this.form.expectedTables,
            expectedGuests: this.form.expectedGuests,
            packageId: this.form.packageId,
            setMenuId: this.form.setMenuId,
            salesId: enforcedSalesId,
            reservedUntil: this.toISOString(this.form.reservedUntil),
            notes: this.form.notes?.trim() || undefined,
            brideName: this.form.brideName.trim(),
            brideAge: this.form.brideAge,
            groomName: this.form.groomName.trim(),
            groomAge: this.form.groomAge,
            brideFatherName: this.form.brideFatherName?.trim() || undefined,
            brideMotherName: this.form.brideMotherName?.trim() || undefined,
            groomFatherName: this.form.groomFatherName?.trim() || undefined,
            groomMotherName: this.form.groomMotherName?.trim() || undefined,
        };
    }

    goBack() {
        this.router.navigate(['/pages/booking']);
    }

    private warn(detail: string) {
        this.messageService.add({ severity: 'warn', summary: 'Thiếu thông tin', detail, life: 3000 });
    }

    private parseDate(value: string): Date {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    private toISODate(date: Date | null): string | undefined {
        if (!date) {
            return undefined;
        }

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    private toISOString(date: Date | null): string | null {
        return date ? date.toISOString() : null;
    }

    private toNumberOrNull(value: unknown): number | null {
        if (value === null || value === undefined || value === '') {
            return null;
        }

        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    private toNumberOrDefault(value: unknown, fallback: number): number {
        const parsed = this.toNumberOrNull(value);
        return parsed ?? fallback;
    }

    formatPrice(value?: number): string {
        if (value == null) {
            return '0 đ';
        }
        return `${new Intl.NumberFormat('vi-VN').format(value)} đ`;
    }

    formatDateDisplay(date: Date | null): string {
        return date ? date.toLocaleDateString('vi-VN') : '-';
    }

    formatDateTimeDisplay(date: Date | null): string {
        return date ? date.toLocaleString('vi-VN') : '-';
    }

    getShiftLabel(value?: string): string {
        const labels: Record<string, string> = {
            SLOT_1: 'Ca sáng (10:00 - 14:00)',
            SLOT_2: 'Ca chiều (17:00 - 21:00)',
            SLOT_3: 'Cả ngày (09:00 - 17:00)',
            AFTERNOON: 'Ca sáng (10:00 - 14:00)',
            EVENING: 'Ca chiều (17:00 - 21:00)',
            FULL_DAY: 'Cả ngày (09:00 - 17:00)',
        };
        return labels[value ?? ''] ?? value ?? '-';
    }

    getBookingStateLabel(value?: string): string {
        const labels: Record<string, string> = {
            DRAFT: 'Nháp',
            EXPIRED: 'Hết hạn',
            APPROVED: 'Đã duyệt',
            UNAPPROVED: 'Chưa duyệt',
            CANCELLED: 'Đã hủy',
            CONVERTED: 'Đã chuyển đổi',
        };
        return labels[value ?? ''] ?? value ?? '-';
    }

    getStatusLabel(value?: string): string {
        const normalized = this.normalizeStatusValue(value);
        const labels: Record<string, string> = {
            ACTIVE: 'Đang hoạt động',
            INACTIVE: 'Ngưng hoạt động',
        };
        return labels[normalized] ?? value ?? '-';
    }

    getStatusColor(value?: string): string {
        const normalized = this.normalizeStatusValue(value);
        const colors: Record<string, string> = {
            ACTIVE: '#166534',
            INACTIVE: '#991b1b',
        };
        return colors[normalized] ?? '#475569';
    }

    getStatusBg(value?: string): string {
        const normalized = this.normalizeStatusValue(value);
        const colors: Record<string, string> = {
            ACTIVE: '#dcfce7',
            INACTIVE: '#fee2e2',
        };
        return colors[normalized] ?? '#e2e8f0';
    }

    private normalizeStatusValue(value?: string): string {
        const raw = (value ?? '').trim();
        if (!raw) return '';
        const normalized = raw.toUpperCase();
        if (normalized === 'ACTIVE' || normalized === 'INACTIVE') {
            return normalized;
        }
        if (raw.toLowerCase() === 'active' || raw === '1' || raw.toLowerCase() === 'true') {
            return 'ACTIVE';
        }
        if (raw.toLowerCase() === 'inactive' || raw === '0' || raw.toLowerCase() === 'false') {
            return 'INACTIVE';
        }
        return normalized;
    }
}