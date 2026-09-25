import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly LOGIN_URL = `${environment.backendUrl}/login`;

  private token: string | null = null;

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return this.token;
  }

  login(): Observable<boolean> {
    const body = {
      username: environment.authUsername,
      password: environment.authPassword,
      modo: 'MOBILE',
    };

    return this.http.post(this.LOGIN_URL, body, { observe: 'response' }).pipe(
      map((resp) => {
        const token = resp.headers.get('Authorization') || resp.headers.get('authorization');
        if (token) {
          this.token = token;
          console.log('[AUTH] Login automático concluído.');
          return true;
        }
        console.warn('[AUTH] Login retornou sem token no header Authorization.');
        return false;
      }),
      catchError((err) => {
        console.error('[AUTH] Falha no login automático:', err);
        return of(false);
      })
    );
  }
}