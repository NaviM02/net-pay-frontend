import '@angular/compiler';
import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injector, runInInjectionContext, TemplateRef, ViewContainerRef } from '@angular/core';
import { ActivatedRouteSnapshot, DefaultUrlSerializer, Router, RouterStateSnapshot } from '@angular/router';
import { isObservable, of, Subject, throwError } from 'rxjs';
import { UserAccess } from '../../model/access-control.model';
import { getHomeRoute, hasPermission, permissionForUrl } from '../../commons/utils/access.utils';
import { QueryParamService } from '../other/query-param.service';
import { AccessControlService } from './access-control.service';
import { CurrentUserService } from './current-user.service';
import { allowNavigationGuard } from '../../security/allow-navigation.guard';
import { PermissionDirective } from '../../commons/directives/permission.directive';

describe('Effective access', () => {
  let http: jasmine.SpyObj<HttpClient>;
  let service: AccessControlService;

  beforeEach(() => {
    http = jasmine.createSpyObj<HttpClient>('HttpClient', ['get']);
    service = new AccessControlService(http, new QueryParamService());
  });

  it('keeps CRUD, import and export grants independent and resource-specific', () => {
    const actions = ['read', 'create', 'update', 'delete', 'import', 'export'];
    for (const action of actions) {
      for (const required of actions) {
        expect(hasPermission([`users:${action}`], `users:${required}`)).toBe(action === required);
      }
    }
    expect(hasPermission(['users:update'], 'roles:update')).toBeFalse();
    expect(hasPermission(['roles:update'], 'users:update')).toBeFalse();
    expect(hasPermission(['reports:export'], 'receipts:export')).toBeFalse();
  });

  it('does not infer access from role names or their permission lists', () => {
    http.get.and.returnValue(of({ roles: [{ role: { name: 'Administrador', permissions: [{ authority: 'users:delete' }] } }], permissions: [] }));
    service.loadAccess().subscribe();
    expect(service.hasPermission('users:delete')).toBeFalse();
    expect(service.getHomeRoute()).toBe('/404');
  });

  it('chooses only a page with an explicit read grant', () => {
    expect(getHomeRoute([])).toBe('/404');
    expect(getHomeRoute(['users:update', 'reports:export'])).toBe('/404');
    expect(getHomeRoute(['payments:read'])).toBe('/payments');
    expect(getHomeRoute(['roles:read'])).toBe('/roles');
    expect(getHomeRoute(['my-payments:create'])).toBe('/my-payments/new');
  });

  it('resolves generic personal routes and audit URLs to catalogue permissions', () => {
    expect(permissionForUrl('/my-payments/new', 'create')).toBe('my-payments:create');
    expect(permissionForUrl('/my-payments/uuid', 'read')).toBe('my-payments:read');
    expect(permissionForUrl('/my-clients/uuid', 'read')).toBe('my-clients:read');
    expect(permissionForUrl('/my-dashboard', 'read')).toBe('my-dashboard:read');
    expect(permissionForUrl('/my-receipts', 'read')).toBe('my-receipts:read');
    expect(permissionForUrl('/my-receipts', 'export')).toBe('receipts:export');
    expect(permissionForUrl('/audit/USER/uuid/1', 'read')).toBe('audit-logs:read');
    expect(permissionForUrl('//users/uuid?tab=roles', 'read')).toBe('users:read');
  });

  it('shares concurrent requests and removes revoked grants after refresh', () => {
    const response = new Subject<UserAccess>();
    http.get.and.returnValue(response);
    service.loadAccess().subscribe();
    service.loadAccess(true).subscribe();
    expect(http.get).toHaveBeenCalledTimes(1);
    response.next({ roles: [], permissions: ['users:read'] });
    response.complete();
    expect(service.hasPermission('users:read')).toBeTrue();

    http.get.and.returnValue(of({ roles: [], permissions: [] }));
    service.loadAccess(true).subscribe();
    expect(service.hasPermission('users:read')).toBeFalse();
  });

  it('fails closed when the refresh request fails', () => {
    http.get.and.returnValue(of({ roles: [], permissions: ['roles:update'] }));
    service.loadAccess().subscribe();
    http.get.and.returnValue(throwError(() => new Error('Network unavailable')));
    service.loadAccess(true).subscribe({ error: () => {} });
    expect(service.hasPermission('roles:update')).toBeFalse();
  });

  it('ignores an old session response after logout and a new login', () => {
    const oldResponse = new Subject<UserAccess>();
    const newResponse = new Subject<UserAccess>();
    http.get.and.returnValues(oldResponse, newResponse);
    service.loadAccess().subscribe();
    service.clear();
    service.loadAccess().subscribe();
    newResponse.next({ roles: [], permissions: ['clients:read'] });
    newResponse.complete();
    oldResponse.next({ roles: [], permissions: ['roles:delete'] });
    oldResponse.complete();
    expect(service.hasPermission('roles:delete')).toBeFalse();
    expect(service.hasPermission('clients:read')).toBeTrue();
  });

  it('removes a rendered control when the grant is revoked', () => {
    const container = jasmine.createSpyObj<ViewContainerRef>('ViewContainerRef', ['clear', 'createEmbeddedView']);
    const destroyRef = { onDestroy: () => () => {} } as DestroyRef;
    const directive = new PermissionDirective({} as TemplateRef<unknown>, container, service, destroyRef);
    directive.appPermission = 'roles:update';
    expect(container.createEmbeddedView).not.toHaveBeenCalled();

    http.get.and.returnValue(of({ roles: [], permissions: ['roles:update'] }));
    service.loadAccess().subscribe();
    expect(container.createEmbeddedView).toHaveBeenCalledTimes(1);
    container.clear.calls.reset();
    service.clear();
    expect(container.clear).toHaveBeenCalledTimes(1);
  });

  it('requires both the parent read grant and the child action grant when navigating', () => {
    const router = jasmine.createSpyObj<Router>('Router', ['parseUrl']);
    router.parseUrl.and.callFake(url => new DefaultUrlSerializer().parse(url));
    const user = { isAuthenticated: () => true, getCurrentUser: () => of({ hashId: 'user-uuid' }) };
    const injector = Injector.create({ providers: [
      { provide: Router, useValue: router },
      { provide: CurrentUserService, useValue: user },
      { provide: AccessControlService, useValue: service },
    ] });
    const route = {
      pathFromRoot: [{ data: { permission: 'clients:read' } }, { data: { permission: 'clients:create' } }],
    } as unknown as ActivatedRouteSnapshot;

    for (const permissions of [['clients:create'], ['clients:read'], ['clients:read', 'clients:create']]) {
      http.get.and.returnValue(of({ roles: [], permissions }));
      const result = runInInjectionContext(injector, () => allowNavigationGuard(route, {} as RouterStateSnapshot));
      expect(isObservable(result)).toBeTrue();
      if (isObservable(result)) result.subscribe(allowed => {
        if (permissions.length === 2) expect(allowed).toBeTrue();
        else expect(String(allowed)).toBe('/404');
      });
    }
  });
});
