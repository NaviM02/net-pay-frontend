import '@angular/compiler';
import { AppPermission } from '../../../model/access-control.model';
import { RolePermissionTableComponent } from './role-permission-table.component';

describe('RolePermissionTableComponent', () => {
  const permissions: AppPermission[] = [
    { hashId: 'client-read', resource: 'clients', action: 'read', authority: 'clients:read' },
    { hashId: 'client-update', resource: 'clients', action: 'update', authority: 'clients:update' },
    { hashId: 'client-import', resource: 'clients', action: 'import', authority: 'clients:import' },
    { hashId: 'payment-read', resource: 'payments', action: 'read', authority: 'payments:read' },
  ];

  let component: RolePermissionTableComponent;

  beforeEach(() => {
    component = new RolePermissionTableComponent();
    component.permissions = permissions;
  });

  it('groups permissions by resource and sorts actions in the supported order', () => {
    expect(component.groups.map(group => group.resource)).toEqual(['clients', 'payments']);
    expect(component.groups[0].permissions.map(permission => permission.action)).toEqual(['read', 'update', 'import']);
  });

  it('selects and clears all actions for a resource without changing other resources', () => {
    component.selectedPermissionHashIds = ['payment-read'];
    const change = spyOn(component.selectedPermissionHashIdsChange, 'emit');

    component.toggleAll(component.groups[0], true);
    expect(change.calls.mostRecent().args[0]).toEqual(['payment-read', 'client-read', 'client-update', 'client-import']);
    component.selectedPermissionHashIds = change.calls.mostRecent().args[0]!;

    component.toggleAll(component.groups[0], false);
    expect(change.calls.mostRecent().args[0]).toEqual(['payment-read']);
  });

  it('keeps individual actions independent and leaves unsupported actions unavailable', () => {
    component.selectedPermissionHashIds = ['client-read'];
    component.toggle(component.groups[0], 'update', true);
    expect(component.selectedPermissionHashIds).toEqual(['client-read', 'client-update']);
    expect(component.isAllChecked(component.groups[0])).toBeFalse();

    component.toggle(component.groups[1], 'import', true);
    expect(component.selectedPermissionHashIds).toEqual(['client-read', 'client-update']);
  });

  it('does not mutate read-only permissions', () => {
    component.readonly = true;
    component.selectedPermissionHashIds = ['client-read'];
    const change = spyOn(component.selectedPermissionHashIdsChange, 'emit');

    component.toggle(component.groups[0], 'update', true);
    component.toggleAll(component.groups[0], true);

    expect(component.selectedPermissionHashIds).toEqual(['client-read']);
    expect(change).not.toHaveBeenCalled();
  });
});
