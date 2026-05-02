import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
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
import {
    TaskListService,
    TaskList,
    TaskListTask,
    TaskState,
    TaskListUpdatePayload,
    TaskListUpdateCategoryPayload,
} from '../service/beo.service';
import {
    InvoiceIncidentPayload,
    InvoiceService,
} from '../service/invoice.service';

export interface TaskItem {
    id: number;
    title: string;
    description?: string;
    state: TaskState | string;
    priority: number;
    categoryKey: string;
}

export interface TaskCategory {
    key: string;
    label: string;
    icon: string;
}

export interface IncidentItem {
    id: number;
    title: string;
    description: string;
    price: number;
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

            <div class="mb-4">
                <button
                    class="flex items-center gap-2 text-sm cursor-pointer px-3 py-2"
                    style="font-size:0.875rem;color:#334155;background:#f8fafc;border:1px solid #94a3b8;border-radius:999px;font-weight:600;"
                    (click)="goBack()"
                >
                    <i class="pi pi-arrow-left" style="font-size:0.8rem;"></i>
                    Quay lại
                </button>
            </div>

            <ng-container *ngIf="taskList(); else loadingHeader">
                <div class="surface-card border-round-xl mb-4 px-5 py-4" style="border:1px solid #d1d5db;">
                    <div class="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                            <div class="font-bold text-900 mb-1" style="font-size:1.1rem;">
                                {{ taskList()!.name || taskList()!.contractNo || ('Danh sách #' + taskList()!.id) }}
                            </div>
                            <div class="flex items-center gap-3 flex-wrap" style="font-size:0.78rem;color:#94a3b8;">
                                <span
                                    class="font-medium border-round"
                                    style="background:#e2e8f0;color:#64748b;padding:1px 7px;border-radius:4px;"
                                >
                                    {{ taskList()!.contractNo ?? ('#' + taskList()!.contractId) }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-clock" style="font-size:0.7rem;"></i>
                                    {{ getShiftLabel(taskList()!.bookingTime) }}
                                </span>
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-building" style="font-size:0.7rem;"></i>
                                    {{ taskList()!.hallName || '-' }}
                                </span>
                            </div>
                        </div>

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
                <div class="surface-card border-round-xl mb-4 px-5 py-4 text-center text-500" style="border:1px solid #d1d5db;">
                    <i class="pi pi-spin pi-spinner"></i>
                </div>
            </ng-template>

            <div class="mb-4">
                <p-button
                    label="Ghi nhận phát sinh"
                    icon="pi pi-file-edit"
                    severity="secondary"
                    [outlined]="true"
                    (onClick)="openIncidentDialog()"
                />
            </div>

            <div class="surface-card border-round-xl overflow-hidden" style="border:1px solid #d1d5db;">

                <div class="flex items-center border-bottom-1 surface-border px-3" style="gap:0;overflow-x:auto;border-bottom-color:#d1d5db;border-bottom-width:1px;">
                    <button
                        *ngFor="let cat of categories"
                        type="button"
                        class="flex items-center gap-2 cursor-pointer bg-transparent border-none py-3 px-4"
                        style="font-size:0.85rem;font-weight:500;border-bottom:2px solid transparent;transition:all 0.15s;white-space:nowrap;"
                        [style.border-bottom-color]="activeTabKey === cat.key ? '#4f6ef7' : 'transparent'"
                        [style.color]="activeTabKey === cat.key ? '#4f6ef7' : '#64748b'"
                        (click)="activeTabKey = cat.key"
                    >
                        <span>{{ cat.label }}</span>
                        <span
                            *ngIf="getTasksForCat(cat.key).length"
                            class="text-xs font-semibold"
                            style="color:#94a3b8;"
                        >
                            {{ getDoneForCat(cat.key) }}/{{ getTasksForCat(cat.key).length }}
                        </span>
                    </button>

                    <button
                        type="button"
                        class="flex items-center gap-1 cursor-pointer py-2 px-3 ml-1"
                        style="font-size:0.82rem;color:#1d4ed8;white-space:nowrap;border:1px solid #bfdbfe;background:#eff6ff;border-radius:999px;font-weight:600;"
                        [style.opacity]="saving ? '0.6' : '1'"
                        (click)="openAddCategory()"
                        [disabled]="saving"
                    >
                        <i class="pi pi-plus" style="font-size:0.75rem;font-weight:700;"></i>
                        <span>Thêm category</span>
                    </button>
                </div>

                <div class="p-4">
                    <ng-container *ngIf="categories.length === 0; else categoryTabsTpl">
                        <div class="text-center py-8 text-500">
                            <i class="pi pi-folder-open text-4xl mb-3 block text-300"></i>
                            <div class="text-sm">Chưa có category nào.</div>
                            <div class="text-xs text-400 mt-1">Hãy thêm category đầu tiên để bắt đầu quản lý công việc.</div>
                            <div class="mt-3">
                                <p-button
                                    label="Thêm category"
                                    icon="pi pi-plus"
                                    severity="secondary"
                                    [outlined]="true"
                                    [disabled]="saving"
                                    (onClick)="openAddCategory()"
                                />
                            </div>
                        </div>
                    </ng-container>

                    <ng-template #categoryTabsTpl>
                        <ng-container *ngFor="let cat of categories">
                            <div *ngIf="activeTabKey === cat.key">

                                <div class="flex items-center gap-2 mb-4">
                                    <input
                                        pInputText
                                        type="text"
                                        [(ngModel)]="newTaskNameMap[cat.key]"
                                        (keydown.enter)="addTask(cat.key)"
                                        placeholder="Thêm công việc..."
                                        [disabled]="saving"
                                        style="flex:1;"
                                    />
                                    <p-button
                                        icon="pi pi-plus"
                                        severity="primary"
                                        [rounded]="true"
                                        [loading]="saving"
                                        [disabled]="saving"
                                        (click)="addTask(cat.key)"
                                    />
                                </div>

                                <ng-container *ngIf="getTasksForCat(cat.key).length; else emptyState">
                                    <div
                                        *ngFor="let task of getTasksForCat(cat.key); trackBy: trackById"
                                        class="flex items-center gap-3 py-2"
                                        style="border-bottom:1px solid #e2e8f0;"
                                    >
                                        <p-checkbox
                                            [ngModel]="isTaskDone(task)"
                                            [binary]="true"
                                            [disabled]="saving"
                                            (onChange)="onTaskToggle(task, $event)"
                                        />
                                        <span
                                            class="flex-1 text-sm"
                                            [style.text-decoration]="isTaskDone(task) ? 'line-through' : 'none'"
                                            [style.color]="isTaskDone(task) ? '#94a3b8' : '#1e293b'"
                                        >
                                            {{ task.title }}
                                        </span>

                                        <div class="flex items-center gap-2" style="min-width:120px;">
                                            <span class="text-xs text-500" style="white-space:nowrap;">Ưu tiên</span>
                                            <input
                                                type="number"
                                                pInputText
                                                class="text-center"
                                                style="width:70px;padding:0.35rem 0.5rem;font-size:0.78rem;"
                                                [min]="1"
                                                [disabled]="saving"
                                                [value]="task.priority"
                                                (change)="onTaskPriorityChange(task, $any($event.target).value)"
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            class="cursor-pointer p-1"
                                            style="color:#dc2626;background:#fff1f2;border:1px solid #fecdd3;border-radius:7px;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;"
                                            [style.opacity]="saving ? '0.6' : '1'"
                                            [disabled]="saving"
                                            (click)="removeTask(task)"
                                            pTooltip="Xóa" tooltipPosition="top"
                                        >
                                            <i class="pi pi-trash" style="font-size:0.85rem;"></i>
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
                    </ng-template>
                </div>

                <div class="flex items-center justify-between flex-wrap gap-2 border-top-1 surface-border px-4 py-3" style="border-top-color:#d1d5db;border-top-width:1px;">
                    <span class="text-xs" [style.color]="hasUnsavedChanges ? '#f59e0b' : '#94a3b8'">
                        {{ hasUnsavedChanges ? 'Có thay đổi chưa lưu' : 'Tất cả thay đổi đã được lưu' }}
                    </span>
                    <p-button
                        label="Lưu thay đổi"
                        icon="pi pi-save"
                        [loading]="saving"
                        [disabled]="saving || !hasUnsavedChanges"
                        (onClick)="saveChanges()"
                    />
                </div>

            </div>
        </div>

        <p-dialog
            header="Thêm category"
            [(visible)]="showAddCategoryDialog"
            [modal]="true"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
            [style]="{ width: '28rem' }"
        >
            <div class="flex flex-column gap-3">
                <div>
                    <label class="text-sm text-600 block mb-2">Tên category</label>
                    <input
                        pInputText
                        type="text"
                        [(ngModel)]="newCategoryLabel"
                        placeholder="Ví dụ: Trang trí, Kỹ thuật, MC..."
                        style="width:100%;"
                        (keydown.enter)="confirmAddCategory()"
                    />
                </div>
            </div>

            <ng-template pTemplate="footer">
                <div class="flex justify-content-end gap-2">
                    <p-button
                        label="Hủy"
                        severity="secondary"
                        [text]="true"
                        (onClick)="showAddCategoryDialog = false"
                    />
                    <p-button
                        label="Thêm"
                        icon="pi pi-check"
                        (onClick)="confirmAddCategory()"
                    />
                </div>
            </ng-template>
        </p-dialog>

        <p-dialog
            header="Ghi nhận phát sinh"
            [(visible)]="showIncidentDialog"
            [modal]="true"
            [closable]="true"
            [draggable]="false"
            [resizable]="false"
            [style]="{ width: '56rem', maxWidth: '95vw' }"
        >
            <div class="text-xs text-500 mb-3">
                Lưu danh sách phát sinh theo hợp đồng {{ taskList()?.contractNo ?? ('#' + (taskList()?.contractId ?? '-')) }}.
            </div>

            <ng-container *ngIf="taskList()?.contractId; else missingContractTpl">
                <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:0.6rem;align-items:end;">
                    <div>
                        <label class="text-xs text-500 block mb-1">Tiêu đề</label>
                        <input
                            pInputText
                            type="text"
                            [(ngModel)]="newIncident.title"
                            [disabled]="incidentSaving"
                            placeholder="Ví dụ: Vỡ ly, phát sinh giờ"
                            style="width:100%;"
                            (keydown.enter)="addIncident()"
                        />
                    </div>
                    <div>
                        <label class="text-xs text-500 block mb-1">Mô tả</label>
                        <input
                            pInputText
                            type="text"
                            [(ngModel)]="newIncident.description"
                            [disabled]="incidentSaving"
                            placeholder="Chi tiết phát sinh"
                            style="width:100%;"
                            (keydown.enter)="addIncident()"
                        />
                    </div>
                    <p-button
                        icon="pi pi-plus"
                        label="Thêm"
                        [disabled]="incidentSaving"
                        (onClick)="addIncident()"
                    />
                </div>

                <div class="mt-4" style="max-height:50vh;overflow:auto;">
                    <div *ngIf="incidentLoading" class="text-center py-5 text-500">
                        <i class="pi pi-spin pi-spinner"></i>
                    </div>

                    <ng-container *ngIf="!incidentLoading">
                        <ng-container *ngIf="incidents().length; else emptyIncidentTpl">
                            <div class="border-round" style="border:1px solid #e2e8f0;overflow:hidden;">
                                <div
                                    class="grid px-3 py-2"
                                    style="grid-template-columns:60px 2fr 3fr 56px;gap:0.75rem;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:0.78rem;font-weight:600;color:#64748b;"
                                >
                                    <div>STT</div>
                                    <div>Tiêu đề</div>
                                    <div>Mô tả</div>
                                    <div class="text-center">Xóa</div>
                                </div>

                                <div
                                    *ngFor="let incident of incidents(); let i = index; trackBy: trackById"
                                    class="grid px-3 py-3"
                                    style="grid-template-columns:60px 2fr 3fr 56px;gap:0.75rem;align-items:center;border-bottom:1px solid #e2e8f0;"
                                >
                                    <div class="text-sm text-700">{{ i + 1 }}</div>
                                    <div class="text-sm font-semibold text-900">{{ incident.title }}</div>
                                    <div class="text-sm text-600">{{ incident.description || '-' }}</div>
                                    <div class="text-center">
                                        <button
                                            type="button"
                                            class="cursor-pointer p-1"
                                            style="color:#dc2626;background:#fff1f2;border:1px solid #fecdd3;border-radius:7px;width:30px;height:30px;display:inline-flex;align-items:center;justify-content:center;"
                                            [style.opacity]="incidentSaving ? '0.6' : '1'"
                                            [disabled]="incidentSaving"
                                            (click)="removeIncident(incident)"
                                            pTooltip="Xóa" tooltipPosition="top"
                                        >
                                            <i class="pi pi-trash" style="font-size:0.85rem;"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </ng-container>
                    </ng-container>
                </div>
            </ng-container>

            <ng-template #missingContractTpl>
                <div class="text-sm text-500">Không tìm thấy hợp đồng để ghi nhận phát sinh.</div>
            </ng-template>

            <ng-template #emptyIncidentTpl>
                <div class="text-center py-6 text-500">
                    <i class="pi pi-receipt text-3xl mb-2 block text-300"></i>
                    <div class="text-sm">Chưa có phát sinh nào.</div>
                </div>
            </ng-template>

            <ng-template pTemplate="footer">
                <div class="flex items-center justify-between gap-2 flex-wrap" style="width:100%;">
                    <span class="text-xs" [style.color]="hasIncidentUnsavedChanges ? '#f59e0b' : '#94a3b8'">
                        {{ hasIncidentUnsavedChanges ? 'Có thay đổi phát sinh chưa lưu' : 'Danh sách phát sinh đã đồng bộ' }}
                    </span>
                    <div class="flex gap-2">
                        <p-button
                            label="Đóng"
                            severity="secondary"
                            [text]="true"
                            [disabled]="incidentSaving"
                            (onClick)="showIncidentDialog = false"
                        />
                        <p-button
                            label="Lưu phát sinh"
                            icon="pi pi-save"
                            [loading]="incidentSaving"
                            [disabled]="incidentSaving || !hasIncidentUnsavedChanges || !taskList()?.contractId"
                            (onClick)="saveIncidents()"
                        />
                    </div>
                </div>
            </ng-template>
        </p-dialog>
    `,
    providers: [MessageService, InvoiceService],
})
export class BeoDetailComponent implements OnInit {

    taskList = signal<TaskList | null>(null);
    tasks = signal<TaskItem[]>([]);
    incidents = signal<IncidentItem[]>([]);
    saving = false;
    incidentLoading = false;
    incidentSaving = false;
    hasUnsavedChanges = false;
    hasIncidentUnsavedChanges = false;

    activeTabKey = '';
    newTaskNameMap: Record<string, string> = {};
    categories: TaskCategory[] = [];
    showIncidentDialog = false;

    showAddCategoryDialog = false;
    newCategoryLabel = '';
    newCategoryIcon = 'pi-bookmark';
    newIncident: { title: string; description: string } = {
        title: '',
        description: '',
    };

    private taskListId!: number;
    private localTaskIdSeed = -1;
    private localIncidentIdSeed = -1;
    private incidentLoadedContractId: number | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private location: Location,
        private taskListService: TaskListService,
        private invoiceService: InvoiceService,
        private messageService: MessageService,
        private cdr: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.taskListId = Number(this.route.snapshot.paramMap.get('id'));
        if (!Number.isFinite(this.taskListId) || this.taskListId <= 0) {
            this.goBack();
            return;
        }
        this.loadTaskListDetail();
    }

    loadTaskListDetail() {
        this.taskListService.getTaskListById(this.taskListId).subscribe({
            next: (res) => {
                const detail = res.data;
                this.taskList.set(detail);
                this.syncUiFromTaskList(detail);
                this.resetIncidentsWhenContractChanged();
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: this.resolveApiErrorDetail(err, 'Không thể tải chi tiết công việc.'),
                    life: 3000,
                });
                this.goBack();
            },
        });
    }

    openAddCategory() {
        this.newCategoryLabel = '';
        this.newCategoryIcon = 'pi-bookmark';
        this.showAddCategoryDialog = true;
    }

    confirmAddCategory() {
        const label = this.newCategoryLabel.trim();
        if (!label) return;

        const duplicate = this.categories.some((cat) => cat.label.trim().toLowerCase() === label.toLowerCase());
        if (duplicate) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Category đã tồn tại',
                detail: 'Vui lòng nhập tên category khác.',
                life: 2500,
            });
            return;
        }

        const key = `cat_local_${Date.now()}`;
        this.categories = [...this.categories, { key, label, icon: this.newCategoryIcon }];
        this.newTaskNameMap[key] = '';
        this.activeTabKey = key;
        this.showAddCategoryDialog = false;
        this.hasUnsavedChanges = true;
        this.cdr.markForCheck();
    }

    addTask(catKey: string) {
        if (!catKey || !this.categories.some((cat) => cat.key === catKey)) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Thiếu category',
                detail: 'Vui lòng thêm category trước khi tạo công việc.',
                life: 2500,
            });
            return;
        }

        const title = (this.newTaskNameMap[catKey] ?? '').trim();
        if (!title || this.saving) return;

        const newTask: TaskItem = {
            id: this.generateLocalTaskId(),
            title,
            description: '',
            state: 'NOT_COMPLETED',
            priority: this.getTasksForCat(catKey).length + 1,
            categoryKey: catKey,
        };

        this.tasks.set([...this.tasks(), newTask]);
        this.newTaskNameMap[catKey] = '';
        this.hasUnsavedChanges = true;
        this.cdr.markForCheck();
    }

    removeTask(task: TaskItem) {
        if (this.saving) return;

        this.tasks.set(this.tasks().filter((t) => t.id !== task.id));
        this.hasUnsavedChanges = true;
        this.cdr.markForCheck();
    }

    onTaskPriorityChange(task: TaskItem, rawValue: unknown) {
        if (this.saving) return;

        const parsed = Number(rawValue);
        if (!Number.isFinite(parsed)) {
            return;
        }

        const normalized = Math.max(1, Math.round(parsed));
        if (Number(task.priority) === normalized) {
            return;
        }

        this.tasks.set(
            this.tasks().map((item) => {
                if (item.id !== task.id) {
                    return item;
                }

                return {
                    ...item,
                    priority: normalized,
                };
            })
        );
        this.hasUnsavedChanges = true;
        this.cdr.markForCheck();
    }

    onTaskToggle(task: TaskItem, event: CheckboxChangeEvent) {
        if (this.saving) return;

        const nextState: TaskState = event.checked ? 'COMPLETED' : 'NOT_COMPLETED';
        if (String(task.state ?? '').toUpperCase() === nextState) {
            return;
        }

        this.tasks.set(this.tasks().map((t) => (t.id === task.id ? { ...t, state: nextState } : t)));
        this.hasUnsavedChanges = true;
        this.cdr.markForCheck();
    }

    saveChanges() {
        if (this.saving || !this.hasUnsavedChanges) {
            return;
        }

        this.persistTaskList(
            () => {
                this.hasUnsavedChanges = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Đã lưu',
                    detail: 'Đã lưu tất cả thay đổi task/category.',
                    life: 2500,
                });
                this.cdr.markForCheck();
            },
            () => {
                this.cdr.markForCheck();
            },
        );
    }

    openIncidentDialog() {
        this.showIncidentDialog = true;
        this.ensureIncidentsLoaded();
        this.cdr.markForCheck();
    }

    addIncident() {
        if (this.incidentSaving) return;

        const title = this.newIncident.title.trim();
        if (!title) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Thiếu tiêu đề',
                detail: 'Vui lòng nhập tiêu đề phát sinh.',
                life: 2500,
            });
            return;
        }

        const item: IncidentItem = {
            id: this.generateLocalIncidentId(),
            title,
            description: this.newIncident.description.trim(),
            price: 0,
        };

        this.incidents.set([...this.incidents(), item]);
        this.newIncident = { title: '', description: '' };
        this.hasIncidentUnsavedChanges = true;
        this.cdr.markForCheck();
    }

    removeIncident(incident: IncidentItem) {
        if (this.incidentSaving) return;

        this.incidents.set(this.incidents().filter((item) => item.id !== incident.id));
        this.hasIncidentUnsavedChanges = true;
        this.cdr.markForCheck();
    }

    saveIncidents() {
        const contractId = this.resolveContractId();
        if (!contractId || this.incidentSaving || !this.hasIncidentUnsavedChanges) {
            return;
        }

        const hasInvalidTitle = this.incidents().some((item) => !item.title.trim());
        if (hasInvalidTitle) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Dữ liệu chưa hợp lệ',
                detail: 'Mỗi phát sinh cần có tiêu đề.',
                life: 2800,
            });
            return;
        }

        const payload: InvoiceIncidentPayload[] = this.incidents().map((item) => ({
            title: item.title.trim(),
            description: item.description.trim(),
            price: 0,
        }));

        this.incidentSaving = true;
        this.invoiceService.updateIncidentsByContractId(contractId, payload).subscribe({
            next: (res) => {
                this.incidentSaving = false;
                const nextIncidents = this.mapIncidentsFromApi(res.data ?? []);
                this.incidents.set(nextIncidents);
                this.hasIncidentUnsavedChanges = false;
                this.messageService.add({
                    severity: 'success',
                    summary: 'Đã lưu',
                    detail: 'Đã cập nhật danh sách phát sinh cho hợp đồng.',
                    life: 2500,
                });
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.incidentSaving = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: this.resolveApiErrorDetail(err, 'Không thể lưu danh sách phát sinh.'),
                    life: 3200,
                });
                this.cdr.markForCheck();
            },
        });
    }

    trackById(_: number, item: { id: number }) { return item.id; }

    getTasksForCat(key: string): TaskItem[] {
        return this.tasks()
            .filter((t) => t.categoryKey === key)
            .sort((a, b) => this.compareTaskPriority(a, b));
    }

    getDoneForCat(key: string): number {
        return this.getTasksForCat(key).filter((t) => this.isTaskDone(t)).length;
    }

    get doneCount() {
        return this.tasks().filter((t) => this.isTaskDone(t)).length;
    }

    get overallPercent() {
        const total = this.tasks().length;
        return total ? Math.round((this.doneCount / total) * 100) : 0;
    }

    goBack() {
        if (window.history.length > 1) {
            this.location.back();
            return;
        }
        this.router.navigate(['/pages/beo']);
    }

    getShiftLabel(shift?: string): string {
        const map: Record<string, string> = {
            SLOT_1: 'Sáng',
            SLOT_2: 'Chiều',
            SLOT_3: 'Cả ngày',
            AFTERNOON: 'Sáng',
            EVENING: 'Chiều',
            FULL_DAY: 'Cả ngày',
        };
        return map[shift ?? ''] ?? shift ?? '-';
    }

    isTaskDone(task: TaskItem): boolean {
        return String(task.state ?? '').toUpperCase() === 'COMPLETED';
    }

    private ensureIncidentsLoaded() {
        const contractId = this.resolveContractId();
        if (!contractId) {
            this.incidents.set([]);
            this.hasIncidentUnsavedChanges = false;
            return;
        }

        if (this.incidentLoadedContractId === contractId) {
            return;
        }

        this.loadIncidents(contractId);
    }

    private resetIncidentsWhenContractChanged() {
        const contractId = this.resolveContractId();
        if (!contractId) {
            this.incidentLoadedContractId = null;
            this.incidents.set([]);
            this.hasIncidentUnsavedChanges = false;
            return;
        }

        if (this.incidentLoadedContractId !== contractId) {
            this.incidents.set([]);
            this.hasIncidentUnsavedChanges = false;
            this.incidentLoadedContractId = null;
            if (this.showIncidentDialog) {
                this.loadIncidents(contractId);
            }
        }
    }

    private loadIncidents(contractId: number) {
        this.incidentLoading = true;
        this.invoiceService.getIncidentsByContractId(contractId).subscribe({
            next: (res) => {
                this.incidentLoading = false;
                this.incidents.set(this.mapIncidentsFromApi(res.data ?? []));
                this.hasIncidentUnsavedChanges = false;
                this.incidentLoadedContractId = contractId;
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.incidentLoading = false;
                this.incidents.set([]);
                this.hasIncidentUnsavedChanges = false;
                this.incidentLoadedContractId = null;
                this.messageService.add({
                    severity: 'warn',
                    summary: 'Không tải được phát sinh',
                    detail: this.resolveApiErrorDetail(err, 'Không thể tải danh sách phát sinh của hợp đồng.'),
                    life: 3200,
                });
                this.cdr.markForCheck();
            },
        });
    }

    private mapIncidentsFromApi(incidents: InvoiceIncidentPayload[]): IncidentItem[] {
        return incidents.map((incident) => ({
            id: this.generateLocalIncidentId(),
            title: String(incident?.title ?? '').trim(),
            description: String(incident?.description ?? '').trim(),
            price: this.normalizeIncidentPrice(incident?.price),
        }));
    }

    private normalizeIncidentPrice(rawPrice: unknown): number {
        const numeric = Number(rawPrice ?? 0);
        if (!Number.isFinite(numeric)) {
            return 0;
        }
        return Math.max(0, numeric);
    }

    private resolveContractId(): number | null {
        const contractId = Number(this.taskList()?.contractId ?? 0);
        if (!Number.isFinite(contractId) || contractId <= 0) {
            return null;
        }
        return contractId;
    }

    private syncUiFromTaskList(detail: TaskList) {
        const groups = detail.taskCategoryGroups ?? [];
        const categories: TaskCategory[] = [];
        const taskItems: TaskItem[] = [];
        const taskNameMap: Record<string, string> = {};

        groups.forEach((group, index) => {
            const key = this.buildCategoryKey(group.categoryId, index);
            const label = String(group.categoryTitle ?? '').trim() || `Category ${index + 1}`;
            categories.push({ key, label, icon: this.pickIcon(index) });
            taskNameMap[key] = '';

            (group.tasks ?? []).forEach((task) => {
                taskItems.push(this.mapTaskToItem(task, key));
            });
        });

        const previousActiveKey = this.activeTabKey;
        const previousActiveLabel = this.categories
            .find((cat) => cat.key === previousActiveKey)
            ?.label
            ?.trim()
            ?.toLowerCase();
        this.categories = categories;
        this.newTaskNameMap = taskNameMap;
        this.tasks.set(taskItems);
        this.hasUnsavedChanges = false;
        if (categories.some((cat) => cat.key === previousActiveKey)) {
            this.activeTabKey = previousActiveKey;
            return;
        }

        const sameLabelCategory = previousActiveLabel
            ? categories.find((cat) => cat.label.trim().toLowerCase() === previousActiveLabel)
            : null;
        this.activeTabKey = sameLabelCategory?.key ?? (categories[0]?.key ?? '');
    }

    private persistTaskList(onSuccess?: (updated?: TaskList) => void, onError?: () => void) {
        if (!Number.isFinite(this.taskListId) || this.taskListId <= 0) {
            onError?.();
            return;
        }

        const payload = this.buildUpdatePayloadFromUi();
        this.saving = true;

        this.taskListService.updateTaskList(this.taskListId, payload).subscribe({
            next: (res) => {
                this.saving = false;
                if (res.data) {
                    this.taskList.set(res.data);
                    this.syncUiFromTaskList(res.data);
                }
                onSuccess?.(res.data);
                this.cdr.markForCheck();
            },
            error: (err) => {
                this.saving = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Lỗi',
                    detail: this.resolveApiErrorDetail(err, 'Không thể cập nhật danh sách công việc.'),
                    life: 3200,
                });
                onError?.();
                this.cdr.markForCheck();
            },
        });
    }

    private buildUpdatePayloadFromUi(): TaskListUpdatePayload {
        const groups: TaskListUpdateCategoryPayload[] = this.categories.map((cat) => ({
            title: cat.label,
            tasks: this.getTasksForCat(cat.key)
                .map((task) => ({
                title: task.title,
                description: task.description ?? '',
                priority: Number(task.priority ?? 0),
                state: this.normalizeTaskState(task.state),
            })),
        }));

        return {
            taskCategoryGroups: groups,
        };
    }

    private normalizeTaskState(value: string | TaskState): TaskState {
        return String(value ?? '').toUpperCase() === 'COMPLETED' ? 'COMPLETED' : 'NOT_COMPLETED';
    }

    private mapTaskToItem(task: TaskListTask, categoryKey: string): TaskItem {
        const parsedId = Number(task.id);
        return {
            id: Number.isFinite(parsedId) && parsedId > 0 ? parsedId : this.generateLocalTaskId(),
            title: task.title ?? '',
            description: task.description ?? '',
            state: task.state ?? 'NOT_COMPLETED',
            priority: Number(task.priority ?? 0),
            categoryKey,
        };
    }

    private compareTaskPriority(a: TaskItem, b: TaskItem): number {
        const priorityA = Number.isFinite(Number(a.priority)) ? Number(a.priority) : Number.MAX_SAFE_INTEGER;
        const priorityB = Number.isFinite(Number(b.priority)) ? Number(b.priority) : Number.MAX_SAFE_INTEGER;

        if (priorityA !== priorityB) {
            return priorityA - priorityB;
        }

        return a.id - b.id;
    }

    private buildCategoryKey(categoryId: number | undefined, index: number): string {
        const id = Number(categoryId);
        if (Number.isFinite(id) && id > 0) {
            return `cat_${id}`;
        }
        return `cat_local_${index + 1}`;
    }

    private pickIcon(index: number): string {
        const iconCandidates = ['pi-list', 'pi-th-large', 'pi-star', 'pi-check-square', 'pi-briefcase'];
        return iconCandidates[index % iconCandidates.length];
    }

    private generateLocalTaskId(): number {
        this.localTaskIdSeed -= 1;
        return this.localTaskIdSeed;
    }

    private generateLocalIncidentId(): number {
        this.localIncidentIdSeed -= 1;
        return this.localIncidentIdSeed;
    }

    private resolveApiErrorDetail(err: any, fallback: string): string {
        const message = String(err?.error?.message ?? '').trim();
        const code = String(err?.error?.code ?? '').trim();
        if (message) {
            return code ? `${message} (code ${code})` : message;
        }
        return fallback;
    }
}
