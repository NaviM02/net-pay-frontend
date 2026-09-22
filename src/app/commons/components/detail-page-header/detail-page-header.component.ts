import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MaterialIconComponent } from '../material-icon/material-icon.component';

/**
 * Component that displays a header for a detail page, including the item name, description,
 * and optional "Edit" and "Delete" actions.
 *
 * @Example
 * ```html
 * <div class="detail-page-header-container">
 *   <app-detail-page-header
 *     itemName="John Doe"
 *     description="txt_user_details_description"
 *     [backRoute]="['/security/users']"
 *     [editRoute]="['/security/users', 'edit', userId]"
 *     (deleteAction)="onDeleteUser()"
 *     deleteText="txt_delete_user"
 *     editText="txt_edit_user"
 *   ></app-detail-page-header>
 * </div>
 * ```
 */
@Component({
  selector: 'app-detail-page-header',
  imports: [
    MaterialIconComponent,
    RouterLink,
  ],
  templateUrl: './detail-page-header.component.html',
  styleUrl: './detail-page-header.component.scss'
})
export class DetailPageHeaderComponent {
  // The route to navigate to when the "Back" button is clicked. If not provided, the button will be hidden.
  @Input() backRoute: any[] | string | null | undefined = undefined;

  // The description to display below the item name.
  @Input() description: string = '';

  // The name of the item being displayed in the detail page.
  @Input() itemName: string = '';

  // Whether to show the "Edit" button. Defaults to false.
  @Input() showEdit: boolean = true;

  // Whether to show the "Delete" button. Defaults to false.
  @Input() showDelete: boolean = true;

  // The text to display for the "Delete" action. Defaults to 'Eliminar'.
  @Input() deleteText: string = 'Eliminar';

  // Event emitted when the "Delete" action is triggered.
  @Output() deleteAction = new EventEmitter<void>();

  // The text to display for the "Edit" action. Defaults to 'txt_edit'.
  @Input() editText: string = 'Editar';

  // The route to navigate to when the "Edit" button is clicked. If not provided, the button will be hidden.
  @Input() editRoute: any[] | string | null | undefined = undefined;
}
