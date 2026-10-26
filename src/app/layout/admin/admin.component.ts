import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, filter, fromEvent, merge, switchMap, timer } from 'rxjs';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../commons/components/header/header.component';
import { SidebarComponent } from '../../commons/components/sidebar/sidebar.component';
import { AccessControlService } from '../../services/core/access-control.service';
import { CurrentUserService } from '../../services/core/current-user.service';

@Component({
  selector: 'app-admin',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent {
  sidebarStatus: boolean = true;

  constructor(
    accessService: AccessControlService,
    currentUserService: CurrentUserService,
    destroyRef: DestroyRef,
    router: Router,
    route: ActivatedRoute,
  ) {
    accessService.access$.pipe(takeUntilDestroyed(destroyRef)).subscribe(access => {
      if (!access || router.getCurrentNavigation()) return;
      let snapshot = route.snapshot.firstChild;
      while (snapshot) {
        const required = snapshot.data['permission'] as string | string[] | undefined;
        if (required && !accessService.hasAnyPermission(required)) {
          void router.navigate(['/404']);
          return;
        }
        snapshot = snapshot.firstChild;
      }
    });
    merge(fromEvent(window, 'focus'), timer(60000, 60000)).pipe(
      filter(() => currentUserService.isAuthenticated()),
      switchMap(() => accessService.loadAccess(true).pipe(catchError(() => EMPTY))),
      takeUntilDestroyed(destroyRef),
    ).subscribe();
  }
}
