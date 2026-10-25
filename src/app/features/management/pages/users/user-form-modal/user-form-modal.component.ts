import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';
import { NgOptionComponent, NgSelectComponent } from '@ng-select/ng-select';
import { concatMap, from, iif, of, switchMap, tap, toArray } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { AppUser, AdmTypology } from '../../../../../model/app.model';
import { AppUserService } from '../../../../../services/core/app-user.service';
import { AdmTypologyService } from '../../../../../services/core/adm-typology.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { TypologyEnum } from '../../../../../model/typology.enum';
import { compareTps } from '../../../../../commons/utils/typology.utils';
import {
  InputForPasswordComponent
} from '../../../../../commons/components/input-for-password/input-for-password.component';
import { UserRolesComponent } from '../../../../../commons/components/user-roles/user-roles.component';
import { DetailPageHeaderComponent } from '../../../../../commons/components/detail-page-header/detail-page-header.component';
import { ChangePasswordModalComponent } from '../../../../../commons/components/change-password-modal/change-password-modal.component';
import { AppRole } from '../../../../../model/access-control.model';
import { AccessControlService } from '../../../../../services/core/access-control.service';

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
    UserRolesComponent,
    DetailPageHeaderComponent,
  ],
})
export class UserFormModalComponent implements OnInit {

  protected readonly compareTps = compareTps;

  hashId: string | null = null;

  user: AppUser = new AppUser();

  tpActive!: AdmTypology;
  tpInactive!: AdmTypology;

  initialized = false;
  roleChanges: {
    additions: { role: AppRole; startsAt: string; endsAt: string }[];
    updates: { assignment: import('../../../../../model/access-control.model').UserRoleAssignment; startsAt: string; endsAt: string }[];
    removals: import('../../../../../model/access-control.model').UserRoleAssignment[];
  } = { additions: [], updates: [], removals: [] };

  constructor(
    private userService: AppUserService,
    private typologyService: AdmTypologyService,
    private toastService: ToastService,
    private route: ActivatedRoute,
    private router: Router,
    private accessService: AccessControlService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.hashId = this.route.snapshot.paramMap.get('hashId');
    this.initialize();
  }

  private initialize(): void {
    this.initialized = false;
    this.user = new AppUser();

    of(null)
      .pipe(
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
            void this.router.navigate(['/users']);
            return;
          }

          this.toastService.error('msg_error_server');
          void this.router.navigate(['/users']);
        }
      });
  }

  save(): void {
    if (!this.isValid) {
      this.toastService.warning('msg_error_required_fields');
      return;
    }

    const allRoleDates = [
      ...this.roleChanges.additions,
      ...this.roleChanges.updates,
    ];
    const invalidRoleDates = allRoleDates.some(draft =>
      draft.endsAt && new Date(draft.endsAt).getTime() <= (draft.startsAt ? new Date(draft.startsAt).getTime() : Date.now()),
    );
    if (invalidRoleDates) {
      this.toastService.warning('La fecha de fin de cada rol debe ser posterior a su fecha de inicio.');
      return;
    }

    if (this.roleChanges.additions.some(draft => draft.role.status === 'INACTIVE')) {
      this.toastService.warning('No se pueden asignar roles inactivos.');
      return;
    }

    this.userService.save(this.user).pipe(
      switchMap(user => {
        this.user = user;
        this.hashId = user.hashId;
        const jobs = [
          ...this.roleChanges.removals.map(assignment => this.accessService.cancel(user.hashId, assignment.hashId)),
          ...this.roleChanges.updates.flatMap(update => [
            this.accessService.cancel(user.hashId, update.assignment.hashId),
            this.accessService.assign(user.hashId, {
              roleHashId: update.assignment.role.hashId,
              startsAt: update.startsAt ? new Date(update.startsAt).toISOString() : null,
              endsAt: update.endsAt ? new Date(update.endsAt).toISOString() : null,
            }),
          ]),
          ...this.roleChanges.additions.map(draft => this.accessService.assign(user.hashId, {
            roleHashId: draft.role.hashId,
            startsAt: draft.startsAt ? new Date(draft.startsAt).toISOString() : null,
            endsAt: draft.endsAt ? new Date(draft.endsAt).toISOString() : null,
          })),
        ];
        if (!jobs.length) return of(user);
        return from(jobs).pipe(
          concatMap(job => job),
          toArray(),
          switchMap(() => this.accessService.loadAccess(true)),
          switchMap(() => of(user)),
        );
      }),
    ).subscribe({
      next: (user) => {
        this.toastService.success('Usuario guardado correctamente.');
        this.user = user;
        this.hashId = user.hashId;
        this.roleChanges = { additions: [], updates: [], removals: [] };
        void this.router.navigate(['/users', user.hashId]);
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
    void this.router.navigate(this.hashId ? ['/users', this.hashId] : ['/users']);
  }

  changePassword(): void {
    if (!this.hashId) return;
    const modal = this.modalService.open(ChangePasswordModalComponent, { centered: true, size: 'md' });
    modal.componentInstance.targetHashId = this.hashId;
  }

  get isEdit(): boolean {
    return !!this.hashId;
  }

  get isValid(): boolean {
    return !!this.user.fullName
      && !!this.user.email
      && !!this.user.tpStatus
      && this.user.fullName.trim() !== ''
      && this.user.email.trim() !== ''
      && (this.isEdit || (!!this.user.password && this.user.password.trim() !== ''));
  }
}
