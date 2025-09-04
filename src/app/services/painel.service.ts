import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * Interface para os dados que vêm do backend (DTO - Data Transfer Object).
 * Esta interface precisará ser ajustada para corresponder à estrutura de dados real
 * que a API retorna. Por enquanto, usamos 'any' para flexibilidade.
 */
export interface ReuniaoDTO {
  // tituloReuniao?: string;
  // parlamentaresPresentes?: any[];
  // dadosVotacao?: any;
  [key: string]: any; 
}

@Injectable({
  providedIn: 'root'
})
export class PainelService {

  private apiUrl = '/publico/sev/buscar/painel';

  constructor(private http: HttpClient) { }

  /**
   * Busca os dados em tempo real do painel para um determinado IP.
   * @param ip O endereço IP do painel que o backend irá consultar.
   * @returns Um Observable com os dados da reunião (ReuniaoDTO).
   */
  getDadosPainel(ip: string): Observable<ReuniaoDTO> {
    return this.http.get<ReuniaoDTO>(this.apiUrl, {
      params: { ip }
    });
  }
}
