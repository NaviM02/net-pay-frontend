import { FilterOrder, ListFilter, StringFilter } from '../../../../../model/filter.model';
import { TypologyEnum } from '../../../../../model/typology.enum';

export const ClientListFilter = {
  id: 'client-list-filters',
  filters: [
    new StringFilter('businessName', 'Razón social', undefined),
    new StringFilter('contactName', 'Contacto', undefined),
    new StringFilter('contactEmail', 'Correo de contacto', undefined),
    new ListFilter(
      'status',
      'Estado',
      [
        { value: `${TypologyEnum.ACTIVE}`, description: 'Activo', checked: false },
        { value: `${TypologyEnum.INACTIVE}`, description: 'Inactivo', checked: false },
      ],
      false,
      true,
    ),
  ],
  order: new FilterOrder('id', true),
};
