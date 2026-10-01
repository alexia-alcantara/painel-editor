import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, finalize, shareReplay } from 'rxjs/operators';
import { runtimeConfig } from '../config/runtime-config';
import { log } from '../utils/log';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private token: string | null = null;
  private loginEmAndamento$: Observable<boolean> | null = null;

  constructor(private http: HttpClient) {}

  private get loginUrl(): string {
    return `${runtimeConfig.backendUrl}/login`;
  }

  getToken(): string | null {
    return this.token;
  }

  estaAutenticado(): boolean {
    return !!this.token;
  }

  ehUrlDeLogin(url: string): boolean {
    return url === this.loginUrl;
  }


  login(): Observable<boolean> {
    if (this.loginEmAndamento$) {
      return this.loginEmAndamento$;
    }

    if (!runtimeConfig.backendUrl || !runtimeConfig.authUsername || !runtimeConfig.authPassword) {
      log.aviso('Auth', 'backendUrl, usuário ou senha não preenchidos no assets/config.json.');
      this.token = null;
      return of(false);
    }

    const body = {
      username: runtimeConfig.authUsername,
      password: runtimeConfig.authPassword,
      modo: 'MOBILE',
    };

    this.loginEmAndamento$ = this.http.post(this.loginUrl, body, { observe: 'response' }).pipe(
      map((resp) => {
        const token = resp.headers.get('Authorization') || resp.headers.get('authorization');
        if (token) {
          this.token = token;
          log.info('Auth', 'Login feito.');
          return true;
        }
        log.aviso('Auth', 'Login sem token no cabeçalho Authorization.');
        this.token = null;
        return false;
      }),
      catchError((err) => {
        log.erro('Auth', 'Falha no login.', err);
        this.token = null;
        return of(false);
      }),
      finalize(() => (this.loginEmAndamento$ = null)),
      shareReplay(1)
    );

    return this.loginEmAndamento$;
  }
}