import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { routes } from './app.routes';
import { ToastService } from './shared/services/toast.service';
import { TokenStorageService } from './shared/services/token-storage.service';
import { authInterceptorProviders } from './shared/services/auth.intercepter';
import { BhakiService } from './shared/services/bhaki-service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withInterceptorsFromDi(),  withFetch()),
    BhakiService,
    ToastService,
    TokenStorageService,
    ...authInterceptorProviders
  ]
};