import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ReuniaoDTO {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class PainelService {

  private apiUrl = '/publico/sev/buscar/painel';

  constructor(private http: HttpClient) { }

   getDadosPainel(ip: string): Observable<ReuniaoDTO> {
    return this.http.get<ReuniaoDTO>(this.apiUrl, {
      params: { ip }
    });
  }
}

