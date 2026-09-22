import { Component, OnInit } from '@angular/core';
import { AppUser } from '../../../../../model/app.model';
import { AppUserService } from '../../../../../services/core/app-user.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MaterialIconComponent } from '../../../../../commons/components/material-icon/material-icon.component';
import {
  DetailPageHeaderComponent
} from '../../../../../commons/components/detail-page-header/detail-page-header.component';
import { TypologyBadgeComponent } from '../../../../../commons/components/typology-badge/typology-badge.component';

@Component({
  selector: 'app-user-detail',
  imports: [
    MaterialIconComponent,
    DetailPageHeaderComponent,
    TypologyBadgeComponent
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {

  hashId!: string | null;
  user: AppUser = new AppUser();

  assignedClients = 0;
  registeredPayments = 0;
  completedPayments = 0;
  totalPayments = 0;
  auditCount = 0;

  activities: any[] = [];

  constructor(
    private userService: AppUserService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap(params => this.hashId = params.get('hashId')),
        concatMap(() =>
          this.userService.findByHashId(this.hashId!)
        ),
        tap(user => this.user = user),
      )
      .subscribe({
        error: (e: HttpErrorResponse) => {
          if (e.status === 404) {
            this.toastService.error('Entidad no encontrada');
            void this.router.navigate(['/configuration/users']);
            return;
          }

          this.toastService.error('Error de servidor');
        }
      });
  }

  get initials(): string {
    return this.user.fullName
      ?.split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(name => name.charAt(0).toUpperCase())
      .join('') ?? '';
  }

  onDelete(): void {
    if (!this.hashId) return;

    this.userService.delete(this.hashId)
      .subscribe({
        next: () => {
          this.toastService.success('msg_success_delete');
          void this.router.navigate(['/configuration/users']);
        },
        error: () => {
          this.toastService.error('msg_error_server');
        }
      });
  }
}
