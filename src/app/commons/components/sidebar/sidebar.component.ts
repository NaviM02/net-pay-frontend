import { NgClass } from '@angular/common';
import { Component, DestroyRef, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ACCESS_MENU_ITEMS, AccessMenuItem } from '../../utils/access.utils';
import { AccessControlService } from '../../../services/core/access-control.service';

@Component({
  selector: 'app-sidebar',
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() active = true;
  items: AccessMenuItem[] = [];

  constructor(accessService: AccessControlService, destroyRef: DestroyRef) {
    accessService.access$.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
      this.items = ACCESS_MENU_ITEMS.flatMap(item => {
        const path = accessService.hasAnyPermission(item.permissions)
          ? item.path
          : item.fallback && accessService.hasPermission(item.fallback.permission)
            ? item.fallback.path
            : undefined;
        return path ? [{ ...item, path }] : [];
      });
    });
  }
}
