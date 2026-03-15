import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AutoCompleteModule, AutoCompleteSelectEvent } from 'primeng/autocomplete';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BookingService } from '../service/booking.service';

const BASE = 'http://localhost:8080/api/v1';

interface CustomerOption { id: number; label: string; phone: string; }
interface HallOption     { id: number; label: string; }
interface LocationOption { id: number; label: string; }
interface SetMenuOption  { id: number; label: string; price: number; }
interface ServiceOption  { id: number; label: string; price: number; selected: boolean; quantity: number; }

@Component({
    selector: 'app-booking-create',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        ButtonModule, InputTextModule, SelectModule,
        AutoCompleteModule, DatePickerModule, TextareaModule,
        InputNumberModule, ToastModule, DividerModule,
    ],
    providers: [MessageService, BookingService],
    styles: [`
        .section-card {
            background: #fff;
            border-radius: 12px;
            padding: 1.5rem;
            margin-bottom: 1.25rem;
            box-shadow: 0 1px 4px rgba(0,0,0,0.07);
        }
        .section-title {
            font-weight: 600;
            font-size: 0.95rem;
            color: #1e293b;
            margin-bottom: 1rem;
        }
        .field-label {
            font-size: 0.82rem;
            font-weight: 500;
            color: #475569;
            margin-bottom: 0.35rem;
            display: block;
        }
        .field-label .req { color: #ef4444; }
        .field-wrap { margin-bottom: 1rem; }
        .field-wrap:last-child { margin-bottom: 0; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }

        /* Set menu card */
        .menu-card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 0.85rem 1rem;
            cursor: pointer;
            transition: all 0.15s;
        }
        .menu-card:hover { border-color: #94a3b8; }
        .menu-card.selected {
            border: 2px solid #10b981;
            background: #f0fdf4;
        }
        .menu-card .menu-name { font-weight: 600; color: #1e293b; font-size: 0.9rem; }
        .menu-card .menu-price { color: #10b981; font-weight: 700; font-size: 0.85rem; margin-top: 0.2rem; }

        /* Service row */
        .svc-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0.75rem 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 0.5rem;
        }
        .svc-row:last-child { margin-bottom: 0; }

        /* Empty state */
        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            color: #94a3b8;
            gap: 0.5rem;
        }
        .empty-state i { font-size: 1.75rem; }
        .empty-state span { font-size: 0.82rem; }

        /* Summary */
        .summary-card {
            background: #fff;
            border-radius: 12px;
            padding: 1.25rem;
            box-shadow: 0 1px 4px rgba(0,0,0,0.07);
            position: sticky;
            top: 1rem;
        }
        .summary-title { font-weight: 600; font-size: 0.95rem; color: #1e293b; margin-bottom: 1rem; }
        .summary-row {
            display: flex;
            justify-content: space-between;
            font-size: 0.85rem;
            margin-bottom: 0.5rem;
            color: #475569;
        }
        .summary-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 0.75rem;
            padding-top: 0.75rem;
            border-top: 1px solid #e2e8f0;
        }
        .total-label { font-weight: 600; color: #1e293b; }
        .total-value { font-weight: 700; font-size: 1.1rem; color: #2563eb; }

        /* Page header */
        .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
        }
        .page-header-left { display: flex; align-items: center; gap: 0.75rem; }
        .page-header h1 { font-size: 1.25rem; font-weight: 700; color: #1e293b; margin: 0; }
        .page-header p  { font-size: 0.82rem; color: #64748b; margin: 0.15rem 0 0; }

        /* Layout */
        .create-layout {
            display: grid;
            grid-template-columns: 1fr 280px;
            gap: 1.5rem;
            align-items: start;
        }
        @media (max-width: 960px) {
            .create-layout { grid-template-columns: 1fr; }
            .two-col, .three-col { grid-template-columns: 1fr; }
        }
    `],
    template: `
    <p-toast />

    <!-- Header -->
    <div class="page-header">
        <div class="page-header-left">
            <p-button icon="pi pi-arrow-left" [text]="true" severity="secondary" (onClick)="goBack()" />
            <div>
                <h1>Đặt tiệc mới</h1>
                <p>Chọn khách hàng, sảnh, dịch vụ và set menu</p>
            </div>
        </div>
        <p-button
            label="Tạo đơn đặt tiệc"
            icon="pi pi-save"
            [style]="{'background':'#10b981','border-color':'#10b981'}"
            [loading]="submitting"
            (onClick)="submit()"
        />
    </div>

    <div class="create-layout">
        <!-- LEFT -->
        <div>

            <!-- 1. Chọn khách hàng -->
            <div class="section-card">
                <div class="section-title">Chọn khách hàng</div>
                <div class="field-wrap">
                    <label class="field-label">Khách hàng <span class="req">*</span></label>
                    <p-autoComplete
                        [(ngModel)]="selectedCustomer"
                        [suggestions]="customerSuggestions"
                        (completeMethod)="searchCustomer($event)"
                        (onSelect)="onCustomerSelect($event)"
                        optionLabel="label"
                        placeholder="Tìm theo tên hoặc SĐT..."
                        [style]="{'width':'100%'}"
                        [inputStyle]="{'width':'100%'}"
                        [forceSelection]="true"
                    >
                        <ng-template let-c pTemplate="item">
                            <div>
                                <div style="font-weight:600">{{ c.label }}</div>
                                <div style="font-size:0.78rem;color:#64748b">{{ c.phone }}</div>
                            </div>
                        </ng-template>
                    </p-autoComplete>
                </div>
            </div>

            <!-- 2. Thông tin cô dâu chú rể -->
            <div class="section-card">
                <div class="section-title">Thông tin cô dâu chú rể</div>
                <div class="two-col">
                    <div class="field-wrap">
                        <label class="field-label">Họ tên chú rể <span class="req">*</span></label>
                        <input pInputText [(ngModel)]="form.groomName"
                            placeholder="Nguyễn Văn A" style="width:100%" />
                    </div>
                    <div class="field-wrap">
                        <label class="field-label">Họ tên cô dâu <span class="req">*</span></label>
                        <input pInputText [(ngModel)]="form.brideName"
                            placeholder="Trần Thị B" style="width:100%" />
                    </div>
                    <div class="field-wrap" style="margin-bottom:0">
                        <label class="field-label">Ngày sinh chú rể</label>
                        <p-datepicker [(ngModel)]="form.groomDob"
                            dateFormat="dd/mm/yy" [showIcon]="true"
                            placeholder="dd/mm/yyyy" styleClass="w-full" />
                    </div>
                    <div class="field-wrap" style="margin-bottom:0">
                        <label class="field-label">Ngày sinh cô dâu</label>
                        <p-datepicker [(ngModel)]="form.brideDob"
                            dateFormat="dd/mm/yy" [showIcon]="true"
                            placeholder="dd/mm/yyyy" styleClass="w-full" />
                    </div>
                </div>
            </div>

            <!-- 3. Thông tin tiệc cưới -->
            <div class="section-card">
                <div class="section-title">Thông tin tiệc cưới</div>

                <!-- Chi nhánh -->
                <div class="field-wrap">
                    <label class="field-label">Chi nhánh</label>
                    <p-select
                        [options]="locationOptions"
                        [(ngModel)]="form.locationId"
                        optionLabel="label" optionValue="id"
                        placeholder="Chọn chi nhánh"
                        [showClear]="true"
                        (onChange)="onLocationChange()"
                        styleClass="w-full"
                    />
                </div>

                <!-- Sảnh + Ca -->
                <div class="two-col">
                    <div class="field-wrap" style="margin-bottom:0">
                        <label class="field-label">Sảnh cưới <span class="req">*</span></label>
                        <p-select
                            [options]="hallOptions"
                            [(ngModel)]="form.hallId"
                            optionLabel="label" optionValue="id"
                            placeholder="Chọn sảnh"
                            [showClear]="true"
                            (onChange)="onHallChange()"
                            styleClass="w-full"
                        />
                    </div>
                    <div class="field-wrap" style="margin-bottom:0">
                        <label class="field-label">Ca tổ chức <span class="req">*</span></label>
                        <p-select
                            [options]="shiftOptions"
                            [(ngModel)]="form.bookingTime"
                            optionLabel="label" optionValue="value"
                            styleClass="w-full"
                        />
                    </div>
                </div>

                <!-- Ngày tổ chức (full width, below sảnh+ca) -->
                <div class="field-wrap" style="margin-top:1rem">
                    <label class="field-label">Ngày tổ chức <span class="req">*</span></label>
                    <p-datepicker
                        [(ngModel)]="form.eventDate"
                        dateFormat="dd/mm/yy"
                        [showIcon]="true"
                        placeholder="Chọn ngày"
                        styleClass="w-full"
                        [minDate]="today"
                    />
                </div>

                <!-- Số bàn + Số khách -->
                <div class="two-col">
                    <div class="field-wrap" style="margin-bottom:0">
                        <label class="field-label">Số bàn <span class="req">*</span></label>
                        <p-inputnumber
                            [(ngModel)]="form.tableCount"
                            [min]="1" [max]="500"
                            (ngModelChange)="recalcTotal()"
                            styleClass="w-full" inputStyleClass="w-full" />
                    </div>
                    <div class="field-wrap" style="margin-bottom:0">
                        <label class="field-label">Số khách dự kiến</label>
                        <p-inputnumber
                            [(ngModel)]="form.guestCount"
                            [min]="1"
                            styleClass="w-full" inputStyleClass="w-full" />
                    </div>
                </div>
            </div>

            <!-- 4. Chọn set menu -->
            <div class="section-card">
                <div class="section-title">
                    <i class="pi pi-fw pi-star-fill" style="color:#f59e0b;margin-right:0.4rem"></i>
                    Chọn set menu
                </div>

                <div *ngIf="setMenuOptions.length === 0" class="empty-state">
                    <i class="pi pi-times-circle"></i>
                    <span>Chọn sảnh cưới để xem danh sách set menu</span>
                </div>

                <div *ngIf="setMenuOptions.length > 0" class="two-col">
                    <div *ngFor="let m of setMenuOptions"
                        class="menu-card"
                        [class.selected]="form.setMenuId === m.id"
                        (click)="selectSetMenu(m)"
                    >
                        <div class="menu-name">{{ m.label }}</div>
                        <div class="menu-price">{{ formatPrice(m.price) }}/bàn</div>
                    </div>
                </div>
            </div>

            <!-- 5. Chọn dịch vụ -->
            <div class="section-card">
                <div class="section-title">
                    <i class="pi pi-bell" style="color:#6366f1;margin-right:0.4rem"></i>
                    Chọn dịch vụ
                </div>

                <div *ngIf="serviceOptions.length === 0" class="empty-state">
                    <i class="pi pi-bell"></i>
                    <span>Chọn sảnh cưới để xem danh sách dịch vụ</span>
                </div>

                <div *ngIf="serviceOptions.length > 0">
                    <div *ngFor="let svc of serviceOptions" class="svc-row">
                        <div style="display:flex;align-items:center;gap:0.75rem">
                            <input type="checkbox" [(ngModel)]="svc.selected"
                                (change)="recalcTotal()"
                                style="width:16px;height:16px;cursor:pointer" />
                            <div>
                                <div style="font-weight:500;color:#1e293b;font-size:0.88rem">{{ svc.label }}</div>
                                <div style="font-size:0.78rem;color:#64748b">{{ formatPrice(svc.price) }}</div>
                            </div>
                        </div>
                        <p-inputnumber *ngIf="svc.selected"
                            [(ngModel)]="svc.quantity"
                            [min]="1" [max]="99"
                            (ngModelChange)="recalcTotal()"
                            [showButtons]="true"
                            buttonLayout="horizontal"
                            decrementButtonIcon="pi pi-minus"
                            incrementButtonIcon="pi pi-plus"
                            [style]="{'width':'110px'}"
                            inputStyleClass="text-center"
                        />
                    </div>
                </div>
            </div>

            <!-- 6. Ghi chú -->
            <div class="section-card">
                <div class="section-title">Ghi chú</div>
                <textarea pTextarea [(ngModel)]="form.notes"
                    placeholder="Nhập ghi chú cho đơn đặt tiệc..."
                    [rows]="4" style="width:100%;resize:vertical">
                </textarea>
            </div>

        </div>

        <!-- RIGHT: Tóm tắt -->
        <div>
            <div class="summary-card">
                <div class="summary-title">Tóm tắt đơn đặt tiệc</div>

                <div *ngIf="!summary.hallName && !form.eventDate && !form.tableCount"
                    style="color:#94a3b8;font-size:0.82rem;text-align:center;padding:1rem 0">
                    Chưa có thông tin
                </div>

                <div *ngIf="summary.hallName" class="summary-row">
                    <span style="color:#94a3b8">Sảnh</span>
                    <span style="color:#1e293b;font-weight:500">{{ summary.hallName }}</span>
                </div>
                <div *ngIf="form.eventDate" class="summary-row">
                    <span style="color:#94a3b8">Ngày</span>
                    <span style="color:#1e293b">{{ formatDateDisplay(form.eventDate) }}</span>
                </div>
                <div *ngIf="form.bookingTime" class="summary-row">
                    <span style="color:#94a3b8">Ca</span>
                    <span style="color:#1e293b">{{ getShiftLabel(form.bookingTime) }}</span>
                </div>
                <div *ngIf="form.tableCount" class="summary-row">
                    <span style="color:#94a3b8">Số bàn</span>
                    <span style="color:#1e293b">{{ form.tableCount }} bàn</span>
                </div>

                <ng-container *ngIf="summary.setMenuName">
                    <div style="border-top:1px solid #f1f5f9;margin:0.5rem 0"></div>
                    <div class="summary-row">
                        <span style="color:#94a3b8">Set menu</span>
                        <span style="color:#1e293b;font-weight:500">{{ summary.setMenuName }}</span>
                    </div>
                    <div class="summary-row">
                        <span style="color:#94a3b8">{{ formatPrice(summary.setMenuPrice) }} × {{ form.tableCount }}</span>
                        <span style="color:#1e293b">{{ formatPrice(summary.setMenuPrice * (form.tableCount ?? 0)) }}</span>
                    </div>
                </ng-container>

                <ng-container *ngIf="summary.services.length > 0">
                    <div style="border-top:1px solid #f1f5f9;margin:0.5rem 0"></div>
                    <div style="font-size:0.78rem;color:#94a3b8;margin-bottom:0.4rem">Dịch vụ</div>
                    <div *ngFor="let s of summary.services" class="summary-row">
                        <span>{{ s.name }} × {{ s.quantity }}</span>
                        <span style="color:#1e293b">{{ formatPrice(s.price * s.quantity) }}</span>
                    </div>
                </ng-container>

                <div class="summary-total">
                    <span class="total-label">Tổng cộng</span>
                    <span class="total-value">{{ formatPrice(totalAmount) }}</span>
                </div>
            </div>
        </div>
    </div>
    `,
})
export class BookingCreateComponent implements OnInit {

    submitting = false;
    today = new Date();

    locationOptions: LocationOption[] = [];
    hallOptions: HallOption[] = [];
    setMenuOptions: SetMenuOption[] = [];
    serviceOptions: ServiceOption[] = [];
    customerSuggestions: CustomerOption[] = [];
    selectedCustomer: CustomerOption | null = null;

    shiftOptions = [
        { label: 'Sáng (08:00 - 12:00)', value: 'SLOT_1' },
        { label: 'Trưa (12:00 - 17:00)', value: 'SLOT_2' },
        { label: 'Tối (17:00 - 21:00)',   value: 'SLOT_3' },
    ];

    form = {
        customerId:  null as number | null,
        groomName:   '',
        brideName:   '',
        groomDob:    null as Date | null,
        brideDob:    null as Date | null,
        locationId:  null as number | null,
        hallId:      null as number | null,
        bookingTime: 'SLOT_3',
        eventDate:   null as Date | null,
        tableCount:  20,
        guestCount:  200,
        setMenuId:   null as number | null,
        notes:       '',
    };

    summary = {
        hallName:     '',
        setMenuName:  '',
        setMenuPrice: 0,
        services:     [] as { name: string; price: number; quantity: number }[],
    };

    totalAmount = 0;

    constructor(
        private http: HttpClient,
        private bookingService: BookingService,
        private messageService: MessageService,
        private router: Router,
    ) {}

    ngOnInit() { this.loadLocations(); }

    loadLocations() {
        this.http.get<any>(`${BASE}/location`).subscribe({
            next: (res) => {
                this.locationOptions = (res.data ?? []).map((l: any) => ({ id: l.id, label: l.name }));
            },
            error: () => {
                this.locationOptions = [{ id: 1, label: 'Chi nhánh 1' }];
            }
        });
    }

    onLocationChange() {
        this.form.hallId = null;
        this.hallOptions = [];
        this.resetHallDependent();
        if (!this.form.locationId) return;
        this.http.get<any>(`${BASE}/hall`, {
            params: new HttpParams().set('locationId', this.form.locationId)
        }).subscribe({
            next: (res) => {
                this.hallOptions = (res.data ?? []).map((h: any) => ({ id: h.id, label: h.name }));
            }
        });
    }

    onHallChange() {
        this.resetHallDependent();
        const hall = this.hallOptions.find(h => h.id === this.form.hallId);
        this.summary.hallName = hall?.label ?? '';
        if (!this.form.hallId) return;

        this.http.get<any>(`${BASE}/set-menu`, {
            params: new HttpParams().set('hallId', this.form.hallId)
        }).subscribe({
            next: (res) => {
                this.setMenuOptions = (res.data ?? []).map((m: any) => ({
                    id: m.id, label: m.name, price: m.pricePerTable ?? m.price ?? 0,
                }));
            }
        });

        this.http.get<any>(`${BASE}/service`, {
            params: new HttpParams().set('hallId', this.form.hallId)
        }).subscribe({
            next: (res) => {
                this.serviceOptions = (res.data ?? []).map((s: any) => ({
                    id: s.id, label: s.name, price: s.price ?? 0,
                    selected: false, quantity: 1,
                }));
            }
        });
    }

    resetHallDependent() {
        this.setMenuOptions = [];
        this.serviceOptions = [];
        this.form.setMenuId       = null;
        this.summary.setMenuName  = '';
        this.summary.setMenuPrice = 0;
        this.summary.services     = [];
        this.totalAmount = 0;
    }

    searchCustomer(event: any) {
        this.http.get<any>(`${BASE}/customer/search`, {
            params: new HttpParams().set('keyword', event.query ?? '').set('page', 0).set('size', 10)
        }).subscribe({
            next: (res) => {
                this.customerSuggestions = (res.data?.content ?? []).map((c: any) => ({
                    id: c.id, label: c.fullName ?? c.name, phone: c.phone ?? '',
                }));
            },
            error: () => { this.customerSuggestions = []; }
        });
    }

    onCustomerSelect(event: AutoCompleteSelectEvent) {
        const c = event.value as CustomerOption;
        this.form.customerId = c.id;
    }

    selectSetMenu(m: SetMenuOption) {
        this.form.setMenuId       = m.id;
        this.summary.setMenuName  = m.label;
        this.summary.setMenuPrice = m.price;
        this.recalcTotal();
    }

    recalcTotal() {
        const menuTotal = (this.summary.setMenuPrice ?? 0) * (this.form.tableCount ?? 0);
        const svcTotal  = this.serviceOptions
            .filter(s => s.selected)
            .reduce((acc, s) => acc + s.price * s.quantity, 0);
        this.totalAmount = menuTotal + svcTotal;
        this.summary.services = this.serviceOptions
            .filter(s => s.selected)
            .map(s => ({ name: s.label, price: s.price, quantity: s.quantity }));
    }

    submit() {
        if (!this.form.customerId) {
            this.warn('Vui lòng chọn khách hàng'); return;
        }
        if (!this.form.groomName || !this.form.brideName) {
            this.warn('Vui lòng nhập tên cô dâu và chú rể'); return;
        }
        if (!this.form.hallId) {
            this.warn('Vui lòng chọn sảnh cưới'); return;
        }
        if (!this.form.eventDate) {
            this.warn('Vui lòng chọn ngày tổ chức'); return;
        }

        const payload = {
            customerId:  this.form.customerId,
            groomName:   this.form.groomName,
            brideName:   this.form.brideName,
            groomDob:    this.toISODate(this.form.groomDob),
            brideDob:    this.toISODate(this.form.brideDob),
            hallId:      this.form.hallId,
            locationId:  this.form.locationId,
            bookingTime: this.form.bookingTime,
            eventDate:   this.toISODate(this.form.eventDate),
            tableCount:  this.form.tableCount,
            guestCount:  this.form.guestCount,
            setMenuId:   this.form.setMenuId,
            notes:       this.form.notes,
            services:    this.serviceOptions
                            .filter(s => s.selected)
                            .map(s => ({ serviceId: s.id, quantity: s.quantity })),
            totalAmount: this.totalAmount,
        };

        this.submitting = true;
        this.http.post<any>(`${BASE}/booking`, payload).subscribe({
            next: (res) => {
                this.submitting = false;
                this.messageService.add({ severity: 'success', summary: 'Thành công', detail: 'Đã tạo đơn đặt tiệc', life: 3000 });
                setTimeout(() => this.router.navigate(['/pages/booking', res.data?.id]), 1200);
            },
            error: (err) => {
                this.submitting = false;
                this.messageService.add({
                    severity: 'error', summary: 'Lỗi',
                    detail: err?.error?.message ?? 'Không thể tạo đơn đặt tiệc', life: 4000,
                });
            }
        });
    }

    goBack() { this.router.navigate(['/pages/booking']); }

    private warn(detail: string) {
        this.messageService.add({ severity: 'warn', summary: 'Thiếu thông tin', detail, life: 3000 });
    }

    toISODate(d: Date | null): string | undefined {
        if (!d) return undefined;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    formatPrice(v?: number): string {
        if (v == null) return '0 đ';
        return new Intl.NumberFormat('vi-VN').format(v) + ' đ';
    }

    formatDateDisplay(d: Date | null): string {
        if (!d) return '-';
        return d.toLocaleDateString('vi-VN');
    }

    getShiftLabel(v?: string): string {
        const m: Record<string, string> = {
            SLOT_1: 'Ca Sáng', SLOT_2: 'Ca Trưa', SLOT_3: 'Ca Tối',
        };
        return m[v ?? ''] ?? '';
    }
}