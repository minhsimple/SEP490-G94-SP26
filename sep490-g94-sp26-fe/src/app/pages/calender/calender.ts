import {
    Component,
    OnInit,
    OnChanges,
    signal,
    computed,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface CalendarEvent {
    id: number;
    date: string;           // 'YYYY-MM-DD'
    groomName: string;
    brideName: string;
    hallId?: number;
    hallName: string;
    branchName: string;
    /** SLOT_1 = Trưa 10-14h | SLOT_2 = Tối 17-21h | SLOT_3 = Cả ngày */
    shift: 'SLOT_1' | 'SLOT_2' | 'SLOT_3';
    tableCount: number;
    status?: string;
}

export interface HallLegend {
    hallName: string;
    branchName: string;
    color: string;
}

interface CalendarCell {
    date: Date;
    dateStr: string;
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    events: CalendarEvent[];
}

interface HallPalette {
    bg: string;
    text: string;
    listBg: string;
    listBorder: string;
    dotColor: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

@Component({
    selector: 'app-event-calendar',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FormsModule, SelectModule, TooltipModule],
    template: `
<div class="ec-root">

    <!-- ═══════════════════════════════════════════════════════
         TOOLBAR
    ═══════════════════════════════════════════════════════ -->
    <div class="ec-toolbar">
        <span class="ec-toolbar-label">Lịch sự kiện và điều phối</span>

        <div class="ec-toolbar-right">
            <p-select
                [options]="branchOptions"
                [(ngModel)]="filterBranch"
                optionLabel="label"
                optionValue="value"
                placeholder="Tất cả cơ sở"
                [showClear]="true"
                (onChange)="onFilter()"
                styleClass="ec-pselect"
            />
            <p-select
                [options]="hallOptions"
                [(ngModel)]="filterHall"
                optionLabel="label"
                optionValue="value"
                placeholder="Tất cả sảnh"
                [showClear]="true"
                (onChange)="onFilter()"
                styleClass="ec-pselect"
            />

            <div class="ec-view-toggle">
                <button
                    class="ec-vtoggle-btn"
                    [class.is-active]="currentView() === 'grid'"
                    (click)="setView('grid')"
                    pTooltip="Dạng lưới" tooltipPosition="top"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                    </svg>
                </button>
                <button
                    class="ec-vtoggle-btn"
                    [class.is-active]="currentView() === 'list'"
                    (click)="setView('list')"
                    pTooltip="Dạng danh sách" tooltipPosition="top"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                        <line x1="8" y1="6" x2="21" y2="6"/>
                        <line x1="8" y1="12" x2="21" y2="12"/>
                        <line x1="8" y1="18" x2="21" y2="18"/>
                        <circle cx="3" cy="6" r="1.2" fill="currentColor" stroke="none"/>
                        <circle cx="3" cy="12" r="1.2" fill="currentColor" stroke="none"/>
                        <circle cx="3" cy="18" r="1.2" fill="currentColor" stroke="none"/>
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════
         CARD
    ═══════════════════════════════════════════════════════ -->
    <div class="ec-card">

        <!-- Month nav bar -->
        <div class="ec-monthbar">
            <button class="ec-mnav-btn" (click)="changeMonth(-1)">&#8249;</button>
            <span class="ec-month-label">
                tháng {{ monthPadded(currentMonth()) }}, {{ currentYear() }}
            </span>
            <button class="ec-mnav-btn" (click)="changeMonth(1)">&#8250;</button>

            @if (currentView() === 'list') {
                <button class="ec-filterday-btn">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    Lọc theo ngày
                </button>
            }
        </div>

        <!-- Loading -->
        @if (loading) {
            <div class="ec-loading">
                <div class="ec-spinner"></div>
            </div>
        }

        <!-- ═══════════════════════════════════════
             GRID VIEW
        ═══════════════════════════════════════ -->
        @if (currentView() === 'grid') {
            <div class="ec-grid-view">
                <div class="ec-dow-row">
                    @for (d of DOW_LABELS; track d) {
                        <div class="ec-dow">{{ d }}</div>
                    }
                </div>

                <div class="ec-cells">
                    @for (cell of calendarCells(); track cell.dateStr) {
                        <div
                            class="ec-cell"
                            [class.ec-cell--other]="!cell.isCurrentMonth"
                            [class.ec-cell--today]="cell.isToday"
                            [class.ec-cell--has-event]="cell.events.length > 0"
                            (click)="handleCellClick(cell)"
                        >
                            <div class="ec-cell-head">
                                <span class="ec-cell-day">{{ cell.dayNumber }}</span>
                                @if (cell.events.length > 0) {
                                    <span class="ec-cell-badge">{{ cell.events.length }} SK</span>
                                }
                            </div>

                            @for (ev of cell.events; track ev.id) {
                                <div
                                    class="ec-chip"
                                    [style.background]="chipBg(ev)"
                                    [style.color]="chipText(ev)"
                                    [pTooltip]="ev.groomName + ' & ' + ev.brideName"
                                    tooltipPosition="top"
                                    (click)="handleEventClick(ev, $event)"
                                >
                                    <span class="ec-chip-hall">{{ ev.hallName }}</span>
                                    <span class="ec-chip-shift">- {{ shiftShort(ev.shift) }}</span>
                                </div>
                            }
                        </div>
                    }
                </div>

                <!-- Legend -->
                <div class="ec-legend">
                    @for (h of autoLegend(); track h.hallName) {
                        <div class="ec-legend-item">
                            <span class="ec-legend-dot" [style.background]="h.color"></span>
                            <span>{{ h.hallName }} ({{ h.branchName }})</span>
                        </div>
                    }
                </div>
            </div>
        }

        <!-- ═══════════════════════════════════════
             LIST VIEW
        ═══════════════════════════════════════ -->
        @if (currentView() === 'list') {
            <div class="ec-list-view">

                @if (listEvents().length === 0) {
                    <div class="ec-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                            <rect x="3" y="4" width="18" height="18" rx="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <p>Không có sự kiện trong tháng này</p>
                    </div>
                }

                @for (ev of listEvents(); track ev.id) {
                    <div
                        class="ec-list-item"
                        [style.border-left-color]="listBorder(ev)"
                        [style.background]="listBg(ev)"
                        (click)="handleEventClick(ev, $event)"
                    >
                        <div class="ec-li-date">
                            <div class="ec-li-day" [style.color]="listDayColor(ev)">{{ dayOfDate(ev.date) }}</div>
                            <div class="ec-li-weekday">{{ weekdayOf(ev.date) }}</div>
                        </div>

                        <div class="ec-li-body">
                            <div class="ec-li-title">{{ ev.groomName }} &amp; {{ ev.brideName }}</div>
                            <div class="ec-li-meta">
                                <span class="ec-li-meta-item">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    {{ shiftTime(ev.shift) }}
                                </span>
                                <span class="ec-li-meta-item">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                        <polyline points="9 22 9 12 15 12 15 22"/>
                                    </svg>
                                    {{ ev.hallName }}
                                </span>
                                <span class="ec-li-meta-item">{{ ev.branchName }}</span>
                            </div>
                        </div>

                        <div class="ec-li-right">
                            <div class="ec-li-tables">{{ ev.tableCount }} bàn</div>
                            <div class="ec-li-shiftlabel">{{ shiftShort(ev.shift) }}</div>
                        </div>
                    </div>
                }
            </div>
        }

        <div class="ec-footnote">
            * Mỗi sảnh tối đa 2 sự kiện/ngày: Trưa (10:00-14:00) và Tối (17:00-21:00)
        </div>
    </div>
</div>
    `,
    styles: [`
        :host { display: block; font-family: 'Be Vietnam Pro', 'Segoe UI', sans-serif; }

        /* ── Root ─────────────────────────────────────────────────────────── */
        .ec-root {
            padding: 20px 24px;
            background: #f1f5f9;
            min-height: 100vh;
        }

        /* ── Toolbar ──────────────────────────────────────────────────────── */
        .ec-toolbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 16px;
        }
        .ec-toolbar-label { font-size: 13px; color: #64748b; }
        .ec-toolbar-right { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }

        /* PrimeNG select */
        :host ::ng-deep .ec-pselect .p-select {
            width: 180px;
            height: 34px;
            font-size: 13px;
            border-color: #e2e8f0;
            border-radius: 8px;
        }

        /* ── View toggle ──────────────────────────────────────────────────── */
        .ec-view-toggle {
            display: flex;
            border: 0.5px solid #e2e8f0;
            border-radius: 8px;
            overflow: hidden;
        }
        .ec-vtoggle-btn {
            width: 34px; height: 34px;
            display: flex; align-items: center; justify-content: center;
            background: #fff;
            border: none;
            cursor: pointer;
            color: #94a3b8;
            transition: background 0.14s, color 0.14s;
        }
        .ec-vtoggle-btn svg { width: 16px; height: 16px; }
        .ec-vtoggle-btn:first-child { border-right: 0.5px solid #e2e8f0; }
        .ec-vtoggle-btn:hover { background: #f8fafc; color: #475569; }
        .ec-vtoggle-btn.is-active { background: #2563eb; color: #fff; }

        /* ── Card ─────────────────────────────────────────────────────────── */
        .ec-card {
            background: #fff;
            border: 0.5px solid #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            position: relative;
        }

        /* ── Month nav bar ────────────────────────────────────────────────── */
        .ec-monthbar {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 14px 20px;
            border-bottom: 0.5px solid #f1f5f9;
        }
        .ec-mnav-btn {
            width: 28px; height: 28px;
            border-radius: 6px;
            border: 0.5px solid #e2e8f0;
            background: #fff;
            font-size: 18px;
            color: #64748b;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            transition: background 0.12s;
        }
        .ec-mnav-btn:hover { background: #f8fafc; }
        .ec-month-label {
            font-size: 15px;
            font-weight: 500;
            color: #1e293b;
            min-width: 140px;
        }
        .ec-filterday-btn {
            margin-left: auto;
            display: flex; align-items: center; gap: 6px;
            background: #fff;
            border: 0.5px solid #e2e8f0;
            border-radius: 8px;
            padding: 6px 12px;
            font-size: 13px;
            color: #64748b;
            cursor: pointer;
            font-family: inherit;
            transition: background 0.12s;
        }
        .ec-filterday-btn:hover { background: #f8fafc; }

        /* ── Loading ──────────────────────────────────────────────────────── */
        .ec-loading {
            position: absolute; inset: 0;
            background: rgba(255,255,255,0.65);
            display: flex; align-items: center; justify-content: center;
            z-index: 10;
        }
        .ec-spinner {
            width: 28px; height: 28px;
            border: 2.5px solid #e2e8f0;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: ec-spin 0.7s linear infinite;
        }
        @keyframes ec-spin { to { transform: rotate(360deg); } }

        /* ── Grid – Day of week ───────────────────────────────────────────── */
        .ec-dow-row {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            border-bottom: 0.5px solid #e2e8f0;
        }
        .ec-dow {
            text-align: center;
            font-size: 11px;
            font-weight: 600;
            color: #94a3b8;
            padding: 10px 0;
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }

        /* ── Grid – Cells ─────────────────────────────────────────────────── */
        .ec-cells {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
        }
        .ec-cell {
            border-right: 0.5px solid #f1f5f9;
            border-bottom: 0.5px solid #f1f5f9;
            min-height: 100px;
            padding: 6px 8px;
            cursor: pointer;
            transition: background 0.1s;
        }
        .ec-cell:nth-child(7n) { border-right: none; }
        .ec-cell:hover { background: #f8fafc; }
        .ec-cell--other { opacity: 0.38; pointer-events: none; }
        .ec-cell--has-event { background: #fafcff; }
        .ec-cell--has-event:hover { background: #f0f6ff; }
        .ec-cell--today .ec-cell-day {
            background: #2563eb;
            color: #fff !important;
            border-radius: 50%;
        }
        .ec-cell-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 4px;
        }
        .ec-cell-day {
            font-size: 13px;
            color: #334155;
            width: 24px; height: 24px;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
        }
        .ec-cell-badge { font-size: 10px; color: #94a3b8; font-weight: 500; }

        /* ── Chip ─────────────────────────────────────────────────────────── */
        .ec-chip {
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 11px;
            font-weight: 500;
            margin-bottom: 3px;
            display: flex; align-items: center; gap: 2px;
            overflow: hidden;
            cursor: pointer;
            transition: opacity 0.12s, transform 0.1s;
        }
        .ec-chip:hover { opacity: 0.82; transform: translateX(1px); }
        .ec-chip:last-child { margin-bottom: 0; }
        .ec-chip-hall {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
        }
        .ec-chip-shift {
            flex-shrink: 0;
            font-size: 10px;
            opacity: 0.9;
            white-space: nowrap;
        }

        /* ── Legend ───────────────────────────────────────────────────────── */
        .ec-legend {
            display: flex; flex-wrap: wrap; gap: 10px 16px;
            padding: 14px 20px;
            border-top: 0.5px solid #f1f5f9;
        }
        .ec-legend-item {
            display: flex; align-items: center; gap: 6px;
            font-size: 11px; color: #64748b;
        }
        .ec-legend-dot {
            width: 10px; height: 10px;
            border-radius: 50%;
            flex-shrink: 0;
        }

        /* ── List view ────────────────────────────────────────────────────── */
        .ec-list-view { padding: 6px 0; }
        .ec-empty {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            padding: 60px 20px;
            color: #94a3b8;
            font-size: 14px; gap: 14px; opacity: 0.6;
        }
        .ec-list-item {
            display: flex; align-items: center; gap: 16px;
            padding: 14px 20px;
            border-bottom: 0.5px solid #f1f5f9;
            border-left: 3px solid transparent;
            cursor: pointer;
            transition: filter 0.1s;
        }
        .ec-list-item:hover { filter: brightness(0.97); }
        .ec-list-item:last-child { border-bottom: none; }
        .ec-li-date { text-align: center; min-width: 48px; flex-shrink: 0; }
        .ec-li-day { font-size: 22px; font-weight: 500; line-height: 1; }
        .ec-li-weekday {
            font-size: 10px; color: #94a3b8;
            text-transform: uppercase; letter-spacing: 0.06em; margin-top: 3px;
        }
        .ec-li-body { flex: 1; min-width: 0; }
        .ec-li-title {
            font-size: 14px; font-weight: 500; color: #1e293b;
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .ec-li-meta {
            display: flex; align-items: center;
            flex-wrap: wrap; gap: 6px 12px;
            margin-top: 4px; font-size: 12px; color: #64748b;
        }
        .ec-li-meta-item { display: flex; align-items: center; gap: 4px; white-space: nowrap; }
        .ec-li-right { text-align: right; flex-shrink: 0; }
        .ec-li-tables { font-size: 14px; font-weight: 500; color: #1e293b; }
        .ec-li-shiftlabel { font-size: 12px; color: #94a3b8; margin-top: 2px; }

        /* ── Footnote ─────────────────────────────────────────────────────── */
        .ec-footnote {
            padding: 10px 20px;
            border-top: 0.5px solid #f1f5f9;
            font-size: 11px; color: #94a3b8;
        }
    `],
})
export class EventCalendarComponent implements OnInit, OnChanges {

    // ── Inputs / Outputs ──────────────────────────────────────────────────────
    @Input() events: CalendarEvent[] = [];
    @Input() legends: HallLegend[] = [];
    @Input() loading = false;

    @Output() eventClick  = new EventEmitter<CalendarEvent>();
    @Output() cellClick   = new EventEmitter<{ date: string; events: CalendarEvent[] }>();
    @Output() monthChange = new EventEmitter<{ year: number; month: number }>();

    // ── State ─────────────────────────────────────────────────────────────────
    currentView  = signal<'grid' | 'list'>('grid');
    currentYear  = signal(new Date().getFullYear());
    currentMonth = signal(new Date().getMonth());

    filterBranch: string | null = null;
    filterHall:   string | null = null;

    branchOptions: { label: string; value: string }[] = [];
    hallOptions:   { label: string; value: string }[] = [];

    readonly DOW_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // ── Hall colour palette ───────────────────────────────────────────────────
    private readonly HALL_PALETTES: Record<string, HallPalette> = {
        'Sảnh Grand Pearl':     { bg: '#dbeafe', text: '#1e40af', listBg: '#eff6ff',  listBorder: '#3b82f6', dotColor: '#3b82f6' },
        'Sảnh Sapphire':        { bg: '#fef9c3', text: '#713f12', listBg: '#fffbeb',  listBorder: '#f59e0b', dotColor: '#f59e0b' },
        'Sảnh Hoàng Hà':        { bg: '#fce7f3', text: '#9d174d', listBg: '#fdf2f8',  listBorder: '#ec4899', dotColor: '#ec4899' },
        'Sảnh Bạch Kim':        { bg: '#fce7f3', text: '#831843', listBg: '#fff1f2',  listBorder: '#f43f5e', dotColor: '#f43f5e' },
        'Sảnh Ruby':            { bg: '#fee2e2', text: '#991b1b', listBg: '#fef2f2',  listBorder: '#ef4444', dotColor: '#ef4444' },
        'Sảnh Ngọc Trai':       { bg: '#ede9fe', text: '#5b21b6', listBg: '#f5f3ff',  listBorder: '#8b5cf6', dotColor: '#8b5cf6' },
        'Sảnh Emerald':         { bg: '#dcfce7', text: '#166534', listBg: '#f0fdf4',  listBorder: '#22c55e', dotColor: '#22c55e' },
        'Sảnh Sen Trắng':       { bg: '#d1fae5', text: '#065f46', listBg: '#ecfdf5',  listBorder: '#10b981', dotColor: '#10b981' },
        'Sảnh Diamond':         { bg: '#ffedd5', text: '#9a3412', listBg: '#fff7ed',  listBorder: '#f97316', dotColor: '#f97316' },
        'Sảnh Hoàng Kim':       { bg: '#fef3c7', text: '#92400e', listBg: '#fffbeb',  listBorder: '#d97706', dotColor: '#d97706' },
        'Sảnh Hồ Tây Panorama': { bg: '#e0f2fe', text: '#075985', listBg: '#f0f9ff',  listBorder: '#0ea5e9', dotColor: '#0ea5e9' },
    };

    private readonly DEFAULT_PALETTE: HallPalette =
        { bg: '#e2e8f0', text: '#334155', listBg: '#f8fafc', listBorder: '#94a3b8', dotColor: '#94a3b8' };

    // ── Computed ──────────────────────────────────────────────────────────────

    filteredEvents = computed(() =>
        this.events.filter(ev => {
            if (this.filterBranch && ev.branchName !== this.filterBranch) return false;
            if (this.filterHall   && ev.hallName   !== this.filterHall)   return false;
            return true;
        })
    );

    calendarCells = computed((): CalendarCell[] => {
        const year  = this.currentYear();
        const month = this.currentMonth();
        const today = new Date();

        const firstDay    = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevDays    = new Date(year, month, 0).getDate();

        const evMap: Record<string, CalendarEvent[]> = {};
        this.filteredEvents()
            .filter(ev => {
                const d = new Date(ev.date);
                return d.getFullYear() === year && d.getMonth() === month;
            })
            .forEach(ev => { (evMap[ev.date] ??= []).push(ev); });

        const mkCell = (d: Date, isCurrent: boolean): CalendarCell => {
            const ds = this.fmt(d);
            return {
                date: d, dateStr: ds, dayNumber: d.getDate(),
                isCurrentMonth: isCurrent,
                isToday:
                    today.getFullYear() === d.getFullYear() &&
                    today.getMonth()    === d.getMonth()    &&
                    today.getDate()     === d.getDate(),
                events: evMap[ds] ?? [],
            };
        };

        const cells: CalendarCell[] = [];
        for (let i = 0; i < firstDay; i++)
            cells.push(mkCell(new Date(year, month - 1, prevDays - firstDay + 1 + i), false));
        for (let d = 1; d <= daysInMonth; d++)
            cells.push(mkCell(new Date(year, month, d), true));
        const rem = (firstDay + daysInMonth) % 7;
        for (let d = 1; d <= (rem === 0 ? 0 : 7 - rem); d++)
            cells.push(mkCell(new Date(year, month + 1, d), false));

        return cells;
    });

    listEvents = computed(() => {
        const y = this.currentYear(), m = this.currentMonth();
        return this.filteredEvents()
            .filter(ev => {
                const d = new Date(ev.date);
                return d.getFullYear() === y && d.getMonth() === m;
            })
            .sort((a, b) =>
                a.date.localeCompare(b.date) ||
                this.shiftOrder(a.shift) - this.shiftOrder(b.shift)
            );
    });

    autoLegend = computed((): HallLegend[] => {
        if (this.legends.length) return this.legends;
        const seen = new Set<string>();
        return this.events
            .filter(ev => { const ok = !seen.has(ev.hallName); seen.add(ev.hallName); return ok; })
            .map(ev => ({
                hallName:   ev.hallName,
                branchName: ev.branchName,
                color:      this.getPalette(ev.hallName).dotColor,
            }));
    });

    // ── Lifecycle ─────────────────────────────────────────────────────────────

    constructor(private cdr: ChangeDetectorRef) {}

    ngOnInit() { this.buildFilterOptions(); }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['events']) this.buildFilterOptions();
        this.cdr.markForCheck();
    }

    // ── Actions ───────────────────────────────────────────────────────────────

    setView(v: 'grid' | 'list') { this.currentView.set(v); }

    changeMonth(dir: number) {
        let m = this.currentMonth() + dir, y = this.currentYear();
        if (m < 0)  { m = 11; y--; }
        if (m > 11) { m = 0;  y++; }
        this.currentMonth.set(m);
        this.currentYear.set(y);
        this.monthChange.emit({ year: y, month: m });
    }

    onFilter() { this.cdr.markForCheck(); }

    handleCellClick(cell: CalendarCell) {
        this.cellClick.emit({ date: cell.dateStr, events: cell.events });
    }

    handleEventClick(ev: CalendarEvent, e: Event) {
        e.stopPropagation();
        this.eventClick.emit(ev);
    }

    // ── Colour helpers ────────────────────────────────────────────────────────

    getPalette(hallName: string): HallPalette {
        return this.HALL_PALETTES[hallName] ?? this.DEFAULT_PALETTE;
    }

    chipBg(ev: CalendarEvent)      { return this.getPalette(ev.hallName).bg; }
    chipText(ev: CalendarEvent)    { return this.getPalette(ev.hallName).text; }
    listBg(ev: CalendarEvent)      { return this.getPalette(ev.hallName).listBg; }
    listBorder(ev: CalendarEvent)  { return this.getPalette(ev.hallName).listBorder; }
    listDayColor(ev: CalendarEvent){ return this.getPalette(ev.hallName).listBorder; }

    // ── Label helpers ─────────────────────────────────────────────────────────

    shiftShort(shift: string): string {
        return ({ SLOT_1: 'Trưa', SLOT_2: 'Tối', SLOT_3: 'Cả ngày' } as Record<string, string>)[shift] ?? shift;
    }

    shiftTime(shift: string): string {
        return ({ SLOT_1: '10:00', SLOT_2: '17:00', SLOT_3: '09:00' } as Record<string, string>)[shift] ?? '--:--';
    }

    shiftOrder(shift: string): number {
        return ({ SLOT_1: 0, SLOT_2: 1, SLOT_3: 2 } as Record<string, number>)[shift] ?? 9;
    }

    dayOfDate(ds: string)  { return new Date(ds).getDate(); }
    weekdayOf(ds: string)  { return this.DOW_LABELS[new Date(ds).getDay()]; }
    monthPadded(m: number) { return String(m + 1).padStart(2, '0'); }

    // ── Private ───────────────────────────────────────────────────────────────

    private fmt(d: Date): string {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }

    private buildFilterOptions() {
        this.branchOptions = [...new Set(this.events.map(e => e.branchName))]
            .sort().map(b => ({ label: b, value: b }));
        this.hallOptions = [...new Set(this.events.map(e => e.hallName))]
            .sort().map(h => ({ label: h, value: h }));
    }
}