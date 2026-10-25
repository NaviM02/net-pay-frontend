import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, switchMap } from 'rxjs';
import { AppPermission, AppRole } from '../../../../../model/access-control.model';
import { AccessControlService } from '../../../../../services/core/access-control.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { ConfirmActionService } from '../../../../../services/other/confirm-action.service';
import { confirmAction } from '../../../../../commons/decorators/confirm.decorator';
import { DetailPageHeaderComponent } from '../../../../../commons/components/detail-page-header/detail-page-header.component';
import { RolePermissionTableComponent } from '../../../../../commons/components/role-permission-table/role-permission-table.component';
import { accessErrorMessage } from '../../../../../commons/utils/access-error.utils';

@Component({
  selector: 'app-role-detail',
  imports: [DetailPageHeaderComponent, RolePermissionTableComponent],
  templateUrl: './role-detail.component.html',
  styleUrl: './role-detail.component.scss',
})
export class RoleDetailComponent implements OnInit {
  role: AppRole | null = null;
  permissions: AppPermission[] = [];
  selectedPermissionHashIds: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accessService: AccessControlService,
    private toastService: ToastService,
    private confirmActionService: ConfirmActionService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => forkJoin({
        role: this.accessService.role(params.get('hashId')!),
        permissions: this.accessService.permissions(),
      })),
    ).subscribe({
      next: ({ role, permissions }) => {
        this.role = role;
        this.permissions = permissions;
        this.selectedPermissionHashIds = role.permissions.map(permission => permission.hashId);
      },
      error: (error: HttpErrorResponse) => {
        this.toastService.error(error.status === 404 ? 'No se encontró el rol.' : accessErrorMessage(error));
        void this.router.navigate(['/roles']);
      },
    });
  }

  @confirmAction({
    title: 'Eliminar rol',
    bodyQuestion: (_ctx, args) => `¿Eliminar el rol ${args[1]}?`,
    bodyText: 'Sus permisos dejarán de aplicarse a los usuarios asignados.',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
  })
  delete(hashId: string, _name: string): void {
    this.accessService.deleteRole(hashId).pipe(switchMap(() => this.accessService.loadAccess(true))).subscribe({
      next: () => {
        this.toastService.success('Rol eliminado correctamente.');
        void this.router.navigate(['/roles']);
      },
      error: (error: HttpErrorResponse) => this.toastService.error(accessErrorMessage(error)),
    });
  }
}
