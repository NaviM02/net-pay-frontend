import { Component, DestroyRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
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
import { AccessControlService } from '../../../services/core/access-control.service';
import { NotificationService } from '../../../services/core/notification.service';
import { OverdueNotification } from '../../../model/notification.model';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownItem,
    NgbDropdownToggle,
    MaterialIconComponent,
    CurrencyPipe,
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
  notifications: OverdueNotification[] = [];
  notificationCount = 0;
  notificationsLoaded = false;

  constructor(
    private currentUserService: CurrentUserService,
    private readonly destroyRef: DestroyRef,
    private accessService: AccessControlService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.accessService.access$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(access => {
      const assignments = access?.roles ?? [];
      const effectiveNames = assignments.filter(assignment => assignment.effective).map(assignment => assignment.role.name);
      const assignedNames = assignments
        .filter(assignment => !assignment.cancelledAt)
        .map(assignment => assignment.role.name);
      this.roleName = [...new Set(effectiveNames.length ? effectiveNames : assignedNames)].join(', ')
        || 'Sin roles vigentes';
    });
    this.currentUserService
      .getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          if (!user) return;

          this.currentUser = user;
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

  loadNotifications(): void {
    this.notificationService.getNotifications().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.notifications = response.notifications ?? [];
        this.notificationCount = response.count ?? this.notifications.length;
        this.notificationsLoaded = true;
      },
      error: () => { this.notificationsLoaded = true; },
    });
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  logout(): void {
    this.currentUserService.logout();
  }
}
