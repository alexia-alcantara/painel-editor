import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PainelService {
  
  // URL base fixa
  private readonly API_URL = 'https://visual.sevweb.com.br/api/v1/publico/sev/buscar/painel';

  constructor(private http: HttpClient) {}

  getDadosPainel(ip: string): Observable<any> {
    const url = `${this.API_URL}?ip=${ip}`;

    // 1. FORÇAR O SERVIDOR A ENVIAR XML
    // Sem isso, ele manda JSON (que vem bugado com apenas 2 membros)
    const headers = new HttpHeaders({
      'Accept': 'application/xml, text/xml, */*'
    });

    return this.http.get(url, { headers, responseType: 'text' }).pipe(
      map((rawResponse) => {
        // Log para confirmar se chegou XML (deve começar com <ResponseContainer> ou <xml>)
        // console.log('📦 Resposta Bruta do Servidor:', rawResponse.substring(0, 100) + '...');

        try {
          const parser = new DOMParser();
          const xml = parser.parseFromString(rawResponse, 'text/xml');
          
          // Verifica se houve erro no parser (o tal objeto {html} que apareceu no seu log)
          if (xml.getElementsByTagName('parsererror').length > 0) {
            console.error('❌ Erro ao converter: O servidor provavelmente não mandou XML válido.');
            return {};
          }

          const json = this.xmlToJson(xml);
          
          // Retorna o conteúdo útil
          return json.ResponseContainer ? json.ResponseContainer : json;
        } catch (e) {
          console.error('Erro fatal no parser:', e);
          return {};
        }
      })
    );
  }

  getDadosPainelEmTempoReal(ip: string, frequenciaMs: number = 2000): Observable<any> {
    return timer(0, frequenciaMs).pipe(
      switchMap(() => this.getDadosPainel(ip))
    );
  }

  // --- CONVERSOR XML -> JSON (Mantido igual) ---
  private xmlToJson(xml: any): any {
    let obj: any = {};

    if (xml.nodeType === 1) { // Elemento
      if (xml.attributes.length > 0) {
        obj['@attributes'] = {};
        for (let j = 0; j < xml.attributes.length; j++) {
          const attribute = xml.attributes.item(j);
          obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType === 3) { // Texto
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
}