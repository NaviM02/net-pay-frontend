import { Component, OnInit } from '@angular/core';
import { AppClient, AppUser } from '../../../../../model/app.model';
import { Pagination } from '../../../../../model/filter.model';
import { AppUserService } from '../../../../../services/core/app-user.service';
import { ListStateService } from '../../../../../services/other/list-state.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MaterialIconComponent } from '../../../../../commons/components/material-icon/material-icon.component';
import {
  DetailPageHeaderComponent
} from '../../../../../commons/components/detail-page-header/detail-page-header.component';
import { PaginationComponent } from '../../../../../commons/components/pagination/pagination.component';
import { TableRowActionComponent } from '../../../../../commons/components/table-row-action/table-row-action.component';
import { TypologyBadgeComponent } from '../../../../../commons/components/typology-badge/typology-badge.component';

@Component({
  selector: 'app-user-detail',
  imports: [
    MaterialIconComponent,
    DetailPageHeaderComponent,
    PaginationComponent,
    TableRowActionComponent,
    TypologyBadgeComponent
  ],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {

  hashId!: string | null;
  user: AppUser = new AppUser();

  assignedClients: AppClient[] = [];
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
    protected listStateService: ListStateService,
  ) {
    // This table has no filters, only pagination.
    this.listStateService.init(
      { id: 'user-detail-clients-filters', filters: [], order: undefined },
      new Pagination('user-detail-clients-pagination'),
      () => this.findAll(),
    );
  }

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap(params => this.hashId = params.get('hashId')),
        concatMap(() =>
          this.userService.findByHashId(this.hashId!)
        ),
        tap(user => this.user = user),
        tap(() => this.findAll()),
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

  findAll(): void {
    if (!this.hashId) return;

    const { size, offset } = this.listStateService.pagination;

    this.userService.findByCollectorHashId(this.hashId, size, offset).subscribe({
      next: (response) => {
        this.assignedClients = response.body ?? [];
        const total = Number(response.headers.get('X-Total-Count')) || this.assignedClients.length;
        this.listStateService.updatePagination(total, this.assignedClients.length);
      },
      error: () => this.toastService.error('Error al cargar los clientes del usuario'),
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

  get assignedClientsTotal(): number {
    return this.listStateService.pagination.total;
  }

  get lastLoginText(): string {
    if (!this.user.lastLoginAt) return 'nunca';

    const parsed = new Date(this.user.lastLoginAt);
    if (Number.isNaN(parsed.getTime())) return this.user.lastLoginAt;

    return parsed.toLocaleString('es-GT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
