import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { authGuard } from './app/components/auth.guard';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'pages/dashboard', pathMatch: 'full' },
            { path: 'profile', loadComponent: () => import('./app/pages/profile/profile').then(m => m.ProfileComponent) },
            { path: 'change-password', loadComponent: () => import('./app/pages/profile/change-password').then(m => m.ChangePasswordComponent) },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') }
        ]
    },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: 'notfound', loadComponent: () => import('./app/pages/notfound/notfound').then(m => m.Notfound) },
    { path: '**', redirectTo: '/notfound' }
];