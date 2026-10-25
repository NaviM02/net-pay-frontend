import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { concatMap, finalize, forkJoin, of, switchMap, take } from 'rxjs';
import { AppPermission, AppRole, RoleRequest } from '../../../../../model/access-control.model';
import { AccessControlService } from '../../../../../services/core/access-control.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { PermissionDirective } from '../../../../../commons/directives/permission.directive';
import { RolePermissionTableComponent } from '../../../../../commons/components/role-permission-table/role-permission-table.component';
import { accessErrorMessage } from '../../../../../commons/utils/access-error.utils';
import { DetailPageHeaderComponent } from '../../../../../commons/components/detail-page-header/detail-page-header.component';

@Component({
  selector: 'app-role-form',
  imports: [FormsModule, RouterLink, PermissionDirective, RolePermissionTableComponent, DetailPageHeaderComponent],
  templateUrl: './role-form.component.html',
  styleUrl: './role-form.component.scss',
})
export class RoleFormComponent implements OnInit {
  role: AppRole | null = null;
  permissions: AppPermission[] = [];
  request: RoleRequest = { name: '', description: '', status: 'ACTIVE', permissionHashIds: [] };
  hashId: string | null = null;
  busy = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accessService: AccessControlService,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      take(1),
      switchMap(params => {
        this.hashId = params.get('hashId');
        return this.hashId
          ? forkJoin({ permissions: this.accessService.permissions(), role: this.accessService.role(this.hashId) })
          : this.accessService.permissions().pipe(concatMap(permissions => of({ permissions, role: null })));
      }),
    ).subscribe({
      next: data => {
        this.permissions = data.permissions;
        this.role = data.role;
        if (this.role?.status === 'LOCKED') {
          this.toastService.warning('Los roles de sistema están protegidos y no se pueden modificar.');
          void this.router.navigate(['/roles', this.role.hashId]);
          return;
        }
        this.request = {
          name: this.role?.name ?? '',
          description: this.role?.description ?? '',
          status: this.role?.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
          permissionHashIds: this.role?.permissions.map(permission => permission.hashId) ?? [],
        };
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 404) {
          this.toastService.error('No se encontró el rol.');
          void this.router.navigate(['/roles']);
          return;
        }
        this.toastService.error(accessErrorMessage(error));
      },
    });
  }

  save(): void {
    if (this.busy || !this.isValid) return;
    this.busy = true;
    this.accessService.saveRole(this.hashId, {
      ...this.request,
      name: this.request.name.trim(),
      description: this.request.description?.trim() || null,
    }).pipe(
      switchMap(role => this.accessService.loadAccess(true).pipe(concatMap(() => of(role)))),
      finalize(() => this.busy = false),
    ).subscribe({
      next: role => {
        this.toastService.success(this.hashId ? 'Rol actualizado correctamente.' : 'Rol creado correctamente.');
        void this.router.navigate(['/roles', role.hashId]);
      },
      error: (error: HttpErrorResponse) => this.toastService.error(accessErrorMessage(error)),
    });
  }

  get isValid(): boolean {
    return !!this.request.name.trim()
      && this.request.name.trim().length <= 150
      && (this.request.description?.length ?? 0) <= 500;
  }
}
