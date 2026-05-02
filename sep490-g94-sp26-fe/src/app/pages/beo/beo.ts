import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TaskListService, TaskList, TaskListTask } from '../service/beo.service';

@Component({
    selector: 'app-beo',
    standalone: true,
    imports: [
        CommonModule, RouterModule,
        ButtonModule, ToastModule,
    ],
    template: `
        <p-toast />

        <div style="max-width:960px; margin:0 auto; padding:24px 16px;">

            <!-- Stats row -->
            <div class="flex gap-3 mb-5 flex-wrap">
                <div
                    *ngFor="let stat of stats"
                    class="flex-1 surface-card border-round-xl p-4 flex items-center gap-3"
                    style="min-width:180px; border:1px solid #d1d5db;"
                >
                    <div
                        class="flex items-center justify-center border-round-lg"
                        style="width:42px;height:42px;"
                        [style.background]="stat.bg"
                    >
                        <i [class]="stat.icon + ' text-lg'" [style.color]="stat.color"></i>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-900">{{ stat.value }}</div>
                        <div class="text-sm text-500">{{ stat.label }}</div>
                    </div>
                </div>
            </div>

            <!-- Loading skeleton -->
            <ng-container *ngIf="loading">
                <div
                    *ngFor="let _ of skeletonRows"
                    class="surface-card border-round-xl mb-2 px-5 py-4"
                    style="border:1px solid #d1d5db;height:72px;animation:pulse 1.5s infinite;"
                ></div>
            </ng-container>

            <!-- Task list card list -->
            <ng-container *ngIf="!loading">
                <div
                    *ngFor="let item of taskLists(); trackBy: trackById"
                    class="surface-card border-round-xl mb-2 cursor-pointer booking-row"
                    style="border:1px solid #d1d5db;transition:box-shadow 0.18s,border-color 0.18s;"
                    (click)="viewTasks(item)"
                >
                    <div class="flex items-center justify-between px-5 py-4">
                        <div style="flex:1;min-width:0;">

                            <!-- Name + progress badge -->
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                                <span class="font-semibold text-900" style="font-size:0.975rem;">
                                    {{ item.name || item.contractNo || ('Danh sách #' + item.id) }}
                                </span>
                                <ng-container *ngIf="getTaskProgress(item) as prog">
                                    <span
                                        class="text-xs font-semibold px-2 border-round"
                                        style="background:transparent;color:#64748b;"
                                    >
                                        {{ prog.done }}/{{ prog.total }}
                                    </span>
                                </ng-container>
                            </div>

                            <!-- Meta row -->
                            <div class="flex items-center gap-3 flex-wrap" style="font-size:0.8rem;color:#94a3b8;">
                                <span
                                    class="font-medium border-round"
                                    style="background:#e2e8f0;color:#64748b;padding:1px 7px;font-size:0.72rem;border-radius:4px;"
                                >
                                    {{ item.contractNo ?? ('#' + item.id) }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-clock" style="font-size:0.72rem;"></i>
                                    {{ getShiftLabel(item.bookingTime) }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-building" style="font-size:0.72rem;"></i>
                                    {{ item.hallName || '-' }}
                                </span>
                            </div>

                            <!-- Progress bar (only shown when there are tasks) -->
                            <ng-container *ngIf="getTaskProgress(item) as prog">
                                <div
                                    class="border-round mt-2 overflow-hidden"
                                    style="height:3px;background:#d1d5db;max-width:260px;"
                                >
                                    <div
                                        class="border-round"
                                        style="height:100%;background:linear-gradient(90deg,#4f6ef7,#7c9cf8);transition:width 0.4s;"
                                        [style.width]="getProgressPercent(prog) + '%'"
                                    ></div>
                                </div>
                            </ng-container>

                        </div>

                        <!-- Arrow -->
                        <i class="pi pi-chevron-right ml-4 text-300" style="font-size:0.85rem;flex-shrink:0;"></i>
                    </div>
                </div>

                <!-- Empty state -->
                <div *ngIf="!taskLists().length" class="text-center py-12 text-500">
                    <i class="pi pi-inbox text-5xl mb-3 block text-300"></i>
                    <div class="text-sm">Không có công việc nào</div>
                </div>
            </ng-container>

        </div>
    `,
    styles: [`
        @keyframes pulse {
            0%,100% { opacity:1; }
            50%      { opacity:0.4; }
        }
        :host ::ng-deep {
            .booking-row:hover {
                box-shadow: 0 4px 16px rgba(79,110,247,0.08);
                border-color: #c7d2fe !important;
            }
        }
    `],
    providers: [MessageService],
})
export class BeoComponent implements OnInit {

    taskLists  = signal<TaskList[]>([]);
    loading   = false;
    skeletonRows = Array(6);
    readonly codeRole = (localStorage.getItem('codeRole') ?? '').toUpperCase();
    readonly currentUserId = Number(localStorage.getItem('userId')) || 0;
    readonly isCoordinatorAccount = this.codeRole.includes('COORDINATOR') || this.codeRole.includes('COORD');

    get completedCount() {
        return this.taskLists().filter((list) => this.isCompleted(list)).length;
    }
    get pendingCount() {
        return this.taskLists().filter((list) => !this.isCompleted(list)).length;
    }
    get stats() {
        return [
            {
                label: 'Tổng công việc',
                value: this.taskLists().length,
                icon:  'pi pi-align-justify',   // ≡ list lines icon
                color: '#4f6ef7',
                bg:    '#eef1fe',
            },
            {
                label: 'Đã hoàn thành',
                value: this.completedCount,
                icon:  'pi pi-align-justify',
                color: '#16a34a',
                bg:    '#dcfce7',
            },
            {
                label: 'Chưa hoàn thành',
                value: this.pendingCount,
                icon:  'pi pi-align-justify',
                color: '#ea580c',
                bg:    '#ffedd5',
            },
        ];
    }

    constructor(
        private taskListService: TaskListService,
        private messageService: MessageService,
        private router: Router,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        if (this.isCoordinatorAccount && this.currentUserId <= 0) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Thiếu thông tin tài khoản',
                detail: 'Không xác định được tài khoản coordinator hiện tại.',
                life: 3000,
            });
        }
        this.loadTaskLists();
    }

    loadTaskLists() {
        this.loading = true;

        this.taskListService.searchTaskLists({
            status: 'active',
            coordinatorId: this.isCoordinatorAccount && this.currentUserId > 0 ? this.currentUserId : undefined,
        }).subscribe({
            next: (res) => {
                this.taskLists.set(res?.data ?? []);
                this.loading = false;
                this.cdr.markForCheck();
            },
            error: () => {
                this.messageService.add({
                    severity: 'error', summary: 'Lỗi',
                    detail: 'Không thể tải danh sách công việc', life: 3000,
                });
                this.loading = false;
            },
        });
    }

    trackById(_: number, item: TaskList) { return item.id; }

    viewTasks(item: TaskList) {
        this.router.navigate(['/pages/beo', item.id]);
    }

    getShiftLabel(shift?: string): string {
        const m: Record<string, string> = {
            SLOT_1: 'Sáng', SLOT_2: 'Chiều', SLOT_3: 'Cả ngày',
            AFTERNOON: 'Sáng', EVENING: 'Chiều', FULL_DAY: 'Cả ngày',
        };
        return m[shift ?? ''] ?? shift ?? '-';
    }

    getTaskProgress(item: TaskList): { done: number; total: number } | null {
        const groups = item.taskCategoryGroups ?? [];
        const tasks: TaskListTask[] = groups.flatMap((group) => group.tasks ?? []);
        const total = tasks.length;
        if (!Number.isFinite(total) || total <= 0) return null;
        const done = tasks.filter((task) => String(task.state ?? '').toUpperCase() === 'COMPLETED').length;
        return { done, total };
    }

    getProgressPercent(prog: { done: number; total: number }): number {
        return prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
    }

    private isCompleted(item: TaskList): boolean {
        const prog = this.getTaskProgress(item);
        return prog ? prog.done >= prog.total : false;
    }
}