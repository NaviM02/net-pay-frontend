import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, tap } from 'rxjs';

import { AppClient } from '../../../../../model/app.model';
import { AppClientAccount, AppClientCharge, AppPayment } from '../../../../../model/app.model';
import { Pagination } from '../../../../../model/filter.model';
import { ChargeStatusEnum } from '../../../../../model/payment.enum';
import { AppClientService } from '../../../../../services/core/app-client.service';
import { AppPaymentService } from '../../../../../services/core/app-payment.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { DetailPageHeaderComponent } from '../../../../../commons/components/detail-page-header/detail-page-header.component';
import {
  LocationPickerComponent,
  MapLocation,
} from '../../../../../commons/components/location-picker/location-picker.component';
import { TypologyBadgeComponent } from '../../../../../commons/components/typology-badge/typology-badge.component';
import { PaginationComponent } from '../../../../../commons/components/pagination/pagination.component';
import { TableRowActionComponent } from '../../../../../commons/components/table-row-action/table-row-action.component';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.scss',
  imports: [
    CurrencyPipe,
    DatePipe,
    FormsModule,
    DetailPageHeaderComponent,
    LocationPickerComponent,
    TypologyBadgeComponent,
    PaginationComponent,
    TableRowActionComponent,
  ],
})
export class ClientDetailComponent implements OnInit {
  hashId!: string | null;
  client: AppClient = new AppClient();
  location: MapLocation = { latitude: null, longitude: null };
  account: AppClientAccount | null = null;
  charges: AppClientCharge[] = [];
  payments: AppPayment[] = [];
  readonly chargePagination = new Pagination('client-detail-charges');
  readonly paymentPagination = new Pagination('client-detail-payments');
  readonly chargeStatus = ChargeStatusEnum;

  constructor(
    private clientService: AppClientService,
    private paymentService: AppPaymentService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap((params) => (this.hashId = params.get('hashId'))),
        concatMap(() => this.clientService.findByHashId(this.hashId!)),
        tap((client) => {
          this.client = client;
          this.location = { latitude: client.latitude, longitude: client.longitude };
          this.loadAccount();
          this.loadPayments();
        }),
      )
      .subscribe({
        error: (e: HttpErrorResponse) => {
          if (e.status === 404) {
            this.toastService.error('Cliente no encontrado.');
            void this.router.navigate(['/clients']);
            return;
          }

          this.toastService.error('Error al cargar el cliente.');
        },
      });
  }

  loadAccount(): void {
    if (!this.hashId) return;
    const params = this.paginationParams(this.chargePagination);
    this.clientService.findAccountPageByHashId(this.hashId, params).subscribe({
      next: response => {
        this.account = response.body;
        this.charges = response.body?.charges ?? [];
        this.updatePagination(this.chargePagination, response.headers.get('X-Total-Count'), this.charges.length);
      },
      error: () => this.toastService.error('No se pudo cargar el estado de cuenta del cliente.'),
    });
  }

  loadPayments(): void {
    if (!this.hashId) return;
    const params = this.paginationParams(this.paymentPagination);
    params.set('clientHashId', this.hashId);
    this.paymentService.findAll(params).subscribe({
      next: response => {
        this.payments = response.body ?? [];
        this.updatePagination(this.paymentPagination, response.headers.get('X-Total-Count'), this.payments.length);
      },
      error: () => this.toastService.error('No se pudieron cargar los pagos del cliente.'),
    });
  }

  private paginationParams(pagination: Pagination): Map<string, string> {
    return new Map([['size', `${pagination.size}`], ['offset', `${pagination.offset}`]]);
  }

  private updatePagination(pagination: Pagination, totalHeader: string | null, length: number): void {
    pagination.total = Number(totalHeader) || length;
    pagination.currentLength = length;
  }

  chargesPageChanged(): void { this.loadAccount(); }
  paymentsPageChanged(): void { this.loadPayments(); }

  get hasLocation(): boolean {
    return this.location.latitude != null && this.location.longitude != null;
  }

  onDelete(): void {
    if (!this.hashId) return;

    this.clientService.delete(this.hashId).subscribe({
      next: () => {
        this.toastService.success('Cliente eliminado correctamente.');
        void this.router.navigate(['/clients']);
      },
      error: () => this.toastService.error('Error al eliminar el cliente.'),
    });
  }
}
