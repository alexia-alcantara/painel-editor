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
    const headers = new HttpHeaders({
      'Accept': 'application/xml, text/xml, */*'
    });

    return this.http.get(url, { headers, responseType: 'text' }).pipe(
      map((rawResponse) => {

        try {
          const parser = new DOMParser();
          const xml = parser.parseFromString(rawResponse, 'text/xml');
          
          if (xml.getElementsByTagName('parsererror').length > 0) {
            console.error('Erro ao converter: O servidor provavelmente não mandou XML válido.');
            return {};
          }

          const json = this.xmlToJson(xml);
          
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
    const url = 'https://visual.sevweb.com.br/api/v1/painel/buscar/todos?offset=0&campoOrdem=periferico.endereco';

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