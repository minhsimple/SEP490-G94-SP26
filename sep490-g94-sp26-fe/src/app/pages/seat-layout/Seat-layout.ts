import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BookingService, Booking, BookingUpsertPayload, TableLayoutRequest } from '../service/booking.service';
import { Customer, CustomerService } from '../service/customer.service';

interface ZoneGroup {
    id: string;
    groupName: string;
    numberOfTables: number;
    colorIndex: number;
}

interface SeatZone {
    id: string;
    enumKey: string;
    label: string;
    groups: ZoneGroup[];
    collapsed: boolean;
    expectedTables: number;
}

type ZoneId = 'A' | 'B' | 'C' | 'D';

interface ZoneDetailGroup {
    groupName: string;
    count: number;
    start: number;
    end: number;
    seats: number[];
    colorIndex: number;
}

interface ZoneDetailSection {
    zoneLabel: string;
    groups: ZoneDetailGroup[];
}

@Component({
    selector: 'app-seat-layout',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, ToastModule],
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
        .layout-content {
            display: grid;
            grid-template-columns: minmax(0, 1fr) 360px;
            gap: 1.5rem;
            align-items: start;
        }
        .section-card {
            background: #fff;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
        }

        .canvas {
            border-radius: 10px;
            background: #f8fafc;
            border: 1px solid #eef2f7;
            padding: 0.85rem;
        }

        .stage-wrap {
            display: flex;
            justify-content: center;
            margin-bottom: 0.55rem;
        }

        .stage {
            background: #e5e7eb;
            color: #6b7280;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.9rem;
            letter-spacing: 0.03em;
            padding: 0.45rem 2.8rem;
        }

        .zone-canvas-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.45rem;
        }

        .zone-canvas-item {
            border: 2px dashed #d1d5db;
            border-radius: 10px;
            min-height: 220px;
            background: #ffffff;
            padding: 0.55rem 0.5rem;
            display: flex;
            flex-direction: column;
        }

        .zone-canvas-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 1.02rem;
            font-weight: 700;
            color: #374151;
            margin-bottom: 0.5rem;
        }

        .zone-canvas-header small {
            font-size: 0.84rem;
            color: #64748b;
            font-weight: 600;
        }

        .dot-wrap {
            flex: 1;
            display: flex;
            align-content: flex-start;
            justify-content: center;
            flex-wrap: wrap;
            gap: 0.6rem;
            padding: 0.3rem;
        }

        .dot {
            width: 34px;
            height: 34px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.86rem;
            font-weight: 700;
            background: #fff;
            border: 2px solid #cbd5e1;
            color: #334155;
        }

        .dot.family {
            border-color: #fb923c;
            background: #fff7ed;
            color: #c2410c;
        }

        .dot.friends {
            border-color: #4ade80;
            background: #f0fdf4;
            color: #15803d;
        }

        .dot.colleague {
            border-color: #818cf8;
            background: #eef2ff;
            color: #4338ca;
        }

        .dot.other {
            border-color: #94a3b8;
            background: #f8fafc;
            color: #475569;
        }

        /* Auto color variants */
        .dot.color-0 { border-color: #fb923c; background: #fff7ed; color: #c2410c; }
        .dot.color-1 { border-color: #4ade80; background: #f0fdf4; color: #15803d; }
        .dot.color-2 { border-color: #818cf8; background: #eef2ff; color: #4338ca; }
        .dot.color-3 { border-color: #f87171; background: #fee2e2; color: #991b1b; }
        .dot.color-4 { border-color: #06b6d4; background: #ecf0f1; color: #0e7490; }
        .dot.color-5 { border-color: #a78bfa; background: #f3f0ff; color: #5b21b6; }

        .legend {
            margin-top: 0.8rem;
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 1rem;
            font-size: 0.9rem;
            color: #475569;
        }

        .legend-item {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
        }

        .legend-dot {
            width: 12px;
            height: 12px;
            border-radius: 999px;
            border: 2px solid #cbd5e1;
            background: #fff;
        }

        .legend-dot.family { border-color: #fb923c; background: #fff7ed; }
        .legend-dot.friends { border-color: #4ade80; background: #f0fdf4; }
        .legend-dot.colleague { border-color: #818cf8; background: #eef2ff; }
        .legend-dot.other { border-color: #94a3b8; background: #f8fafc; }

        /* Auto color variants for legend */
        .legend-dot.color-0 { border-color: #fb923c; background: #fff7ed; }
        .legend-dot.color-1 { border-color: #4ade80; background: #f0fdf4; }
        .legend-dot.color-2 { border-color: #818cf8; background: #eef2ff; }
        .legend-dot.color-3 { border-color: #f87171; background: #fee2e2; }
        .legend-dot.color-4 { border-color: #06b6d4; background: #ecf0f1; }
        .legend-dot.color-5 { border-color: #a78bfa; background: #f3f0ff; }

        .right-card {
            background: #fff;
            border-radius: 12px;
            padding: 0;
            overflow: hidden;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
            position: sticky;
            top: 1rem;
        }

        .zone-controls {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.7rem;
            padding: 0.85rem 0.9rem;
            border-bottom: 1px solid #e2e8f0;
            background: #ffffff;
        }

        .zone-controls strong {
            display: block;
            font-size: 0.95rem;
            color: #0f172a;
        }

        .zone-controls small {
            display: block;
            font-size: 0.8rem;
            color: #64748b;
            margin-top: 0.1rem;
        }

        .zone-control-btn {
            border: 1px solid #cbd5e1;
            border-radius: 7px;
            height: 33px;
            background: #f8fafc;
            color: #0f172a;
            font-size: 0.85rem;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            padding: 0 0.6rem;
            cursor: pointer;
            white-space: nowrap;
        }

        .zone-control-btn:hover:not(:disabled) {
            border-color: #94a3b8;
            background: #f1f5f9;
        }

        .zone-control-btn:disabled {
            opacity: 0.55;
            cursor: not-allowed;
        }

        .zone-editor-card {
            margin: 0;
            overflow: hidden;
            border-bottom: 1px solid #e2e8f0;
        }

        .zone-editor-card:last-child {
            border-bottom: none;
        }

        .zone-editor-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0.9rem;
            cursor: pointer;
            background: #f8fafc;
        }

        .zone-editor-head:hover {
            background: #f1f5f9;
        }

        .zone-editor-title {
            font-size: 1rem;
            font-weight: 700;
            color: #0f172a;
        }

        .zone-editor-title small {
            margin-left: 0.35rem;
            font-size: 0.9rem;
            color: #64748b;
            font-weight: 600;
        }

        .zone-head-actions {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
        }

        .zone-remove-btn {
            border: none;
            width: 27px;
            height: 27px;
            border-radius: 6px;
            background: transparent;
            color: #64748b;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .zone-remove-btn:hover:not(:disabled) {
            background: #fee2e2;
            color: #dc2626;
        }

        .zone-remove-btn:disabled {
            opacity: 0.45;
            cursor: not-allowed;
        }

        .zone-editor-body {
            border-top: 1px solid #e2e8f0;
            padding: 0.55rem 0.8rem 0.75rem;
            background: #fff;
        }

        .group-row {
            display: grid;
            grid-template-columns: 1fr 58px 26px;
            gap: 0.35rem;
            margin-bottom: 0.35rem;
        }

        .group-select,
        .table-input {
            border: 1px solid #cbd5e1;
            border-radius: 7px;
            height: 33px;
            font-size: 0.95rem;
            color: #334155;
            padding: 0 0.55rem;
            background: #fff;
        }

        .group-select:focus,
        .table-input:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .table-input {
            text-align: center;
            font-weight: 700;
        }

        .trash-btn {
            border: none;
            background: transparent;
            color: #111827;
            cursor: pointer;
            border-radius: 6px;
            width: 26px;
            height: 33px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .trash-btn:hover {
            background: #fee2e2;
            color: #dc2626;
        }

        .add-row-btn {
            border: none;
            background: transparent;
            color: #334155;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            margin-top: 0.2rem;
            margin-left: 0.2rem;
            font-size: 0.9rem;
        }

        .add-row-btn:hover:not(:disabled) {
            color: #2563eb;
        }

        .add-row-btn:disabled {
            cursor: not-allowed;
            color: #cbd5e1;
        }

        .detail-btn-wrap {
            padding: 0.8rem 0.7rem;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
        }

        .detail-btn {
            width: 100%;
            border: none;
            border-radius: 8px;
            background: #ede9fe;
            color: #1f2937;
            font-weight: 700;
            height: 37px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: background 200ms;
        }

        .detail-btn:hover {
            background: #ddd6fe;
        }

        .modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.55);
            z-index: 1200;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1rem;
        }

        .modal-card {
            width: min(620px, 92vw);
            max-height: 82vh;
            background: #fff;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            overflow: auto;
            padding: 0.95rem 1.05rem 1rem;
        }

        .modal-head {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }

        .modal-title {
            font-size: 1.5rem;
            font-weight: 800;
            margin: 0;
            color: #0f172a;
        }

        .icon-btn {
            border: none;
            background: transparent;
            cursor: pointer;
            color: #334155;
            width: 34px;
            height: 34px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            font-size: 1rem;
        }

        .icon-btn:hover {
            background: #f1f5f9;
        }

        .modal-zone {
            border-top: 1px solid #dbe3ec;
            padding-top: 0.7rem;
            margin-top: 0.7rem;
        }

        .modal-zone h4 {
            margin: 0 0 0.45rem;
            font-size: 1.1rem;
            font-weight: 700;
            color: #0f172a;
        }

        .modal-row {
            margin-bottom: 0.58rem;
        }

        .modal-row-head {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.95rem;
            color: #0f172a;
            font-weight: 700;
            margin-bottom: 0.25rem;
        }

        .seat-chip-list {
            display: flex;
            flex-wrap: wrap;
            gap: 0.42rem;
        }

        .seat-chip {
            width: 39px;
            height: 39px;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 0.95rem;
            font-weight: 700;
            border: 2px solid #cbd5e1;
            background: #fff;
            color: #334155;
        }

        .seat-chip.family { border-color: #fb923c; background: #fff7ed; color: #c2410c; }
        .seat-chip.friends { border-color: #4ade80; background: #f0fdf4; color: #15803d; }
        .seat-chip.colleague { border-color: #818cf8; background: #eef2ff; color: #4338ca; }
        .seat-chip.other { border-color: #94a3b8; background: #f8fafc; color: #475569; }

        .summary-card {
            position: sticky;
            top: 1rem;
        }

        @media (max-width: 1200px) {
            .layout-content {
                grid-template-columns: 1fr;
            }
            .right-card,
            .summary-card {
                position: static;
            }
        }

        @media (max-width: 760px) {
            .zone-canvas-grid {
                grid-template-columns: 1fr;
            }

            .modal-title {
                font-size: 1.2rem;
            }

            .layout-content {
                gap: 1rem;
            }
        }
    `],
    template: `
        <p-toast />

        <div class="page-header">
            <div class="page-header-left">
                <p-button icon="pi pi-arrow-left" [text]="true" severity="secondary" (onClick)="goBack()" />
                <div>
                    <h1>Thiết lập sơ đồ chỗ ngồi</h1>
                    <p>Cấu hình bàn ngồi cho các khu vực</p>
                </div>
            </div>

            <div class="header-actions">
                <p-button
                    label="Xác nhận"
                    icon="pi pi-check"
                    (onClick)="saveLayout()"
                />
            </div>
        </div>

        <ng-container *ngIf="!loading; else loadingTpl">
        <div class="layout-content">
            <div>
                <div class="section-card">
                    <div class="canvas">
                        <div class="stage-wrap"><div class="stage">SÂN KHẤU</div></div>
                        <div class="zone-canvas-grid">
                            <div class="zone-canvas-item" *ngFor="let zone of zones">
                                <div class="zone-canvas-header">
                                    <span>{{ zone.label }}</span>
                                    <small>{{ zoneTableCount(zone) }} bàn</small>
                                </div>
                                <div class="dot-wrap">
                                    <span class="dot" [ngStyle]="groupColorStyle(group.colorIndex)" *ngFor="let group of zoneSeatDots(zone)">{{ group.no }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="legend">
                            <span class="legend-item" *ngFor="let entry of legendGroups()">
                                <i class="legend-dot" [ngStyle]="legendColorStyle(entry.colorIndex)"></i> {{ entry.groupName }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div>
                <div class="right-card">
                    <div class="zone-controls">
                        <div>
                            <strong>Khu vực</strong>
                            <small>{{ zones.length }}/{{ maxZones }} khu (tối thiểu {{ minZones }} khu)</small>
                        </div>
                        <button class="zone-control-btn" (click)="addZone()" [disabled]="!canAddZone()">
                            <i class="pi pi-plus"></i>
                            Thêm khu
                        </button>
                    </div>

                    <div class="zone-editor-card" *ngFor="let zone of zones">
                        <div class="zone-editor-head" (click)="toggleZone(zone)">
                            <div class="zone-editor-title">{{ zone.label }} <small>{{ zoneTableCount(zone) }} bàn</small></div>
                            <div class="zone-head-actions">
                                <button class="zone-remove-btn" (click)="removeZone(zone, $event)" [disabled]="!canRemoveZone()" title="Xóa khu">
                                    <i class="pi pi-trash"></i>
                                </button>
                                <i class="pi" [class.pi-chevron-up]="!zone.collapsed" [class.pi-chevron-down]="zone.collapsed"></i>
                            </div>
                        </div>
                        <div class="zone-editor-body" *ngIf="!zone.collapsed">
                            <div style="font-size: 0.82rem; color: #64748b; margin-bottom: 0.5rem;">
                                Dự kiến: {{ zone.expectedTables }} bàn | Hiện tại: {{ zoneTableCount(zone) }} bàn
                            </div>
                            <div class="group-row" *ngFor="let row of zone.groups; let idx = index">
                                <input class="group-select" type="text" [(ngModel)]="row.groupName" placeholder="Tên nhóm (vd: Người thân)" />
                                <input 
                                    class="table-input" 
                                    type="number" 
                                    min="0" 
                                    [(ngModel)]="row.numberOfTables" 
                                    (change)="normalizeRow(row, zone)"
                                />
                                <button class="trash-btn" (click)="removeGroup(zone, row)"><i class="pi pi-trash"></i></button>
                            </div>
                            <button class="add-row-btn" (click)="addGroup(zone)">
                                <i class="pi pi-plus"></i> Thêm nhóm
                            </button>
                        </div>
                    </div>
                    <div class="detail-btn-wrap">
                        <button class="detail-btn" (click)="openDetailModal()">
                            <i class="pi pi-list" style="margin-right:0.35rem"></i>
                            Xem chi tiết bàn
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </ng-container>

        <ng-template #loadingTpl>
            <div style="text-align:center; padding:3rem; color:#64748b">Đang tải...</div>
        </ng-template>

        <div class="modal-backdrop" *ngIf="showDetailModal" (click)="closeDetailModal()">
            <div class="modal-card" (click)="$event.stopPropagation()">
                <div class="modal-head">
                    <h3 class="modal-title">Chi tiết sắp xếp bàn ({{ totalTables }} bàn)</h3>
                    <button class="icon-btn" (click)="closeDetailModal()"><i class="pi pi-times"></i></button>
                </div>

                <div class="modal-zone" *ngFor="let section of detailSections()">
                    <h4>{{ section.zoneLabel }}</h4>
                    <div class="modal-row" *ngFor="let row of section.groups">
                        <div class="modal-row-head">
                            <i class="legend-dot" [ngStyle]="legendColorStyle(row.colorIndex)"></i>
                            <span>{{ row.groupName }}</span>
                            <small style="color:#64748b; font-weight:600;">- Bàn {{ row.start }}-{{ row.end }} ({{ row.count }} bàn)</small>
                        </div>
                        <div class="seat-chip-list">
                            <span class="seat-chip" [ngStyle]="groupColorStyle(row.colorIndex)" *ngFor="let seat of row.seats">{{ seat }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
})
export class SeatLayoutComponent implements OnInit {
    @Input() bookingId: number | null = null;
    @Input() embeddedMode = false;
    @Input() draftBooking: Partial<Booking> | null = null;
    @Input() draftCustomerName = '';
    @Input() draftHallName = '';
    @Output() requestClose = new EventEmitter<void>();

    loading = false;
    booking: Booking | null = null;
    customer: Customer | null = null;
    customerName = '';
    hallName = '';
    showDetailModal = false;

    private returnUrl = '/pages/booking';
    private draftTableLayoutRequest: TableLayoutRequest | null = null;
    readonly minZones = 1;
    readonly maxZones = 4;
    private readonly zoneIds: ReadonlyArray<ZoneId> = ['A', 'B', 'C', 'D'];

    zones: SeatZone[] = [];
    totalExpectedTables = 0;
    private colorStyleCache = new Map<number, { border: string; background: string; text: string }>();

    get totalTables(): number {
        return this.zones.reduce((sum, zone) => sum + this.zoneTableCount(zone), 0);
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private bookingService: BookingService,
        private customerService: CustomerService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        const navState = history.state ?? {};
        if (typeof navState.returnUrl === 'string' && navState.returnUrl.trim()) {
            this.returnUrl = navState.returnUrl;
        }
        this.draftTableLayoutRequest = navState?.draftTableLayoutRequest ?? null;

        const routeId = Number(this.route.snapshot.paramMap.get('id'));
        const id = Number(this.bookingId ?? routeId);
        if (!Number.isFinite(id) || id <= 0) {
            const stateDraftBooking = navState.draftBooking as Partial<Booking> | undefined;
            const stateDraftCustomerName = String(navState.draftCustomerName ?? '');
            const stateDraftHallName = String(navState.draftHallName ?? '');

            if (this.embeddedMode || stateDraftBooking) {
                this.booking = {
                    id: 0,
                    ...(stateDraftBooking ?? this.draftBooking),
                } as Booking;
                this.customerName = stateDraftCustomerName || this.draftCustomerName || '';
                this.hallName = stateDraftHallName || this.draftHallName || this.booking?.hallName || '';
                const total = Number(this.booking?.expectedTables ?? this.booking?.tableCount ?? 0);
                if (this.draftTableLayoutRequest?.tableLayoutDetailRequestList?.length) {
                    this.buildZonesFromRequest(this.draftTableLayoutRequest, total > 0 ? total : null);
                } else {
                    this.buildZones(total > 0 ? total : 20);
                }
                this.cdr.detectChanges();
                return;
            }
            this.goBack();
            return;
        }
        this.loadBooking(id);
    }

    private loadBooking(id: number) {
        this.loading = true;
        this.bookingService.getById(id).subscribe({
            next: (res) => {
                this.booking = res.data;
                const customerId = Number(this.booking?.customerId ?? 0);
                if (Number.isFinite(customerId) && customerId > 0) {
                    this.loadCustomer(customerId);
                }
                const expectedTotal = Number(this.booking?.expectedTables ?? this.booking?.tableCount ?? 0);
                const fromResponse = this.extractLayoutRequest(this.booking);
                if (fromResponse?.tableLayoutDetailRequestList?.length) {
                    this.buildZonesFromRequest(fromResponse, expectedTotal > 0 ? expectedTotal : null);
                } else if (this.draftTableLayoutRequest?.tableLayoutDetailRequestList?.length) {
                    this.buildZonesFromRequest(this.draftTableLayoutRequest, expectedTotal > 0 ? expectedTotal : null);
                } else {
                    this.buildZones(expectedTotal > 0 ? expectedTotal : 20);
                }
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => {
                this.loading = false;
                this.goBack();
            },
        });
    }

    private loadCustomer(customerId: number) {
        this.customerService.getCustomerById(customerId).subscribe({
            next: (res) => {
                this.customer = res.data;
                this.customerName = res.data?.fullName ?? this.customerName;
                this.cdr.detectChanges();
            },
            error: () => {
                this.cdr.detectChanges();
            },
        });
    }

    private buildZones(total: number) {
        const normalizedTotal = this.normalizeTableCount(total);
        const zoneCount = Math.min(
            this.maxZones,
            Math.max(this.minZones, normalizedTotal > 0 ? Math.min(this.maxZones, normalizedTotal) : this.minZones),
        );
        const counts = this.distributeTables(normalizedTotal, zoneCount);

        this.totalExpectedTables = normalizedTotal;
        this.zones = counts.map((count, index) => this.newZone(this.zoneIds[index], count));
    }

    private newZone(id: ZoneId, tables: number): SeatZone {
        const normalizedTables = this.normalizeTableCount(tables);
        return {
            id,
            enumKey: `SIDE_${id}`,
            label: `Khu ${id}`,
            groups: normalizedTables > 0 ? [{ id: `${id}-1`, groupName: '', numberOfTables: normalizedTables, colorIndex: 0 }] : [],
            collapsed: id !== 'A',
            expectedTables: normalizedTables,
        };
    }

    private buildZonesFromRequest(request: TableLayoutRequest, expectedTotal?: number | null) {
        const zones = this.zoneIds.map((id) => this.newZone(id, 0));

        let colorIndex = 0;
        for (const item of request.tableLayoutDetailRequestList ?? []) {
            const enumKey = String(item.tableLayoutEnum ?? '').toUpperCase();
            const zone = zones.find((z) => z.enumKey === enumKey);
            if (!zone) continue;
            zone.groups.push({
                id: `${zone.id}-${zone.groups.length + 1}`,
                groupName: String(item.groupName ?? ''),
                numberOfTables: this.normalizeTableCount(item.numberOfTables ?? 0),
                colorIndex,
            });
            colorIndex++;
        }

        this.zones = zones.filter((zone) => zone.groups.length > 0);
        if (this.zones.length === 0) {
            this.zones = [this.newZone('A', 0)];
        }

        this.reindexZones();
        for (const zone of this.zones) {
            zone.expectedTables = this.zoneTableCount(zone);
        }

        this.totalExpectedTables = Number.isFinite(Number(expectedTotal)) && Number(expectedTotal) > 0
            ? Number(expectedTotal)
            : this.totalTables;
    }

    toggleZone(zone: SeatZone) {
        zone.collapsed = !zone.collapsed;
    }

    canAddZone(): boolean {
        return this.zones.length < this.maxZones;
    }

    canRemoveZone(): boolean {
        return this.zones.length > this.minZones;
    }

    addZone() {
        if (!this.canAddZone()) {
            return;
        }

        const nextId = this.zoneIds[this.zones.length];
        if (!nextId) {
            return;
        }

        this.zones.push(this.newZone(nextId, 0));
        this.reindexZones();
    }

    removeZone(zone: SeatZone, event?: Event) {
        event?.stopPropagation();
        if (!this.canRemoveZone()) {
            return;
        }

        this.zones = this.zones.filter((z) => z.id !== zone.id);
        if (this.zones.length === 0) {
            this.zones = [this.newZone('A', 0)];
        }
        this.reindexZones();
    }

    addGroup(zone: SeatZone) {
        const colorIndex = this.nextColorIndex();
        zone.groups.push({
            id: `${zone.id}-${zone.groups.length + 1}`,
            groupName: '',
            numberOfTables: 0,
            colorIndex,
        });
    }

    removeGroup(zone: SeatZone, row: ZoneGroup) {
        zone.groups = zone.groups.filter((g) => g.id !== row.id);
    }

    normalizeRow(row: ZoneGroup, zone: SeatZone) {
        row.numberOfTables = this.normalizeTableCount(row.numberOfTables ?? 0);
        
        const total = this.totalTables;
        if (total > this.totalExpectedTables) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Cảnh báo',
                detail: `Tổng số bàn đã vượt quá ${this.totalExpectedTables} bàn (hiện tại: ${total} bàn)`,
                life: 3000,
            });
        }
    }

    zoneTableCount(zone: SeatZone): number {
        return zone.groups.reduce((sum, g) => sum + this.normalizeTableCount(g.numberOfTables), 0);
    }

    zoneSeatDots(zone: SeatZone): Array<{ no: number; colorIndex: number }> {
        const dots: Array<{ no: number; colorIndex: number }> = [];
        let count = 0;
        for (const group of zone.groups) {
            const tables = this.normalizeTableCount(group.numberOfTables);
            for (let i = 0; i < tables; i++) {
                count += 1;
                dots.push({ no: count, colorIndex: group.colorIndex });
            }
        }
        return dots;
    }

    openDetailModal() {
        this.showDetailModal = true;
    }

    closeDetailModal() {
        this.showDetailModal = false;
    }

    detailSections(): ZoneDetailSection[] {
        let seatCursor = 1;
        return this.zones.map((zone) => {
            const groups: ZoneDetailGroup[] = zone.groups
                .map((g) => {
                const count = this.normalizeTableCount(g.numberOfTables);
                if (count <= 0) {
                    return null;
                }
                const start = seatCursor;
                const end = seatCursor + count - 1;
                const seats = Array.from({ length: count }, (_, i) => seatCursor + i);
                seatCursor = end + 1;
                return {
                    groupName: g.groupName || '(Không tên)',
                    count,
                    start,
                    end,
                    seats,
                    colorIndex: g.colorIndex,
                };
            })
                .filter((group): group is ZoneDetailGroup => Boolean(group));
            return { zoneLabel: zone.label, groups };
        });
    }

    saveLayout() {
        // Validate total tables
        if (this.totalTables > this.totalExpectedTables) {
            this.messageService.add({
                severity: 'error',
                summary: 'Lỗi',
                detail: `Tổng số bàn vượt quá giới hạn (${this.totalExpectedTables} bàn). Hiện tại: ${this.totalTables} bàn`,
                life: 4000,
            });
            return;
        }

        if (this.totalTables < this.totalExpectedTables) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Cảnh báo',
                detail: `Vui lòng điền đủ số bàn (dự kiến: ${this.totalExpectedTables} bàn, hiện tại: ${this.totalTables} bàn)`,
                life: 4000,
            });
            return;
        }

        const tableLayoutRequest = this.toTableLayoutRequest();

        if (!this.embeddedMode && this.booking?.id && this.booking.id > 0) {
            const payload = this.buildUpdatePayloadForLayout(tableLayoutRequest);
            if (!payload) {
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Thiếu dữ liệu',
                    detail: 'Không đủ dữ liệu để lưu layout vào hợp đồng.',
                    life: 3000,
                });
                return;
            }

            this.loading = true;
            this.bookingService.update(this.booking.id, payload).subscribe({
                next: (res) => {
                    this.loading = false;
                    this.booking = res.data ?? this.booking;
                    this.navigateBackWithLayout(tableLayoutRequest, true);
                },
                error: (err) => {
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Lỗi',
                        detail: err?.error?.message ?? 'Không thể lưu layout vào hệ thống',
                        life: 3500,
                    });
                },
            });
            return;
        }

        if (!this.embeddedMode && this.returnUrl) {
            this.navigateBackWithLayout(tableLayoutRequest, false);
            return;
        }

        this.messageService.add({
            severity: 'success',
            summary: 'Đã lưu',
            detail: `Sơ đồ chỗ ngồi đã được lưu (${this.totalTables} bàn).`,
            life: 3000,
        });
    }

    goBack() {
        if (this.embeddedMode) {
            this.requestClose.emit();
            return;
        }

        if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
            return;
        }

        if (window.history.length > 1) {
            this.location.back();
            return;
        }

        const id = this.route.snapshot.paramMap.get('id');
        if (id) this.router.navigate(['/pages/booking', id]);
        else this.router.navigate(['/pages/booking']);
    }

    private toTableLayoutRequest(): TableLayoutRequest {
        return {
            tableLayoutDetailRequestList: this.zones.flatMap((zone) =>
                zone.groups
                    .filter((g) => this.normalizeTableCount(g.numberOfTables) > 0)
                    .map((g) => ({
                        tableLayoutEnum: zone.enumKey,
                        groupName: g.groupName || '(Không tên)',
                        numberOfTables: this.normalizeTableCount(g.numberOfTables),
                    }))
            ),
        };
    }

    legendGroups(): Array<{ groupName: string; colorIndex: number }> {
        const nameCounts = new Map<string, number>();
        for (const zone of this.zones) {
            for (const group of zone.groups) {
                const groupName = String(group.groupName ?? '').trim();
                if (groupName && group.numberOfTables > 0) {
                    const key = groupName.toLowerCase();
                    nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
                }
            }
        }

        const displayCounts = new Map<string, number>();
        const entries: Array<{ groupName: string; colorIndex: number }> = [];

        for (const zone of this.zones) {
            for (const group of zone.groups) {
                const groupName = String(group.groupName ?? '').trim();
                if (!groupName || group.numberOfTables <= 0) {
                    continue;
                }

                const key = groupName.toLowerCase();
                const totalByName = nameCounts.get(key) ?? 0;
                let displayName = totalByName > 1 ? `${groupName} (${zone.label})` : groupName;

                const displayKey = displayName.toLowerCase();
                const seenDisplay = (displayCounts.get(displayKey) ?? 0) + 1;
                displayCounts.set(displayKey, seenDisplay);
                if (seenDisplay > 1) {
                    displayName = `${displayName} #${seenDisplay}`;
                }

                entries.push({
                    groupName: displayName,
                    colorIndex: this.normalizeColorIndex(group.colorIndex),
                });
            }
        }

        return entries;
    }

    groupColorStyle(colorIndex: number): Record<string, string> {
        const token = this.resolveColorToken(colorIndex);
        return {
            'border-color': token.border,
            background: token.background,
            color: token.text,
        };
    }

    legendColorStyle(colorIndex: number): Record<string, string> {
        const token = this.resolveColorToken(colorIndex);
        return {
            'border-color': token.border,
            background: token.background,
        };
    }

    private nextColorIndex(): number {
        let max = -1;
        for (const zone of this.zones) {
            for (const group of zone.groups) {
                const current = this.normalizeColorIndex(group.colorIndex);
                if (current > max) {
                    max = current;
                }
            }
        }
        return max + 1;
    }

    private normalizeColorIndex(colorIndex: number): number {
        const value = Number(colorIndex);
        if (!Number.isFinite(value) || value < 0) {
            return 0;
        }
        return Math.floor(value);
    }

    private resolveColorToken(colorIndex: number): { border: string; background: string; text: string } {
        const key = this.normalizeColorIndex(colorIndex);
        const cached = this.colorStyleCache.get(key);
        if (cached) {
            return cached;
        }

        // Golden-angle hue spacing keeps adjacent colors visually distinct as group count grows.
        const hue = (key * 137.508) % 360;
        const saturation = 70 + (key % 3) * 6;
        const lightness = 90 - (Math.floor(key / 3) % 3) * 8;

        const token = {
            border: `hsl(${hue} ${Math.min(94, saturation + 6)}% ${Math.max(38, lightness - 26)}%)`,
            background: `hsl(${hue} ${Math.min(90, saturation)}% ${Math.max(62, lightness)}%)`,
            text: `hsl(${hue} ${Math.min(96, saturation + 8)}% ${Math.max(18, lightness - 54)}%)`,
        };

        this.colorStyleCache.set(key, token);
        return token;
    }

    private extractLayoutRequest(booking: Booking | null): TableLayoutRequest | null {
        const details = booking?.tableLayoutResponse?.tableLayoutDetails;
        if (!details) return null;

        const knownOrder = this.zoneIds.map((id) => `SIDE_${id}`);
        const knownItems = knownOrder.flatMap((key) => (details[key] ?? []).map((item) => ({ key, item })));
        const fallbackItems = Object.entries(details)
            .filter(([key]) => !knownOrder.includes(key))
            .flatMap(([, arr]) => arr.map((item) => ({ item })));

        const source = knownItems.length > 0 ? knownItems : fallbackItems;
        if (source.length === 0) return null;

        return {
            tableLayoutDetailRequestList: source.map((entry, index) => ({
                tableLayoutEnum: (entry as any).key ?? knownOrder[index % knownOrder.length],
                groupName: String(entry.item?.groupName ?? 'Khách mời'),
                numberOfTables: Number(entry.item?.numberOfTables ?? 1),
            })),
        };
    }

    private distributeTables(total: number, zoneCount: number): number[] {
        const safeZoneCount = Math.min(this.maxZones, Math.max(this.minZones, Math.floor(zoneCount)));
        const safeTotal = this.normalizeTableCount(total);
        const base = Math.floor(safeTotal / safeZoneCount);
        const extra = safeTotal % safeZoneCount;

        return Array.from({ length: safeZoneCount }, (_, i) => base + (i < extra ? 1 : 0));
    }

    private normalizeTableCount(value: unknown): number {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 0) {
            return 0;
        }
        return Math.floor(parsed);
    }

    private reindexZones() {
        this.zones = this.zones
            .slice(0, this.maxZones)
            .map((zone, zoneIndex) => {
                const id = this.zoneIds[zoneIndex];
                return {
                    ...zone,
                    id,
                    enumKey: `SIDE_${id}`,
                    label: `Khu ${id}`,
                    collapsed: zoneIndex === 0 ? false : zone.collapsed,
                    groups: zone.groups.map((group, groupIndex) => ({
                        ...group,
                        id: `${id}-${groupIndex + 1}`,
                        numberOfTables: this.normalizeTableCount(group.numberOfTables),
                        colorIndex: this.normalizeColorIndex(group.colorIndex),
                    })),
                };
            });
    }

    private buildUpdatePayloadForLayout(tableLayoutRequest: TableLayoutRequest): BookingUpsertPayload | null {
        const b = this.booking;
        if (!b) return null;

        const customerId = Number(b.customerId ?? 0);
        const hallId = Number(b.hallId ?? 0);
        const bookingDate = String(b.bookingDate ?? b.eventDate ?? '').trim();
        const bookingTime = String(b.bookingTime ?? b.shift ?? '').trim();
        const expectedTables = Number(b.expectedTables ?? b.tableCount ?? this.totalExpectedTables ?? this.totalTables ?? 0);
        const expectedGuests = Number(b.expectedGuests ?? b.guestCount ?? 0);
        const brideName = String(b.brideName ?? '').trim();
        const groomName = String(b.groomName ?? '').trim();

        if (!customerId || !hallId || !bookingDate || !bookingTime || !expectedTables || !expectedGuests || !brideName || !groomName) {
            return null;
        }

        const customerRequest = this.buildCustomerRequestForPayload(customerId);
        if (!customerRequest) {
            return null;
        }

        return {
            customerId,
            customerRequest,
            hallId,
            bookingDate,
            bookingTime,
            expectedTables,
            expectedGuests,
            assignCoordinatorId: b.assignCoordinatorId ?? null,
            packageId: b.packageId ?? null,
            setMenuId: b.setMenuId ?? null,
            salesId: b.salesId ?? null,
            reservedUntil: b.reservedUntil ?? null,
            notes: b.notes ?? undefined,
            brideName,
            brideAge: b.brideAge ?? null,
            groomName,
            groomAge: b.groomAge ?? null,
            brideFatherName: b.brideFatherName ?? undefined,
            brideMotherName: b.brideMotherName ?? undefined,
            groomFatherName: b.groomFatherName ?? undefined,
            groomMotherName: b.groomMotherName ?? undefined,
            tableLayoutRequest,
        };
    }

    private buildCustomerRequestForPayload(customerId: number): BookingUpsertPayload['customerRequest'] | null {
        const customer = this.customer;
        if (!customer || Number(customer.id ?? 0) !== customerId) {
            return null;
        }

        const fullName = String(customer.fullName ?? '').trim();
        const phone = String(customer.phone ?? '').trim();
        const address = String(customer.address ?? '').trim();
        const locationId = Number(customer.locationId ?? 0);

        if (!fullName || !phone || !address || !locationId) {
            return null;
        }

        return {
            fullName,
            citizenIdNumber: customer.citizenIdNumber?.trim() || undefined,
            phone,
            email: customer.email?.trim() || undefined,
            address,
            notes: customer.notes?.trim() || undefined,
            locationId,
        };
    }

    private navigateBackWithLayout(tableLayoutRequest: TableLayoutRequest, savedToDb: boolean) {
        try {
            sessionStorage.setItem('bookingCreateTableLayoutDraft', JSON.stringify(tableLayoutRequest));
            sessionStorage.setItem('bookingCreateTableLayoutSavedToDb', savedToDb ? '1' : '0');
        } catch {
            // Ignore storage failures.
        }

        this.router.navigateByUrl(this.returnUrl, {
            state: {
                tableLayoutRequest,
                layoutSaved: true,
                layoutSavedToDb: savedToDb,
                tableLayoutSavedAt: Date.now(),
            },
        });
    }
}
