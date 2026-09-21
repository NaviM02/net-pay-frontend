import { HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export enum FilterEnum {
  STRING = 0,
  LIST = 1,
  DYNAMIC_LIST = 2,
  DATE_RANGE = 3,
  QUICK_FILTER = 4, // badge or chip, check FilterBarComponent
}

class BaseFilter {
  id: string; // used in the query params
  name: string; // to display in the HTML template
  curValue: any | undefined;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

export class StringFilter extends BaseFilter {
  type: FilterEnum.STRING = FilterEnum.STRING;
  override curValue: string | undefined;

  constructor(id: string, name: string, curValue: string | undefined) {
    super(id, name);
    this.curValue = curValue;
  }
}

export class ListFilter extends BaseFilter {
  type: FilterEnum.LIST = FilterEnum.LIST;
  values: { value: string; description: string; checked: boolean }[];
  translatable: boolean;
  isMultiple: boolean;

  override curValue: undefined;

  constructor(
    id: string,
    name: string,
    values: { value: string; description: string; checked: boolean }[],
    translatable: boolean,
    isMultiple: boolean,
  ) {
    super(id, name);
    this.values = values;
    this.translatable = translatable;
    this.isMultiple = isMultiple;
    this.curValue = undefined;
  }
}

export interface DynamicListSelectedValue {
  id: string | number;
  value: string;
}

export type DynamicListSearchService = (
  params: Map<string, string>,
) => Observable<HttpResponse<unknown[]>>;

export interface DynamicListProvider {
  key: string;
  searchService: DynamicListSearchService;
}

/**
 * Dynamic filter backed by a paginated/searchable endpoint.
 *
 * The filter stores only serializable data (config + selected values) so it can be
 * persisted in localStorage. The runtime search service is resolved by `providerKey`
 * through the dynamic list provider registry.
 */
export class DynamicListFilter extends BaseFilter {
  type: FilterEnum.DYNAMIC_LIST = FilterEnum.DYNAMIC_LIST;
  providerKey: string;
  queryParamName: string;
  size: number;
  idField: string;
  bindLabel: string;
  queryParams: Record<string, string>;

  override curValue: DynamicListSelectedValue[];

  /**
   * @param id Query param key used in the main list request with selected values
   * (example: `userIds=1,2`).
   * @param name i18n key or display label shown in the filter menu.
   * @param providerKey Provider registry key used to resolve the backend search service.
   * @param queryParamName Query param key used for dynamic search requests
   * (example: `username=john`).
   * @param idField Entity field name used as unique identifier for each option
   * (example: `userId`).
   * @param bindLabel Entity field name used to display each option
   * (example: `username`).
   * @param queryParams Static/default query params sent on every dynamic search request
   * (example: `{ status: 'active,locked' }`).
   * @param size Page size used by infinite scroll. Defaults to 10.
   * @param curValue Initial selected values snapshot to persist and restore selection.
   *
   * @Example
   * ```ts
   *  new DynamicListFilter (
   *    'essayIds',
   *    'txt_essays',
   *    DynamicProviderKey.SIDAL_ESSAY_FIND_ALL,
   *    'name',
   *    'essayId',
   *    'name',
   *    {
   *      status: `${TypologyEnum.ACTIVE},${TypologyEnum.LOCKED}`,
   *      columnOrder: 'name'
   *    },
   *  )
   * ```
   */
  constructor(
    id: string,
    name: string,
    providerKey: string,
    queryParamName: string,
    idField: string,
    bindLabel: string,
    queryParams: Record<string, string> = {},
    size: number = 10,
    curValue: DynamicListSelectedValue[] = [],
  ) {
    super(id, name);
    this.providerKey = providerKey;
    this.queryParamName = queryParamName;
    this.idField = idField;
    this.bindLabel = bindLabel;
    this.queryParams = queryParams;
    this.size = size;
    this.curValue = curValue;
  }
}

export class DateRangeFilter extends BaseFilter {
  type: FilterEnum.DATE_RANGE = FilterEnum.DATE_RANGE;
  fromDate?: string;
  toDate?: string;

  override curValue: undefined;

  constructor(id: string, name: string, fromDate?: string, toDate?: string) {
    super(id, name);
    this.fromDate = fromDate;
    this.toDate = toDate;
    this.curValue = undefined;
  }
}

export class QuickFilter extends BaseFilter {
  type: FilterEnum.QUICK_FILTER = FilterEnum.QUICK_FILTER;
  override curValue: {
    label: string;
    values: string[];
    count: number | undefined;
    active: boolean;
  }[];

  constructor(
    id: string,
    curValue: { label: string; values: string[]; count: number | undefined; active: boolean }[],
  ) {
    super(id, '');
    this.curValue = curValue;
  }
}

export class FilterOrder {
  columnOrder: string;
  asc: boolean;

  constructor(columnOrder: string, asc: boolean) {
    this.columnOrder = columnOrder;
    this.asc = asc;
  }
}

// As a suggestion, quick filter only should be used in the filter-bar.component.ts
export type FilterType =
  StringFilter | ListFilter | DynamicListFilter | DateRangeFilter | QuickFilter;

export interface IFilterGroup {
  id: string;
  filters: FilterType[];
  order: FilterOrder | undefined;
}

export class Pagination {
  name: string;
  offset: number = 0;
  size: number = 10;
  page: number = 1;
  total: number = 0;
  currentLength: number = 0;

  constructor(name: string) {
    this.name = name;
  }
}

export class ColumnConfig {
  id: string;
  name: string;
  isDefault: boolean;
  display: boolean;

  constructor(id: string, name: string, isDefault: boolean, display: boolean) {
    this.id = id;
    this.name = name;
    this.isDefault = isDefault;
    this.display = display;
  }
}
