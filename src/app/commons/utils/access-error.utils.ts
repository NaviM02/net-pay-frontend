import { HttpErrorResponse } from '@angular/common/http';

export function accessErrorMessage(error: HttpErrorResponse): string {
  if (error.status === 403) return 'No tienes permiso para realizar esta acción.';
  const messages: Record<string, string> = {
    role_locked: 'Este rol de sistema está bloqueado y no se puede modificar ni eliminar.',
    role_inactive: 'El rol está inactivo y no se puede asignar.',
    role_not_found: 'El rol ya no existe.',
    role_name_invalid: 'Introduce un nombre de rol de hasta 150 caracteres.',
    role_description_invalid: 'La descripción no puede superar los 500 caracteres.',
    role_status_invalid: 'El estado del rol no es válido.',
    role_permissions_required: 'Selecciona los permisos del rol.',
    role_date_range_invalid: 'La fecha de fin debe ser posterior a la fecha de inicio.',
    permission_not_found: 'Uno de los permisos seleccionados ya no existe.',
    role_name_already_exists: 'Ya existe un rol con este nombre.',
    role_not_editable: 'El rol ya no se puede editar ni eliminar.',
    active_role_not_found: 'El rol ya no está disponible para asignación.',
    user_role_not_found: 'La asignación del rol ya no existe.',
  };
  return (typeof error.error === 'string' && messages[error.error]) || 'No se pudo guardar el cambio de acceso.';
}
