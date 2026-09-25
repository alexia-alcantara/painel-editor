import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { DistribuirConfig } from '../dialogs/distribuir-parlamentares/distribuir-parlamentares.component';
import { Cenario } from '../models/cenario.model';

interface ResponseContainer<T> {
  status: { code: number; message: string };
  valor: T;
}

interface ListaRetorno<T> {
  lista: T[];
  count: number;
  offset: number;
  limit: number;
}

interface TipoPainelBackend {
  id?: number;
  nome: string;
  resolucao: string;
  class?: string;
}

interface PainelCenarioBackend {
  id?: number;
  nome: string;
  layout: string;
  tipopainel: TipoPainelBackend;
  class?: string;
}

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly BASE_URL = 'http://localhost:8443';
  private readonly API_URL = `${this.BASE_URL}/painelcenario`;
  private readonly TIPO_PAINEL_URL = `${this.BASE_URL}/tipoPainel`;

  private cenariosAtualizados = new Subject<Cenario[]>();
  cenarios$ = this.cenariosAtualizados.asObservable();

  private LAYOUT_ATUAL_KEY = 'layout_editor_atual';
  private DIST_CONFIG_KEY = 'distribuicao_config';

  constructor(private http: HttpClient) {}

  salvarLayoutAtual(layout: Cenario): void {
    const layoutParaSalvar = { ...layout };
    delete (layoutParaSalvar as any).imagemFundoFile;
    localStorage.setItem(this.LAYOUT_ATUAL_KEY, JSON.stringify(layoutParaSalvar));
  }

  carregarLayoutAtual(): Cenario | null {
    try {
      const cenarioString = localStorage.getItem(this.LAYOUT_ATUAL_KEY);
      return cenarioString ? JSON.parse(cenarioString) : null;
    } catch (e) {
      console.error('Erro ao carregar cenário atual do localStorage', e);
      return null;
    }
  }

  listarCenarios(): Observable<Cenario[]> {
    return this.http.get<ResponseContainer<ListaRetorno<PainelCenarioBackend>>>(`${this.API_URL}/buscar/todos`).pipe(
      map((resp) =>
        (resp.valor?.lista || [])
          .map((c) => this.converterParaCenario(c))
          .filter((c): c is Cenario => c !== null)
      ),
      tap((cenarios) => this.cenariosAtualizados.next(cenarios)),
      catchError((e) => {
        console.error('Erro ao listar cenários do backend', e);
        return of([]);
      })
    );
  }

  carregarCenario(identificador: string): Observable<Cenario | null> {
    return this.listarCenarios().pipe(
      map(
        (cenarios) =>
          cenarios.find(
            (c) =>
              c.slug === identificador ||
              c.id === identificador ||
              String(c.idBackend) === identificador
          ) || null
      )
    );
  }

  salvarCenario(cenario: Cenario): Observable<Cenario> {
    return this.obterOuCriarTipoPainel(cenario).pipe(
      switchMap((idTipoPainel) => {
        const payload = this.converterParaBackend(cenario, idTipoPainel);
        const isUpdate = !!cenario.idBackend;

        if (isUpdate) {
          (payload as any).id = cenario.idBackend;
        }

        const req$ = isUpdate
          ? this.http.post<ResponseContainer<PainelCenarioBackend>>(`${this.API_URL}/alterar`, payload)
          : this.http.post<ResponseContainer<PainelCenarioBackend>>(`${this.API_URL}/inserir`, payload);

        return req$.pipe(
          map((resp) => {
            const cenarioSalvo = this.converterParaCenario(resp.valor);
            if (!cenarioSalvo) {
              throw new Error('Backend devolveu um cenário em formato inesperado ao salvar.');
            }
            return cenarioSalvo;
          })
        );
      }),
      tap(() => this.listarCenarios().subscribe())
    );
  }

  removerCenario(idBackend: number): Observable<void> {
    return this.http.post<ResponseContainer<any>>(`${this.API_URL}/deletar`, { id: idBackend }).pipe(
      map(() => void 0),
      tap(() => this.listarCenarios().subscribe())
    );
  }

  private readonly CLASS_PAINEL_CENARIO = 'br.com.visual.legis.pojo.comunicacao.PainelCenario';
  private readonly CLASS_TIPO_PAINEL = 'br.com.visual.legis.pojo.comunicacao.TipoPainel';

  private obterOuCriarTipoPainel(cenario: Cenario): Observable<number> {
    const resolucao = `${cenario.targetWidth}x${cenario.targetHeight}`;

    return this.http.get<ResponseContainer<ListaRetorno<TipoPainelBackend>>>(`${this.TIPO_PAINEL_URL}/buscar/todos`).pipe(
      map((resp) => (resp.valor?.lista || []).find((t) => t.resolucao === resolucao)),
      switchMap((existente) => {
        if (existente && existente.id) {
          return of(existente.id);
        }
        const novo: TipoPainelBackend = {
          nome: `Painel ${resolucao}`,
          resolucao,
          class: this.CLASS_TIPO_PAINEL,
        };
        return this.http
          .post<ResponseContainer<TipoPainelBackend>>(`${this.TIPO_PAINEL_URL}/inserir`, novo)
          .pipe(map((r) => r.valor.id!));
      })
    );
  }

  private converterParaBackend(cenario: Cenario, idTipoPainel: number): PainelCenarioBackend {
    const { idBackend, ...cenarioParaSalvar } = cenario as any;
    return {
      nome: cenario.nome,
      layout: this.escaparNaoAscii(JSON.stringify(cenarioParaSalvar)),
      tipopainel: {
        id: idTipoPainel,
        nome: '',
        resolucao: '',
        class: this.CLASS_TIPO_PAINEL,
      },
      class: this.CLASS_PAINEL_CENARIO,
    };
  }

  private converterParaCenario(backendCenario: PainelCenarioBackend): Cenario | null {
    let cenario: any;
    try {
      cenario = this.repararAcentosEmTudo(JSON.parse(backendCenario.layout));
    } catch {
      return null;
    }

    if (!cenario || !Array.isArray(cenario.componentes) || typeof cenario.slug !== 'string') {
      return null;
    }

    cenario.idBackend = backendCenario.id;
    cenario.nome = cenario.nome || this.repararAcentos(backendCenario.nome);
    return cenario as Cenario;
  }

  private escaparNaoAscii(json: string): string {
    return json.replace(/[\u0080-\uFFFF]/g, (ch) =>
      '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0')
    );
  }

  private readonly CP1252_PARA_BYTE: Record<number, number> = {
    0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85, 0x2020: 0x86,
    0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c,
    0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95,
    0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b,
    0x0153: 0x9c, 0x017e: 0x9e, 0x0178: 0x9f,
  };

    private repararAcentosEmTudo(valor: any): any {
    if (typeof valor === 'string') return this.repararAcentos(valor);
    if (Array.isArray(valor)) return valor.map((v) => this.repararAcentosEmTudo(v));
    if (valor && typeof valor === 'object') {
      const saida: any = {};
      for (const chave of Object.keys(valor)) {
        saida[chave] = this.repararAcentosEmTudo(valor[chave]);
      }
      return saida;
    }
    return valor;
  }

  private repararAcentos(texto: string): string {
    if (!texto) return texto;

    if (!/[\u00c3\u00c2][\u0080-\u00bf\u0152\u0153\u0160\u0161\u0178\u017d\u017e\u0192\u02c6\u02dc\u2013-\u203a\u20ac\u2122]/.test(texto)) {
      return texto;
    }

    try {
      const bytes = new Uint8Array(texto.length);
      for (let i = 0; i < texto.length; i++) {
        const cod = texto.charCodeAt(i);
        const byte = cod < 0x100 ? cod : this.CP1252_PARA_BYTE[cod];
        if (byte === undefined) return texto; 
        bytes[i] = byte;
      }
      return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      return texto;
    }
  }

  salvarConfigDistribuicao(config: DistribuirConfig): void {
    localStorage.setItem(this.DIST_CONFIG_KEY, JSON.stringify(config));
  }

  carregarConfigDistribuicao(): DistribuirConfig | null {
    const configString = localStorage.getItem(this.DIST_CONFIG_KEY);
    return configString ? JSON.parse(configString) : null;
  }
}