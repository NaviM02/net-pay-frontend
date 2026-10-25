import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgOptionComponent, NgSelectComponent } from '@ng-select/ng-select';
import { concatMap, finalize, iif, Observable, of, switchMap, tap } from 'rxjs';

import { AdmTypology, AppClientAccount, AppPayment, AppUser } from '../../../../../model/app.model';
import { DynamicProviderKey } from '../../../../../model/dynamic-provider-key.enum';
import { ChargeStatusEnum } from '../../../../../model/payment.enum';
import { TypologyEnum } from '../../../../../model/typology.enum';
import { AppClientService } from '../../../../../services/core/app-client.service';
import { AppPaymentService } from '../../../../../services/core/app-payment.service';
import { AdmTypologyService } from '../../../../../services/core/adm-typology.service';
import { CurrentUserService } from '../../../../../services/core/current-user.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { DetailPageHeaderComponent } from '../../../../../commons/components/detail-page-header/detail-page-header.component';
import { DynamicSelectComponent } from '../../../../../commons/components/dynamic-select/dynamic-select.component';
import { getChargeStatusClass, getChargeStatusLabel } from '../../../../../commons/utils/charge-status.utils';
import { isPaymentLocked } from '../../../../../commons/utils/payment.utils';
import { compareTps } from '../../../../../commons/utils/typology.utils';
import { FileDropzoneComponent } from '../../../../../commons/components/file-dropzone/file-dropzone.component';
import { FileUploadService } from '../../../../../services/core/file-upload.service';

/**
 * Register and correct payments of the collector.
 *
 * There is no collector field: the create endpoint takes it from the security
 * context of the token, and on an edit the id of the session is always sent so
 * the backend does not empty the field.
 */
@Component({
  selector: 'app-my-payment-form',
  templateUrl: './my-payment-form.component.html',
  styleUrl: './my-payment-form.component.scss',
  imports: [
    CurrencyPipe,
    FormsModule,
    NgSelectComponent,
    NgOptionComponent,
    DynamicSelectComponent,
    DetailPageHeaderComponent,
    FileDropzoneComponent,
  ],
})
export class MyPaymentFormComponent implements OnInit {
  protected readonly compareTps = compareTps;
  protected readonly DynamicProviderKey = DynamicProviderKey;
  protected readonly getChargeStatusLabel = getChargeStatusLabel;
  protected readonly getChargeStatusClass = getChargeStatusClass;

  hashId: string | null = null;
  payment: AppPayment = new AppPayment();

  tpsMethods: AdmTypology[] = [];

  completedStatus: AdmTypology | null = null;
  attachmentFile: File | null = null;
  attachmentError = '';
  saving = false;

  // Statement of the selected client, used to suggest the amount.
  account: AppClientAccount | null = null;

  constructor(
    private paymentService: AppPaymentService,
    private clientService: AppClientService,
    private typologyService: AdmTypologyService,
    private currentUserService: CurrentUserService,
    private fileUploadService: FileUploadService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap((params) => (this.hashId = params.get('hashId'))),
        concatMap(() =>
          this.typologyService
            .findByParentInternalId(TypologyEnum.PAYMENT_METHODS)
            .pipe(tap((tps) => (this.tpsMethods = tps))),
        ),
        concatMap(() => this.typologyService.findByParentInternalId(TypologyEnum.PAYMENT_STATUS).pipe(
          tap(tps => this.completedStatus = tps.find(tp => tp.internalId === TypologyEnum.COMPLETED) ?? null),
        )),
        concatMap(() =>
          iif(
            () => !!this.hashId,
            this.paymentService.findByHashId(this.hashId!).pipe(tap((p) => this.applyPayment(p))),
            of(null).pipe(tap(() => this.applyDefaults())),
          ),
        ),
        concatMap(() => this.loadAccount()),
      )
      .subscribe({
        error: (e: HttpErrorResponse) => {
          if (e.status === 404) {
            this.toastService.error('Pago no encontrado.');
            void this.router.navigate(['/my-payments']);
            return;
          }

          this.toastService.error('Error al cargar el pago.');
        },
      });
  }

  get isEdit(): boolean {
    return !!this.hashId;
  }

  /** A payment that is not completed cannot be edited anymore. */
  get isLocked(): boolean {
    return isPaymentLocked(this.payment);
  }

  get isValid(): boolean {
    if (this.isLocked) return false;

    return (
      !!this.payment.client &&
      this.payment.amount !== null &&
      this.payment.amount !== undefined &&
      this.payment.amount > 0 &&
      !!this.payment.paidAt &&
      !!this.payment.tpPaymentMethod &&
      !!this.completedStatus
    );
  }

  /** Months still owed, oldest first, matching the backend cascade order. */
  get pendingCharges() {
    return this.account?.charges.filter(c => c.status !== ChargeStatusEnum.PAID) ?? [];
  }

  get suggestedAmount(): number {
    return this.account?.balance ?? 0;
  }

  onClientChange(): void {
    this.loadAccount().subscribe();
  }

  /** Fills the amount with what the client owes. */
  applySuggestedAmount(): void {
    if (!this.suggestedAmount) return;
    this.payment.amount = this.suggestedAmount;
  }

  selectAttachment(file: File | null): void {
    this.attachmentError = '';
    this.attachmentFile = null;
    this.payment.attachmentUrl = null;
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      this.attachmentError = 'El archivo no puede superar los 10 MB.';
    } else if (!(file.type === 'application/pdf' || file.type.startsWith('image/'))) {
      this.attachmentError = 'Adjunta una imagen o un archivo PDF.';
    } else {
      this.attachmentFile = file;
    }
  }

  save(): void {
    if (this.saving) return;
    if (this.isLocked) {
      this.toastService.warning('El pago ya no se puede modificar.');
      return;
    }

    if (!this.isValid) {
      this.toastService.warning('Completa los campos obligatorios.');
      return;
    }
    if (this.attachmentError) {
      this.toastService.warning(this.attachmentError);
      return;
    }

    if (!this.completedStatus) {
      this.toastService.error('No se pudo cargar el estado completado del pago.');
      return;
    }
    this.payment.tpPaymentStatus = this.completedStatus;

    const savePayment = () => this.isEdit ? this.update() : this.create();
    const request = this.attachmentFile && !this.payment.attachmentUrl
      ? this.fileUploadService.upload(this.attachmentFile).pipe(
          tap(response => this.payment.attachmentUrl = response.url),
          switchMap(() => savePayment()),
        )
      : savePayment();

    this.saving = true;
    request.pipe(finalize(() => this.saving = false)).subscribe({
      next: () => {
        this.toastService.success('Pago guardado correctamente.');
        void this.router.navigate(['/my-payments']);
      },
      error: (e: HttpErrorResponse) => {
        if (e.error === 'file_storage_not_configured' || e.error === 'file_upload_failed' || e.error === 'file_read_failed') {
          return this.toastService.error('No se pudo subir el archivo adjunto. Intenta de nuevo.');
        }
        if (e.error === 'file_too_large') {
          return this.toastService.warning('El archivo no puede superar los 10 MB.');
        }
        if (e.error === 'payment_attachment_url_invalid') {
          return this.toastService.error('La URL del comprobante adjunto no es válida.');
        }
        if (e.error === 'payment_not_found' || e.error === 'payment_client_not_found') {
          return this.toastService.error('Pago o cliente no encontrado.');
        }

        if (e.error === 'payment_locked_by_receipt') {
          return this.toastService.warning('El pago ya tiene un recibo emitido.');
        }

        if (
          e.error === 'payment_amount_invalid' ||
          e.error === 'payment_amount_required' ||
          e.error === 'payment_paid_at_required' ||
          e.error === 'payment_method_required'
        ) {
          return this.toastService.warning('Revisa el monto, la fecha y el método de pago.');
        }

        this.toastService.error('Error al guardar el pago.');
      },
    });
  }

  cancel(): void {
    void this.router.navigate(['/my-payments']);
  }

  /**
   * Create: the endpoint stamps the collector from the token, so no collector is
   * sent in the body.
   */
  private create(): Observable<AppPayment> {
    const payload = { ...this.payment, collector: null };
    return this.paymentService.createAsCurrentUser(payload);
  }

  /**
   * Update: `PUT /api/payments/{hashId}` empties the collector when the body
   * omits it, so the id of the session travels with every edit.
   */
  private update(): Observable<AppPayment> {
    const sessionId = this.currentUserService.getCurrentId();
    const collector: AppUser | null = sessionId
      ? ({ ...(this.payment.collector ?? {}), id: sessionId } as AppUser)
      : this.payment.collector;

    return this.paymentService.save({ ...this.payment, collector });
  }

  private applyPayment(payment: AppPayment): void {
    // The endpoint answers any `hashId`, so a collector could open a payment that
    // is not its own by typing the URL. The answer is the same as for a payment
    // that does not exist.
    if (payment.collector?.hashId !== this.currentUserService.getCurrentHashId()) {
      this.toastService.error('Pago no encontrado.');
      void this.router.navigate(['/my-payments']);
      return;
    }

    this.payment = payment;
    this.payment.paidAt = this.toDateInput(payment.paidAt);
  }

  private applyDefaults(): void {
    this.payment = new AppPayment();
    this.payment.paidAt = this.today();
    this.payment.tpPaymentMethod = this.tpsMethods.find(tp => tp.internalId === TypologyEnum.CASH)!;
    this.payment.tpPaymentStatus = this.completedStatus!;
  }

  private loadAccount(): Observable<AppClientAccount | null> {
    const clientHashId = this.payment.client?.hashId;

    if (!clientHashId) {
      this.account = null;
      return of(null);
    }

    return this.clientService
      .findAccountByHashId(clientHashId)
      .pipe(tap((account) => (this.account = account)));
  }

  private toDateInput(value: string | null | undefined): string {
    if (!value) return '';
    return value.length > 10 ? value.substring(0, 10) : value;
  }

  private today(): string {
    return new Date().toISOString().substring(0, 10);
  }
}
