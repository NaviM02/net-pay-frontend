import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbDropdown, NgbDropdownMenu, NgbDropdownToggle } from '@ng-bootstrap/ng-bootstrap';
/*import { InfiniteScrollDirective } from 'ngx-infinite-scroll';*/
import { debounceTime, Subject, Subscription } from 'rxjs';
import {
  DateRangeFilter,
  DynamicListFilter,
  DynamicListSelectedValue,
  FilterEnum,
  FilterType,
  IFilterGroup,
} from '../../../model/filter.model';
import { ToastService } from '../../../services/other/toast.service';
import { MaterialIconComponent } from '../material-icon/material-icon.component';
import { DateRangePickerComponent } from '../date-range-picker/date-range-picker.component';

interface DynamicListOption extends DynamicListSelectedValue {
  checked: boolean;
}

/**
 * Component to handle a filter menu with multiple filter types (string, list).
 * It emits the filterGroup with the current filter values on any change, debounced.
 *
 * @Example
 * ```html
 * <app-filter-menu
 *   [filterGroup]="myFilterGroup"
 *   (onFilterChange)="onFilterChange($event)"
 * ></app-filter-menu>
 * ```
 */
@Component({
  selector: 'app-filter-menu',
  imports: [
    MaterialIconComponent,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    FormsModule,
    NgClass,
    NgTemplateOutlet,
    DateRangePickerComponent, /*
    InfiniteScrollDirective,*/
  ],
  templateUrl: './filter-menu.component.html',
  styleUrl: './filter-menu.component.scss',
})
export class FilterMenuComponent implements OnInit, OnDestroy {
  // map of filter id to number of selected items
  selectedCount: { [id: string]: number } = {};

  // total number of selected items in all filters
  totalSelected = 0;

  // currently selected filter in the dropdown
  selectedFilter: FilterType | undefined;

  // internal filter group
  _filterGroup: IFilterGroup = { id: '', filters: [], order: undefined };

  @Output() onFilterChange = new EventEmitter<IFilterGroup>();
  @Input() set filterGroup(value: IFilterGroup) {
    if (!value) return;
    this._filterGroup = value;
    this.selectedFilter = undefined;
    this.updateTotalSelected();
  }

  protected readonly FilterEnum = FilterEnum;

  /**
   * To handle a {@link DynamicListFilter}
   */
  dynamicSearchValue = '';
  dynamicItems: DynamicListOption[] = [];
  dynamicOffset = 0;
  dynamicTotal = 0;
  dynamicLoading = false;

  private filterChange$ = new Subject<IFilterGroup>();
  private dynamicSearch$ = new Subject<string>();
  private filterChangeSub!: Subscription;
  private dynamicSearchSub!: Subscription;

  constructor(
    /*private dynamicProviderRegistry: DynamicProviderRegistryService,*/
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    // subscribe to filter changes with debouncing
    this.filterChangeSub = this.filterChange$.pipe(debounceTime(900)).subscribe({
      // next: filterGroup => this.filterGroupChange.emit(filterGroup)
      next: (_) => this.emitChange(),
    });

    this.dynamicSearchSub = this.dynamicSearch$.pipe(debounceTime(500)).subscribe({
      next: (_) => {
        if (!this.selectedFilter || this.selectedFilter.type !== FilterEnum.DYNAMIC_LIST) return;
        this.resetDynamicPagination();
        /*this.findDynamicValues(this.selectedFilter);*/
      },
    });
  }

  // called on any filter change (string input or list checkbox)
  onAnyFilterChange(): void {
    this.updateTotalSelected();
    this.filterChange$.next(this._filterGroup);
  }

  // index of the selected filter in filterGroup.filters
  onSelectedFilterChange(index: number): void {
    this.selectedFilter = this._filterGroup.filters[index];
    if (this.selectedFilter.type === FilterEnum.DYNAMIC_LIST) {
      this.resetDynamicState(this.selectedFilter);
      /*this.findDynamicValues(this.selectedFilter);*/
    }
  }

  // clear the currently selected filter
  onClearSelected(): void {
    if (!this.selectedFilter) return;

    this.clearAnyFilter(this.selectedFilter);

    if (this.selectedFilter.type === FilterEnum.DYNAMIC_LIST) {
      // call here and not in this.clearAnyFilter to avoid multiple calls for every possible dynamic list filter
     /* this.findDynamicValues(this.selectedFilter);*/
    }

    this.updateTotalSelected();
    this.emitChange(); // emit immediately
  }

  // clear all filters
  onClearAll(): void {
    this._filterGroup.filters.forEach((f) => this.clearAnyFilter(f));
    this.updateTotalSelected();
    this.emitChange(); // emit immediately
  }

  ngOnDestroy(): void {
    this.filterChangeSub?.unsubscribe();
    this.dynamicSearchSub?.unsubscribe();
  }

  // update the totalSelected and selectedCount map
  private updateTotalSelected(): void {
    this.totalSelected = this._filterGroup.filters.reduce((acc, filter) => {
      const count = this.getSelectedCount(filter);
      this.selectedCount[filter.id] = count;
      return acc + count;
    }, 0);
  }

  // get the number of selected items in a filter
  private getSelectedCount(filter: FilterType): number {
    if (filter.type === FilterEnum.STRING) {
      return !!filter.curValue && !!filter.curValue.trim() ? 1 : 0;
    }

    if (filter.type === FilterEnum.LIST) {
      return filter.values.filter((v) => v.checked).length;
    }

    if (filter.type === FilterEnum.DATE_RANGE) {
      return filter.fromDate && filter.toDate ? 1 : 0;
    }

    if (filter.type === FilterEnum.DYNAMIC_LIST) {
      return filter.curValue.length;
    }

    return 0;
  }

  // clear any filter (string or list)
  private clearAnyFilter(filter: FilterType): void {
    if (filter.type === FilterEnum.STRING) {
      filter.curValue = undefined;
    }
    if (filter.type === FilterEnum.LIST) {
      filter.values.forEach((v) => (v.checked = false));
    }
    if (filter.type === FilterEnum.DATE_RANGE) {
      filter.fromDate = undefined;
      filter.toDate = undefined;
    }

    if (filter.type === FilterEnum.DYNAMIC_LIST) {
      filter.curValue = [];
      this.resetDynamicState(filter);
    }
  }

  // call this method to emit immediately
  private emitChange(): void {
    this.onFilterChange.emit(this._filterGroup);
  }

  onDateRangeChange(range: { from: string; to: string }, filter: DateRangeFilter) {
    filter.fromDate = range.from || undefined;
    filter.toDate = range.to || undefined;
    this.onAnyFilterChange(); // debounced save + buildQueryParams
  }

  onDynamicSearchChange(): void {
    this.dynamicSearch$.next(this.dynamicSearchValue.trim());
  }

  /*onDynamicScrollDown(): void {
    if (!this.selectedFilter || this.selectedFilter.type !== FilterEnum.DYNAMIC_LIST) return;
    if (this.dynamicLoading || this.dynamicItems.length >= this.dynamicTotal) return;

    this.dynamicOffset += this.selectedFilter.size;
    this.findDynamicValues(this.selectedFilter);
  }*/

  onDynamicOptionChange(option: DynamicListOption): void {
    if (!this.selectedFilter || this.selectedFilter.type !== FilterEnum.DYNAMIC_LIST) return;

    if (option.checked) {
      if (!this.selectedFilter.curValue.some((v) => v.id === option.id)) {
        this.selectedFilter.curValue.push({ id: option.id, value: option.value });
      }
    } else {
      this.selectedFilter.curValue = this.selectedFilter.curValue.filter((v) => v.id !== option.id);
    }

    this.onAnyFilterChange();
  }

  private resetDynamicState(filter: DynamicListFilter): void {
    this.dynamicSearchValue = '';
    this.dynamicItems = this.buildDynamicOptions(filter, []);
    this.resetDynamicPagination();
  }

  private resetDynamicPagination(): void {
    this.dynamicOffset = 0;
    this.dynamicTotal = 0;
  }

  /*private findDynamicValues(filter: DynamicListFilter): void {
    const provider = this.dynamicProviderRegistry.get(filter.providerKey);
    if (!provider) return this.toastService.error('msg_error_server');

    const queryParams = filter.queryParams as Record<string, string>;

    const params = new Map<string, string>(Object.entries(queryParams))
      .set('offset', `${this.dynamicOffset}`)
      .set('size', `${filter.size}`);

    if (this.dynamicSearchValue.trim()) {
      params.set(filter.queryParamName, this.dynamicSearchValue.trim());
    }

    this.dynamicLoading = true;
    provider
      .searchService(params)
      .subscribe({
        next: (response) => {
          const mappedItems = this.mapDynamicResponseValues(response.body ?? [], filter);
          const isSearchMode = !!this.dynamicSearchValue.trim();
          const currentItems =
            this.dynamicOffset !== 0
              ? this.dynamicItems.map((item) => ({ id: item.id, value: item.value }))
              : [];
          const incomingItems = currentItems.concat(mappedItems);

          this.dynamicItems = this.buildDynamicOptions(filter, incomingItems, !isSearchMode);
          this.dynamicTotal =
            Number(response.headers.get('X-Total-Count')) || this.dynamicItems.length;
        },
        error: (_) => this.toastService.error('msg_error_server'),
      })
      .add(() => (this.dynamicLoading = false));
  }*/

  private mapDynamicResponseValues(
    items: unknown[],
    filter: DynamicListFilter,
  ): DynamicListSelectedValue[] {
    return items.reduce((acc: DynamicListSelectedValue[], item: unknown) => {
      if (!item || typeof item !== 'object') return acc;
      const entity = item as Record<string, unknown>;
      const idValue = entity[filter.idField];
      if (typeof idValue !== 'string' && typeof idValue !== 'number') return acc;

      const labelValue = entity[filter.bindLabel];
      const value =
        typeof labelValue === 'string' && labelValue.length ? labelValue : String(idValue);
      acc.push({ id: idValue, value });
      return acc;
    }, []);
  }

  private buildDynamicOptions(
    filter: DynamicListFilter,
    incoming: DynamicListSelectedValue[],
    includeChecked: boolean = true,
  ): DynamicListOption[] {
    const merged = new Map<string, DynamicListSelectedValue>();

    if (includeChecked) {
      for (const item of filter.curValue) {
        merged.set(String(item.id), item);
      }
    }

    for (const item of incoming) {
      merged.set(String(item.id), item);
    }

    const selectedIds = new Set(filter.curValue.map((item) => String(item.id)));
    return Array.from(merged.values()).map((item) => ({
      ...item,
      checked: selectedIds.has(String(item.id)),
    }));
  }
}
