import { runtimeConfig } from '../config/runtime-config';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { log } from '../utils/log';

interface ResponseContainer<T> {
  status: { code: number; message: string };
  valor: T;
}

interface ArquivoBackend {
  id?: number;
  nome: string;
  md5?: string;
  dados: string; // base64
  class?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ImagemStorageService {
  private get API_URL(): string {
    return `${runtimeConfig.backendUrl}/arquivo`;
  }
  private readonly CLASS_ARQUIVO = 'br.com.visual.legis.pojo.configuracao.Arquivo';

  constructor(private http: HttpClient) {}

  salvarImagem(arquivo: File): Observable<number> {
    return from(this.arquivoParaBase64(arquivo)).pipe(
      switchMap((base64) => {
        const payload: ArquivoBackend = {
          nome: arquivo.name,
          dados: base64,
          class: this.CLASS_ARQUIVO,
        };
        return this.http
          .post<ResponseContainer<ArquivoBackend>>(`${this.API_URL}/inserir`, payload)
          .pipe(map((resp) => resp.valor.id!));
      })
    );
  }

  carregarImagem(idBackend: number | string): Observable<string | null> {
    return this.http.get<ResponseContainer<ArquivoBackend>>(`${this.API_URL}/buscar/${idBackend}`).pipe(
      map((resp) => (resp.valor?.dados ? `data:image/*;base64,${resp.valor.dados}` : null)),
      catchError((e) => {
        log.erro('Imagens', 'Falha ao carregar a imagem do backend.', e);
        return of(null);
      })
    );
  }

  removerImagem(idBackend: number | string): Observable<void> {
    return this.http
      .post<ResponseContainer<any>>(`${this.API_URL}/deletar`, { id: idBackend })
      .pipe(map(() => void 0));
  }

  private arquivoParaBase64(arquivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const resultado = reader.result as string;
        const base64 = resultado.split(',')[1] || '';
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(arquivo);
    });
  }
}