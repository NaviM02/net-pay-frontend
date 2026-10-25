import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppPayment } from '../../../../../model/app.model';
import { Pagination } from '../../../../../model/filter.model';
import { AppPaymentService } from '../../../../../services/core/app-payment.service';
import { ListStateService } from '../../../../../services/other/list-state.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { FilterMenuComponent } from '../../../../../commons/components/filter-menu/filter-menu.component';
import { ListPageHeaderComponent } from '../../../../../commons/components/list-page-header/list-page-header.component';
import { PaginationComponent } from '../../../../../commons/components/pagination/pagination.component';
import { TableRowActionComponent, TableRowCustomAction } from '../../../../../commons/components/table-row-action/table-row-action.component';
import { TypologyBadgeComponent } from '../../../../../commons/components/typology-badge/typology-badge.component';
import { PaymentListFilter } from './payment-list.filter';
import { DataImportComponent } from '../../../../../commons/components/data-import/data-import.component';
import { openBlobInNewTab } from '../../../../../commons/utils/blob.utils';

@Component({
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.scss',
  imports: [
    CurrencyPipe,
    DatePipe,
    ListPageHeaderComponent,
    FilterMenuComponent,
    TypologyBadgeComponent,
    TableRowActionComponent,
    PaginationComponent,
    DataImportComponent,
  ],
})
export class PaymentListComponent implements OnInit {
  payments: AppPayment[] = [];

  constructor(
    private paymentService: AppPaymentService,
    private toastService: ToastService,
    private router: Router,
    protected listStateService: ListStateService,
  ) {
    this.listStateService.init(PaymentListFilter, new Pagination('payment-list-pagination'), () =>
      this.findAll(),
    );
  }

  ngOnInit(): void {
    this.findAll();
  }

  findAll(): void {
    this.paymentService.findAll(this.listStateService.queryParams).subscribe({
      next: (response) => {
        this.payments = response.body ?? [];
        const total = Number(response.headers.get('X-Total-Count')) || this.payments.length;
        this.listStateService.updatePagination(total, this.payments.length);
      },
      error: () => this.toastService.error('Error al cargar los pagos.'),
    });
  }

  add(): void {
    void this.router.navigate(['/payments', 'new']);
  }

  edit(hashId: string): void {
    void this.router.navigate(['/payments', hashId, 'edit']);
  }

  rowActions(payment: AppPayment): TableRowCustomAction[] {
    return payment.attachmentUrl ? [{
      label: 'Ver comprobante',
      icon: 'attach_file',
      action: () => this.paymentService.findAttachment(payment.hashId).subscribe({
        next: blob => openBlobInNewTab(blob),
        error: () => this.toastService.error('No se pudo abrir el archivo adjunto.'),
      }),
    }] : [];
  }
}
