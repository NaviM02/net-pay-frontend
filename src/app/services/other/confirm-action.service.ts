import { Injectable } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { from } from 'rxjs';
import { ConfirmActionComponent } from '../../commons/components/confirm-action/confirm-action.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmActionService {

  private static instance: ConfirmActionService | null = null;

  constructor(private modalService: NgbModal) {
    ConfirmActionService.instance = this;
  }

  public static getInstance() {
    return ConfirmActionService.instance;
  }

  confirm(data: {
    title: string,
    titleHelper: string,
    bodyQuestion: string,
    bodyText: string,
    buttonType: string,
    confirmText: string,
    cancelText: string,
  }) {
    const modalRef = this.modalService.open(ConfirmActionComponent, { centered: true, size: 'md', keyboard: true, backdrop: true });
    modalRef.componentInstance.data = data;
    return from(modalRef.result)
  }
}
