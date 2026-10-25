import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NgClass } from '@angular/common';
import { NgOptionComponent, NgSelectComponent } from '@ng-select/ng-select';
import { concatMap, iif, of, tap } from 'rxjs';

import { AdmTypology, AppService } from '../../../../../model/app.model';
import { TypologyEnum } from '../../../../../model/typology.enum';
import { AppServiceService } from '../../../../../services/core/app-service.service';
import { AdmTypologyService } from '../../../../../services/core/adm-typology.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { compareTps } from '../../../../../commons/utils/typology.utils';

@Component({
  selector: 'app-service-form-modal',
  templateUrl: './service-form-modal.component.html',
  styleUrl: './service-form-modal.component.scss',
  imports: [
    FormsModule,
    NgClass,
    NgSelectComponent,
    NgOptionComponent,
  ],
})
export class ServiceFormModalComponent implements OnChanges {
  protected readonly compareTps = compareTps;

  @Input() hashId: string | null = null;
  @Output() close = new EventEmitter<boolean>();

  service: AppService = new AppService();

  tpsTypes: AdmTypology[] = [];
  tpActive!: AdmTypology;
  tpDiscontinued!: AdmTypology;

  initialized = false;

  constructor(
    private serviceService: AppServiceService,
    private typologyService: AdmTypologyService,
    private toastService: ToastService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hashId']) {
      this.initialize();
    }
  }

  private initialize(): void {
    this.initialized = false;
    this.service = new AppService();

    of(null)
      .pipe(
        concatMap(() =>
          this.typologyService.findByParentInternalId(TypologyEnum.SERVICE_TYPES).pipe(
            tap(response => this.tpsTypes = response)
          )
        ),
        concatMap(() =>
          this.typologyService.findByInternalId(TypologyEnum.ACTIVE).pipe(
            tap(tp => this.tpActive = tp)
          )
        ),
        concatMap(() =>
          this.typologyService.findByInternalId(TypologyEnum.INACTIVE).pipe(
            tap(tp => this.tpDiscontinued = tp)
          )
        ),
        concatMap(() =>
          iif(
            () => !!this.hashId,
            this.serviceService.findByHashId(this.hashId!).pipe(
              tap(service => this.service = service)
            ),
            of(null).pipe(
              tap(() => {
                this.service.tpStatus = this.tpActive;
                this.service.tpType = this.tpsTypes.find(tp => tp.internalId === TypologyEnum.RESIDENTIAL)!;
                this.service.monthlyPrice = 0;
              })
            )
          )
        )
      )
      .subscribe({
        next: () => this.initialized = true,
        error: (e: HttpErrorResponse) => {
          this.initialized = false;

          if (e.status === 404) {
            this.toastService.error('msg_error_not_found');
            this.close.emit(false);
            return;
          }

          this.toastService.error('msg_error_server');
          this.close.emit(false);
        }
      });
  }

  save(): void {
    if (!this.isValid) {
      this.toastService.warning('msg_error_required_fields');
      return;
    }

    this.serviceService.save(this.service).subscribe({
      next: () => {
        this.toastService.success('msg_success_save');
        this.close.emit(true);
      },
      error: (e: HttpErrorResponse) => {
        if (e.error === 'service_name_must_be_unique') {
          return this.toastService.error('msg_service_name_already_exists');
        }

        if (e.error === 'service_not_found') {
          return this.toastService.error('msg_error_not_found');
        }

        this.toastService.error('msg_error_server');
      }
    });
  }

  cancel(): void {
    this.close.emit(false);
  }

  get isEdit(): boolean {
    return !!this.hashId;
  }

  get isValid(): boolean {
    return !!this.service.name
      && !!this.service.speed
      && this.service.monthlyPrice !== null
      && this.service.monthlyPrice !== undefined
      && this.service.monthlyPrice >= 0
      && !!this.service.tpType
      && !!this.service.tpStatus
      && this.service.name.trim() !== ''
      && this.service.speed.trim() !== '';
  }
}
