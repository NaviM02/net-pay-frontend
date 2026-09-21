import { Injectable } from '@angular/core';
import { FilterEnum, IFilterGroup, Pagination } from '../../model/filter.model';

@Injectable({
  providedIn: 'root',
})
export class ListStateService {
  filterBars: IFilterGroup[] = [];

  filter!: IFilterGroup;
  pagination!: Pagination;
  queryParams: Map<string, string> = new Map<string, string>();
  hideColumns: Map<string, boolean> = new Map<string, boolean>();

  findAllCallback!: () => void;

  constructor() {}

  init(
    filter: IFilterGroup,
    pagination: Pagination,
    findAll: () => void,
  ) {
    // reset state
    this.queryParams = new Map<string, string>();
    this.hideColumns = new Map<string, boolean>();

    this.filter = this.loadFilter(filter); // Load filter from LS
    this.filterBars = [];

    this.pagination = this.loadPagination(pagination); // Load pagination from LS
    this.buildQueryParams(); // Build queryParams from filter and pagination
    this.findAllCallback = findAll; // Set the callback to reload data
  }

  updatePagination(total: number, currentLength: number) {
    this.pagination = { ...this.pagination, total: total, currentLength: currentLength }; // to trigger change detection
    localStorage.setItem(this.pagination.name, JSON.stringify(this.pagination));
  }

  onPaginationChange(pagination: Pagination) {
    this.pagination = pagination;

    // Update queryParams
    this.queryParams.set('size', `${pagination.size}`);
    this.queryParams.set('offset', `${pagination.offset}`);

    // Save to localStorage
    localStorage.setItem(this.pagination.name, JSON.stringify(this.pagination));
    this.findAllCallback();
  }

  onFilterChange(filter: IFilterGroup) {
    if (this.filter.id == filter.id) this.filter = filter;
    else {
      const index = this.filterBars.findIndex((f) => f.id === filter.id);
      if (index >= 0) this.filterBars[index] = filter;
    }

    this.pagination = new Pagination(this.pagination.name); // to trigger change detection

    // save to localStorage
    for (const filterBar of this.filterBars) {
      localStorage.setItem(filterBar.id, JSON.stringify(filterBar));
    }
    localStorage.setItem(this.filter.id, JSON.stringify(this.filter));
    localStorage.setItem(this.pagination.name, JSON.stringify(this.pagination));

    this.buildQueryParams();
    this.findAllCallback(); // Reload data
  }

  private buildQueryParams() {
    const allFilters = [...this.filter.filters];
    for (const filterBar of this.filterBars) {
      allFilters.push(...filterBar.filters);
    }
    this.queryParams.clear();

    // update queryParams from filter
    for (const f of allFilters) {
      if (f.type === FilterEnum.STRING) {
        if (f.curValue && f.curValue.trim()) this.queryParams.set(f.id, f.curValue);
      }

      if (f.type === FilterEnum.LIST) {
        const selectedValues = f.values
          .filter((v) => v.checked)
          .map((v) => v.value)
          .join(',');
        if (selectedValues.length) this.queryParams.set(f.id, selectedValues);
      }

      if (f.type === FilterEnum.DYNAMIC_LIST) {
        const selectedValues = f.curValue.map((v) => String(v.id)).join(',');
        if (selectedValues.length) this.queryParams.set(f.id, selectedValues);
      }

      if (f.type === FilterEnum.DATE_RANGE) {
        if (f.fromDate && f.toDate) {
          this.queryParams.set('fromDate', f.fromDate);
          this.queryParams.set('toDate', f.toDate);
        }
      }

      if (f.type === FilterEnum.QUICK_FILTER) {
        const activeItem = f.curValue.find((f) => f.active);
        if (activeItem && activeItem.values.length)
          this.queryParams.set(f.id, activeItem.values.join(','));
      }
    }

    // update queryParams from pagination
    this.queryParams.set('size', `${this.pagination.size}`);
    this.queryParams.set('offset', `${this.pagination.offset}`);

    // update queryParams from order
    if (this.filter.order) {
      this.queryParams.set('columnOrder', this.filter.order.columnOrder);
      this.queryParams.set('asc', String(this.filter.order.asc));
    }
  }

  private loadPagination(pagination: Pagination): Pagination {
    try {
      const json = localStorage.getItem(pagination.name);
      if (!json) return pagination;

      const tmpPagination = JSON.parse(json) as Pagination;
      if (typeof tmpPagination !== 'object' || tmpPagination.name != pagination.name)
        return pagination;

      Object.assign(pagination, tmpPagination);
      return tmpPagination;
    } catch (err) {
      return pagination;
    }
  }

  public loadFilter(filter: IFilterGroup): IFilterGroup {
    try {
      const json = localStorage.getItem(filter.id);
      if (!json) return filter;

      const tmpFilter = JSON.parse(json) as IFilterGroup;
      if (
        typeof tmpFilter !== 'object' ||
        !tmpFilter.filters ||
        tmpFilter.filters.length !== filter.filters.length
      ) {
        return filter;
      }

      return tmpFilter;
    } catch (err) {
      return filter;
    }
  }
}
