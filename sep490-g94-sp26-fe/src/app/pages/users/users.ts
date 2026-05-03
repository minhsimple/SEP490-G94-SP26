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
import { PasswordModule } from 'primeng/password';
import { MultiSelectModule } from 'primeng/multiselect';
import { User, UserService } from '../service/users.service';
import { RoleService } from '../service/role.service';
import { LocationService } from '../service/location.service';
import { Router } from '@angular/router';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-users',
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
    PasswordModule,
    MultiSelectModule,
  ],
  template: `
    <div class="card">
      <p-toast />

      <p-toolbar styleClass="mb-6">
        <ng-template #start>
          <p-button
            label="Thêm người dùng mới"
            icon="pi pi-plus"
            severity="primary"
            class="mr-2"
            (onClick)="openNew()"
          />
          <p-select
            *ngIf="!isSingleLocation"
            [options]="locationOptions"
            [(ngModel)]="selectedLocationId"
            optionLabel="label"
            optionValue="value"
            placeholder="Lọc chi nhánh"
            (onChange)="onLocationChange($event)"
            class="ml-2"
            [showClear]="true"
            style="width: 200px"
            appendTo="body"
          />
          <!-- <p-button
                        severity="danger"
                        label="Xóa"
                        icon="pi pi-trash"
                        outlined
                        (onClick)="deleteSelectedUsers()"
                        [disabled]="!selectedUsers || !selectedUsers.length"
                    /> -->
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
        [value]="users()"
        [rows]="pageSize"
        [columns]="cols"
        [paginator]="true"
        [totalRecords]="totalRecords"
        [lazy]="true"
        (onLazyLoad)="onLazyLoad($event)"
        [globalFilterFields]="['fullName', 'email', 'phone', 'role', 'status']"
        [tableStyle]="{ 'min-width': '75rem' }"
        [(selection)]="selectedUsers"
        [rowHover]="true"
        dataKey="id"
        currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} người dùng"
        [showCurrentPageReport]="true"
        [rowsPerPageOptions]="[10, 20, 30]"
        [loading]="loading"
      >
        <ng-template #caption>
          <div class="flex items-center justify-between">
            <h2 class="m-0 text-2xl font-bold">Danh sách người dùng</h2>
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
            <th pSortableColumn="role" style="min-width:10rem">
              Vai trò <p-sortIcon field="role" />
            </th>
            <th pSortableColumn="status" style="min-width:10rem">
              Trạng thái <p-sortIcon field="status" />
            </th>
            <th style="min-width:12rem">Thao tác</th>
          </tr>
        </ng-template>

        <ng-template #body let-user>
          <tr>
            <td><p-tableCheckbox [value]="user" /></td>
            <td>
              <div class="flex items-center gap-3">
                <div
                  class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold"
                >
                  {{ getInitials(user.fullName) }}
                </div>
                <span class="font-medium">{{ user.fullName }}</span>
              </div>
            </td>
            <td><i class="pi pi-envelope mr-2 text-gray-400"></i>{{ user.email }}</td>
            <td><i class="pi pi-phone mr-2 text-gray-400"></i>{{ user.phone || '-' }}</td>
            <td>
              <p-tag [value]="getRoleName(user.roleId)" [icon]="getRoleIcon(user.roleId)" />
            </td>
            <td>
              <p-tag
                [value]="getStatusLabel(user.status)"
                [severity]="getStatusSeverity(user.status)"
              />
            </td>

            <td>
              <div class="flex gap-2">
                <p-button
                  icon="pi pi-pencil"
                  [rounded]="true"
                  [outlined]="true"
                  severity="info"
                  (click)="editUser(user)"
                  pTooltip="Chỉnh sửa"
                  tooltipPosition="top"
                />
                <p-button
                  [icon]="(user.status || '').toLowerCase() === 'active' ? 'pi pi-ban' : 'pi pi-check-circle'"
                  [severity]="(user.status || '').toLowerCase() === 'active' ? 'warn' : 'success'"
                  [rounded]="true"
                  [outlined]="true"
                  (click)="toggleStatus(user)"
                  tooltipPosition="top"
                />
                <p-button
                  icon="pi pi-eye"
                  severity="info"
                  [rounded]="true"
                  [outlined]="true"
                  (click)="goToUserDetail(user)"
                  pTooltip="Xem chi tiết và thống kê"
                  tooltipPosition="top"
                />
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Dialog thêm/sửa người dùng -->
      <p-dialog
        [(visible)]="userDialog"
        [style]="{ width: '500px', maxHeight: '90vh' }"
        [contentStyle]="{ overflow: 'auto', maxHeight: 'calc(90vh - 9rem)' }"
        [header]="user && user.id ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'"
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
              <label class="block font-bold mb-3"
                >Họ và tên <span class="text-red-500">*</span></label
              >
              <input
                type="text"
                pInputText
                [(ngModel)]="user.fullName"
                required
                autofocus
                fluid
                placeholder="Nguyễn Văn A"
              />
              <small class="text-red-500" *ngIf="submitted && !user.fullName"
                >Họ và tên là bắt buộc.</small
              >
            </div>

            <div>
              <label class="block font-bold mb-3">Email <span class="text-red-500">*</span></label>
              <input
                type="email"
                pInputText
                [(ngModel)]="user.email"
                required
                fluid
                placeholder="email@example.com"
              />
              <small class="text-red-500" *ngIf="submitted && !user.email"
                >Email là bắt buộc.</small
              >
            </div>

            <div>
              <label class="block font-bold mb-3">Số điện thoại</label>
              <input
                type="text"
                pInputText
                [(ngModel)]="user.phone"
                fluid
                placeholder="0901234567"
              />
            </div>

            <div>
              <label class="block font-bold mb-3">Chi nhánh</label>
              <p-multiselect
                [options]="locationOptions"
                [(ngModel)]="user.locationIds"
                optionLabel="label"
                optionValue="value"
                placeholder="-- Chọn chi nhánh --"
                [loading]="loadingLocations"
                [showClear]="true"
                [disabled]="isSingleLocation"
                fluid
                appendTo="body"
              />
            </div>

            <div>
              <label class="block font-bold mb-3"
                >Vai trò <span class="text-red-500">*</span></label
              >
              <p-select
                [options]="roleOptions"
                [(ngModel)]="user.roleId"
                optionLabel="label"
                optionValue="value"
                placeholder="-- Chọn vai trò --"
                [loading]="loadingRoles"
                fluid
                appendTo="body"
              />
              <small class="text-red-500" *ngIf="submitted && !user.roleId"
                >Vai trò là bắt buộc.</small
              >
            </div>


            <div *ngIf="!user.id">
              <label class="block font-bold mb-3"
                >Mật khẩu <span class="text-red-500">*</span></label
              >
              <p-password
                [(ngModel)]="user.password"
                [toggleMask]="true"
                fluid
                placeholder="Nhập mật khẩu"
              />
              <small class="text-red-500" *ngIf="submitted && !user.id && !user.password"
                >Mật khẩu là bắt buộc.</small
              >
            </div>
          </div>
        </ng-template>

        <ng-template #footer>
          <p-button label="Hủy" icon="pi pi-times" text (click)="hideDialog()" />
          <p-button label="Lưu" icon="pi pi-check" [loading]="saving" (click)="saveUser()" />
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
        .p-dialog .p-dialog-header {
          padding: 1.5rem;
        }
        .p-dialog .p-dialog-content {
          padding: 0 1.5rem 1.5rem 1.5rem;
        }
      }
    `,
  ],
  providers: [MessageService, UserService, RoleService, LocationService, ConfirmationService],
})
export class Users implements OnInit {
  userDialog = false;
  users = signal<User[]>([]);
  user!: User;
  selectedUsers!: User[] | null;
  submitted = false;
  saving = false;
  loading = false;
  loadingRoles = false;
  loadingLocations = false;
  totalRecords = 0;
  pageSize = 20;
  currentPage = 0;
  cols!: Column[];

  // Dropdown options
  roleOptions: { label: string; value: number }[] = [];
  locationOptions: { label: string; value: number }[] = [];
  roleMap = new Map<number, string>();
  readonly roleCode = (localStorage.getItem('codeRole') ?? '').toUpperCase();
  readonly isAdmin = this.roleCode.includes('ADMIN');
  readonly isManager = this.roleCode.includes('MANAGER');
  readonly isSingleLocation = !this.isAdmin && !this.isManager;
  readonly managerLocationId = Number(localStorage.getItem('locationId') ?? 0) || null;
  readonly managerLocationIds: number[] = (() => {
    if (!this.isManager) return [];
    try { return JSON.parse(localStorage.getItem('locationIds') ?? '[]') as number[]; } catch { return []; }
  })();

  @ViewChild('dt') dt!: Table;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private locationService: LocationService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {}

  selectedLocationId: number | null = null;

  ngOnInit() {
    this.cols = [
      { field: 'fullName', header: 'Họ và tên' },
      { field: 'email', header: 'Email' },
      { field: 'phone', header: 'Số điện thoại' },
      { field: 'role', header: 'Vai trò' },
      { field: 'status', header: 'Trạng thái' },
    ];
    if (this.isSingleLocation && this.managerLocationId) {
      this.selectedLocationId = this.managerLocationId;
    }
    this.loadRoleOptions();
    this.loadLocationOptions();
  }

  loadRoleOptions() {
    this.loadingRoles = true;
    this.roleService.searchRoles({ page: 0, size: 100 }).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.roleOptions = res.data.content.map((r) => ({
            label: r.name ?? '',
            value: r.id,
          }));
          this.roleMap.clear();
          res.data.content.forEach((r) => this.roleMap.set(r.id, r.name ?? ''));
        }
        this.loadingRoles = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách vai trò',
          life: 3000,
        });
        this.loadingRoles = false;
      },
    });
  }

  loadLocationOptions() {
    this.loadingLocations = true;
    this.locationService.searchLocations({ page: 0, size: 100 }).subscribe({
      next: (res) => {
        if (res.code === 200) {
          const allLocations = res.data.content.map((l) => ({
            label: l.name ?? '',
            value: l.id,
          }));
          if (this.isManager) {
            this.locationOptions = this.managerLocationIds.length
              ? allLocations.filter((item) => this.managerLocationIds.includes(Number(item.value)))
              : allLocations.filter((item) => Number(item.value) === this.managerLocationId);
          } else if (this.isSingleLocation) {
            this.locationOptions = allLocations.filter((item) => Number(item.value) === this.managerLocationId);
          } else {
            this.locationOptions = allLocations;
          }
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

  loadUsers(page = 0, size = this.pageSize, locationId?: number | null) {
    this.loading = true;
    const params: any = { page, size };
    const effectiveLocationId = this.isSingleLocation ? this.managerLocationId : locationId;
    if (effectiveLocationId) params.locationId = effectiveLocationId;
    this.userService.searchUsers(params).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.users.set(res.data.content);
          this.totalRecords = res.data.totalElements;
        }
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải danh sách người dùng',
          life: 3000,
        });
        this.loading = false;
      },
    });
  }

  onLazyLoad(event: any) {
    const page = event.first / event.rows;
    this.pageSize = event.rows;
    this.currentPage = page;
    this.loadUsers(page, event.rows, this.selectedLocationId);
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onLocationChange(event: any) {
    this.selectedLocationId = event.value;
    // reload to first page with filter
    this.loadUsers(0, this.pageSize, this.selectedLocationId);
    if (this.dt) {
      this.dt.reset();
    }
  }

  openNew() {
    const defaultLocationIds = this.isSingleLocation && this.managerLocationId
      ? [this.managerLocationId]
      : [];
    this.user = { status: 'active', locationIds: defaultLocationIds };
    this.submitted = false;
    this.userDialog = true;
  }

  editUser(user: User) {
    const existingLocationIds = user.locationIds?.length
      ? user.locationIds
      : user.locationId ? [user.locationId] : [];
    const locationIds = this.isSingleLocation && this.managerLocationId
      ? [this.managerLocationId]
      : existingLocationIds;
    this.user = { ...user, locationIds };
    this.userDialog = true;
  }

  goToUserDetail(user: User) {
    this.router.navigate(['/pages/users', user.id]);
  }

  saveUser() {
    this.submitted = true;

    if (!this.user.fullName?.trim() || !this.user.email?.trim() || !this.user.roleId) return;
    if (!this.user.id && !this.user.password) {
      this.messageService.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Vui lòng nhập mật khẩu',
        life: 3000,
      });
      return;
    }

    this.saving = true;
    const payloadLocationIds = this.isSingleLocation && this.managerLocationId
      ? [this.managerLocationId]
      : (this.user.locationIds ?? []);

    if (this.user.id) {
      this.userService
        .updateUser(this.user.id, {
          email: this.user.email,
          fullName: this.user.fullName,
          phone: this.user.phone,
          roleId: this.user.roleId,
          locationIds: payloadLocationIds,
          password: this.user.password,
        })
        .subscribe({
          next: (res) => {
            if (res.code === 200) {
              this.loadUsers(this.currentPage, this.pageSize);
              this.messageService.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã cập nhật người dùng',
                life: 3000,
              });
              this.hideDialog();
            }
            this.saving = false;
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: err.error?.message || 'Cập nhật thất bại',
              life: 3000,
            });
            this.saving = false;
          },
        });
    } else {
      this.userService
        .createUser({
          email: this.user.email!,
          fullName: this.user.fullName!,
          phone: this.user.phone,
          roleId: this.user.roleId!,
          locationIds: payloadLocationIds,
          password: this.user.password!,
        })
        .subscribe({
          next: (res) => {
            if (res.code === 200) {
              this.loadUsers(this.currentPage, this.pageSize);
              this.messageService.add({
                severity: 'success',
                summary: 'Thành công',
                detail: 'Đã tạo người dùng mới',
                life: 3000,
              });
              this.hideDialog();
            }
            this.saving = false;
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: err.error?.message || 'Tạo người dùng thất bại',
              life: 3000,
            });
            this.saving = false;
          },
        });
    }
  }

  toggleStatus(user: User) {
    const action = String(user.status ?? '').toLowerCase() === 'active' ? 'vô hiệu hóa' : 'kích hoạt';
    this.confirmationService.confirm({
      message: `Bạn có chắc muốn ${action} người dùng ${user.fullName}?`,
      header: 'Xác nhận',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Có',
      rejectLabel: 'Không',
      accept: () => {
        this.userService.changeStatus(user.id).subscribe({
          next: (res) => {
            if (res.code === 200) {
              this.loadUsers(this.currentPage, this.pageSize);
              this.messageService.add({
                severity: 'success',
                summary: 'Thành công',
                detail: `Đã ${action} người dùng`,
                life: 3000,
              });
            }
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Lỗi',
              detail: err.error?.message || 'Thao tác thất bại',
              life: 3000,
            });
          },
        });
      },
    });
  }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: `Bạn có chắc chắn muốn xóa người dùng ${user.fullName}?`,
      header: 'Xác nhận',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Có',
      rejectLabel: 'Không',
      accept: () => {
        this.users.set(this.users().filter((v) => v.id !== user.id));
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã xóa người dùng',
          life: 3000,
        });
      },
    });
  }

  deleteSelectedUsers() {
    this.confirmationService.confirm({
      message: 'Bạn có chắc chắn muốn xóa các người dùng đã chọn?',
      header: 'Xác nhận',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Có',
      rejectLabel: 'Không',
      accept: () => {
        this.users.set(this.users().filter((v) => !this.selectedUsers?.includes(v)));
        this.selectedUsers = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã xóa người dùng',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.userDialog = false;
    this.submitted = false;
  }

  exportCSV() {
    this.dt.exportCSV();
  }

  getInitials(fullName?: string): string {
    if (!fullName) return '?';
    const names = fullName.split(' ');
    return names.length >= 2
      ? (names[0][0] + names[names.length - 1][0]).toUpperCase()
      : fullName.substring(0, 2).toUpperCase();
  }

  getStatusLabel(status?: string): string {
    return status === 'active' ? 'Hoạt động' : 'Không hoạt động';
  }

  getStatusSeverity(status?: string): any {
    return status === 'active' ? 'success' : 'danger';
  }

  getRoleName(roleId?: number): string {
    if (!roleId) return 'Chưa gán';
    return this.roleMap.get(roleId) ?? 'Không xác định';
  }

  getRoleIcon(roleId?: number): string {
    const roleName = this.getRoleName(roleId);
    if (roleName.includes('Quản trị')) return 'pi pi-shield';
    if (roleName.includes('Kinh doanh')) return 'pi pi-briefcase';
    if (roleName.includes('Kế toán')) return 'pi pi-calculator';
    if (roleName.includes('Bếp')) return 'pi pi-shop';
    if (roleName.includes('Lễ tân')) return 'pi pi-bell';
    if (roleName.includes('Sự kiện')) return 'pi pi-calendar';
    return 'pi pi-user';
  }
}
