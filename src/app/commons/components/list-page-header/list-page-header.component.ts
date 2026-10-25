import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AccessControlService } from '../../../services/core/access-control.service';
import { permissionForUrl } from '../../utils/access.utils';

@Component({
  selector: 'app-list-page-header',
  templateUrl: './list-page-header.component.html',
  styleUrls: ['./list-page-header.component.scss'],
})
export class ListPageHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() saveText: string = '';
  @Input() createPermission?: string;

  constructor(private router: Router, private accessService: AccessControlService) {}

  get canCreate(): boolean {
    return this.accessService.hasPermission(this.createPermission ?? permissionForUrl(this.router.url, 'create'));
  }

  @Output() buttonClick = new EventEmitter<void>();

  onButtonClick(): void {
    if (this.canCreate) this.buttonClick.emit();
  }
}
