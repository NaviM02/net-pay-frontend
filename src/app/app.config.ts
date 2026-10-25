import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { HttpResponse, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { of } from 'rxjs';
import { routes } from './app.routes';
import { loadingUiInterceptor } from './interceptors/loading-ui.interceptor';
import { unauthorizedInterceptor } from './interceptors/unauthorized.interceptor';
import { JwtModule } from '@auth0/angular-jwt';
import { AppStorageKeys } from './model/app-storage-keys.enum';
import { environment } from '../environments/environment';
import { DYNAMIC_LIST_PROVIDERS } from './services/other/dynamic-provider-registry.service';
import { AppUserService } from './services/core/app-user.service';
import { CurrentUserService } from './services/core/current-user.service';
import { AppServiceService } from './services/core/app-service.service';
import { AppClientService } from './services/core/app-client.service';
import { AppClient } from './model/app.model';
import { DynamicProviderKey } from './model/dynamic-provider-key.enum';
import { TypologyEnum } from './model/typology.enum';
import { AccessControlService } from './services/core/access-control.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([loadingUiInterceptor, unauthorizedInterceptor]),
    ),
    importProvidersFrom(
      JwtModule.forRoot({
        config: {
          tokenGetter: () => {
            return localStorage.getItem(AppStorageKeys.AUTH);
          },
          allowedDomains: [environment.backendDomain],
        },
      }),
    ),
    {
      provide: DYNAMIC_LIST_PROVIDERS,
      multi: true,
      deps: [AccessControlService],
      useFactory: (service: AccessControlService) => ({
        key: DynamicProviderKey.APP_ROLES_FIND_ALL,
        searchService: (params: Map<string, string>) => service.roles(params),
      }),
    },
    {
      provide: DYNAMIC_LIST_PROVIDERS,
      multi: true,
      deps: [AppUserService],
      useFactory: (service: AppUserService) => ({
        key: DynamicProviderKey.APP_USERS_FIND_ALL,
        searchService: (params: Map<string, string>) => service.findAll(params, true),
      })
    },
    {
      provide: DYNAMIC_LIST_PROVIDERS,
      multi: true,
      deps: [AppServiceService],
      useFactory: (service: AppServiceService) => ({
        key: DynamicProviderKey.APP_SERVICES_FIND_ALL,
        searchService: (params: Map<string, string>) => service.findAll(params, true),
      })
    },
    {
      provide: DYNAMIC_LIST_PROVIDERS,
      multi: true,
      deps: [AppUserService],
      useFactory: (service: AppUserService) => ({
        key: DynamicProviderKey.APP_COLLECTORS_FIND_ALL,
        searchService: (params: Map<string, string>) => {
          params.delete('role');
          params.set('status', `${TypologyEnum.ACTIVE}`);
          return service.findAll(params, true);
        },
      })
    },
    {
      provide: DYNAMIC_LIST_PROVIDERS,
      multi: true,
      deps: [AppClientService],
      useFactory: (service: AppClientService) => ({
        key: DynamicProviderKey.APP_CLIENTS_FIND_ALL,
        searchService: (params: Map<string, string>) => service.findAll(params, true),
      })
    },
    {
      provide: DYNAMIC_LIST_PROVIDERS,
      multi: true,
      deps: [AppUserService, CurrentUserService],
      useFactory: (service: AppUserService, currentUserService: CurrentUserService) => ({
        key: DynamicProviderKey.APP_PERSONAL_CLIENTS_FIND_ALL,
        searchService: (params: Map<string, string>) => {
          // Always the current user, so the select can never offer a client outside their
          // client outside its portfolio.
          const hashId = currentUserService.getCurrentHashId();
          if (!hashId) return of(new HttpResponse<AppClient[]>({ body: [] }));

          return service.findClientsByUserHashId(hashId, params);
        },
      })
    },
  ],
};
