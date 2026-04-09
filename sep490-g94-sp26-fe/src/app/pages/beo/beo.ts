import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BookingService, Booking } from '../service/booking.service';
import { HallService } from '../service/hall.service';

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
                    style="min-width:180px; border:1px solid #e8edf2;"
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
                    style="border:1px solid #e8edf2;height:72px;animation:pulse 1.5s infinite;"
                ></div>
            </ng-container>

            <!-- Booking card list -->
            <ng-container *ngIf="!loading">
                <div
                    *ngFor="let booking of bookings(); trackBy: trackById"
                    class="surface-card border-round-xl mb-2 cursor-pointer booking-row"
                    style="border:1px solid #e8edf2;transition:box-shadow 0.18s,border-color 0.18s;"
                    (click)="viewTasks(booking)"
                >
                    <div class="flex items-center justify-between px-5 py-4">
                        <div style="flex:1;min-width:0;">

                            <!-- Name + progress badge -->
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                                <span class="font-semibold text-900" style="font-size:0.975rem;">
                                    {{ booking.groomName }} & {{ booking.brideName }}
                                </span>
                                <ng-container *ngIf="getTaskProgress(booking) as prog">
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
                                    {{ booking.contractNo ?? booking.bookingNo ?? ('#' + booking.id) }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-calendar" style="font-size:0.72rem;"></i>
                                    {{ formatDate(booking.bookingDate ?? booking.eventDate) }}
                                    &mdash; {{ getShiftLabel(booking.shift ?? booking.bookingTime) }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-building" style="font-size:0.72rem;"></i>
                                    {{ getHallLabel(booking) }}
                                </span>
                            </div>

                            <!-- Progress bar (only shown when there are tasks) -->
                            <ng-container *ngIf="getTaskProgress(booking) as prog">
                                <div
                                    class="border-round mt-2 overflow-hidden"
                                    style="height:3px;background:#e8edf2;max-width:260px;"
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
                <div *ngIf="!bookings().length" class="text-center py-12 text-500">
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
    providers: [MessageService, BookingService],
})
export class BeoComponent implements OnInit {

    bookings  = signal<Booking[]>([]);
    loading   = false;
    skeletonRows = Array(6);

    hallOptions: { label: string; value: number }[] = [];

    get completedCount() {
        return this.bookings().filter(b => this.isCompleted(b)).length;
    }
    get pendingCount() {
        return this.bookings().filter(b => !this.isCompleted(b)).length;
    }
    get stats() {
        return [
            {
                label: 'Tổng công việc',
                value: this.bookings().length,
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
        private bookingService: BookingService,
        private hallService: HallService,
        private messageService: MessageService,
        private router: Router,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.loadHallOptions();
        this.loadBookings();
    }

    loadHallOptions() {
        this.hallService.searchHalls({ page: 0, size: 200, sort: 'name,ASC' }).subscribe({
            next: (res) => {
                this.hallOptions = (res.data?.content ?? []).map(hall => ({
                    label: hall.name ?? `Sảnh #${hall.id}`,
                    value: Number(hall.id),
                }));
                this.cdr.markForCheck();
            },
            error: () => { this.hallOptions = []; },
        });
    }

    loadBookings() {
        this.loading = true;

        this.bookingService.searchBookings({
            page: 0,
            size: 200,
            sort: 'updatedAt,DESC',
        }).subscribe({
            next: (res) => {
                if (res?.data) {
                    this.bookings.set(res.data.content ?? []);
                }
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

    trackById(_: number, b: Booking) { return b.id; }

    viewTasks(booking: Booking) {
        this.router.navigate(['/pages/beo', booking.id]);
    }

    formatDate(d?: string): string {
        if (!d) return '-';
        return new Date(d).toLocaleDateString('vi-VN');
    }

    getHallLabel(booking: Booking): string {
        if (booking.hallName) return booking.hallName;
        const hall = this.hallOptions.find(h => h.value === booking.hallId);
        return hall?.label ?? (booking.hallId ? `Sảnh #${booking.hallId}` : '-');
    }

    getShiftLabel(shift?: string): string {
        const m: Record<string, string> = {
            SLOT_1: 'Trưa', SLOT_2: 'Tối', SLOT_3: 'Cả ngày',
            AFTERNOON: 'Trưa', EVENING: 'Tối', FULL_DAY: 'Cả ngày',
        };
        return m[shift ?? ''] ?? shift ?? '-';
    }

    getTaskProgress(booking: Booking): { done: number; total: number } | null {
        const row   = booking as any;
        const total = Number(row.totalTasks ?? row.taskCount ?? 0);
        if (!Number.isFinite(total) || total <= 0) return null;
        const done  = Number(row.completedTasks ?? row.doneCount ?? 0);
        return { done: Number.isFinite(done) ? done : 0, total };
    }

    getProgressPercent(prog: { done: number; total: number }): number {
        return prog.total ? Math.round((prog.done / prog.total) * 100) : 0;
    }

    private isCompleted(booking: Booking): boolean {
        const prog = this.getTaskProgress(booking);
        return prog ? prog.done >= prog.total : false;
    }
}