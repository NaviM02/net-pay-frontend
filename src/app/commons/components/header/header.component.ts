import { Component, DestroyRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrentUserService } from '../../../services/core/current-user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppUser } from '../../../model/app.model';
import {
  NgbDropdown,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle,
} from '@ng-bootstrap/ng-bootstrap';
import { MaterialIconComponent } from '../material-icon/material-icon.component';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownItem,
    NgbDropdownToggle,
    MaterialIconComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  @Input() sidebarOpen = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser!: AppUser;
  initials = '';
  roleName: string = '';

  constructor(
    private currentUserService: CurrentUserService,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.currentUserService
      .getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          if (!user) return;

          this.currentUser = user;
          this.roleName = user.tpRole.description;
          this.initials =
            this.currentUser.fullName
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase() || 'Me';
        },
      });
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.currentUserService.logout();
  }
}
