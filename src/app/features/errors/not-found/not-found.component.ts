import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ListPageHeaderComponent } from '../../../commons/components/list-page-header/list-page-header.component';
import { MaterialIconComponent } from '../../../commons/components/material-icon/material-icon.component';
import { CurrentUserService } from '../../../services/core/current-user.service';

/**
 * Answer for every URL that cannot be reached: unknown paths, and pages that
 * belong to a role the current user does not have. It must not hint at whether
 * the requested page exists, so it stays generic on purpose.
 */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink, ListPageHeaderComponent, MaterialIconComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  /** Home of the current role, so the way out is never the admin area. */
  homeRoute: string;

  constructor(currentUserService: CurrentUserService) {
    this.homeRoute = currentUserService.getHomeRoute();
  }
}