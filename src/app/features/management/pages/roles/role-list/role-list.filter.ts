import { FilterOrder, ListFilter, StringFilter } from '../../../../../model/filter.model';

export const RoleListFilter = {
  id: 'role-list-filters',
  filters: [
    new StringFilter('search', 'Nombre', undefined),
    new ListFilter('status', 'Estado', [
      { value: 'ACTIVE', description: 'Activo', checked: false },
      { value: 'INACTIVE', description: 'Inactivo', checked: false },
      { value: 'LOCKED', description: 'Sistema (bloqueado)', checked: false },
    ], false, false),
  ],
  order: new FilterOrder('name', true),
};
