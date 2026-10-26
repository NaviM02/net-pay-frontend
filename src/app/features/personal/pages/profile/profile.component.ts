import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AppUser } from '../../../../model/app.model';
import { AppUserService } from '../../../../services/core/app-user.service';
import { CurrentUserService } from '../../../../services/core/current-user.service';
import { ToastService } from '../../../../services/other/toast.service';
import { MaterialIconComponent } from '../../../../commons/components/material-icon/material-icon.component';
import { TypologyBadgeComponent } from '../../../../commons/components/typology-badge/typology-badge.component';
import { UserRolesComponent } from '../../../../commons/components/user-roles/user-roles.component';
import { ChangePasswordModalComponent } from '../../../../commons/components/change-password-modal/change-password-modal.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, MaterialIconComponent, TypologyBadgeComponent, UserRolesComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  user = new AppUser();
  initialized = false;

  constructor(
    private userService: AppUserService,
    private currentUserService: CurrentUserService,
    private toastService: ToastService,
    private modalService: NgbModal,
  ) {}

  ngOnInit(): void {
    this.userService.findMe().subscribe({
      next: user => {
        this.user = user;
        this.initialized = true;
        this.currentUserService.updateCurrentUser(user);
      },
      error: () => this.toastService.error('No se pudo cargar tu perfil.'),
    });
  }

  get initials(): string {
    return this.user.fullName?.split(' ').filter(Boolean).slice(0, 2).map(name => name.charAt(0).toUpperCase()).join('') ?? '';
  }

  save(): void {
    if (!this.user.fullName?.trim() || !this.isValidEmail(this.user.email)) {
      this.toastService.warning('Introduce un nombre y un correo electrónico válido.');
      return;
    }
    this.userService.updateMe({
      fullName: this.user.fullName.trim(),
      email: this.user.email.trim(),
      twoFactorEnabled: this.user.twoFactorEnabled,
    }).subscribe({
      next: user => {
        this.user = user;
        this.currentUserService.updateCurrentUser(user);
        this.toastService.success('Perfil actualizado correctamente.');
      },
      error: (e: HttpErrorResponse) => this.toastService.error(e.error === 'user_email_must_be_unique'
        ? 'Este correo electrónico ya está registrado.'
        : 'No se pudo actualizar tu perfil.'),
    });
  }

  isValidEmail(value: string | null | undefined): boolean {
    return !!value && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value.trim());
  }

  changePassword(): void {
    const modal = this.modalService.open(ChangePasswordModalComponent, { centered: true, size: 'md' });
    modal.componentInstance.targetHashId = null;
  }
}
