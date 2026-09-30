import { runtimeConfig } from '../config/runtime-config';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, merge, of, timer } from 'rxjs';
import { catchError, debounceTime, exhaustMap, filter, map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class PainelService {
  
  // URL base fixa
   private get API_URL(): string {
    return `${runtimeConfig.backendUrl}/publico/sev/buscar/painel`;
  }

  constructor(private http: HttpClient) {}

  getDadosPainel(ip: string): Observable<any> {
    const url = `${this.API_URL}?ip=${encodeURIComponent(ip)}`;
    const headers = new HttpHeaders({
      'Accept': 'application/xml, text/xml, application/json, */*'
    });

    return this.http.get(url, { headers, responseType: 'text' }).pipe(
      map((rawResponse) => this.converterResposta(rawResponse, ip)),
      catchError((err) => {
        console.error(`[PAINEL] Erro ao buscar dados do painel "${ip}" em ${url}:`, err);
        return of(null);
      })
    );
  }

  getDadosPainelEmTempoReal(ip: string, frequenciaMs: number = 2000): Observable<any> {
    return timer(0, frequenciaMs).pipe(
      exhaustMap(() => this.getDadosPainel(ip))
    );
  }

  getDadosPainelComAvisos(
    ip: string,
    avisos$: Observable<any>,
    socketConectado: () => boolean,
    frequenciaMs: number = 1000,
    segurancaMs: number = 5000
  ): Observable<any> {
    let ultimaBusca = 0;

    const porTempo$ = timer(0, frequenciaMs).pipe(
      filter(() => !socketConectado() || Date.now() - ultimaBusca >= segurancaMs)
    );

    const porAviso$ = avisos$.pipe(debounceTime(150));

    return merge(porTempo$, porAviso$).pipe(
      exhaustMap(() => {
        ultimaBusca = Date.now();
        return this.getDadosPainel(ip);
      })
    );
  }

  private converterResposta(rawResponse: string, ip: string): any {
    const texto = (rawResponse || '').trim();

    if (!texto) {
      console.warn(`[PAINEL] Resposta vazia para o painel "${ip}".`);
      return null;
    }

    try {
      if (texto.startsWith('{') || texto.startsWith('[')) {
        const json = JSON.parse(texto);
        this.avisarSeStatusDeErro(json, ip);
        return json;
      }

      const parser = new DOMParser();
      const xml = parser.parseFromString(texto, 'text/xml');

      if (xml.getElementsByTagName('parsererror').length > 0) {
        console.error(`[PAINEL] Resposta do painel "${ip}" não é XML nem JSON válido:`, texto.slice(0, 300));
        return null;
      }

      const json = this.xmlToJson(xml);
      const resposta = json.ResponseContainer ? json.ResponseContainer : json;
      this.avisarSeStatusDeErro(resposta, ip);
      return resposta;
    } catch (e) {
      console.error(`[PAINEL] Erro ao ler a resposta do painel "${ip}":`, e);
      return null;
    }
  }

  private avisarSeStatusDeErro(resposta: any, ip: string): void {
    const codigo = resposta?.status?.code;
    if (codigo !== undefined && String(codigo) !== '0') {
      console.warn(
        `[PAINEL] Backend respondeu com status ${codigo} para o painel "${ip}":`,
        resposta?.status?.message
      );
    }
  }

  private xmlToJson(xml: any): any {
    let obj: any = {};

    if (xml.nodeType === 1) { 
      if (xml.attributes.length > 0) {
        obj['@attributes'] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType === 3) { 
      obj = xml.nodeValue.trim();
    }

    if (xml.hasChildNodes()) {
      for (let i = 0; i < xml.childNodes.length; i++) {
        const item = xml.childNodes.item(i);
        const nodeName = item.nodeName;

        if (nodeName === '#text') {
          const text = item.nodeValue.trim();
          if (text) return text; 
          continue;
        }

        const jsonItem = this.xmlToJson(item);

        if (obj[nodeName] === undefined) {
          obj[nodeName] = jsonItem;
        } else {
          if (!Array.isArray(obj[nodeName])) {
            obj[nodeName] = [obj[nodeName]];
          }
          obj[nodeName].push(jsonItem);
        }
      }
    }
    return obj;
  }

  listarPaineis(): Observable<any[]> {
    const url = `${runtimeConfig.backendUrl}/painel/buscar/todos?offset=0&campoOrdem=periferico.endereco`;

    return this.http.get<any>(url).pipe(
      map(response => {
        if (response && response.valor && response.valor.lista) {
           return response.valor.lista;
        }
        return [];
      })
    );
  }
}