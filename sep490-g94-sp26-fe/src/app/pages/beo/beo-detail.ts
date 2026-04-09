import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ToastModule } from 'primeng/toast';
import { TabsModule } from 'primeng/tabs';
import { CheckboxChangeEvent, CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { BookingService, Booking } from '../service/booking.service';
import { HallService } from '../service/hall.service';

export interface TaskItem {
    id: number;
    name: string;
    done: boolean;
    categoryKey: string;
    note?: string;
}

export interface TaskCategory {
    key: string;
    label: string;
    icon: string;
}

@Component({
    selector: 'app-beo-detail',
    standalone: true,
    imports: [
        CommonModule, FormsModule, RouterModule,
        ButtonModule, InputTextModule, SelectModule,
        TagModule, InputIconModule, IconFieldModule,
        ToastModule, TooltipModule, TabsModule,
        CheckboxModule, DialogModule,
    ],
    template: `
        <div class="card">
            <p-toast />

            <!-- Back + Header -->
            <div class="mb-5">
                <p-button
                    icon="pi pi-arrow-left"
                    label="Quay lại"
                    [text]="true"
                    severity="secondary"
                    (click)="goBack()"
                    styleClass="mb-3"
                />

                <ng-container *ngIf="booking(); else loadingHeader">
                    <div class="surface-card border-round-xl shadow-1 p-4">
                        <div class="flex items-start justify-between flex-wrap gap-3">
                            <div>
                                <div class="flex items-center gap-3 mb-2">
                                    <h2 class="text-2xl font-bold text-900 m-0">
                                        {{ booking()!.groomName }} & {{ booking()!.brideName }}
                                    </h2>
                                </div>
                                <div class="flex items-center gap-4 flex-wrap">
                                    <span class="text-xs font-semibold px-2 py-1 border-round surface-200 text-600">
                                        {{ booking()!.contractNo ?? booking()!.bookingNo ?? ('#' + booking()!.id) }}
                                    </span>
                                    <span class="text-sm text-500 flex items-center gap-1">
                                        <i class="pi pi-calendar text-xs"></i>
                                        {{ formatDate(booking()!.bookingDate ?? booking()!.eventDate) }}
                                        — {{ getShiftLabel(booking()!.shift ?? booking()!.bookingTime) }}
                                    </span>
                                    <span class="text-sm text-500 flex items-center gap-1">
                                        <i class="pi pi-building text-xs"></i>
                                        {{ getHallLabel(booking()!) }}
                                    </span>
                                </div>
                            </div>

                            <!-- Overall progress -->
                            <div class="text-right" style="min-width:140px;">
                                <div class="text-sm text-500 mb-1">Tiến độ tổng thể</div>
                                <div class="text-2xl font-bold text-primary mb-1">
                                    {{ doneCount }}/{{ tasks().length }}
                                </div>
                                <div class="w-full border-round overflow-hidden" style="height:6px;background:#e2e8f0;">
                                    <div
                                        class="border-round"
                                        style="height:100%;background:linear-gradient(90deg,#6c63ff,#a78bfa);transition:width 0.4s;"
                                        [style.width]="overallPercent + '%'"
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ng-container>
                <ng-template #loadingHeader>
                    <div class="surface-card border-round-xl shadow-1 p-4 text-center text-500">
                        <i class="pi pi-spin pi-spinner text-2xl"></i>
                    </div>
                </ng-template>
            </div>

            <!-- Tab content -->
            <div class="surface-card border-round-xl shadow-1 overflow-hidden">
                <p-tabs [(value)]="activeTabKey">

                    <p-tablist>
                        <p-tab *ngFor="let cat of categories" [value]="cat.key">
                            <span class="flex items-center gap-2">
                                <i [class]="'pi ' + cat.icon"></i>
                                <span>{{ cat.label }}</span>
                                <span
                                    *ngIf="getTasksForCat(cat.key).length"
                                    class="text-xs font-semibold px-2 py-1 border-round"
                                    style="background:#ede9fe;color:#4f46e5;"
                                >
                                    {{ getDoneForCat(cat.key) }}/{{ getTasksForCat(cat.key).length }}
                                </span>
                            </span>
                        </p-tab>

                        <!-- Add category button -->
                        <p-tab value="__add__" styleClass="add-cat-tab">
                            <span
                                class="flex items-center gap-1"
                                style="color:#94a3b8;font-size:0.85rem;"
                                (click)="openAddCategory($event)"
                            >
                                <i class="pi pi-plus-circle"></i>
                                <span>Thêm mục</span>
                            </span>
                        </p-tab>
                    </p-tablist>

                    <p-tabpanels>
                        <p-tabpanel *ngFor="let cat of categories" [value]="cat.key">
                            <!-- Only render content when this tab is active -->
                            <div *ngIf="activeTabKey === cat.key" class="p-4">

                                <!-- Add task input -->
                                <div class="flex items-center gap-2 mb-4">
                                    <input
                                        pInputText
                                        type="text"
                                        [(ngModel)]="newTaskNameMap[cat.key]"
                                        (keydown.enter)="addTask(cat.key)"
                                        [placeholder]="'Thêm ' + cat.label.toLowerCase() + '...'"
                                        style="flex:1;"
                                    />
                                    <p-button
                                        icon="pi pi-plus"
                                        severity="primary"
                                        [rounded]="true"
                                        (click)="addTask(cat.key)"
                                        pTooltip="Thêm"
                                        tooltipPosition="top"
                                    />
                                </div>

                                <!-- Task list for this category -->
                                <ng-container *ngIf="getTasksForCat(cat.key).length; else emptyState">
                                    <div
                                        *ngFor="let task of getTasksForCat(cat.key); trackBy: trackById"
                                        class="flex items-center gap-3 py-3 border-bottom-1 surface-border"
                                        [class.opacity-60]="task.done"
                                    >
                                        <p-checkbox
                                            [ngModel]="task.done"
                                            [binary]="true"
                                            (onChange)="onTaskToggle(task, $event)"
                                        />
                                        <span
                                            class="flex-1 text-sm text-900"
                                            [class.line-through]="task.done"
                                            [class.text-400]="task.done"
                                        >
                                            {{ task.name }}
                                        </span>
                                        <p-button
                                            icon="pi pi-trash"
                                            [text]="true"
                                            [rounded]="true"
                                            severity="danger"
                                            size="small"
                                            (click)="removeTask(task)"
                                            pTooltip="Xóa"
                                            tooltipPosition="top"
                                        />
                                    </div>
                                </ng-container>

                                <ng-template #emptyState>
                                    <div class="text-center py-8 text-500">
                                        <i class="pi pi-inbox text-4xl mb-3 block text-300"></i>
                                        <div class="text-sm">Chưa có mục nào.</div>
                                        <div class="text-xs text-400 mt-1">Nhập tên và nhấn + để thêm</div>
                                    </div>
                                </ng-template>

                            </div>
                        </p-tabpanel>

                        <!-- Dummy panel for __add__ tab -->
                        <p-tabpanel value="__add__"></p-tabpanel>
                    </p-tabpanels>

                </p-tabs>
            </div>
        </div>

        <!-- Dialog: Add category -->
        <p-dialog
            header="Thêm nhóm công việc"
            [(visible)]="showAddCategoryDialog"
            [modal]="true"
            [style]="{ width: '380px' }"
            [draggable]="false"
            [resizable]="false"
        >
            <div class="flex flex-column gap-3 pt-2">
                <div>
                    <label class="text-sm font-semibold text-700 mb-1 block">Tên nhóm</label>
                    <input
                        pInputText
                        type="text"
                        [(ngModel)]="newCategoryLabel"
                        placeholder="VD: Trang trí, Âm nhạc..."
                        class="w-full"
                        (keydown.enter)="confirmAddCategory()"
                    />
                </div>
                <div>
                    <label class="text-sm font-semibold text-700 mb-2 block">Chọn icon</label>
                    <div class="flex flex-wrap gap-2">
                        <button
                            *ngFor="let ic of iconOptions"
                            type="button"
                            class="flex align-items-center justify-content-center border-round cursor-pointer"
                            style="width:36px;height:36px;border:1.5px solid;transition:all 0.15s;background:none;"
                            [style.border-color]="newCategoryIcon === ic ? '#6c63ff' : '#e2e8f0'"
                            [style.background]="newCategoryIcon === ic ? '#ede9fe' : 'transparent'"
                            (click)="newCategoryIcon = ic"
                        >
                            <i [class]="'pi ' + ic" [style.color]="newCategoryIcon === ic ? '#4f46e5' : '#94a3b8'"></i>
                        </button>
                    </div>
                </div>
            </div>

            <ng-template pTemplate="footer">
                <p-button
                    label="Hủy"
                    [text]="true"
                    severity="secondary"
                    (click)="showAddCategoryDialog = false"
                />
                <p-button
                    label="Thêm nhóm"
                    severity="primary"
                    [disabled]="!newCategoryLabel.trim()"
                    (click)="confirmAddCategory()"
                />
            </ng-template>
        </p-dialog>
    `,
    styles: [`
        :host ::ng-deep {
            .p-tabs .p-tablist { border-bottom: 1px solid #e2e8f0; }
            .p-tabs .p-tab { padding: 0.85rem 1.1rem; font-size: 0.875rem; font-weight: 500; }
            .p-tabpanels { padding: 0; }
            .p-checkbox { flex-shrink: 0; }

            .add-cat-tab { opacity: 1 !important; }
            .add-cat-tab.p-tab-active {
                border-bottom-color: transparent !important;
                color: #94a3b8 !important;
            }
        }
    `],
    providers: [MessageService, BookingService],
})
export class BeoDetailComponent implements OnInit {

    booking = signal<Booking | null>(null);
    tasks   = signal<TaskItem[]>([]);

    activeTabKey = 'thucdon';

    newTaskNameMap: Record<string, string> = {
        thucdon: '',
        dichvu:  '',
    };

    categories: TaskCategory[] = [
        { key: 'thucdon', label: 'Thực đơn', icon: 'pi-th-large' },
        { key: 'dichvu',  label: 'Dịch vụ',  icon: 'pi-star'     },
    ];

    showAddCategoryDialog = false;
    newCategoryLabel = '';
    newCategoryIcon  = 'pi-bookmark';

    iconOptions = [
        'pi-bookmark', 'pi-heart',   'pi-camera',  'pi-music',
        'pi-car',      'pi-gift',    'pi-palette',  'pi-users',
        'pi-home',     'pi-globe',   'pi-bolt',     'pi-flag',
        'pi-phone',    'pi-map',     'pi-image',    'pi-video',
    ];

    private bookingId!: number;
    private hallNameMap: Record<number, string> = {};

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private bookingService: BookingService,
        private hallService: HallService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.bookingId = Number(this.route.snapshot.paramMap.get('id'));
        this.loadBooking();
        this.loadTasks();
    }

    loadBooking() {
        // TODO: load booking by this.bookingId
    }

    private loadHallName(hallId: number) {
        this.hallService.getHallById(hallId).subscribe({
            next: (res) => {
                if (res.data?.name) {
                    this.hallNameMap[hallId] = res.data.name;
                    this.cdr.markForCheck();
                }
            },
            error: () => {},
        });
    }

    loadTasks() {
        // TODO: replace with real API
        this.tasks.set([]);
    }

    // ── Category management ───────────────────────────────────────────────────
    openAddCategory(event: Event) {
        event.stopPropagation();
        const last = this.categories[this.categories.length - 1];
        if (last) setTimeout(() => { this.activeTabKey = last.key; this.cdr.markForCheck(); }, 0);
        this.newCategoryLabel = '';
        this.newCategoryIcon  = 'pi-bookmark';
        this.showAddCategoryDialog = true;
    }

    confirmAddCategory() {
        const label = this.newCategoryLabel.trim();
        if (!label) return;
        const key = 'cat_' + Date.now();
        this.categories = [...this.categories, { key, label, icon: this.newCategoryIcon }];
        this.newTaskNameMap[key] = '';
        this.showAddCategoryDialog = false;
        setTimeout(() => { this.activeTabKey = key; this.cdr.markForCheck(); }, 0);
    }

    // ── Task actions ──────────────────────────────────────────────────────────
    addTask(catKey: string) {
        const name = (this.newTaskNameMap[catKey] ?? '').trim();
        if (!name) return;
        this.tasks.update(prev => [...prev, {
            id: Date.now(), name, done: false, categoryKey: catKey,
        }]);
        this.newTaskNameMap[catKey] = '';
        this.cdr.markForCheck();
    }

    removeTask(task: TaskItem) {
        this.tasks.update(prev => prev.filter(t => t.id !== task.id));
        this.cdr.markForCheck();
    }

    onTaskToggle(task: TaskItem, event: CheckboxChangeEvent) {
    this.tasks.update(prev =>
        prev.map(t => t.id === task.id ? { ...t, done: !!event.checked } : t)
    );
    this.cdr.markForCheck();
    }

    trackById(_: number, item: TaskItem) { return item.id; }

    // ── Derived helpers ───────────────────────────────────────────────────────
    getTasksForCat(key: string): TaskItem[] {
        return this.tasks().filter(t => t.categoryKey === key);
    }

    getDoneForCat(key: string): number {
        return this.getTasksForCat(key).filter(t => t.done).length;
    }

    get doneCount() { return this.tasks().filter(t => t.done).length; }
    get overallPercent() {
        const total = this.tasks().length;
        return total ? Math.round((this.doneCount / total) * 100) : 0;
    }

    // ── Navigation ────────────────────────────────────────────────────────────
    goBack() { this.router.navigate(['/pages/beo']); }

    // ── Helpers ───────────────────────────────────────────────────────────────
    formatDate(d?: string): string {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('vi-VN');
    }

    getHallLabel(booking: Booking): string {
        if (booking.hallName) return booking.hallName;
        const cached = this.hallNameMap[Number(booking.hallId)];
        return cached ?? (booking.hallId ? `Sảnh #${booking.hallId}` : '-');
    }

    getShiftLabel(shift?: string): string {
        const m: Record<string, string> = {
            SLOT_1:    'Ca sáng (10:00 - 14:00)',
            SLOT_2:    'Ca chiều (17:00 - 21:00)',
            SLOT_3:    'Cả ngày (09:00 - 17:00)',
            AFTERNOON: 'Ca sáng (10:00 - 14:00)',
            EVENING:   'Ca chiều (17:00 - 21:00)',
            FULL_DAY:  'Cả ngày (09:00 - 17:00)',
        };
        return m[shift ?? ''] ?? shift ?? '-';
    }
}