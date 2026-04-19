import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './app/pages/service/auth.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {
    private router = inject(Router);
    private authService = inject(AuthService);

    @HostListener('window:storage', ['$event'])
    onStorageChanged(event: StorageEvent): void {
        if (event.storageArea !== localStorage) {
            return;
        }

        // Only react to events that can indicate sign-out in another tab.
        if (event.key !== 'accessToken' && event.key !== null) {
            return;
        }

        if (!this.authService.isAuthenticated() && this.router.url !== '/auth/login') {
            void this.router.navigate(['/auth/login']);
        }
    }
}
