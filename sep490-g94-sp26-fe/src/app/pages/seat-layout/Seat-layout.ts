import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { BookingService, Booking } from '../service/booking.service';

export interface ZoneConfig {
    id: string;
    label: string;           // "Khu A", "Khu B", ...
    tableCount: number;
    side: 'GROOM' | 'BRIDE'; // Nhà trai / Nhà gái
    guestGroup: 'FAMILY' | 'FRIENDS' | 'COLLEAGUE' | 'OTHER';
    color: 'blue' | 'pink';
}

@Component({
    selector: 'app-seat-layout',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, ToastModule, CheckboxModule],
    providers: [MessageService, BookingService],
    styles: [`
        :host {
            display: block;
            font-family: 'Segoe UI', sans-serif;
        }

        /* ── Page header ── */
        .page-header {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 1rem 1.5rem 0.75rem;
            border-bottom: 1px solid #e8edf3;
            background: #fff;
        }
        .page-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0;
        }
        .page-subtitle {
            font-size: 0.82rem;
            color: #64748b;
            margin-top: 0.1rem;
        }
        .spacer { flex: 1; }
        .btn-save {
            background: #2563eb;
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 0.5rem 1.25rem;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.4rem;
            transition: background 0.15s;
        }
        .btn-save:hover { background: #1d4ed8; }

        /* ── Info bar ── */
        .info-bar {
            display: flex;
            gap: 1rem;
            padding: 1rem 1.5rem;
            background: #fff;
        }
        .info-card {
            flex: 1;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 0.6rem 1rem;
        }
        .info-card label {
            font-size: 0.72rem;
            color: #94a3b8;
            display: block;
            margin-bottom: 0.2rem;
            font-weight: 500;
        }
        .info-card .info-value {
            font-weight: 600;
            color: #1e293b;
            font-size: 0.9rem;
        }

        /* ── Layout canvas ── */
        .layout-canvas {
            padding: 1rem 1.5rem 2rem;
            background: #f4f6f9;
            min-height: calc(100vh - 200px);
        }
        .canvas-title {
            font-weight: 600;
            color: #1e293b;
            font-size: 0.95rem;
            margin-bottom: 1rem;
        }

        /* Stage */
        .stage-row {
            display: flex;
            justify-content: center;
            margin-bottom: 1.25rem;
        }
        .stage-badge {
            background: #fff;
            border: 1.5px solid #cbd5e1;
            border-radius: 8px;
            padding: 0.35rem 2.5rem;
            font-size: 0.78rem;
            font-weight: 700;
            color: #475569;
            letter-spacing: 0.08em;
        }

        /* Zone grid */
        .zones-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
        }

        .zone-card {
            border-radius: 14px;
            padding: 1.25rem;
            border: 1.5px solid transparent;
        }
        .zone-card.blue {
            background: #eff6ff;
            border-color: #bfdbfe;
        }
        .zone-card.pink {
            background: #fff1f5;
            border-color: #fecdd3;
        }

        .zone-header {
            text-align: center;
            margin-bottom: 1rem;
        }
        .zone-name {
            font-size: 1rem;
            font-weight: 700;
            color: #1e293b;
            margin: 0;
        }
        .zone-table-count {
            font-size: 0.82rem;
            color: #64748b;
            margin-top: 0.1rem;
        }

        .field-group {
            margin-bottom: 0.75rem;
        }
        .field-label {
            font-size: 0.75rem;
            color: #64748b;
            margin-bottom: 0.3rem;
            font-weight: 500;
        }
        .field-select {
            width: 100%;
            padding: 0.4rem 0.65rem;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.85rem;
            color: #1e293b;
            background: #fff;
            appearance: none;
            -webkit-appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.65rem center;
            cursor: pointer;
        }
        .field-select:focus {
            outline: none;
            border-color: #93c5fd;
            box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }

        /* Chips */
        .zone-chips {
            display: flex;
            gap: 0.4rem;
            flex-wrap: wrap;
            margin-top: 0.5rem;
        }
        .zone-chip {
            font-size: 0.72rem;
            font-weight: 600;
            padding: 0.22rem 0.6rem;
            border-radius: 999px;
        }
        .zone-chip.blue {
            background: #2563eb;
            color: #fff;
        }
        .zone-chip.pink {
            background: #fb7185;
            color: #fff;
        }
        .zone-chip.outline {
            background: #fff;
            border: 1px solid #cbd5e1;
            color: #475569;
        }

        /* Legend */
        .legend-row {
            display: flex;
            justify-content: center;
            gap: 1.25rem;
            margin-top: 1.25rem;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.78rem;
            color: #64748b;
        }
        .legend-box {
            width: 14px;
            height: 14px;
            border-radius: 3px;
        }
        .legend-box.blue  { background: #bfdbfe; border: 1.5px solid #93c5fd; }
        .legend-box.pink  { background: #fecdd3; border: 1.5px solid #fda4af; }

        /* Table count editor */
        .table-count-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(255,255,255,0.65);
            border-radius: 8px;
            padding: 0.4rem 0.65rem;
            margin-bottom: 0.75rem;
        }
        .table-count-label { font-size: 0.78rem; color: #64748b; }
        .table-count-controls {
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .count-btn {
            width: 24px; height: 24px;
            border-radius: 50%;
            border: 1px solid #d1d5db;
            background: #fff;
            font-size: 1rem;
            line-height: 1;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            color: #475569;
            transition: background 0.12s;
        }
        .count-btn:hover { background: #f1f5f9; }
        .count-val { font-weight: 700; font-size: 0.9rem; color: #1e293b; min-width: 20px; text-align: center; }

        @media (max-width: 768px) {
            .zones-grid { grid-template-columns: 1fr; }
            .info-bar { flex-wrap: wrap; }
        }
    `],
    template: `
        <p-toast />

        <!-- Page header -->
        <div class="page-header">
            <button class="count-btn" style="width:32px;height:32px;font-size:1.1rem" (click)="goBack()">
                <i class="pi pi-arrow-left"></i>
            </button>
            <div>
                <div class="page-title">Sơ đồ chỗ ngồi</div>
                <div class="page-subtitle" *ngIf="booking">
                    {{ booking.brideName || '-' }} &amp; {{ booking.groomName || '-' }}
                    &nbsp;—&nbsp;{{ hallName || 'Sảnh #' + booking.hallId }}
                    &nbsp;—&nbsp;{{ totalTables }} bàn
                </div>
            </div>
            <div class="spacer"></div>
            <button class="btn-save" (click)="saveLayout()">
                <i class="pi pi-save"></i> Lưu
            </button>
        </div>

        <!-- Info bar -->
        <div class="info-bar">
            <div class="info-card">
                <label>Khách hàng</label>
                <div class="info-value">{{ customerName || '-' }}</div>
            </div>
            <div class="info-card">
                <label>Sảnh</label>
                <div class="info-value">{{ hallName || (booking?.hallId ? 'Sảnh #' + booking?.hallId : '-') }}</div>
            </div>
            <div class="info-card">
                <label>Tổng bàn</label>
                <div class="info-value">{{ totalTables }} bàn</div>
            </div>
            <div class="info-card">
                <label>Ngày tổ chức</label>
                <div class="info-value">{{ formatDate(booking?.bookingDate) }}</div>
            </div>
        </div>

        <!-- Canvas -->
        <div class="layout-canvas" *ngIf="!loading">
            <div class="canvas-title">Sơ đồ bố trí {{ zones.length }} khu</div>

            <!-- Stage -->
            <div class="stage-row">
                <div class="stage-badge">SÂN KHẤU</div>
            </div>

            <!-- Zones -->
            <div class="zones-grid">
                <div
                    *ngFor="let z of zones"
                    class="zone-card"
                    [ngClass]="z.color"
                >
                    <div class="zone-header">
                        <div class="zone-name">{{ z.label }}</div>
                        <div class="zone-table-count">{{ z.tableCount }} bàn</div>
                    </div>

                    <!-- Table count -->
                    <div class="table-count-row">
                        <span class="table-count-label">Số bàn</span>
                        <div class="table-count-controls">
                            <button class="count-btn" (click)="decreaseTable(z)">−</button>
                            <span class="count-val">{{ z.tableCount }}</span>
                            <button class="count-btn" (click)="increaseTable(z)">+</button>
                        </div>
                    </div>

                    <!-- Side dropdown -->
                    <div class="field-group">
                        <div class="field-label">Bên</div>
                        <select class="field-select" [(ngModel)]="z.side" (ngModelChange)="onSideChange(z)">
                            <option value="GROOM">Nhà trai</option>
                            <option value="BRIDE">Nhà gái</option>
                        </select>
                    </div>

                    <!-- Guest group dropdown -->
                    <div class="field-group">
                        <div class="field-label">Nhóm khách</div>
                        <select class="field-select" [(ngModel)]="z.guestGroup">
                            <option value="FAMILY">Người thân</option>
                            <option value="FRIENDS">Bạn bè</option>
                            <option value="COLLEAGUE">Đồng nghiệp</option>
                            <option value="OTHER">Khác</option>
                        </select>
                    </div>

                    <!-- Chips preview -->
                    <div class="zone-chips">
                        <span class="zone-chip" [ngClass]="z.color">{{ sideLabel(z.side) }}</span>
                        <span class="zone-chip outline">{{ guestGroupLabel(z.guestGroup) }}</span>
                    </div>
                </div>
            </div>

            <!-- Legend -->
            <div class="legend-row">
                <div class="legend-item">
                    <div class="legend-box blue"></div>
                    <span>Nhà trai</span>
                </div>
                <div class="legend-item">
                    <div class="legend-box pink"></div>
                    <span>Nhà gái</span>
                </div>
            </div>
        </div>

        <div *ngIf="loading" style="text-align:center; padding:3rem; color:#64748b">
            Đang tải...
        </div>
    `,
})
export class SeatLayoutComponent implements OnInit {
    loading = false;
    booking: Booking | null = null;
    customerName = '';
    hallName = '';

    zones: ZoneConfig[] = [];

    get totalTables(): number {
        return this.zones.reduce((s, z) => s + z.tableCount, 0);
    }

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private bookingService: BookingService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isFinite(id) || id <= 0) { this.goBack(); return; }
        this.loadBooking(id);
    }

    private loadBooking(id: number) {
        this.loading = true;
        this.bookingService.getById(id).subscribe({
            next: (res) => {
                this.booking = res.data;
                const total = Number(this.booking?.expectedTables ?? this.booking?.tableCount ?? 0);
                this.buildZones(total > 0 ? total : 28);
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: () => { this.loading = false; this.goBack(); },
        });
    }

    /** Chia đều tổng bàn thành 4 khu A-D */
    private buildZones(total: number) {
        const base  = Math.floor(total / 4);
        const extra = total % 4;

        const zoneSetup: Array<{ id: string; label: string; side: ZoneConfig['side']; group: ZoneConfig['guestGroup']; color: 'blue' | 'pink' }> = [
            { id: 'A', label: 'Khu A', side: 'GROOM', group: 'FAMILY',   color: 'blue' },
            { id: 'B', label: 'Khu B', side: 'GROOM', group: 'FRIENDS',  color: 'blue' },
            { id: 'C', label: 'Khu C', side: 'BRIDE', group: 'FAMILY',   color: 'pink' },
            { id: 'D', label: 'Khu D', side: 'BRIDE', group: 'FRIENDS',  color: 'pink' },
        ];

        this.zones = zoneSetup.map((z, i) => ({
            id: z.id,
            label: z.label,
            tableCount: base + (i < extra ? 1 : 0),
            side: z.side,
            guestGroup: z.group,
            color: z.color,
        }));
    }

    onSideChange(zone: ZoneConfig) {
        zone.color = zone.side === 'GROOM' ? 'blue' : 'pink';
    }

    increaseTable(zone: ZoneConfig) { zone.tableCount++; }
    decreaseTable(zone: ZoneConfig) { if (zone.tableCount > 1) zone.tableCount--; }

    saveLayout() {
        // TODO: gọi API lưu zone layout
        this.messageService.add({
            severity: 'success',
            summary: 'Đã lưu',
            detail: `Sơ đồ chỗ ngồi đã được lưu (${this.totalTables} bàn, ${this.zones.length} khu).`,
            life: 3000,
        });
    }

    goBack() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) this.router.navigate(['/pages/booking', id]);
        else this.router.navigate(['/pages/booking']);
    }

    sideLabel(v: ZoneConfig['side']): string {
        return v === 'GROOM' ? 'Nhà trai' : 'Nhà gái';
    }

    guestGroupLabel(v: ZoneConfig['guestGroup']): string {
        return { FAMILY: 'Người thân', FRIENDS: 'Bạn bè', COLLEAGUE: 'Đồng nghiệp', OTHER: 'Khác' }[v] ?? v;
    }

    formatDate(value?: string): string {
        if (!value) return '-';
        return new Date(value).toLocaleDateString('vi-VN');
    }
}