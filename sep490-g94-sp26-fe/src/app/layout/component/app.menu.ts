import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

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
    </ul> `,
})
export class AppMenu {
    model: MenuItem[] = [];

<<<<<<< Updated upstream
    ngOnInit() {
        this.model = [
            // {
            //     label: 'Home',
            //     items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            // },
            {
                label: 'Pages',
                icon: 'pi pi-fw pi-briefcase',
                path: '/pages',
                items: [
                    {
                        // label: 'Auth',
                        // icon: 'pi pi-fw pi-user',
                        // path: '/auth',
                        // items: [
                        //     {
                        //         label: 'Login',
                        //         icon: 'pi pi-fw pi-sign-in',
                        //         routerLink: ['/auth/login']
                        //     },
                        // {
                        //     label: 'Error',
                        //     icon: 'pi pi-fw pi-times-circle',
                        //     routerLink: ['/auth/error']
                        // },
                        // {
                        //     label: 'Access Denied',
                        //     icon: 'pi pi-fw pi-lock',
                        //     routerLink: ['/auth/access']
                        // }
                        // ]
                    },
                    // {
                    //     label: 'Crud',
                    //     icon: 'pi pi-fw pi-pencil',
                    //     routerLink: ['/pages/crud']
                    // },
                    {
                        label: 'Quản lý vai trò',
                        icon: 'pi pi-fw pi-shield',
                        routerLink: ['/pages/role']
                    },
                    {
                        label: 'Quản lý chi nhánh',
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/pages/location']
                    },
                    {
                        label: 'Quản lý người dùng',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/pages/users']
                    },
                    {
                        label: 'Quản lý leads',
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/pages/leads']
                    },
                    {
                        label: 'Quản lý danh khách hàng',
                        icon: 'pi pi-fw pi-user-plus',
                        routerLink: ['/pages/customers']
                    },
                    {
                        label: 'Quản lý sảnh hội trường ',
                        icon: 'pi pi-fw pi-home',
                        routerLink: ['/pages/hall']
                    },
                    {
                        label: 'Quản lý dịch vụ',
                        icon: 'pi pi-fw pi-shopping-bag',
                        routerLink: ['/pages/service']
                    },
                    {
                        label: 'Quản lý combo-dịch vụ',
                        icon: 'pi pi-fw pi-shopping-bag',
                        routerLink: ['/pages/combo-services']
                    },
                    // {
                    //     label: 'Empty',
                    //     icon: 'pi pi-fw pi-circle-off',
                    //     routerLink: ['/pages/empty']
                    // }
                    {
                        label: 'Thực đơn',
                        icon: 'pi pi-fw pi-book',
                        path: '/pages/menu',
                        items: [
                            {
                                label: 'Món ăn',
                                icon: 'pi pi-fw pi-receipt',
                                routerLink: ['/pages/menu-item']
                            },
                            {
                                label: 'Danh mục món ăn',
                                icon: 'pi pi-fw pi-list',
                                routerLink: ['/pages/category-menu-item']
                            },
                            {
                                label: 'Set Menu',
                                icon: 'pi pi-fw pi-box',
                                routerLink: ['/pages/set-menu']
                            }
                        ]
                    }
                ]
            },
            // {
            //     label: 'Hierarchy',
            //     path: '/hierarchy',
            //     items: [
            //         {
            //             label: 'Submenu 1',
            //             icon: 'pi pi-fw pi-bookmark',
            //             path: '/hierarchy/submenu_1',
            //             items: [
            //                 {
            //                     label: 'Submenu 1.1',
            //                     icon: 'pi pi-fw pi-bookmark',
            //                     path: '/hierarchy/submenu_1/submenu_1_1',
            //                     items: [
            //                         { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
            //                         { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
            //                     ]
            //                 },
            //                 {
            //                     label: 'Submenu 1.2',
            //                     icon: 'pi pi-fw pi-bookmark',
            //                     path: '/hierarchy/submenu_1/submenu_1_2',
            //                     items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
            //                 }
            //             ]
            //         },
            //     ]
            // },
        ];
    }
}
=======
  private readonly allMenuItems: MenuItem[] = [
    { label: 'Quản lý vai trò', icon: 'pi pi-fw pi-shield', routerLink: ['/pages/role'], id: 'role' },
    { label: 'Quản lý chi nhánh', icon: 'pi pi-fw pi-building', routerLink: ['/pages/location'], id: 'location' },
    { label: 'Quản lý người dùng', icon: 'pi pi-fw pi-users', routerLink: ['/pages/users'], id: 'users' },
    { label: 'Quản lý leads', icon: 'pi pi-fw pi-users', routerLink: ['/pages/leads'], id: 'leads' },
    { label: 'Quản lý danh sách khách hàng', icon: 'pi pi-fw pi-user-plus', routerLink: ['/pages/customers'], id: 'customers' },
    { label: 'Quản lý sảnh hội trường', icon: 'pi pi-fw pi-home', routerLink: ['/pages/hall'], id: 'hall' },
    { label: 'Đặt tiệc', icon: 'pi pi-fw pi-home', routerLink: ['/pages/booking'], id: 'booking' },
    {
      label: 'Dịch vụ', icon: 'pi pi-fw pi-shopping-bag', path: '/pages/service', id: 'service',
      items: [
        { label: 'Quản lý dịch vụ', icon: 'pi pi-fw pi-cog', routerLink: ['/pages/service'] },
        { label: 'Quản lý combo-dịch vụ', icon: 'pi pi-fw pi-box', routerLink: ['/pages/combo-services'] },
      ],
    },
    {
      label: 'Thực đơn', icon: 'pi pi-fw pi-book', path: '/pages/menu', id: 'menu',
      items: [
        { label: 'Món ăn', icon: 'pi pi-fw pi-receipt', routerLink: ['/pages/menu-item'] },
        { label: 'Danh mục món ăn', icon: 'pi pi-fw pi-list', routerLink: ['/pages/category-menu-item'] },
        { label: 'Set Menu', icon: 'pi pi-fw pi-box', routerLink: ['/pages/set-menu'] },
      ],
    },
  ];

  private readonly rolePermissions: Record<string, string[] | 'all'> = {
    SALE:         ['leads', 'customers'],
    RECEPTIONIST: ['leads'],
    MANAGER:      'all',
    ADMIN:        'all',
    COORDINATOR:  [],
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
    const allowed = this.rolePermissions[codeRole];

    const filteredItems =
      allowed === 'all'
        ? this.allMenuItems
        : this.allMenuItems.filter(item =>
            (allowed ?? []).includes((item as any).id ?? '')
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
>>>>>>> Stashed changes
