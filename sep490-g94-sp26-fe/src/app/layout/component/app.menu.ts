import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { Subscription } from 'rxjs';
import { AuthService } from './../../pages/service/auth.service';


@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, AppMenuitem, RouterModule],
  template: `<ul class="layout-menu">
      @for (item of model; track item.label) {
          @if (!item.separator) {
              <li app-menuitem [item]="item" [root]="true"></li>
          } @else {
              <li class="menu-separator"></li>
          }
      }
  </ul>`,
})
export class AppMenu implements OnInit, OnDestroy {
  model: MenuItem[] = [];
  private sub!: Subscription;

  private readonly allMenuItems: MenuItem[] = [
// { label: 'Dashboard', icon: 'pi pi-chart-bar', routerLink: ['/pages/dashboard'], id: 'dashboard' },
// { label: 'Báo cáo chi nhánh', icon: 'pi pi-chart-line', routerLink: ['/pages/reports/branches'], id: 'branch-reports' },
  { label: 'Dashboard quản lý', icon: 'pi pi-gauge', routerLink: ['/pages/dashboardv2'], id: 'dashboardv2' },
  { label: 'Dashboard cá nhân', icon: 'pi pi-user', routerLink: ['/pages/dashboard-sale'], id: 'dashboard-sale' },
  { label: 'Dashboard kế toán', icon: 'pi pi-chart-line', routerLink: ['/pages/dashboard-accountant'], id: 'dashboard-accountant' },
  { label: 'Lịch sự kiện', icon: 'pi pi-calendar', routerLink: ['/pages/calender'], id: 'calender' },
{ label: 'Hợp đồng', icon: 'pi pi-file', routerLink: ['/pages/booking'], id: 'booking' },
{ label: 'Công việc', icon: 'pi pi-check-square', routerLink: ['/pages/beo'], id: 'beo' },
  { label: 'Thanh Toán', icon: 'pi pi-credit-card', routerLink: ['/pages/payment'], id: 'payment' },
  { label: 'Hóa Đơn', icon: 'pi pi-dollar', routerLink: ['/pages/invoice'], id: 'invoice' },
  { label: 'Quản lý vai trò', icon: 'pi pi-shield', routerLink: ['/pages/role'], id: 'role' },
  { label: 'Quản lý chi nhánh', icon: 'pi pi-sitemap', routerLink: ['/pages/location'], id: 'location' },
  { label: 'Quản lý người dùng', icon: 'pi pi-users', routerLink: ['/pages/users'], id: 'users' },
  { label: 'Quản lý khách vãng lai', icon: 'pi pi-user-plus', routerLink: ['/pages/leads'], id: 'leads' },
  { label: 'Quản lý danh sách khách hàng', icon: 'pi pi-id-card', routerLink: ['/pages/customers'], id: 'customers' },
  { label: 'Quản lý sảnh hội trường', icon: 'pi pi-building', routerLink: ['/pages/hall'], id: 'hall' },

  {
    label: 'Dịch vụ',
    icon: 'pi pi-cog',
    path: '/pages/service',
    id: 'service',
    items: [
      { label: 'Quản lý dịch vụ', icon: 'pi pi-cog', routerLink: ['/pages/service'] },
      { label: 'Quản lý combo-dịch vụ', icon: 'pi pi-box', routerLink: ['/pages/combo-services'] },
    ],
  },
  {
    label: 'Quản lý Thực đơn',
    icon: 'pi pi-book',
    path: '/pages/menu',
    id: 'menu',
    items: [
      { label: 'Món ăn', icon: 'pi pi-receipt', routerLink: ['/pages/menu-item'] },
      { label: 'Danh mục món ăn', icon: 'pi pi-list', routerLink: ['/pages/category-menu-item'] },
      { label: 'Thực đơn', icon: 'pi pi-box', routerLink: ['/pages/set-menu'] },
    ],
  },
];

  private readonly rolePermissions: Record<string, string[] | 'all'> = {
    SALE:         ['dashboard-sale', 'leads', 'customers', 'service', 'menu', 'hall', 'booking', 'invoice'],
    RECEPTION:    ['leads', 'calender'],
    RECEPTIONIST: ['leads', 'calender'],
    ACCOUNT:      ['dashboard-accountant', 'customers', 'booking', 'invoice', 'payment'],
    ACCOUNTANT:   ['dashboard-accountant', 'customers', 'booking', 'invoice', 'payment'],
    ACCOUNTING:   ['dashboard-accountant', 'customers', 'booking', 'invoice', 'payment'],
    KETOAN:       ['dashboard-accountant', 'customers', 'booking', 'invoice', 'payment'],
    KE_TOAN:      ['dashboard-accountant', 'customers', 'booking', 'invoice', 'payment'],
    MANAGER:      ['dashboard', 'dashboardv2', 'calender', 'booking', 'payment', 'invoice', 'customers', 'hall', 'service', 'menu', 'users'],
    ADMIN:        'all',
    COORDINATOR:  ['calender', 'booking', 'beo'],
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Lắng nghe codeRole$ — tự động cập nhật menu khi login/logout
    this.sub = this.authService.codeRole$.subscribe(codeRole => {
      console.log('[AppMenu] codeRole changed:', codeRole);
      this.buildMenu(codeRole);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private buildMenu(codeRole: string): void {
    const normalizedRole = (codeRole ?? '').toUpperCase().trim();
    const allowed = this.rolePermissions[normalizedRole] ?? (normalizedRole.includes('ADMIN') ? 'all' : undefined);
    const isAdmin = normalizedRole.includes('ADMIN');
    const adminHiddenIds = ['leads', 'beo', 'dashboard-sale'];

    let filteredItems =
      allowed === 'all'
        ? this.allMenuItems
        : this.allMenuItems.filter(item =>
            (allowed ?? []).includes((item as any).id ?? '')
          );

    if (isAdmin) {
      filteredItems = filteredItems.filter(item => !adminHiddenIds.includes((item as any).id ?? ''));
    }

    this.model = [
      {
        label: 'Pages',
        icon: 'pi pi-fw pi-briefcase',
        path: '/pages',
        items: filteredItems,
      },
    ];
  }
}