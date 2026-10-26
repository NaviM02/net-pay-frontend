import { DateRangeFilter, FilterOrder, ListFilter, StringFilter } from '../../../../../model/filter.model';
import { TypologyEnum } from '../../../../../model/typology.enum';

export const PaymentListFilter = {
  id: 'payment-list-filters',
  filters: [
    new StringFilter('reference', 'Referencia', undefined),
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
    new DateRangeFilter('paidAt', 'Fecha de pago'),
  ],
  order: new FilterOrder('paidAt', false),
};
