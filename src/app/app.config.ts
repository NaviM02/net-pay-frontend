import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { loadingUiInterceptor } from './interceptors/loading-ui.interceptor';
import { unauthorizedInterceptor } from './interceptors/unauthorized.interceptor';
import { JwtModule } from '@auth0/angular-jwt';
import { AppStorageKeys } from './model/app-storage-keys.enum';
import { environment } from '../environments/environment';
import { DYNAMIC_LIST_PROVIDERS } from './services/other/dynamic-provider-registry.service';
import { AppUserService } from './services/core/app-user.service';
import { AppServiceService } from './services/core/app-service.service';
import { DynamicProviderKey } from './model/dynamic-provider-key.enum';
import { TypologyEnum } from './model/typology.enum';

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
          params.set('role', `${TypologyEnum.COLLECTOR}`);
          return service.findAll(params, true);
        },
      })
    },
  ],
};
