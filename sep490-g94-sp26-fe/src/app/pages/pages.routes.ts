import { Routes } from '@angular/router';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { Users } from './users/users';
import { Leads } from './leads/leads';
import { Customers } from './customers/customers';
import { LocationComponent } from './location/location';
import { RoleComponent } from './role/role';
import { HallComponent } from './hall/hall';
import { HallDetailComponent } from './hall/hall-detail';
import { ServicesComponent } from './services/services';
import { SetMenuComponent } from './set-menu/set-menu';
import { SetMenuDetailComponent } from './set-menu/set-menu-detail.component';
import { SetMenuEditComponent } from './set-menu-edit/set-menu-edit';
import { CategoryMenuItemComponent } from './category-menu-item/category-menu-item.component';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { MenuItemDetailComponent } from './menu-item/menu-item-detail.component';
import { CombosComponent } from './services/combo-services';
<<<<<<< Updated upstream
=======
import { ComboServiceDetailComponent } from './services/combo-service-detail.component';
import { BookingsComponent } from './booking/Booking';
import { BookingCreateComponent } from './booking/Booking-create';
>>>>>>> Stashed changes

export default [
    { path: 'crud', component: Crud },
    { path: 'users', component: Users },
    { path: 'leads', component: Leads },
    { path: 'customers', component: Customers },
    { path: 'location', component: LocationComponent },
    { path: 'role', component: RoleComponent },
    { path: 'empty', component: Empty },
    { path: 'hall', component: HallComponent },
    { path: 'hall/:id', component: HallDetailComponent },
    { path: 'service', component: ServicesComponent },
    { path: 'combo-services', component: CombosComponent },
    // ⚠️ Đặt route cụ thể hơn TRƯỚC route chung
    { path: 'set-menu/create', component: SetMenuEditComponent },
    { path: 'set-menu/edit/:id', component: SetMenuEditComponent },
    { path: 'set-menu/:id', component: SetMenuDetailComponent },
    { path: 'set-menu', component: SetMenuComponent },
    { path: 'category-menu-item', component: CategoryMenuItemComponent },
    { path: 'menu-item/:id', component: MenuItemDetailComponent },
    { path: 'menu-item', component: MenuItemComponent },
    // ⚠️ booking/create phải đứng TRƯỚC booking/:id
    { path: 'booking/create', component: BookingCreateComponent },
    { path: 'booking/:id', component: BookingsComponent },  // detail — thay component khi có
    { path: 'booking', component: BookingsComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;