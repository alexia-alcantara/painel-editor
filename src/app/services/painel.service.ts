import { runtimeConfig } from '../config/runtime-config';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, merge, of, timer } from 'rxjs';
import { catchError, debounceTime, exhaustMap, filter, map, throttleTime } from 'rxjs/operators';
import { log } from '../utils/log';


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
        log.erro('Painel', `Falha ao buscar os dados do painel ${ip}.`, err);
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

   
    const ehAvisoDeCronometro = (a: any) =>
      a?.destino === 'CRONOMETROS' || a?.tipoValor === 'ListCronometroDTO';

    const avisosCronometro$ = avisos$.pipe(
      filter(ehAvisoDeCronometro),
      throttleTime(5000, undefined, { leading: true, trailing: true }),
    );

    const outrosAvisos$ = avisos$.pipe(
      filter((a) => !ehAvisoDeCronometro(a)),
      debounceTime(150),
    );

    const porAviso$ = merge(avisosCronometro$, outrosAvisos$);

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
      log.aviso('Painel', `Resposta vazia para o painel ${ip}.`);
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
        log.erro('Painel', `Resposta inválida para o painel ${ip}.`, texto.slice(0, 300));
        return null;
      }

      const json = this.xmlToJson(xml);
      const resposta = json.ResponseContainer ? json.ResponseContainer : json;
      this.avisarSeStatusDeErro(resposta, ip);
      return resposta;
    } catch (e) {
      log.erro('Painel', `Falha ao ler a resposta do painel ${ip}.`, e);
      return null;
    }
  }

  private avisarSeStatusDeErro(resposta: any, ip: string): void {
    const codigo = resposta?.status?.code;
    if (codigo !== undefined && String(codigo) !== '0') {
      log.aviso('Painel', `Backend respondeu status ${codigo} para o painel ${ip}.`, resposta?.status?.message);
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