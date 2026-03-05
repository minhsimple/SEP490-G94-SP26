import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Users } from './app/pages/users/users';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Users },
            { path: 'profile', loadComponent: () => import('./app/pages/profile/profile').then(m => m.ProfileComponent) },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: 'notfound', redirectTo: '' },  // ← thêm dòng này
    { path: '**', redirectTo: '/notfound' }
];