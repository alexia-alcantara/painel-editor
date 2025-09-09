import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReuniaoDTO {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class PainelService {

  // private apiUrl = '/publico/sev/buscar/painel';
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

   getDadosPainel(ip: string): Observable<ReuniaoDTO> {
    const endpoint = '/publico/sev/buscar/painel';
    const urlCompleta = this.baseUrl + endpoint;

     return this.http.get<ReuniaoDTO>(urlCompleta, {
      params: { ip }
    });
  }
}

