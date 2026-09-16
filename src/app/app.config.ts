import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { routes } from './app.routes';
import { loadingUiInterceptor } from './interceptors/loading-ui.interceptor';
import { unauthorizedInterceptor } from './interceptors/unauthorized.interceptor';
import { JwtModule } from '@auth0/angular-jwt';
import { AppStorageKeys } from './model/app-storage-keys.enum';
import { environment } from '../environments/environment';

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
  ],
};
