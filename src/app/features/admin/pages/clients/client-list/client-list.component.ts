import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppClient } from '../../../../../model/app.model';
import { Pagination } from '../../../../../model/filter.model';
import { AppClientService } from '../../../../../services/core/app-client.service';
import { ConfirmActionService } from '../../../../../services/other/confirm-action.service';
import { ListStateService } from '../../../../../services/other/list-state.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { confirmAction } from '../../../../../commons/decorators/confirm.decorator';
import { FilterMenuComponent } from '../../../../../commons/components/filter-menu/filter-menu.component';
import { ListPageHeaderComponent } from '../../../../../commons/components/list-page-header/list-page-header.component';
import { PaginationComponent } from '../../../../../commons/components/pagination/pagination.component';
import { TableRowActionComponent } from '../../../../../commons/components/table-row-action/table-row-action.component';
import { TypologyBadgeComponent } from '../../../../../commons/components/typology-badge/typology-badge.component';
import { ClientListFilter } from './client-list.filter';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.scss',
  imports: [
    ListPageHeaderComponent,
    FilterMenuComponent,
    TypologyBadgeComponent,
    TableRowActionComponent,
    PaginationComponent,
  ],
})
export class ClientListComponent implements OnInit {
  clients: AppClient[] = [];

  constructor(
    private clientService: AppClientService,
    private toastService: ToastService,
    // Required by @confirmAction: it reads the instance registered by this injection.
    private confirmActionService: ConfirmActionService,
    private router: Router,
    protected listStateService: ListStateService,
  ) {
    this.listStateService.init(ClientListFilter, new Pagination('client-list-pagination'), () =>
      this.findAll(),
    );
  }

  ngOnInit(): void {
    this.findAll();
  }

  findAll(): void {
    this.clientService.findAll(this.listStateService.queryParams).subscribe({
      next: (response) => {
        this.clients = response.body ?? [];
        const total = Number(response.headers.get('X-Total-Count')) || this.clients.length;
        this.listStateService.updatePagination(total, this.clients.length);
      },
      error: () => this.toastService.error('Error al cargar los clientes.'),
    });
  }

  add(): void {
    void this.router.navigate(['/clients', 'new']);
  }

  edit(hashId: string): void {
    void this.router.navigate(['/clients', hashId, 'edit']);
  }

  @confirmAction({
    title: 'Eliminar cliente',
    bodyQuestion: (_ctx, args) =>
      args[1] ? `¿Eliminar el cliente ${args[1]}?` : '¿Eliminar este cliente?',
    bodyText: 'Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
  })
  delete(hashId: string, _name: string): void {
    this.clientService.delete(hashId).subscribe({
      next: () => {
        this.toastService.success('Cliente eliminado correctamente.');
        this.findAll();
      },
      error: () => this.toastService.error('Error al eliminar el cliente.'),
    });
  }
}
