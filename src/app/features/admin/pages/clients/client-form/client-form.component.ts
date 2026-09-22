import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgOptionComponent, NgSelectComponent } from '@ng-select/ng-select';
import { concatMap, iif, of, tap } from 'rxjs';

import { AdmTypology, AppClient } from '../../../../../model/app.model';
import { DynamicProviderKey } from '../../../../../model/dynamic-provider-key.enum';
import { TypologyEnum } from '../../../../../model/typology.enum';
import { AdmTypologyService } from '../../../../../services/core/adm-typology.service';
import { AppClientService } from '../../../../../services/core/app-client.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { compareTps } from '../../../../../commons/utils/typology.utils';
import { DynamicSelectComponent } from '../../../../../commons/components/dynamic-select/dynamic-select.component';
import { DetailPageHeaderComponent } from '../../../../../commons/components/detail-page-header/detail-page-header.component';
import {
  LocationPickerComponent,
  MapLocation,
} from '../../../../../commons/components/location-picker/location-picker.component';

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss',
  imports: [
    FormsModule,
    NgSelectComponent,
    NgOptionComponent,
    DynamicSelectComponent,
    LocationPickerComponent,
    DetailPageHeaderComponent,
  ],
})
export class ClientFormComponent implements OnInit {
  protected readonly compareTps = compareTps;
  protected readonly DynamicProviderKey = DynamicProviderKey;

  hashId: string | null = null;
  client: AppClient = new AppClient();
  location: MapLocation = { latitude: null, longitude: null };

  tpActive!: AdmTypology;
  tpInactive!: AdmTypology;

  constructor(
    private clientService: AppClientService,
    private typologyService: AdmTypologyService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap((params) => (this.hashId = params.get('hashId'))),
        concatMap(() =>
          this.typologyService
            .findByInternalId(TypologyEnum.ACTIVE)
            .pipe(tap((tp) => (this.tpActive = tp))),
        ),
        concatMap(() =>
          this.typologyService
            .findByInternalId(TypologyEnum.INACTIVE)
            .pipe(tap((tp) => (this.tpInactive = tp))),
        ),
        concatMap(() =>
          iif(
            () => !!this.hashId,
            this.clientService
              .findByHashId(this.hashId!)
              .pipe(tap((client) => this.applyClient(client))),
            of(null).pipe(tap(() => this.applyDefaults())),
          ),
        ),
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

  get isEdit(): boolean {
    return !!this.hashId;
  }

  get isValid(): boolean {
    return (
      !!this.client.businessName?.trim() &&
      !!this.client.service &&
      !!this.client.tpStatus
    );
  }

  onAddressResolved(address: string): void {
    this.client.address = address;
  }

  save(): void {
    if (!this.isValid) {
      this.toastService.warning('Completa los campos obligatorios.');
      return;
    }

    this.client.latitude = this.location.latitude;
    this.client.longitude = this.location.longitude;

    this.clientService.save(this.client).subscribe({
      next: () => {
        this.toastService.success('Cliente guardado correctamente.');
        void this.router.navigate(['/clients']);
      },
      error: (e: HttpErrorResponse) => {
        if (e.error === 'client_not_found') {
          return this.toastService.error('Cliente no encontrado.');
        }

        if (e.error === 'client_business_name_must_be_unique') {
          return this.toastService.error('Ya existe un cliente con esa razón social.');
        }

        this.toastService.error('Error al guardar el cliente.');
      },
    });
  }

  cancel(): void {
    void this.router.navigate(['/clients']);
  }

  private applyClient(client: AppClient): void {
    this.client = client;
    this.client.customerSince = this.toDateInput(client.customerSince);
    this.location = { latitude: client.latitude, longitude: client.longitude };
  }

  private applyDefaults(): void {
    this.client = new AppClient();
    this.client.tpStatus = this.tpActive;
    this.client.customerSince = this.today();
    this.location = { latitude: null, longitude: null };
  }

  private toDateInput(value: string | null | undefined): string {
    if (!value) return '';
    return value.length > 10 ? value.substring(0, 10) : value;
  }

  private today(): string {
    return new Date().toISOString().substring(0, 10);
  }
}
