import { FilterOrder, ListFilter, StringFilter } from '../../../../../model/filter.model';
import { TypologyEnum } from '../../../../../model/typology.enum';

export const UserListFilter = {
  id: 'user-list-filters',
  filters: [
    new StringFilter('fullName', 'Nombre completo', undefined),
    new StringFilter('email', 'Correo electrónico', undefined),
    new ListFilter(
      'role',
      'Rol',
      [
        { value: `${TypologyEnum.ADMIN}`, description: 'Administrador', checked: false },
        { value: `${TypologyEnum.COLLECTOR}`, description: 'Cobrador', checked: false },
      ],
      false,
      true,
    ),
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
