import { Component, OnInit } from '@angular/core';

import { AppClient } from '../../../../../model/app.model';
import { Pagination } from '../../../../../model/filter.model';
import { AppUserService } from '../../../../../services/core/app-user.service';
import { ListStateService } from '../../../../../services/other/list-state.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { CurrentUserService } from '../../../../../services/core/current-user.service';
import { FilterMenuComponent } from '../../../../../commons/components/filter-menu/filter-menu.component';
import { ListPageHeaderComponent } from '../../../../../commons/components/list-page-header/list-page-header.component';
import { PaginationComponent } from '../../../../../commons/components/pagination/pagination.component';
import { TableRowActionComponent } from '../../../../../commons/components/table-row-action/table-row-action.component';
import { TypologyBadgeComponent } from '../../../../../commons/components/typology-badge/typology-badge.component';
import { MyClientListFilter } from './my-client-list.filter';

/**
 * Clients assigned to the signed-in user. Same table as the
 * administrator one, without the create, edit and delete actions.
 */
@Component({
  selector: 'app-my-client-list',
  templateUrl: './my-client-list.component.html',
  styleUrl: './my-client-list.component.scss',
  imports: [
    ListPageHeaderComponent,
    FilterMenuComponent,
    TypologyBadgeComponent,
    TableRowActionComponent,
    PaginationComponent,
  ],
})
export class MyClientListComponent implements OnInit {
  clients: AppClient[] = [];

  /** `hashId` of the signed-in user, the only portfolio that can be queried. */
  userHashId: string | null = null;

  constructor(
    private userService: AppUserService,
    private toastService: ToastService,
    private currentUserService: CurrentUserService,
    protected listStateService: ListStateService,
  ) {
    this.listStateService.init(
      MyClientListFilter,
      new Pagination('my-client-list-pagination'),
      () => this.findAll(),
    );
  }

  ngOnInit(): void {
    this.userHashId = this.currentUserService.getCurrentHashId() ?? null;

    if (!this.userHashId) {
      this.toastService.error('No se pudo identificar al usuario de la sesión.');
      return;
    }

    this.findAll();
  }

  findAll(): void {
    if (!this.userHashId) return;

    this.userService.findClientsByUserHashId(this.userHashId, this.listStateService.queryParams).subscribe({
      next: (response) => {
        this.clients = response.body ?? [];
        const total = Number(response.headers.get('X-Total-Count')) || this.clients.length;
        this.listStateService.updatePagination(total, this.clients.length);
      },
      error: () => this.toastService.error('Error al cargar los clientes.'),
    });
  }
}
