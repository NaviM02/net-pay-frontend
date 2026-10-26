import { DateRangeFilter, FilterOrder, ListFilter, StringFilter } from '../../../../../model/filter.model';
import { TypologyEnum } from '../../../../../model/typology.enum';

export const MyPaymentListFilter = {
  id: 'my-payment-list-filters',
  filters: [
    // The endpoint filters by `search`, which matches the reference and the
    // client of the payment.
    new StringFilter('search', 'Referencia o cliente', undefined),
    new ListFilter(
      'method',
      'Método de pago',
      [
        { value: `${TypologyEnum.CASH}`, description: 'Efectivo', checked: false },
        { value: `${TypologyEnum.TRANSFER}`, description: 'Transferencia', checked: false },
        { value: `${TypologyEnum.CAR}`, description: 'Tarjeta', checked: false },
      ],
      false,
      true,
    ),
    // `ListStateService` sends every date range as `fromDate` / `toDate`.
    new DateRangeFilter('paidAt', 'Fecha de pago'),
  ],
  order: new FilterOrder('paidAt', false),
};
