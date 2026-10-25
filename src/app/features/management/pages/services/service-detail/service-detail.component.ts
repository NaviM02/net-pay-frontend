import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { concatMap, tap } from 'rxjs';

import { AppService } from '../../../../../model/app.model';
import { AppServiceService } from '../../../../../services/core/app-service.service';
import { ToastService } from '../../../../../services/other/toast.service';
import { DetailPageHeaderComponent } from '../../../../../commons/components/detail-page-header/detail-page-header.component';
import { TypologyBadgeComponent } from '../../../../../commons/components/typology-badge/typology-badge.component';
import { ServiceFormModalComponent } from '../service-form-modal/service-form-modal.component';

@Component({
  selector: 'app-service-detail',
  imports: [
    CurrencyPipe,
    DetailPageHeaderComponent,
    TypologyBadgeComponent,
    ServiceFormModalComponent,
  ],
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.scss',
})
export class ServiceDetailComponent implements OnInit {
  hashId!: string | null;
  service: AppService = new AppService();

  showModal = false;

  constructor(
    private serviceService: AppServiceService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap(params => this.hashId = params.get('hashId')),
        concatMap(() => this.serviceService.findByHashId(this.hashId!)),
        tap(service => this.service = service),
      )
      .subscribe({
        error: (e: HttpErrorResponse) => {
          if (e.status === 404) {
            this.toastService.error('msg_error_not_found');
            void this.router.navigate(['/services']);
            return;
          }

          this.toastService.error('msg_error_server');
        }
      });
  }

  onEdit(): void {
    this.showModal = true;
  }

  onModalClose(saved: boolean): void {
    this.showModal = false;

    if (!saved) return;

    this.serviceService.findByHashId(this.hashId!).subscribe({
      next: service => this.service = service,
      error: () => this.toastService.error('msg_error_server'),
    });
  }

  onDelete(): void {
    if (!this.hashId) return;

    this.serviceService.delete(this.hashId).subscribe({
      next: () => {
        this.toastService.success('msg_success_delete');
        void this.router.navigate(['/services']);
      },
      error: () => this.toastService.error('msg_error_server'),
    });
  }
}
