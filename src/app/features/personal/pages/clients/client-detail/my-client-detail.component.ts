import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, tap } from 'rxjs';

import { AppClient } from '../../../../../model/app.model';
import { AppClientService } from '../../../../../services/core/app-client.service';
import { CurrentUserService } from '../../../../../services/core/current-user.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { DetailPageHeaderComponent } from '../../../../../commons/components/detail-page-header/detail-page-header.component';
import {
  LocationPickerComponent,
  MapLocation,
} from '../../../../../commons/components/location-picker/location-picker.component';
import { TypologyBadgeComponent } from '../../../../../commons/components/typology-badge/typology-badge.component';

/**
 * Detail of a client of the collector. Same content as the administrator one,
 * without the edit and delete actions.
 */
@Component({
  selector: 'app-my-client-detail',
  templateUrl: './my-client-detail.component.html',
  styleUrl: './my-client-detail.component.scss',
  imports: [
    CurrencyPipe,
    FormsModule,
    DetailPageHeaderComponent,
    LocationPickerComponent,
    TypologyBadgeComponent,
  ],
})
export class MyClientDetailComponent implements OnInit {
  hashId!: string | null;
  client: AppClient = new AppClient();
  location: MapLocation = { latitude: null, longitude: null };

  constructor(
    private clientService: AppClientService,
    private currentUserService: CurrentUserService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap((params) => (this.hashId = params.get('hashId'))),
        concatMap(() => this.clientService.findByHashId(this.hashId!)),
        tap((client) => {
          // The endpoint answers any `hashId`, so a collector could reach a client
          // that is not on its portfolio by typing the URL. The answer is the
          // same as for a client that does not exist.
          if (!this.belongsToCurrentUser(client)) {
            this.toastService.error('Cliente no encontrado.');
            void this.router.navigate(['/my-clients']);
            return;
          }

          this.client = client;
          this.location = { latitude: client.latitude, longitude: client.longitude };
        }),
      )
      .subscribe({
        error: (e: HttpErrorResponse) => {
          if (e.status === 404) {
            this.toastService.error('Cliente no encontrado.');
          void this.router.navigate(['/my-clients']);
            return;
          }

          this.toastService.error('Error al cargar el cliente.');
        },
      });
  }

  get hasLocation(): boolean {
    return this.location.latitude != null && this.location.longitude != null;
  }

  private belongsToCurrentUser(client: AppClient): boolean {
    const currentUserHashId = this.currentUserService.getCurrentHashId();
    if (!currentUserHashId) return false;

    return client.collector?.hashId === currentUserHashId;
  }
}
