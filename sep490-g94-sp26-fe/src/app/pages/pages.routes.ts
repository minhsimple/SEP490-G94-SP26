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
    { path: '**', redirectTo: '/notfound' }
] as Routes;
