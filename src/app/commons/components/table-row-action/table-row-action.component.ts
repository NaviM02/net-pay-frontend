import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AccessControlService } from '../../../services/core/access-control.service';
import { permissionForUrl } from '../../utils/access.utils';

export interface TableRowCustomAction {
  label: string;
  action: () => void;
  icon?: string;
  danger?: boolean;
  permission?: string;
}

@Component({
  selector: 'app-table-row-action',
  templateUrl: './table-row-action.component.html',
  styleUrls: ['./table-row-action.component.scss'],
  imports: [RouterLink],
})
export class TableRowActionComponent {
  constructor(private router: Router, private accessService: AccessControlService) {}

  can(action: string): boolean {
    const url = this.viewRoute ? (Array.isArray(this.viewRoute) ? this.viewRoute.join('/') : this.viewRoute) : this.router.url;
    return this.accessService.hasPermission(permissionForUrl(url, action));
  }

  canRun(action: TableRowCustomAction): boolean {
    if (action.permission) return this.accessService.hasPermission(action.permission);
    // Receipt row actions request PDF documents and printing; personal receipts
    // use their own export grant instead of the management permission.
    const resource = this.router.url.split(/[/?#]/).filter(Boolean)[0];
    if (resource === 'receipts' || resource === 'my-receipts') {
      return this.accessService.hasPermission(permissionForUrl(this.router.url, 'export'));
    }
    return true;
  }

  @Input() viewRoute: any[] | string | null | undefined;
  @Input() editRoute: any[] | string | null | undefined;
  @Output() editAction = new EventEmitter<void>();
  @Output() deleteAction = new EventEmitter<void>();

  // Whether to show the "Edit" button. Defaults to false.
  @Input() showEdit: boolean = true;

  // Whether to show the "Edit" button. Defaults to false.
  @Input() showEditButton: boolean = true;

  // Whether to show the "Delete" button. Defaults to false.
  @Input() showDelete: boolean = true;

  @Input() viewText: string = 'txt_view';
  @Input() editText: string = 'txt_edit';
  @Input() deleteText: string = 'txt_delete';

  @Input() customActions: TableRowCustomAction[] = [];

  get show(): boolean {
    return (
      this.viewRoute !== undefined ||
      this.editRoute !== undefined ||
      this.editAction.observed ||
      this.deleteAction.observed ||
      this.customActions.length > 0
    );
  }
}
