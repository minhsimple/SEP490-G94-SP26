import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { forkJoin } from 'rxjs';
import { AuthService, UserProfile } from '../service/auth.service';
import { RoleService } from '../service/role.service';
import { LocationService } from '../service/location.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, CardModule, TagModule, ProgressSpinnerModule],
    template: `
        <div class="profile-page">
            <div class="profile-header">
                <h2><i class="pi pi-user"></i> Thông tin cá nhân</h2>
            </div>

            @if (loading()) {
                <div class="loading-container">
                    <p-progressSpinner strokeWidth="4" animationDuration="1s" />
                </div>
            }

            @if (errorMessage() && !loading()) {
                <div class="error-container">
                    <i class="pi pi-exclamation-triangle"></i>
                    <span>{{ errorMessage() }}</span>
                </div>
            }

            @if (user() && !loading()) {
                <div class="profile-content">
                    <p-card>
                        <div class="profile-card">
                            <div class="avatar-section">
                                <div class="avatar-circle">
                                    <i class="pi pi-user"></i>
                                </div>
                                <h3 class="user-fullname">{{ user()!.fullName }}</h3>
                                <p-tag
                                    [value]="user()!.status === 'active' ? 'Hoạt động' : 'Không hoạt động'"
                                    [severity]="user()!.status === 'active' ? 'success' : 'danger'"
                                />
                            </div>

                            <div class="info-section">
                                <div class="info-row">
                                    <div class="info-label">
                                        <i class="pi pi-envelope"></i>
                                        <span>Email</span>
                                    </div>
                                    <div class="info-value">{{ user()!.email }}</div>
                                </div>

                                <div class="info-row">
                                    <div class="info-label">
                                        <i class="pi pi-user"></i>
                                        <span>Họ và tên</span>
                                    </div>
                                    <div class="info-value">{{ user()!.fullName }}</div>
                                </div>

                                <div class="info-row">
                                    <div class="info-label">
                                        <i class="pi pi-phone"></i>
                                        <span>Số điện thoại</span>
                                    </div>
                                    <div class="info-value">{{ user()!.phone || 'Chưa cập nhật' }}</div>
                                </div>

                                <div class="info-row">
                                    <div class="info-label">
                                        <i class="pi pi-briefcase"></i>
                                        <span>Vai trò</span>
                                    </div>
                                    <div class="info-value">{{ roleName() }}</div>
                                </div>

                                <div class="info-row">
                                    <div class="info-label">
                                        <i class="pi pi-map-marker"></i>
                                        <span>Chi nhánh</span>
                                    </div>
                                    <div class="info-value">{{ locationName() }}</div>
                                </div>

                                <div class="info-row">
                                    <div class="info-label">
                                        <i class="pi pi-info-circle"></i>
                                        <span>Trạng thái</span>
                                    </div>
                                    <div class="info-value">
                                        <p-tag
                                            [value]="user()!.status === 'active' ? 'Hoạt động' : 'Không hoạt động'"
                                            [severity]="user()!.status === 'active' ? 'success' : 'danger'"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </p-card>
                </div>
            }
        </div>
    `,
    styles: [`
        .profile-page {
            padding: 1.5rem;
            max-width: 800px;
            margin: 0 auto;
        }

        .profile-header {
            margin-bottom: 1.5rem;

            h2 {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--text-color);
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin: 0;

                i {
                    color: var(--primary-color);
                }
            }
        }

        .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 300px;
        }

        .error-container {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem;
            border-radius: 8px;
            background: var(--red-50, #fef2f2);
            color: var(--red-500, #ef4444);
            font-size: 0.875rem;
        }

        .profile-card {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }

        .avatar-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.75rem;
            padding-bottom: 1.5rem;
            border-bottom: 1px solid var(--surface-border, #dee2e6);
        }

        .avatar-circle {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-400, #818cf8));
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);

            i {
                font-size: 2rem;
                color: white;
            }
        }

        .user-fullname {
            font-size: 1.25rem;
            font-weight: 700;
            color: var(--text-color);
            margin: 0;
        }

        .info-section {
            display: flex;
            flex-direction: column;
            gap: 0;
        }

        .info-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 0;
            border-bottom: 1px solid var(--surface-border, #dee2e6);

            &:last-child {
                border-bottom: none;
            }
        }

        .info-label {
            display: flex;
            align-items: center;
            gap: 0.625rem;
            color: var(--text-color-secondary);
            font-size: 0.875rem;
            font-weight: 500;

            i {
                font-size: 0.875rem;
                width: 18px;
                text-align: center;
                color: var(--primary-color);
            }
        }

        .info-value {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-color);
        }

        @media (max-width: 576px) {
            .info-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.375rem;
            }
        }
    `]
})
export class ProfileComponent implements OnInit {
    private authService = inject(AuthService);
    private roleService = inject(RoleService);
    private locationService = inject(LocationService);
    private cdr = inject(ChangeDetectorRef);

    user = signal<UserProfile | null>(null);
    loading = signal(true);
    errorMessage = signal('');
    roleName = signal('Đang tải...');
    locationName = signal('Đang tải...');

    ngOnInit() {
        this.authService.getMe().subscribe({
            next: (res) => {
                this.user.set(res.data);
                this.loading.set(false);
                const locationId = res.data.locationId ?? res.data.locationIds?.[0];
                this.loadRoleAndLocation(res.data.roleId, locationId);
            },
            error: (err) => {
                this.errorMessage.set('Không thể tải thông tin cá nhân. Vui lòng thử lại sau.');
                this.loading.set(false);
                console.error('Error loading profile:', err);
            }
        });
    }

    private loadRoleAndLocation(roleId: number, locationId: number | undefined) {
        forkJoin({
            roles: this.roleService.searchRoles({ size: 100 }),
            locations: this.locationService.searchLocations({ size: 100 })
        }).subscribe({
            next: ({ roles, locations }) => {
                const role = roles.data.content.find(r => r.id === roleId);
                this.roleName.set(role?.name || `Vai trò #${roleId}`);

                if (locationId) {
                    const location = locations.data.content.find(l => l.id === locationId);
                    this.locationName.set(location?.name || `Chi nhánh #${locationId}`);
                } else {
                    this.locationName.set('-');
                }

                this.cdr.markForCheck();
            },
            error: () => {
                this.roleName.set(`Vai trò #${roleId}`);
                this.locationName.set(locationId ? `Chi nhánh #${locationId}` : '-');
                this.cdr.markForCheck();
            }
        });
    }
}
