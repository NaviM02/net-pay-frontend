import { DateRangeFilter, ListFilter, StringFilter } from '../../../../../model/filter.model';
import { AuditLevelEnum } from '../../../../../model/audit.enum';

export const AuditListFilter = {
  id: 'audit-list-filters',
  filters: [
    new StringFilter('search', 'Acción, detalle o usuario', undefined),
    new ListFilter(
      'level',
      'Nivel',
      [
        { value: `${AuditLevelEnum.INFO}`, description: 'Info', checked: false },
        { value: `${AuditLevelEnum.WARNING}`, description: 'Alerta', checked: false },
        { value: `${AuditLevelEnum.ERROR}`, description: 'Error', checked: false },
      ],
      false,
      true,
    ),
    new DateRangeFilter('createdAt', 'Fecha'),
  ],
  // No order: the endpoint already returns the newest first and only reads `asc`.
  order: undefined,
};
