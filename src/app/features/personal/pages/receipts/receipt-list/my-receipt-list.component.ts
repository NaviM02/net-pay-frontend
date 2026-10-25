import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { AppReceipt } from '../../../../../model/app.model';
import { Pagination } from '../../../../../model/filter.model';
import { AppReceiptService } from '../../../../../services/core/app-receipt.service';
import { CurrentUserService } from '../../../../../services/core/current-user.service';
import { ListStateService } from '../../../../../services/other/list-state.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { FilterMenuComponent } from '../../../../../commons/components/filter-menu/filter-menu.component';
import { ListPageHeaderComponent } from '../../../../../commons/components/list-page-header/list-page-header.component';
import { PaginationComponent } from '../../../../../commons/components/pagination/pagination.component';
import {
  TableRowActionComponent,
  TableRowCustomAction,
} from '../../../../../commons/components/table-row-action/table-row-action.component';
import { downloadBlob, openBlobInNewTab } from '../../../../../commons/utils/blob.utils';
import { MyReceiptListFilter } from './my-receipt-list.filter';

/**
 * Receipts issued by the signed-in user. The backend filters them by
 * the `collectorId` of the session, so the list never shows someone else's
 * receipts. Viewing, downloading and printing work exactly as in the
 * administrator area.
 */
@Component({
  selector: 'app-my-receipt-list',
  templateUrl: './my-receipt-list.component.html',
  styleUrl: './my-receipt-list.component.scss',
  imports: [
    CurrencyPipe,
    DatePipe,
    ListPageHeaderComponent,
    FilterMenuComponent,
    TableRowActionComponent,
    PaginationComponent,
  ],
})
export class MyReceiptListComponent implements OnInit {
  receipts: AppReceipt[] = [];

  /** Numeric internal id of the collector of the session. */
  collectorId: number | null = null;

  constructor(
    private receiptService: AppReceiptService,
    private currentUserService: CurrentUserService,
    private toastService: ToastService,
    protected listStateService: ListStateService,
  ) {
    this.listStateService.init(
      MyReceiptListFilter,
      new Pagination('my-receipt-list-pagination'),
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

    this.receiptService.findAll(queryParams).subscribe({
      next: (response) => {
        this.receipts = response.body ?? [];
        const total = Number(response.headers.get('X-Total-Count')) || this.receipts.length;
        this.listStateService.updatePagination(total, this.receipts.length);
      },
      error: () => this.toastService.error('Error al cargar los recibos.'),
    });
  }

  /** Ver: the PDF always comes as bytes, so it is opened from a blob. */
  view(hashId: string): void {
    this.receiptService.findDocument(hashId).subscribe({
      next: (blob) => openBlobInNewTab(blob),
      error: () => this.toastService.error('No se pudo abrir el recibo.'),
    });
  }

  download(hashId: string, receiptNumber: string): void {
    this.receiptService.findDocument(hashId).subscribe({
      next: (blob) => downloadBlob(blob, `recibo-${receiptNumber}.pdf`),
      error: () => this.toastService.error('No se pudo descargar el recibo.'),
    });
  }

  /** Print: the PDF first, then `printedAt` is stamped and the row refreshed. */
  print(hashId: string): void {
    this.receiptService.findDocument(hashId).subscribe({
      next: (blob) => {
        openBlobInNewTab(blob);

        this.receiptService.markAsPrinted(hashId).subscribe({
          next: () => {
            this.toastService.success('Recibo marcado como impreso.');
            this.findAll();
          },
          error: () => this.toastService.error('No se pudo marcar el recibo como impreso.'),
        });
      },
      error: () => this.toastService.error('No se pudo abrir el recibo.'),
    });
  }

  /** View, download and, when still not printed, print. */
  rowActions(receipt: AppReceipt): TableRowCustomAction[] {
    const actions: TableRowCustomAction[] = [
      { label: 'Ver recibo', icon: 'visibility', action: () => this.view(receipt.hashId) },
      {
        label: 'Descargar recibo',
        icon: 'download',
        action: () => this.download(receipt.hashId, receipt.receiptNumber),
      },
    ];

    if (!receipt.printedAt) {
      actions.push({
        label: 'Imprimir recibo',
        icon: 'print',
        action: () => this.print(receipt.hashId),
      });
    }

    return actions;
  }
}
