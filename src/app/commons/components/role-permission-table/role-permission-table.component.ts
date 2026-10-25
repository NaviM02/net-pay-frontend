import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AppPermission } from '../../../model/access-control.model';

export interface PermissionResourceGroup {
  resource: string;
  permissions: AppPermission[];
}

export type PermissionAction = 'read' | 'create' | 'update' | 'delete' | 'import' | 'export';

@Component({
  selector: 'app-role-permission-table',
  templateUrl: './role-permission-table.component.html',
  styleUrl: './role-permission-table.component.scss',
})
export class RolePermissionTableComponent {
  @Input() readonly = false;
  @Input() selectedPermissionHashIds: string[] = [];
  @Output() selectedPermissionHashIdsChange = new EventEmitter<string[]>();
  groups: PermissionResourceGroup[] = [];
  private readonly resourceLabels: Record<string, string> = {
    'audit-logs': 'Auditoría', 'my-dashboard': 'Mi panel', 'my-clients': 'Mis clientes',
    'my-payments': 'Mis pagos', 'my-receipts': 'Mis recibos', clients: 'Clientes',
    services: 'Servicios', payments: 'Pagos', receipts: 'Recibos', users: 'Usuarios',
    roles: 'Perfiles y permisos', reports: 'Reportes', dashboard: 'Dashboard',
  };
  readonly actions: { key: PermissionAction; shortLabel: string }[] = [
    { key: 'read', shortLabel: 'Ver' },
    { key: 'create', shortLabel: 'Crear' },
    { key: 'update', shortLabel: 'Editar' },
    { key: 'delete', shortLabel: 'Borrar' },
    { key: 'import', shortLabel: 'Importar' },
    { key: 'export', shortLabel: 'Exportar' },
  ];

  @Input() set permissions(permissions: AppPermission[]) {
    const grouped = new Map<string, AppPermission[]>();
    for (const permission of permissions ?? []) {
      const group = grouped.get(permission.resource) ?? [];
      group.push(permission);
      grouped.set(permission.resource, group);
    }
    this.groups = [...grouped.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([resource, items]) => ({
        resource: this.resourceLabels[resource] ?? this.humanize(resource),
        permissions: items.sort((left, right) => this.actionOrder(left.action) - this.actionOrder(right.action)),
      }));
  }

  private humanize(value: string): string {
    return value.replace(/[-_]+/g, ' ').replace(/\b\w/g, letter => letter.toLocaleUpperCase());
  }

  permission(group: PermissionResourceGroup, action: PermissionAction): AppPermission | undefined {
    return group.permissions.find(permission => permission.action === action);
  }

  isChecked(group: PermissionResourceGroup, action: PermissionAction): boolean {
    const permission = this.permission(group, action);
    return !!permission && this.selectedPermissionHashIds.includes(permission.hashId);
  }

  isAllChecked(group: PermissionResourceGroup): boolean {
    return group.permissions.length > 0 && group.permissions.every(permission => this.selectedPermissionHashIds.includes(permission.hashId));
  }

  toggle(group: PermissionResourceGroup, action: PermissionAction, checked: boolean): void {
    if (this.readonly) return;
    const permission = this.permission(group, action);
    if (!permission) return;
    const selection = new Set(this.selectedPermissionHashIds);
    checked ? selection.add(permission.hashId) : selection.delete(permission.hashId);
    this.emit(selection);
  }

  toggleAll(group: PermissionResourceGroup, checked: boolean): void {
    if (this.readonly) return;
    const selection = new Set(this.selectedPermissionHashIds);
    for (const permission of group.permissions) {
      checked ? selection.add(permission.hashId) : selection.delete(permission.hashId);
    }
    this.emit(selection);
  }

  private emit(selection: Set<string>): void {
    this.selectedPermissionHashIds = [...selection];
    this.selectedPermissionHashIdsChange.emit(this.selectedPermissionHashIds);
  }

  private actionOrder(action: string): number {
    const order: string[] = this.actions.map(item => item.key);
    const index = order.indexOf(action);
    return index < 0 ? order.length : index;
  }
}
