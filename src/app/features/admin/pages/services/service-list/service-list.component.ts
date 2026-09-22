import { CurrencyPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../../../model/app.model';
import { Pagination } from '../../../../../model/filter.model';
import { ListStateService } from '../../../../../services/other/list-state.service';
import { ConfirmActionService } from '../../../../../services/other/confirm-action.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { confirmAction } from '../../../../../commons/decorators/confirm.decorator';
import { FilterMenuComponent } from '../../../../../commons/components/filter-menu/filter-menu.component';
import { ListPageHeaderComponent } from '../../../../../commons/components/list-page-header/list-page-header.component';
import { PaginationComponent } from '../../../../../commons/components/pagination/pagination.component';
import { TableRowActionComponent } from '../../../../../commons/components/table-row-action/table-row-action.component';
import { TypologyBadgeComponent } from '../../../../../commons/components/typology-badge/typology-badge.component';
import { AppServiceService } from '../../../../../services/core/app-service.service';
import { ServiceFormModalComponent } from '../service-form-modal/service-form-modal.component';
import { ServiceListFilter } from './service-list.filter';

@Component({
  selector: 'app-service-list',
  templateUrl: './service-list.component.html',
  styleUrl: './service-list.component.scss',
  imports: [
    CurrencyPipe,
    ListPageHeaderComponent,
    FilterMenuComponent,
    TypologyBadgeComponent,
    TableRowActionComponent,
    PaginationComponent,
    ServiceFormModalComponent,
  ],
})
export class ServiceListComponent implements OnInit {
  services: AppService[] = [];

  showModal = false;
  selectedHashId: string | null = null;

  constructor(
    private serviceService: AppServiceService,
    private toastService: ToastService,
    // Required by @confirmAction: it reads the instance registered by this injection.
    private confirmActionService: ConfirmActionService,
    protected listStateService: ListStateService,
  ) {
    this.listStateService.init(ServiceListFilter, new Pagination('service-list-pagination'), () =>
      this.findAll(),
    );
  }

  ngOnInit(): void {
    this.findAll();
  }

  findAll(): void {
    this.serviceService.findAll(this.listStateService.queryParams).subscribe({
      next: (response) => {
        this.services = response.body ?? [];
        const total = Number(response.headers.get('X-Total-Count')) || this.services.length;
        this.listStateService.updatePagination(total, this.services.length);
      },
      error: () => this.toastService.error('msg_error_server'),
    });
  }

  add(): void {
    this.selectedHashId = null;
    this.showModal = true;
  }

  edit(hashId: string): void {
    this.selectedHashId = hashId;
    this.showModal = true;
  }

  onModalClose(saved: boolean): void {
    this.showModal = false;
    this.selectedHashId = null;

    if (saved) {
      this.findAll();
    }
  }

  @confirmAction({
    title: 'Eliminar plan',
    bodyQuestion: (_ctx, args) => args[1] ? `¿Eliminar el plan ${args[1]}?` : '¿Eliminar este plan?',
    bodyText: 'Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
  })
  delete(hashId: string, _name: string): void {
    this.serviceService.delete(hashId).subscribe({
      next: () => {
        this.toastService.success('msg_success_delete');
        this.findAll();
      },
      error: () => this.toastService.error('msg_error_server'),
    });
  }
}
