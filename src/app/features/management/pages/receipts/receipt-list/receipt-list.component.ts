import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { AppReceipt } from '../../../../../model/app.model';
import { Pagination } from '../../../../../model/filter.model';
import { AppReceiptService } from '../../../../../services/core/app-receipt.service';
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
import { ReceiptListFilter } from './receipt-list.filter';

@Component({
  selector: 'app-receipt-list',
  templateUrl: './receipt-list.component.html',
  styleUrl: './receipt-list.component.scss',
  imports: [
    CurrencyPipe,
    DatePipe,
    ListPageHeaderComponent,
    FilterMenuComponent,
    TableRowActionComponent,
    PaginationComponent,
  ],
})
export class ReceiptListComponent implements OnInit {
  receipts: AppReceipt[] = [];

  constructor(
    private receiptService: AppReceiptService,
    private toastService: ToastService,
    protected listStateService: ListStateService,
  ) {
    this.listStateService.init(ReceiptListFilter, new Pagination('receipt-list-pagination'), () =>
      this.findAll(),
    );
  }

  ngOnInit(): void {
    this.findAll();
  }

  findAll(): void {
    this.receiptService.findAll(this.listStateService.queryParams).subscribe({
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
