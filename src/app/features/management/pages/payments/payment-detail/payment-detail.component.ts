import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { concatMap, tap } from 'rxjs';

import { AppPayment } from '../../../../../model/app.model';
import { AppPaymentService } from '../../../../../services/core/app-payment.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { DetailPageHeaderComponent } from '../../../../../commons/components/detail-page-header/detail-page-header.component';
import { TypologyBadgeComponent } from '../../../../../commons/components/typology-badge/typology-badge.component';
import { isPaymentLocked } from '../../../../../commons/utils/payment.utils';
import { openBlobInNewTab } from '../../../../../commons/utils/blob.utils';

@Component({
  selector: 'app-payment-detail',
  templateUrl: './payment-detail.component.html',
  styleUrl: './payment-detail.component.scss',
  imports: [
    CurrencyPipe,
    DatePipe,
    RouterLink,
    DetailPageHeaderComponent,
    TypologyBadgeComponent,
  ],
})
export class PaymentDetailComponent implements OnInit {
  protected readonly isPaymentLocked = isPaymentLocked;

  hashId!: string | null;
  payment: AppPayment = new AppPayment();

  constructor(
    private paymentService: AppPaymentService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap((params) => (this.hashId = params.get('hashId'))),
        concatMap(() => this.paymentService.findByHashId(this.hashId!)),
        tap((payment) => (this.payment = payment)),
      )
      .subscribe({
        error: (e: HttpErrorResponse) => {
          if (e.status === 404) {
            this.toastService.error('Pago no encontrado.');
            void this.router.navigate(['/payments']);
            return;
          }

          this.toastService.error('Error al cargar el pago.');
        },
      });
  }

  openAttachment(): void {
    if (!this.hashId) return;
    this.paymentService.findAttachment(this.hashId).subscribe({
      next: blob => openBlobInNewTab(blob),
      error: () => this.toastService.error('No se pudo abrir el archivo adjunto.'),
    });
  }
}
