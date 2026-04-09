import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { BookingService, Booking } from '../service/booking.service';
import { HallService } from '../service/hall.service';

export interface TaskItem {
    id: number;
    name: string;
    done: boolean;
    categoryKey: string;
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
        ButtonModule, InputTextModule,
        ToastModule, TooltipModule,
        CheckboxModule, DialogModule,
    ],
    template: `
        <p-toast />

        <div style="max-width:960px; margin:0 auto; padding:24px 16px;">

            <!-- Back -->
            <div class="mb-4">
                <button
                    class="flex items-center gap-2 text-sm text-600 cursor-pointer bg-transparent border-none p-0"
                    style="font-size:0.875rem;color:#64748b;"
                    (click)="goBack()"
                >
                    <i class="pi pi-arrow-left" style="font-size:0.8rem;"></i>
                    Quay lại
                </button>
            </div>

            <!-- Header card -->
            <ng-container *ngIf="booking(); else loadingHeader">
                <div class="surface-card border-round-xl mb-4 px-5 py-4"
                     style="border:1px solid #e8edf2;">
                    <div class="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <div class="font-bold text-900 mb-1" style="font-size:1.1rem;">
                                {{ booking()!.groomName }} & {{ booking()!.brideName }}
                            </div>
                            <div class="flex items-center gap-3 flex-wrap" style="font-size:0.78rem;color:#94a3b8;">
                                <span
                                    class="font-medium border-round"
                                    style="background:#e2e8f0;color:#64748b;padding:1px 7px;border-radius:4px;"
                                >
                                    {{ booking()!.contractNo ?? booking()!.bookingNo ?? ('#' + booking()!.id) }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-calendar" style="font-size:0.7rem;"></i>
                                    {{ formatDate(booking()!.bookingDate ?? booking()!.eventDate) }}
                                    — {{ getShiftLabel(booking()!.shift ?? booking()!.bookingTime) }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-building" style="font-size:0.7rem;"></i>
                                    {{ getHallLabel(booking()!) }}
                                </span>
                            </div>
                        </div>

                        <!-- Progress -->
                        <div class="flex items-center gap-3" style="min-width:160px;">
                            <div class="flex-1 border-round overflow-hidden" style="height:5px;background:#e2e8f0;min-width:80px;">
                                <div
                                    class="border-round"
                                    style="height:100%;background:linear-gradient(90deg,#4f6ef7,#7c9cf8);transition:width 0.4s;"
                                    [style.width]="overallPercent + '%'"
                                ></div>
                            </div>
                            <span class="text-sm font-semibold text-600" style="white-space:nowrap;">
                                {{ doneCount }}/{{ tasks().length }}
                            </span>
                        </div>
                    </div>
                </div>
            </ng-container>
            <ng-template #loadingHeader>
                <div class="surface-card border-round-xl mb-4 px-5 py-4 text-center text-500"
                     style="border:1px solid #e8edf2;">
                    <i class="pi pi-spin pi-spinner"></i>
                </div>
            </ng-template>

            <!-- Category tabs + add button -->
            <div class="surface-card border-round-xl overflow-hidden" style="border:1px solid #e8edf2;">

                <!-- Tab bar -->
                <div class="flex items-center border-bottom-1 surface-border px-3"
                     style="gap:0;overflow-x:auto;">
                    <button
                        *ngFor="let cat of categories"
                        type="button"
                        class="flex items-center gap-2 cursor-pointer bg-transparent border-none py-3 px-4"
                        style="font-size:0.85rem;font-weight:500;border-bottom:2px solid transparent;transition:all 0.15s;white-space:nowrap;"
                        [style.border-bottom-color]="activeTabKey === cat.key ? '#4f6ef7' : 'transparent'"
                        [style.color]="activeTabKey === cat.key ? '#4f6ef7' : '#64748b'"
                        (click)="activeTabKey = cat.key"
                    >
                        <i [class]="'pi ' + cat.icon" style="font-size:0.8rem;"></i>
                        <span>{{ cat.label }}</span>
                        <span
                            *ngIf="getTasksForCat(cat.key).length"
                            class="text-xs font-semibold"
                            style="color:#94a3b8;"
                        >
                            {{ getDoneForCat(cat.key) }}/{{ getTasksForCat(cat.key).length }}
                        </span>
                    </button>

                    <!-- Add category button -->
                    <button
                        type="button"
                        class="flex items-center gap-1 cursor-pointer bg-transparent border-none py-3 px-3 ml-1"
                        style="font-size:0.82rem;color:#94a3b8;white-space:nowrap;border-bottom:2px solid transparent;"
                        (click)="openAddCategory()"
                    >
                        <i class="pi pi-plus" style="font-size:0.75rem;"></i>
                        <span>Thêm mục</span>
                    </button>
                </div>

                <!-- Tab panel -->
                <div class="p-4">
                    <ng-container *ngFor="let cat of categories">
                        <div *ngIf="activeTabKey === cat.key">

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
                                />
                            </div>

                            <!-- Task list -->
                            <ng-container *ngIf="getTasksForCat(cat.key).length; else emptyState">
                                <div
                                    *ngFor="let task of getTasksForCat(cat.key); trackBy: trackById"
                                    class="flex items-center gap-3 py-2"
                                    style="border-bottom:1px solid #f1f5f9;"
                                >
                                    <p-checkbox
                                        [ngModel]="task.done"
                                        [binary]="true"
                                        (onChange)="onTaskToggle(task, $event)"
                                    />
                                    <span
                                        class="flex-1 text-sm"
                                        [style.text-decoration]="task.done ? 'line-through' : 'none'"
                                        [style.color]="task.done ? '#94a3b8' : '#1e293b'"
                                    >
                                        {{ task.name }}
                                    </span>
                                    <button
                                        type="button"
                                        class="bg-transparent border-none cursor-pointer p-1"
                                        style="color:#cbd5e1;"
                                        (click)="removeTask(task)"
                                        pTooltip="Xóa" tooltipPosition="top"
                                    >
                                        <i class="pi pi-trash" style="font-size:0.8rem;"></i>
                                    </button>
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
                    </ng-container>
                </div>

            </div>
        </div>

        
        
    `,
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

    loadTasks() {
        // TODO: replace with real API
        this.tasks.set([]);
    }

    // ── Category management ───────────────────────────────────────────────────
    openAddCategory() {
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

    // ── Derived ───────────────────────────────────────────────────────────────
    getTasksForCat(key: string): TaskItem[] {
        return this.tasks().filter(t => t.categoryKey === key);
    }

    getDoneForCat(key: string): number {
        return this.getTasksForCat(key).filter(t => t.done).length;
    }

    get doneCount()       { return this.tasks().filter(t => t.done).length; }
    get overallPercent()  {
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
            SLOT_1: 'Trưa', SLOT_2: 'Tối', SLOT_3: 'Cả ngày',
            AFTERNOON: 'Trưa', EVENING: 'Tối', FULL_DAY: 'Cả ngày',
        };
        return m[shift ?? ''] ?? shift ?? '-';
    }
}