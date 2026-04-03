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
import { ServiceDetailComponent } from './services/service-detail.component';
import { SetMenuComponent } from './set-menu/set-menu';
import { SetMenuDetailComponent } from './set-menu/set-menu-detail.component';
import { SetMenuEditComponent } from './set-menu-edit/set-menu-edit';
import { CategoryMenuItemComponent } from './category-menu-item/category-menu-item.component';
import { MenuItemComponent } from './menu-item/menu-item.component';
import { MenuItemDetailComponent } from './menu-item/menu-item-detail.component';
import { CombosComponent } from './services/combo-services';
import { BookingsComponent } from './booking/Booking';
import { BookingCreateComponent } from './booking/Booking-create';
import { BookingDetailComponent } from './booking/Booking-detail';
import { ComboServiceDetailComponent } from './services/combo-service-detail.component';
import { PaymentsComponent } from './payment/Payment';
import { InvoicesComponent } from './invoice/Invoice';
import { InvoiceDetailComponent } from './invoice/Invoice-detail';


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
    { path: 'service/:id', component: ServiceDetailComponent },
    { path: 'service', component: ServicesComponent },
    { path: 'combo-services/:id', component: ComboServiceDetailComponent },
    { path: 'combo-services', component: CombosComponent },
    // ⚠️ Đặt route cụ thể hơn TRƯỚC route chung
    { path: 'set-menu/create', component: SetMenuEditComponent },
    { path: 'set-menu/edit/:id', component: SetMenuEditComponent },
    { path: 'set-menu/:id', component: SetMenuDetailComponent },
    { path: 'set-menu', component: SetMenuComponent },
    { path: 'category-menu-item', component: CategoryMenuItemComponent },
    { path: 'menu-item/:id', component: MenuItemDetailComponent },
    { path: 'menu-item', component: MenuItemComponent },
    // ⚠️ booking route cụ thể phải đứng trước route chung
    { path: 'booking/create', component: BookingCreateComponent },
    { path: 'booking/:id/edit', component: BookingCreateComponent },
    { path: 'booking/:id/view', component: BookingDetailComponent },
    { path: 'booking/:id', component: BookingDetailComponent },
    { path: 'booking', component: BookingsComponent },
    // ⚠️ invoice route cụ thể phải đứng trước route chung
    { path: 'invoice/:id', component: InvoiceDetailComponent },
    { path: 'invoice', component: InvoicesComponent },
    { path: 'payment', component: PaymentsComponent },
    { path: '**', redirectTo: '/notfound' }
] as Routes;