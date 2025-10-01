import { provideHttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, TitleStrategy } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { TitleService } from '@core/services';
import {
  GATEWAY_ADMIN_API_URL,
  RD_DEV_API_URL,
  SUBSCRIPTION_API_URL,
} from '@core/tokens';
import { environment } from 'src/environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
    }),
    {
      provide: TitleStrategy,
      useClass: TitleService,
    },
    {
      provide: RD_DEV_API_URL,
      useValue: environment.rdDevApiUrl,
    },
    {
      provide: GATEWAY_ADMIN_API_URL,
      useValue: environment.gatewayAdminApiUrl,
    },
    {
      provide: SUBSCRIPTION_API_URL,
      useValue: environment.subscriptionApiUrl,
    },
  ],
};
