import { Routes } from '@angular/router';
import { Crud } from './crud/crud';
import { Empty } from './empty/empty';
import { Users } from './users/users';
import { Leads } from './leads/leads';
import { Customers } from './customers/customers';

export default [
    { path: 'crud', component: Crud },
    { path: 'users', component: Users },
    { path: 'leads', component: Leads },
    { path: 'customers', component: Customers },
    { path: 'empty', component: Empty },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
