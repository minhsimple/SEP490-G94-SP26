import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { LeadService } from '../service/lead.service';
import { LocationService } from '../service/location.service';
import { UserService } from '../service/users.service';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    InputTextModule,
    SelectModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
  ],
  template: `
    <div class="card">
      <p-toast />

      <p-toolbar styleClass="mb-6">
        <ng-template #start>
          <!-- Ẩn nút Thêm Lead nếu là SALE -->
          <p-button *ngIf="!isSale"
            label="Thêm Lead mới"
            icon="pi pi-plus"
            severity="primary"
            class="mr-2"
            (onClick)="openNew()"
          />
          <p-select *ngIf="!isSale && !isReception"
            [options]="locationOptions"
            [(ngModel)]="selectedLocationId"
            optionLabel="label"
            optionValue="value"
            placeholder="Lọc chi nhánh"
            (onChange)="onLocationChange($event)"
            class="ml-2"
            [showClear]="true"
            style="width: 200px"
          />
          <p-select *ngIf="isSale"
            [options]="viewOptions"
            [(ngModel)]="viewType"
            optionLabel="label"
            optionValue="value"
            (onChange)="onViewTypeChange()"
            class="ml-2"
            style="width: 200px"
          />
        </ng-template>
        <ng-template #end>
          <p-button
            label="Xuất Excel"
            icon="pi pi-file-excel"
            severity="success"
            (onClick)="exportCSV()"
          />
        </ng-template>
      </p-toolbar>

      <p-table
        #dt
        [value]="leads()"
        [rows]="pageSize"
        [columns]="cols"
        [paginator]="true"
        [totalRecords]="totalRecords"
        [lazy]="true"
        (onLazyLoad)="onLazyLoad($event)"
        [globalFilterFields]="['fullName', 'email', 'phone', 'state', 'assignedSalesName']"
        [tableStyle]="{ 'min-width': '75rem' }"
        [(selection)]="selectedLeads"
        [rowHover]="true"
        dataKey="id"
        currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} leads"
        [showCurrentPageReport]="true"
        [rowsPerPageOptions]="[10, 20, 30]"
        [loading]="loading"
      >
        <ng-template #caption>
          <div class="flex items-center justify-between">
            <h2 class="m-0 text-2xl font-bold">Danh sách Leads</h2>
            <p-iconfield>
              <p-inputicon styleClass="pi pi-search" />
              <input
                pInputText
                type="text"
                (input)="onGlobalFilter(dt, $event)"
                placeholder="Tìm kiếm..."
              />
            </p-iconfield>
          </div>
        </ng-template>

        <ng-template #header>
          <tr>
            <th style="width: 3rem">
              <p-tableHeaderCheckbox />
            </th>
            <th pSortableColumn="fullName" style="min-width:14rem">
              Họ và tên <p-sortIcon field="fullName" />
            </th>
            <th pSortableColumn="email" style="min-width:16rem">
              Email <p-sortIcon field="email" />
            </th>
            <th pSortableColumn="phone" style="min-width:12rem">
              Số điện thoại <p-sortIcon field="phone" />
            </th>
            <th pSortableColumn="assignedSalesName" style="min-width:10rem">
              Phụ trách <p-sortIcon field="assignedSalesName" />
            </th>
            <th pSortableColumn="state" style="min-width:10rem">
              Trạng thái <p-sortIcon field="state" />
            </th>
            <th style="min-width:10rem">Thao tác</th>
          </tr>
        </ng-template>

        <ng-template #body let-lead>
          <tr>
            <td><p-tableCheckbox [value]="lead" /></td>
            <td>
              <div class="flex items-center gap-3">
                <div
                  class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold"
                >
                  {{ getInitials(lead.fullName) }}
                </div>
                <span class="font-medium">{{ lead.fullName }}</span>
              </div>
            </td>
            <td>
              <i class="pi pi-envelope mr-2 text-gray-400"></i>
              {{ lead.email || '-' }}
            </td>
            <td>
              <i class="pi pi-phone mr-2 text-gray-400"></i>
              {{ lead.phone || '-' }}
            </td>
            <td>{{ getSalesName(lead.assignedSalesId) }}</td>
            <td>
              <p-tag
                [value]="getStateLabel(lead.state || lead.leadState)"
                [severity]="getStateSeverity(lead.state || lead.leadState)"
              />
            </td>
            <td>
  <div class="flex gap-2">
    <!-- Nút Nhận Lead cho SALE khi Lead mới -->
    <p-button
      *ngIf="isSale && (lead.state === 'NEW' || lead.leadState === 'NEW')"
      icon="pi pi-user-plus"
      [rounded]="true"
      [outlined]="true"
      severity="success"
      (click)="takeLead(lead)"
      pTooltip="Nhận Lead"
      tooltipPosition="top"
    />
    <p-button *ngIf="!isSale"
      icon="pi pi-pencil"
      [rounded]="true"
      [outlined]="true"
      severity="info"
      (click)="editLead(lead)"
      pTooltip="Chỉnh sửa"
      tooltipPosition="top"
    />
    <!-- Nút Đổi trạng thái cho Admin/Manager hoặc khi SALE đã nhận lead -->
    <p-button
      *ngIf="!isReception && (!isSale || (lead.state !== 'NEW' && lead.leadState !== 'NEW'))"
      icon="pi pi-sync"
      [rounded]="true"
      [outlined]="true"
      severity="warn"
      (click)="changeStatus(lead)"
      pTooltip="Đổi trạng thái"
      tooltipPosition="top"
    />
  </div>
</td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Dialog thêm/sửa lead -->
      <p-dialog
        [(visible)]="leadDialog"
        [style]="{ width: '500px', maxHeight: '90vh' }"
        [contentStyle]="{ overflow: 'auto', maxHeight: 'calc(90vh - 9rem)' }"
        [header]="lead?.id ? 'Chỉnh sửa Lead' : 'Thêm Lead mới'"
        [modal]="true"
        appendTo="body"
        [draggable]="false"
        [resizable]="false"
        [breakpoints]="{ '960px': '92vw', '640px': '96vw' }"
        styleClass="p-fluid"
      >
        <ng-template #content>
          <div class="flex flex-col gap-6">
            <div>
              <label for="fullName" class="block font-bold mb-3">
                Họ và tên <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                pInputText
                id="fullName"
                [(ngModel)]="lead.fullName"
                required
                autofocus
                fluid
                placeholder="Nguyễn Văn A"
              />
              <small class="text-red-500" *ngIf="submitted && !lead.fullName">
                Họ và tên là bắt buộc.
              </small>
            </div>

            <div>
              <label for="email" class="block font-bold mb-3">Email</label>
              <input
                type="email"
                pInputText
                id="email"
                [(ngModel)]="lead.email"
                fluid
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label for="phone" class="block font-bold mb-3">Số điện thoại</label>
              <input
                type="text"
                pInputText
                id="phone"
                [(ngModel)]="lead.phone"
                fluid
                placeholder="0901234567"
              />
            </div>

            <div>
              <label for="address" class="block font-bold mb-3">Địa chỉ</label>
              <input
                type="text"
                pInputText
                id="address"
                [(ngModel)]="lead.address"
                fluid
                placeholder="123 Đường ABC, ..."
              />
            </div>

            <div>
              <label for="source" class="block font-bold mb-3">Nguồn</label>
              <input
                type="text"
                pInputText
                id="source"
                [(ngModel)]="lead.source"
                fluid
                placeholder="Facebook, Zalo, ..."
              />
            </div>

            <div>
              <label for="location" class="block font-bold mb-3">Chi nhánh</label>
              <input
                type="text"
                pInputText
                id="location"
                [value]="locationName"
                [readonly]="true"
                fluid
                class="bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label for="notes" class="block font-bold mb-3">Ghi chú</label>
              <input
                type="text"
                pInputText
                id="notes"
                [(ngModel)]="lead.notes"
                fluid
                placeholder="Ghi chú thêm..."
              />
            </div>
          </div>
        </ng-template>

        <ng-template #footer>
          <p-button label="Hủy" icon="pi pi-times" text (click)="hideDialog()" />
          <p-button label="Lưu" icon="pi pi-check" (click)="saveLead()" [loading]="saving" />
        </ng-template>
      </p-dialog>

      <p-confirmdialog />
    </div>
  `,
  styles: [
    `
      :host ::ng-deep {
        .p-toolbar {
          border-radius: 8px;
          padding: 1rem;
        }
        .p-datatable {
          border-radius: 8px;
          overflow: hidden;
        }
        .p-datatable .p-datatable-header {
          background: #f8f9fa;
          padding: 1.5rem;
          border-bottom: 1px solid #dee2e6;
        }
        .p-datatable-thead > tr > th {
          background: #f8f9fa;
          font-weight: 600;
          padding: 1rem;
        }
        .p-datatable-tbody > tr {
          transition: all 0.2s;
        }
        .p-datatable-tbody > tr:hover {
          background: #f8f9fa;
        }
      }
    `,
  ],
  providers: [MessageService, LeadService, ConfirmationService],
})
export class Leads implements OnInit {
  leadDialog = false;
  leads = signal<any[]>([]);
  lead!: any;
  selectedLeads!: any[] | null;
  submitted = false;
  saving = false;
  loading = false;
  totalRecords = 0;
  pageSize = 20;
  currentPage = 0;
  states!: any[];
  cols!: Column[];
  loadingLocations = false;
  salesNames = signal<Record<number, string>>({});

  locationOptions: { label: string; value: number }[] = [];
  locationName = '';
  selectedLocationId: number | null = null;

  // Kiểm tra role (không phân biệt hoa thường)
  isSale = localStorage.getItem('codeRole')?.toUpperCase() === 'SALE';
  isReception = ['RECEPTION', 'RECEPTIONIST'].includes(localStorage.getItem('codeRole')?.toUpperCase() ?? '');

  viewType: 'all' | 'mine' = 'all';
  viewOptions = [
    { label: 'Tất cả Leads mới', value: 'all' },
    { label: 'Leads của tôi', value: 'mine' },
  ];

  @ViewChild('dt') dt!: Table;

  constructor(
    private leadService: LeadService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private locationService: LocationService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    if (this.isSale || this.isReception) {
      const locId = localStorage.getItem('locationId');
      if (locId) this.selectedLocationId = Number(locId);
    }
    this.initializeDropdowns();
    this.loadLocationOptions();
    this.loadLeads(0, this.pageSize, this.selectedLocationId);
  }

  loadLeads(page = 0, size = this.pageSize, locationId?: number | null) {
    this.loading = true;
    const params: any = { page, size };
    if (locationId) params.locationId = locationId;

    if (this.isSale) {
      if (this.viewType === 'all') {
        params.state = 'NEW';
      } else {
        const userId = localStorage.getItem('userId');
        if (userId) {
          params.assignedSalesId = Number(userId);
        }
      }
    }

    this.leadService.searchLeads(params).subscribe({
      next: (res) => {
        if (res.code === 200 || res.data) {
          const content = res.data.content;
          this.leads.set(content);
          this.totalRecords = res.data.totalElements;
          this.fetchSalesNames(content);
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách leads',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }

  fetchSalesNames(leads: any[]) {
    const currentNames = this.salesNames();
    const newIds = leads
      .map((l) => l.assignedSalesId)
      .filter((id) => id && !currentNames[id]);

    const uniqueIds = Array.from(new Set(newIds));

    uniqueIds.forEach((id) => {
      this.userService.getUser(id).subscribe({
        next: (res) => {
          if (res.code === 200) {
            this.salesNames.update((prev) => ({
              ...prev,
              [id]: res.data.fullName as string,
            }));
          }
        },
      });
    });
  }

  getSalesName(id: number | null | undefined): string {
    if (!id) return '-';
    return this.salesNames()[id] || 'Đang tải...';
  }

  onLazyLoad(event: any) {
    const page = event.first / event.rows;
    const size = event.rows;
    this.currentPage = page;
    this.pageSize = size;
    this.loadLeads(page, size, this.selectedLocationId);
  }

  initializeDropdowns() {
    this.states = [
      { label: 'Mới', value: 'NEW' },
      { label: 'Đang liên hệ', value: 'CONTACTING' },
      { label: 'Đã báo giá', value: 'QUOTED' },
      { label: 'Thành công', value: 'WON' },
      { label: 'Thất bại', value: 'LOST' },
    ];

    this.cols = [
      { field: 'fullName', header: 'Họ và tên' },
      { field: 'email', header: 'Email' },
      { field: 'phone', header: 'Số điện thoại' },
      { field: 'assignedSalesName', header: 'Phụ trách' },
      { field: 'state', header: 'Trạng thái' },
    ];
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onLocationChange(event: any) {
    this.selectedLocationId = event.value;
    this.loadLeads(0, this.pageSize, this.selectedLocationId);
    if (this.dt) {
      this.dt.reset();
    }
  }

  onViewTypeChange() {
    this.loadLeads(0, this.pageSize, this.selectedLocationId);
    if (this.dt) {
      this.dt.reset();
    }
  }

  resolveLocationName(locationId?: number) {
    if (locationId) {
      const found = this.locationOptions.find((l) => l.value === locationId);
      this.locationName = found?.label ?? '';
    } else {
      this.locationName = '';
    }
  }

  openNew() {
    const storedLocationId = localStorage.getItem('locationId');
    this.lead = {
      state: 'NEW',
      locationId: storedLocationId ? Number(storedLocationId) : undefined,
    };
    this.resolveLocationName(this.lead.locationId);
    this.submitted = false;
    this.leadDialog = true;
  }

  editLead(lead: any) {
    this.lead = { ...lead };
    this.resolveLocationName(this.lead.locationId);
    this.leadDialog = true;
  }

  takeLead(lead: any) {
    this.confirmationService.confirm({
      message: `Bạn có chắc muốn nhận lead "${lead.fullName}"?`,
      header: 'Xác nhận',
      icon: 'pi pi-user-plus',
      acceptLabel: 'Có',
      rejectLabel: 'Không',
      accept: () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          this.messageService.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không tìm thấy thông tin nhân viên',
          });
          return;
        }

        this.leadService.assignToSales(lead.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Đã nhận lead thành công',
              life: 3000,
            });
            this.loadLeads(this.currentPage, this.pageSize, this.selectedLocationId);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Không thể nhận lead',
              life: 3000,
            });
          },
        });
      },
    });
  }

  changeStatus(lead: any) {
    if (this.isReception) {
      return;
    }

    this.confirmationService.confirm({
      message: `Bạn có chắc muốn đổi trạng thái của "${lead.fullName}"?`,
      header: 'Xác nhận',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Có',
      rejectLabel: 'Không',
      accept: () => {
        this.leadService.changeStatus(lead.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Thành công',
              detail: 'Đã đổi trạng thái',
              life: 3000,
            });
            this.loadLeads(this.currentPage, this.pageSize, this.selectedLocationId);
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: 'Không thể đổi trạng thái',
              life: 3000,
            });
          },
        });
      },
    });
  }

  loadLocationOptions() {
    this.loadingLocations = true;
    this.locationService.searchLocations({ page: 0, size: 100 }).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.locationOptions = res.data.content.map((l) => ({
            label: l.name ?? '',
            value: l.id,
          }));
          this.resolveLocationName(this.lead?.locationId);
        }
        this.loadingLocations = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách chi nhánh',
          life: 3000,
        });
        this.loadingLocations = false;
      },
    });
  }

  hideDialog() {
    this.leadDialog = false;
    this.submitted = false;
  }

  saveLead() {
    this.submitted = true;
    if (!this.lead.fullName?.trim()) return;

    const payload = {
      fullName: this.lead.fullName,
      phone: this.lead.phone,
      email: this.lead.email,
      source: this.lead.source,
      address: this.lead.address,
      notes: this.lead.notes,
      state: this.lead.state ?? 'NEW',
      locationId: this.lead.locationId,
    };

    this.saving = true;

    const request$ = this.lead.id
      ? this.leadService.updateLead(this.lead.id, payload)
      : this.leadService.createLead(payload);

    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: this.lead.id ? 'Đã cập nhật lead' : 'Đã tạo lead mới',
          life: 3000,
        });
        this.leadDialog = false;
        this.lead = {};
        this.saving = false;
        this.loadLeads(this.currentPage, this.pageSize, this.selectedLocationId);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể lưu lead',
          life: 3000,
        });
        this.saving = false;
      },
    });
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  getInitials(fullName: string | undefined): string {
    if (!fullName) return '?';
    const names = fullName.split(' ');
    return names.length >= 2
      ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
      : fullName.substring(0, 2).toUpperCase();
  }

  getStateLabel(state: string | undefined): string {
    const map: Record<string, string> = {
      NEW: 'Mới',
      CONTACTING: 'Đang liên hệ',
      QUOTED: 'Đã báo giá',
      WON: 'Thành công',
      LOST: 'Thất bại',
    };
    return map[state ?? ''] ?? state ?? '-';
  }

  getStatusLabel(status?: string): string {
    return status === 'active' ? 'Hoạt động' : 'Không hoạt động';
  }

  getStatusSeverity(status?: string): any {
    return status === 'active' ? 'success' : 'danger';
  }

  getStateSeverity(state: string | undefined): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | null | undefined {
    const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
      NEW: 'info',
      CONTACTING: 'warn',
      QUOTED: 'info',
      WON: 'success',
      LOST: 'danger',
    };
    return map[state ?? ''] ?? 'secondary';
  }
}