import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-action',
  imports: [
    NgClass
  ],
  templateUrl: './confirm-action.component.html',
  styleUrl: './confirm-action.component.scss'
})
export class ConfirmActionComponent {

  data = {
    title: 'txt_confirm',
    titleHelper: '',
    bodyQuestion: 'txt_confirm_want_to_proceed',
    bodyText: '',
    buttonType: 'btn-danger',
    confirmText: 'txt_confirm',
    cancelText: 'txt_cancel',
  }

  constructor(public activeModal: NgbActiveModal) {
  }

  confirm() {
    this.activeModal.close(true);
  }

  close() {
    this.activeModal.dismiss(false);
  }
}
