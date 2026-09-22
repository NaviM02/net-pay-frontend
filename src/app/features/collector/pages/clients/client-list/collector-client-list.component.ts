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
import { CollectorClientListFilter } from './collector-client-list.filter';

/**
 * Clients assigned to the collector of the session. Same table as the
 * administrator one, without the create, edit and delete actions.
 */
@Component({
  selector: 'app-collector-client-list',
  templateUrl: './collector-client-list.component.html',
  styleUrl: './collector-client-list.component.scss',
  imports: [
    ListPageHeaderComponent,
    FilterMenuComponent,
    TypologyBadgeComponent,
    TableRowActionComponent,
    PaginationComponent,
  ],
})
export class CollectorClientListComponent implements OnInit {
  clients: AppClient[] = [];

  /** `hashId` of the collector of the session, the only one that can be queried. */
  collectorHashId: string | null = null;

  constructor(
    private userService: AppUserService,
    private toastService: ToastService,
    private currentUserService: CurrentUserService,
    protected listStateService: ListStateService,
  ) {
    this.listStateService.init(
      CollectorClientListFilter,
      new Pagination('collector-client-list-pagination'),
      () => this.findAll(),
    );
  }

  ngOnInit(): void {
    this.collectorHashId = this.currentUserService.getCurrentHashId() ?? null;

    if (!this.collectorHashId) {
      this.toastService.error('No se pudo identificar al cobrador de la sesión.');
      return;
    }

    this.findAll();
  }

  findAll(): void {
    if (!this.collectorHashId) return;

    this.userService.findByCollectorHashId(this.collectorHashId, this.listStateService.queryParams).subscribe({
      next: (response) => {
        this.clients = response.body ?? [];
        const total = Number(response.headers.get('X-Total-Count')) || this.clients.length;
        this.listStateService.updatePagination(total, this.clients.length);
      },
      error: () => this.toastService.error('Error al cargar los clientes.'),
    });
  }
}