import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppPayment } from '../../../../../model/app.model';
import { Pagination } from '../../../../../model/filter.model';
import { AppPaymentService } from '../../../../../services/core/app-payment.service';
import { CurrentUserService } from '../../../../../services/core/current-user.service';
import { ListStateService } from '../../../../../services/other/list-state.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { FilterMenuComponent } from '../../../../../commons/components/filter-menu/filter-menu.component';
import { ListPageHeaderComponent } from '../../../../../commons/components/list-page-header/list-page-header.component';
import { PaginationComponent } from '../../../../../commons/components/pagination/pagination.component';
import { TableRowActionComponent } from '../../../../../commons/components/table-row-action/table-row-action.component';
import { TypologyBadgeComponent } from '../../../../../commons/components/typology-badge/typology-badge.component';
import { MyPaymentListFilter } from './my-payment-list.filter';

/**
 * Payments of the signed-in user. The backend filters them by the
 * `collectorId` of the session, so the list can never show someone else's
 * payments. It can register new ones but never edit or delete them.
 */
@Component({
  selector: 'app-my-payment-list',
  templateUrl: './my-payment-list.component.html',
  styleUrl: './my-payment-list.component.scss',
  imports: [
    CurrencyPipe,
    DatePipe,
    ListPageHeaderComponent,
    FilterMenuComponent,
    TypologyBadgeComponent,
    TableRowActionComponent,
    PaginationComponent,
  ],
})
export class MyPaymentListComponent implements OnInit {
  payments: AppPayment[] = [];

  /** Numeric internal id of the collector of the session. */
  collectorId: number | null = null;

  constructor(
    private paymentService: AppPaymentService,
    private currentUserService: CurrentUserService,
    private toastService: ToastService,
    private router: Router,
    protected listStateService: ListStateService,
  ) {
    this.listStateService.init(
      MyPaymentListFilter,
      new Pagination('my-payment-list-pagination'),
      () => this.findAll(),
    );
  }

  ngOnInit(): void {
    this.collectorId = this.currentUserService.getCurrentId() ?? null;

    if (!this.collectorId) {
      this.toastService.error('No se pudo identificar al cobrador de la sesión.');
      return;
    }

    this.findAll();
  }

  findAll(): void {
    if (!this.collectorId) return;

    // `collectorId` is added on top of the filters of the list state instead of
    // being a filter of its own: it comes from the session and must never be
    // persisted as something the user picked.
    const queryParams = new Map(this.listStateService.queryParams);
    queryParams.set('collectorId', `${this.collectorId}`);

    this.paymentService.findAll(queryParams).subscribe({
      next: (response) => {
        this.payments = response.body ?? [];
        const total = Number(response.headers.get('X-Total-Count')) || this.payments.length;
        this.listStateService.updatePagination(total, this.payments.length);
      },
      error: () => this.toastService.error('Error al cargar los pagos.'),
    });
  }

  add(): void {
    void this.router.navigate(['/my-payments', 'new']);
  }

}
