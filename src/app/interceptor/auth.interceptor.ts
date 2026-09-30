import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { runtimeConfig } from '../config/runtime-config';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const backendUrl = runtimeConfig.backendUrl;

  if (!backendUrl || !req.url.startsWith(backendUrl)) {
    return next(req);
  }

  const authService = inject(AuthService);

  if (authService.ehUrlDeLogin(req.url)) {
    return next(req);
  }

  const comToken = (r: HttpRequest<unknown>) => {
    const token = authService.getToken();
    return token ? r.clone({ setHeaders: { Authorization: token } }) : r;
  };

  return next(comToken(req)).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        console.warn('Tentando login automático..');
        return authService.login().pipe(
          switchMap((ok) => (ok ? next(comToken(req)) : throwError(() => err)))
        );
      }
      return throwError(() => err);
    })
  );
};