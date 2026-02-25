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
                        label: 'Auth',
                        icon: 'pi pi-fw pi-user',
                        path: '/auth',
                        items: [
                            {
                                label: 'Login',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/auth/login']
                            },
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
                        ]
                    },
                    // {
                    //     label: 'Crud',
                    //     icon: 'pi pi-fw pi-pencil',
                    //     routerLink: ['/pages/crud']
                    // },
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
                        icon: 'pi pi-fw pi-users',
                        routerLink: ['/pages/customers']
                    },
                    // {
                    //     label: 'Empty',
                    //     icon: 'pi pi-fw pi-circle-off',
                    //     routerLink: ['/pages/empty']
                    // }
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
