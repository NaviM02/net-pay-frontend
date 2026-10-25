import { FilterOrder, ListFilter, StringFilter } from '../../../../../model/filter.model';
import { TypologyEnum } from '../../../../../model/typology.enum';

export const ServiceListFilter = {
  id: 'service-list-filters',
  filters: [
    new StringFilter('name', 'Nombre del plan', undefined),
    new ListFilter(
      'type',
      'Tipo',
      [
        { value: `${TypologyEnum.RESIDENTIAL}`, description: 'Residencial', checked: false },
        { value: `${TypologyEnum.EMPRESARIAL}`, description: 'Empresarial', checked: false },
        { value: `${TypologyEnum.CORPORATE}`, description: 'Corporativo', checked: false },
      ],
      false,
      true,
    ),
    new ListFilter(
      'status',
      'Estado',
      [
        { value: `${TypologyEnum.ACTIVE}`, description: 'Activo', checked: false },
        { value: `${TypologyEnum.INACTIVE}`, description: 'Descontinuado', checked: false },
      ],
      false,
      true,
    ),
  ],
  order: new FilterOrder('name', true),
};
