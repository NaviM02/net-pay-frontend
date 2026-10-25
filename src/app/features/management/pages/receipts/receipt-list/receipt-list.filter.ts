import { DateRangeFilter, FilterOrder, StringFilter } from '../../../../../model/filter.model';

export const ReceiptListFilter = {
  id: 'receipt-list-filters',
  filters: [
    new StringFilter('search', 'N° de recibo o cliente', undefined),
    new DateRangeFilter('issuedAt', 'Fecha de emisión'),
  ],
  order: new FilterOrder('issuedAt', false),
};
