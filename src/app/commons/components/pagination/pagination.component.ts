import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle,
  NgbPagination,
  NgbPaginationFirst,
  NgbPaginationLast,
  NgbPaginationNext,
  NgbPaginationPages, NgbPaginationPrevious
} from '@ng-bootstrap/ng-bootstrap';
import { Pagination } from '../../../model/filter.model';
import { MaterialIconComponent } from '../material-icon/material-icon.component';

const FILTER_PAG_REGEX = /[^0-9]/g;

/**
 * Component to handle pagination. Example usage:
 *
 * @Example
 * ```html
 * <app-pagination
 *  [pagination]="myPagination"
 *  (onPaginationChange)="onPaginationChange($event)"
 * >
 * </app-pagination>
 * ```
 */
@Component({
  selector: 'app-pagination',
  imports: [
    NgbPagination,
    NgbPaginationPages,
    NgbPaginationFirst,
    MaterialIconComponent,
    NgbPaginationLast,
    NgbPaginationNext,
    NgbPaginationPrevious,
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownItem,
    NgbDropdownToggle
  ],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {

  // output that is emitted when any property of the pagination (size or page) has changed
  @Output() onPaginationChange = new EventEmitter<Pagination>();
  // input that receives the pagination configuration
  @Input() pagination!: Pagination;

  // possible rows to show options
  rowsToShow = [10, 20, 30];

  selectPage(page: string, pages: number, input: HTMLInputElement) {
    const aux = parseInt(page, 10) || 1;

    // set current page to last page if current page is greater than last page
    this.pagination.page = aux > pages ? pages : aux;

    // if there are no pages, set current page to 1
    if (pages <= 0) this.pagination.page = 1;
    input.value = this.pagination.page.toString();

    this.emitChange();
  }

  // format input to allow only numbers
  formatInput(input: HTMLInputElement) {
    input.value = input.value.replace(FILTER_PAG_REGEX, '');
  }

  // when user selects a new max rows to show
  selectMax(max: number) {
    const pages = Math.ceil(this.pagination.total / max) || 1;

    // set current page to last page if current page is greater than last page
    if (this.pagination.page > pages) this.pagination.page = pages;
    this.pagination.size = max;
    this.emitChange();
  }

  // emit the pagination change event
  emitChange() {
    this.pagination.offset = (this.pagination.page - 1) * this.pagination.size;
    this.onPaginationChange.emit(this.pagination);
  }
}
