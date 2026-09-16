import { Component, DestroyRef, EventEmitter, OnInit, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrentUserService } from '../../../services/core/current-user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppUser } from '../../../model/app.model';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<void>();

  currentUser!: AppUser;
  initials = '';

  constructor(
    private currentUserService: CurrentUserService,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.currentUserService
      .getCurrentUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (client) => {
          if (!client) return;

          this.currentUser = client;
          this.initials =
            this.currentUser.userFullName
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
