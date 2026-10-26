import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AppRole } from '../../../../../model/access-control.model';
import { Pagination } from '../../../../../model/filter.model';
import { AccessControlService } from '../../../../../services/core/access-control.service';
import { ListStateService } from '../../../../../services/other/list-state.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { ConfirmActionService } from '../../../../../services/other/confirm-action.service';
import { confirmAction } from '../../../../../commons/decorators/confirm.decorator';
import { accessErrorMessage } from '../../../../../commons/utils/access-error.utils';
import { ListPageHeaderComponent } from '../../../../../commons/components/list-page-header/list-page-header.component';
import { FilterMenuComponent } from '../../../../../commons/components/filter-menu/filter-menu.component';
import { PaginationComponent } from '../../../../../commons/components/pagination/pagination.component';
import { RoleListFilter } from './role-list.filter';
import { TableRowActionComponent } from '../../../../../commons/components/table-row-action/table-row-action.component';

@Component({
  selector: 'app-role-list',
  imports: [ListPageHeaderComponent, FilterMenuComponent, PaginationComponent, TableRowActionComponent],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss',
})
export class RoleListComponent implements OnInit {
  roles: AppRole[] = [];

  constructor(
    protected accessService: AccessControlService,
    protected listStateService: ListStateService,
    private router: Router,
    private toastService: ToastService,
    private confirmActionService: ConfirmActionService,
  ) {
    this.listStateService.init(RoleListFilter, new Pagination('role-list-pagination'), () => this.findAll());
  }

  ngOnInit(): void { this.findAll(); }

  create(): void { void this.router.navigate(['/roles', 'new']); }

  edit(hashId: string): void { void this.router.navigate(['/roles', hashId, 'edit']); }

  findAll(): void {
    this.accessService.roles(this.listStateService.queryParams).subscribe({
      next: response => {
        this.roles = response.body ?? [];
        this.listStateService.updatePagination(Number(response.headers.get('X-Total-Count')) || this.roles.length, this.roles.length);
      },
      error: () => this.toastService.error('No se pudieron cargar los roles.'),
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
    this.accessService.deleteRole(hashId).subscribe({
      next: () => {
        this.toastService.success('Rol eliminado correctamente.');
        this.accessService.loadAccess(true).subscribe();
        this.findAll();
      },
      error: (error: HttpErrorResponse) => this.toastService.error(accessErrorMessage(error)),
    });
  }
}
