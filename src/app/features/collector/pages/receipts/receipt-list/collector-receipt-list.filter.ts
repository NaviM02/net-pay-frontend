import { DateRangeFilter, FilterOrder, StringFilter } from '../../../../../model/filter.model';

export const CollectorReceiptListFilter = {
  id: 'collector-receipt-list-filters',
  filters: [
    // The endpoint matches the receipt number, the business name and the contact
    // name of the client.
    new StringFilter('search', 'N° de recibo o cliente', undefined),
    // `ListStateService` sends every date range as `fromDate` / `toDate`.
    new DateRangeFilter('issuedAt', 'Fecha de emisión'),
  ],
  order: new FilterOrder('issuedAt', false),
};