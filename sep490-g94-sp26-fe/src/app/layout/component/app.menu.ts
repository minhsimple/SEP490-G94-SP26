import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthService } from '../../pages/service/auth.service';

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
export class AppMenu implements OnInit {
  model: MenuItem[] = [];

  // Định nghĩa TẤT CẢ các menu item
  private readonly allMenuItems: MenuItem[] = [
    {
      label: 'Quản lý vai trò',
      icon: 'pi pi-fw pi-shield',
      routerLink: ['/pages/role'],
      id: 'role',
    },
    {
      label: 'Quản lý chi nhánh',
      icon: 'pi pi-fw pi-building',
      routerLink: ['/pages/location'],
      id: 'location',
    },
    {
      label: 'Quản lý người dùng',
      icon: 'pi pi-fw pi-users',
      routerLink: ['/pages/users'],
      id: 'users',
    },
    {
      label: 'Quản lý leads',
      icon: 'pi pi-fw pi-users',
      routerLink: ['/pages/leads'],
      id: 'leads',
    },
    {
      label: 'Quản lý danh sách khách hàng',
      icon: 'pi pi-fw pi-user-plus',
      routerLink: ['/pages/customers'],
      id: 'customers',
    },
    {
      label: 'Quản lý sảnh hội trường',
      icon: 'pi pi-fw pi-home',
      routerLink: ['/pages/hall'],
      id: 'hall',
    },
    {
      label: 'Dịch vụ',
      icon: 'pi pi-fw pi-shopping-bag',
      path: '/pages/service',
      id: 'service',
      items: [
        {
          label: 'Quản lý dịch vụ',
          icon: 'pi pi-fw pi-cog',
          routerLink: ['/pages/service'],
        },
        {
          label: 'Quản lý combo-dịch vụ',
          icon: 'pi pi-fw pi-box',
          routerLink: ['/pages/combo-services'],
        },
      ],
    },
    {
      label: 'Thực đơn',
      icon: 'pi pi-fw pi-book',
      path: '/pages/menu',
      id: 'menu',
      items: [
        {
          label: 'Món ăn',
          icon: 'pi pi-fw pi-receipt',
          routerLink: ['/pages/menu-item'],
        },
        {
          label: 'Danh mục món ăn',
          icon: 'pi pi-fw pi-list',
          routerLink: ['/pages/category-menu-item'],
        },
        {
          label: 'Set Menu',
          icon: 'pi pi-fw pi-box',
          routerLink: ['/pages/set-menu'],
        },
      ],
    },
  ];

  // Mapping roleId → danh sách id được phép hiển thị
  // ADMIN (4) và MANAGER (3) thấy tất cả → dùng 'all'
  private readonly rolePermissions: Record<number, string[] | 'all'> = {
    1: ['leads', 'customers'],                                          // SALE
    2: ['leads'],                                                       // RECEPTIONIST
    3: 'all',                                                           // MANAGER
    4: 'all',                                                           // ADMIN
    5: [],                                                              // COORDINATOR — chưa có màn hình
  };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.getMe().subscribe({
      next: (res) => {
        const roleId: number = res.data.roleId;
        this.buildMenu(roleId);
      },
      error: () => {
        // Fallback: không hiển thị gì khi không lấy được user
        this.model = [];
      },
    });
  }

  private buildMenu(roleId: number) {
    const allowed = this.rolePermissions[roleId];

    const filteredItems =
      allowed === 'all'
        ? this.allMenuItems
        : this.allMenuItems.filter((item) =>
            allowed.includes((item as any).id ?? '')
          );

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