import { ListFilter, StringFilter } from '../../../../../model/filter.model';
import { TypologyEnum } from '../../../../../model/typology.enum';
import { OverdueClientStatusEnum } from '../../../../../model/report.enum';

export const OverdueClientsReportFilter = {
  id: 'overdue-clients-report-filters',
  filters: [
    new StringFilter('search', 'Negocio, contacto o correo', undefined),
    new ListFilter(
      'status',
      'Estado del cliente',
      [
        { value: `${TypologyEnum.ACTIVE}`, description: 'Activo', checked: false },
        { value: `${TypologyEnum.INACTIVE}`, description: 'Inactivo', checked: false },
        { value: `${TypologyEnum.LOCKED}`, description: 'Bloqueado', checked: false },
        { value: `${OverdueClientStatusEnum.SUSPENDED}`, description: 'Suspendido', checked: false },
      ],
      false,
      true,
    ),
  ],
  // The endpoint already answers sorted by debt and does not read `columnOrder`.
  order: undefined,
};