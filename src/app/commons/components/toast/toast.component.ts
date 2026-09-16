import { Component } from '@angular/core';
import { NgbToast, NgbToastHeader } from '@ng-bootstrap/ng-bootstrap';
import { MaterialIconComponent } from '../material-icon/material-icon.component';
import { ToastService } from '../../../services/other/toast.service';

@Component({
  selector: 'app-toast',
  imports: [NgbToast, NgbToastHeader, MaterialIconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  host: { class: 'toast-container position-fixed top-0 end-0 p-4', style: 'z-index: 1200' },
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
