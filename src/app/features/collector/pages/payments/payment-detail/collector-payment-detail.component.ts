import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { concatMap, tap } from 'rxjs';

import { AppPayment } from '../../../../../model/app.model';
import { AppPaymentService } from '../../../../../services/core/app-payment.service';
import { CurrentUserService } from '../../../../../services/core/current-user.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { DetailPageHeaderComponent } from '../../../../../commons/components/detail-page-header/detail-page-header.component';
import { TypologyBadgeComponent } from '../../../../../commons/components/typology-badge/typology-badge.component';
import { isPaymentLocked } from '../../../../../commons/utils/payment.utils';

/**
 * Detail of a payment of the collector. The collector is never changed here, it
 * only travels back and forth with the record.
 */
@Component({
  selector: 'app-collector-payment-detail',
  templateUrl: './collector-payment-detail.component.html',
  styleUrl: './collector-payment-detail.component.scss',
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    DetailPageHeaderComponent,
    TypologyBadgeComponent,
  ],
})
export class CollectorPaymentDetailComponent implements OnInit {
  protected readonly isPaymentLocked = isPaymentLocked;

  hashId!: string | null;
  payment: AppPayment = new AppPayment();

  constructor(
    private paymentService: AppPaymentService,
    private currentUserService: CurrentUserService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap((params) => (this.hashId = params.get('hashId'))),
        concatMap(() => this.paymentService.findByHashId(this.hashId!)),
        tap((payment) => this.applyPayment(payment)),
      )
      .subscribe({
        error: (e: HttpErrorResponse) => {
          if (e.status === 404) {
            this.toastService.error('Pago no encontrado.');
            void this.router.navigate(['/collector/payments']);
            return;
          }

          this.toastService.error('Error al cargar el pago.');
        },
      });
  }

  private applyPayment(payment: AppPayment): void {
    // The endpoint answers any `hashId`, so a collector could open a payment that
    // is not its own by typing the URL. The answer is the same as for a payment
    // that does not exist.
    if (payment.collector?.hashId !== this.currentUserService.getCurrentHashId()) {
      this.toastService.error('Pago no encontrado.');
      void this.router.navigate(['/collector/payments']);
      return;
    }

    this.payment = payment;
  }
}