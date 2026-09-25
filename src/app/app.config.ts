import { APP_INITIALIZER, ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './services/auth.service';
import { authInterceptor } from './interceptor/auth.interceptor';

function iniciarAutoLogin(authService: AuthService) {
  return () => firstValueFrom(authService.login());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    {
      provide: APP_INITIALIZER,
      useFactory: iniciarAutoLogin,
      deps: [AuthService],
      multi: true,
    },
  ],
};