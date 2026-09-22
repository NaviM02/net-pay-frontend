import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface TableRowCustomAction {
  label: string;
  action: () => void;
}

@Component({
  selector: 'app-table-row-action',
  templateUrl: './table-row-action.component.html',
  styleUrls: ['./table-row-action.component.scss'],
  imports: [RouterLink],
})
export class TableRowActionComponent {
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
