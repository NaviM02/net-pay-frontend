import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { NgOptionComponent, NgSelectComponent } from '@ng-select/ng-select';
import { concatMap, iif, of, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { AppUser, AdmTypology } from '../../../../../model/app.model';
import { AppUserService } from '../../../../../services/core/app-user.service';
import { AdmTypologyService } from '../../../../../services/core/adm-typology.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { TypologyEnum } from '../../../../../model/typology.enum';
import { compareTps } from '../../../../../commons/utils/typology.utils';
import {
  InputForPasswordComponent
} from '../../../../../commons/components/input-for-password/input-for-password.component';

@Component({
  selector: 'app-user-form-modal',
  templateUrl: './user-form-modal.component.html',
  styleUrl: './user-form-modal.component.scss',
  imports: [
    FormsModule,
    NgClass,
    NgSelectComponent,
    NgOptionComponent,
    InputForPasswordComponent,
  ],
})
export class UserFormModalComponent implements OnChanges {

  protected readonly compareTps = compareTps;

  @Input() hashId: string | null = null;
  @Output() close = new EventEmitter<boolean>();

  user: AppUser = new AppUser();

  tpsRoles: AdmTypology[] = [];
  tpActive!: AdmTypology;
  tpInactive!: AdmTypology;

  initialized = false;

  constructor(
    private userService: AppUserService,
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
    this.user = new AppUser();

    of(null)
      .pipe(
        concatMap(() =>
          this.typologyService.findByParentInternalId(TypologyEnum.USER_ROLES).pipe(
            tap(response => this.tpsRoles = response)
          )
        ),
        concatMap(() =>
          this.typologyService.findByInternalId(TypologyEnum.ACTIVE).pipe(
            tap(tp => this.tpActive = tp)
          )
        ),
        concatMap(() =>
          this.typologyService.findByInternalId(TypologyEnum.INACTIVE).pipe(
            tap(tp => this.tpInactive = tp)
          )
        ),
        concatMap(() =>
          iif(
            () => !!this.hashId,
            this.userService.findByHashId(this.hashId!).pipe(tap(user => this.user = user)),
            of(null).pipe(
              tap(() => {
                this.user.tpStatus = this.tpActive;
                this.user.tpRole = this.tpsRoles.find(tp => tp.internalId === TypologyEnum.COLLECTOR)!;
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

    this.userService.save(this.user).subscribe({
      next: () => {
        this.toastService.success('msg_success_save');
        this.close.emit(true);
      },
      error: (e: HttpErrorResponse) => {
        if (e.error === 'user_email_must_be_unique') {
          return this.toastService.error('msg_user_email_already_exists');
        }

        if (e.error === 'user_not_found') {
          return this.toastService.error('msg_error_not_found');
        }

        if (e.error === 'invalid_user_id') {
          return this.toastService.error('msg_error_server');
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
    return !!this.user.fullName
      && !!this.user.email
      && !!this.user.tpRole
      && !!this.user.tpStatus
      && this.user.fullName.trim() !== ''
      && this.user.email.trim() !== ''
      && (this.isEdit || (!!this.user.password && this.user.password.trim() !== ''));
  }
}
