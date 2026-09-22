import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, tap } from 'rxjs';

import { AppClient } from '../../../../../model/app.model';
import { AppClientService } from '../../../../../services/core/app-client.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { DetailPageHeaderComponent } from '../../../../../commons/components/detail-page-header/detail-page-header.component';
import {
  LocationPickerComponent,
  MapLocation,
} from '../../../../../commons/components/location-picker/location-picker.component';
import { TypologyBadgeComponent } from '../../../../../commons/components/typology-badge/typology-badge.component';

@Component({
  selector: 'app-client-detail',
  templateUrl: './client-detail.component.html',
  styleUrl: './client-detail.component.scss',
  imports: [
    CurrencyPipe,
    FormsModule,
    DetailPageHeaderComponent,
    LocationPickerComponent,
    TypologyBadgeComponent,
  ],
})
export class ClientDetailComponent implements OnInit {
  hashId!: string | null;
  client: AppClient = new AppClient();
  location: MapLocation = { latitude: null, longitude: null };

  constructor(
    private clientService: AppClientService,
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
          this.client = client;
          this.location = { latitude: client.latitude, longitude: client.longitude };
        }),
      )
      .subscribe({
        error: (e: HttpErrorResponse) => {
          if (e.status === 404) {
            this.toastService.error('Cliente no encontrado.');
            void this.router.navigate(['/clients']);
            return;
          }

          this.toastService.error('Error al cargar el cliente.');
        },
      });
  }

  get hasLocation(): boolean {
    return this.location.latitude != null && this.location.longitude != null;
  }

  onDelete(): void {
    if (!this.hashId) return;

    this.clientService.delete(this.hashId).subscribe({
      next: () => {
        this.toastService.success('Cliente eliminado correctamente.');
        void this.router.navigate(['/clients']);
      },
      error: () => this.toastService.error('Error al eliminar el cliente.'),
    });
  }
}
