import { FilterOrder, ListFilter, StringFilter } from '../../../../../model/filter.model';
import { TypologyEnum } from '../../../../../model/typology.enum';

export const CollectorClientListFilter = {
  id: 'collector-client-list-filters',
  filters: [
    // The endpoint filters by `search`, which matches the business name, the
    // contact name or the contact email.
    new StringFilter('search', 'Negocio, contacto o correo', undefined),
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