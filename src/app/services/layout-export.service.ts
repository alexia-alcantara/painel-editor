import { Injectable } from '@angular/core';
import { Cenario } from '../models/cenario.model';
import { ComponenteEditor } from '../models/components.model';
import { FontConfig, FonteGrupo } from '../models/fontes.model';
import { log } from '../utils/log';

interface MapeamentoDelphi {
  chave: string;
  id: string;
  formato: 'jvpa' | 'frame';
  fontes?: { familia: string; tamanho: string; tipo: string; subId: string }[];
}

const FONTE_JVPA = (tipo: string, subId: string) => [
  { familia: '@MF', tamanho: '@MT', tipo, subId },
];
const FONTE_TEMPORIZADOR = (subId: string) => [
  { familia: '@TF', tamanho: '@TT', tipo: 'temporizador-item', subId },
];
const FONTE_TOTALIZADOR = [
  { familia: '@LF', tamanho: '@LT', tipo: 'votacao-item', subId: 'label' },
];


const MAPEAMENTO: MapeamentoDelphi[] = [
  { chave: 'JvPaReuniao', id: 'titulo', formato: 'jvpa', fontes: FONTE_JVPA('titulo', 'titulo-texto') },
  { chave: 'JvPaMateria', id: 'subtitulo', formato: 'jvpa', fontes: FONTE_JVPA('subtitulo', 'subtitulo-texto') },
  { chave: 'JvPaEmenta', id: 'descricao', formato: 'jvpa', fontes: FONTE_JVPA('descricao', 'descricao-texto') },
  { chave: 'JvPaResultado', id: 'resultado-votacao', formato: 'jvpa', fontes: FONTE_JVPA('resultado-votacao', 'resultado-texto') },
  { chave: 'JvPaAutor', id: 'autor-principal', formato: 'jvpa', fontes: FONTE_JVPA('autor', 'texto') },
  { chave: 'JvPaOrador', id: 'orador-principal', formato: 'jvpa', fontes: FONTE_JVPA('tribuna', 'orador') },
  { chave: 'JvPaTipoFala', id: 'tipo-fala-principal', formato: 'jvpa', fontes: FONTE_JVPA('tipo-fala', 'texto') },
  { chave: 'JvPaData', id: 'data-atual', formato: 'jvpa', fontes: FONTE_JVPA('temporizador-item', 'data') },
  { chave: 'JvPaCategoriaReuniao', id: 'categoria-reuniao-principal', formato: 'jvpa', fontes: FONTE_JVPA('categoria-reuniao', 'texto') },
  { chave: 'JvPaVotacaoTurno', id: 'turno-votacao-principal', formato: 'jvpa', fontes: FONTE_JVPA('turno-votacao', 'texto') },
  { chave: 'JvPaVotacaoModo', id: 'modo-votacao-principal', formato: 'jvpa', fontes: FONTE_JVPA('modo-votacao', 'texto') },
  { chave: 'JvPaVotacaoParametro', id: 'parametro-votacao-principal', formato: 'jvpa', fontes: FONTE_JVPA('parametro-votacao', 'texto') },
  { chave: 'JvPaMensagemLinha1', id: 'mensagem-linha-1', formato: 'jvpa', fontes: FONTE_JVPA('mensagem-linha', 'linha-1') },
  { chave: 'JvPaMensagemLinha2', id: 'mensagem-linha-2', formato: 'jvpa', fontes: FONTE_JVPA('mensagem-linha', 'linha-2') },
  { chave: 'JvPaMensagemLinha3', id: 'mensagem-linha-3', formato: 'jvpa', fontes: FONTE_JVPA('mensagem-linha', 'linha-3') },
  { chave: 'JvPaMensagemLinha4', id: 'mensagem-linha-4', formato: 'jvpa', fontes: FONTE_JVPA('mensagem-linha', 'linha-4') },
  { chave: 'JvPaMultimidia1', id: 'multimidia-principal', formato: 'jvpa' },

  { chave: 'FrameTemporizador1', id: 'temporizador-1', formato: 'frame', fontes: FONTE_TEMPORIZADOR('cronometro-1') },
  { chave: 'FrameTemporizador2', id: 'temporizador-2', formato: 'frame', fontes: FONTE_TEMPORIZADOR('cronometro-2') },
  { chave: 'FrameTemporizador3', id: 'temporizador-3', formato: 'frame', fontes: FONTE_TEMPORIZADOR('cronometro-3') },
  { chave: 'FrameTemporizador4', id: 'temporizador-4', formato: 'frame', fontes: FONTE_TEMPORIZADOR('cronometro-4') },

  { chave: 'FrameTotalizadorSim', id: 'voto-sim', formato: 'frame', fontes: FONTE_TOTALIZADOR },
  { chave: 'FrameTotalizadorNao', id: 'voto-nao', formato: 'frame', fontes: FONTE_TOTALIZADOR },
  { chave: 'FrameTotalizadorAbstencao', id: 'voto-abstencao', formato: 'frame', fontes: FONTE_TOTALIZADOR },
  { chave: 'FrameTotalizadorBranco', id: 'voto-branco', formato: 'frame', fontes: FONTE_TOTALIZADOR },
  { chave: 'FrameTotalizadorVotos', id: 'status-votos', formato: 'frame', fontes: FONTE_TOTALIZADOR },
  { chave: 'FrameTotalizadorPresentes', id: 'status-presentes', formato: 'frame', fontes: FONTE_TOTALIZADOR },
  { chave: 'FrameTotalizadorAusentes', id: 'status-ausentes', formato: 'frame', fontes: FONTE_TOTALIZADOR },
  { chave: 'FrameTotalizadorLicenciados', id: 'status-licenciados', formato: 'frame', fontes: FONTE_TOTALIZADOR },
  { chave: 'FrameTotalizadorObstrucao', id: 'status-obstrucao', formato: 'frame', fontes: FONTE_TOTALIZADOR },
  { chave: 'FrameTotalizadorQuorum', id: 'status-quorum', formato: 'frame', fontes: FONTE_TOTALIZADOR },
  { chave: 'FrameTotalizadorParlamentares', id: 'status-parlamentares', formato: 'frame', fontes: FONTE_TOTALIZADOR },
  { chave: 'FrameTotalizadorExtras', id: 'status-extras', formato: 'frame', fontes: FONTE_TOTALIZADOR },
  { chave: 'FrameTotalizadorPresencasWeb', id: 'status-presencas-web', formato: 'frame', fontes: FONTE_TOTALIZADOR },
  { chave: 'FrameTotalizadorPresencasLocais', id: 'status-presencas-locais', formato: 'frame', fontes: FONTE_TOTALIZADOR },
];

const FONTES_PARLAMENTAR = [
  { familia: '@NF', tamanho: '@NT', tipo: 'parlamentar', subId: 'nome' },
  { familia: '@PF', tamanho: '@PT', tipo: 'parlamentar', subId: 'partido' },
  { familia: '@VF', tamanho: '@VT', tipo: 'parlamentar', subId: 'voto' },
];

const GERAIS_PADRAO: Record<string, any> = {
  '@NC': 1, '@NL': 1, '@TN': 15, '@TP': 5, '@TS': 2, '@TR': 8, '@TV': 8, '@TC': 0,
  '@C_QT': 0, '@C_QC': 0, '@C_MS': 0, '@C_ME': 0, '@C_EV': 0, '@C_EH': 0, '@C_PI': 0, '@C_PF': 0, '@C_OF': 0,
};

const BLOCOS_SEM_EQUIVALENTE: Record<string, any> = {
  JvPaEleicao: { '@TO': 20, '@ES': 1142, '@AL': 113, '@LA': 281, '@TC': false, '@EX': false, '@MF': 'MS Sans Serif', '@MT': 24 },
  JvPaMultimidia2: { '@TO': 249, '@ES': 1456, '@AL': 113, '@LA': 283, '@TC': false, '@EX': false, '@MF': 'MS Sans Serif', '@MT': 24 },
  JvPaMultimidia3: { '@TO': 34, '@ES': 1491, '@AL': 113, '@LA': 283, '@TC': false, '@EX': false, '@MF': 'MS Sans Serif', '@MT': 24 },
  JvPaMultimidia4: { '@TO': 287, '@ES': 1228, '@AL': 113, '@LA': 283, '@TC': false, '@EX': false, '@MF': 'MS Sans Serif', '@MT': 24 },
  JvPaMensagemLinhaTitulo: { '@TO': 342, '@ES': 1465, '@AL': 49, '@LA': 481, '@TC': false, '@EX': false, '@MF': 'MS Sans Serif', '@MT': 24 },
  JvPaFoto: { '@TO': 446, '@ES': 360, '@AL': 216, '@LA': 216, '@TC': false, '@EX': false, '@MF': 'MS Sans Serif', '@MT': 24 },
  JvPaPresidente: { '@TO': 347, '@ES': 1557, '@AL': 49, '@LA': 199, '@TC': false, '@EX': false, '@MF': 'MS Sans Serif', '@MT': 24 },
  JvPaApuracao: { '@TO': 975, '@ES': 1486, '@AL': 49, '@LA': 199, '@TC': false, '@EX': false, '@MF': 'MS Sans Serif', '@MT': 24 },
  JvPaDetalheOrador: { '@TO': 816, '@ES': 995, '@AL': 49, '@LA': 369, '@TC': false, '@EX': false, '@MF': 'MS Sans Serif', '@MT': 24 },
  FrameTemporizador5: { '@EX': false, '@TO': 47, '@ES': 763, '@AL': 86, '@LA': 246, '@TF': 'Segoe UI Semibold', '@TT': 48 },
  FrameTemporizador6: { '@EX': false, '@TO': 17, '@ES': 788, '@AL': 86, '@LA': 246, '@TF': 'Segoe UI Semibold', '@TT': 48 },
};

@Injectable({
  providedIn: 'root',
})
export class LayoutExportService {
  ehFormatoDelphi(json: any): boolean {
    return !!json && typeof json === 'object' && !Array.isArray(json) && '@LA' in json && '@AL' in json;
  }

 
  paraFormatoDelphi(cenario: Cenario): any {
    const legado = cenario.legadoDelphi || {};
    const porId = new Map(cenario.componentes.map((c) => [c.id, c]));
    const fontes = cenario.fontes || [];

    const parlamentares = cenario.componentes
      .filter((c) => c.tipo === 'parlamentar')
      .sort((a, b) => this.numeroParlamentar(a.id) - this.numeroParlamentar(b.id));

    const resultado: any = {
      '@AL': Math.round(cenario.targetHeight),
      '@LA': Math.round(cenario.targetWidth),
      ...this.gerais(legado),
      '@IM': cenario.imagemFundo || legado['@IM'] || '',
      ...this.distribuicaoParaDelphi(cenario, parlamentares, legado),
      ...this.gerais(legado, 'C'),
    };

    MAPEAMENTO.forEach((m) => {
      const comp = porId.get(m.id);
      if (!comp) {
        if (legado[m.chave]) resultado[m.chave] = legado[m.chave];
        return;
      }
      resultado[m.chave] = this.blocoParaDelphi(comp, m.formato, m.fontes, fontes, legado[m.chave]);
    });

    Object.entries(BLOCOS_SEM_EQUIVALENTE).forEach(([chave, padrao]) => {
      resultado[chave] = legado[chave] ?? padrao;
    });

    parlamentares.forEach((comp, i) => {
      resultado[`FrameParla${i + 1}`] = this.blocoParaDelphi(comp, 'frame', FONTES_PARLAMENTAR, fontes);
    });

    log.info('Exportar', `Cenário "${cenario.nome}" convertido pro formato do Delphi (${parlamentares.length} parlamentares)`);
    return resultado;
  }

  private blocoParaDelphi(
    comp: ComponenteEditor,
    formato: 'jvpa' | 'frame',
    mapaFontes: MapeamentoDelphi['fontes'],
    fontes: FonteGrupo[],
    anterior?: any,
  ): any {
    const posicao = {
      '@TO': Math.round(comp.y),
      '@ES': Math.round(comp.x),
      '@AL': Math.round(comp.height),
      '@LA': Math.round(comp.width),
    };
    const visivel = comp.visible !== false;

    const bloco: any =
      formato === 'jvpa'
        ? { ...posicao, '@TC': anterior?.['@TC'] ?? false, '@EX': visivel }
        : { '@EX': visivel, ...posicao };

    if (mapaFontes?.length) {
      mapaFontes.forEach((f) => {
        const fonte = this.acharFonte(fontes, f.tipo, f.subId);
        bloco[f.familia] = fonte ? this.familiaParaDelphi(fonte) : anterior?.[f.familia] ?? 'Segoe UI Semibold';
        bloco[f.tamanho] = fonte ? Math.round(fonte.size) : anterior?.[f.tamanho] ?? 24;
      });
    } else if (formato === 'jvpa') {
      bloco['@MF'] = anterior?.['@MF'] ?? 'MS Sans Serif';
      bloco['@MT'] = anterior?.['@MT'] ?? 24;
    }
    return bloco;
  }

  private distribuicaoParaDelphi(cenario: Cenario, parlamentares: ComponenteEditor[], legado: any): any {
    const total = parlamentares.length;
    if (!total) {
      return { '@P_QT': 0, '@P_QC': 0, '@P_MS': 0, '@P_ME': 0, '@P_EV': 0, '@P_EH': 0, '@P_PI': 0, '@P_PF': 0, '@P_OF': 0 };
    }

    const primeiro = parlamentares[0];
    const mesmaColuna = parlamentares.filter((c) => Math.abs(c.x - primeiro.x) <= 2).sort((a, b) => a.y - b.y);
    const outraColuna = parlamentares
      .filter((c) => c.x > primeiro.x + 2)
      .sort((a, b) => a.x - b.x)[0];

    const espacoVertical =
      mesmaColuna.length > 1 ? mesmaColuna[1].y - mesmaColuna[0].y - primeiro.height : legado['@P_EV'] ?? 0;
    const espacoHorizontal = outraColuna ? outraColuna.x - primeiro.x - primeiro.width : legado['@P_EH'] ?? 0;
    const dist = cenario.distribuicao;

    return {
      '@P_QT': total,
      '@P_QC': mesmaColuna.length,
      '@P_MS': Math.round(Math.min(...parlamentares.map((c) => c.y))),
      '@P_ME': Math.round(Math.min(...parlamentares.map((c) => c.x))),
      '@P_EV': Math.round(espacoVertical),
      '@P_EH': Math.round(espacoHorizontal),
      '@P_PI': dist?.exibirDe || 1,
      '@P_PF': dist?.exibirAte || total,
      '@P_OF': dist?.offsetInicial || 0,
    };
  }

  private gerais(legado: any, grupo?: 'C'): any {
    const chaves = Object.keys(GERAIS_PADRAO).filter((k) => (grupo === 'C' ? k.startsWith('@C_') : !k.startsWith('@C_')));
    return Object.fromEntries(chaves.map((k) => [k, legado[k] ?? GERAIS_PADRAO[k]]));
  }

  
  deFormatoDelphi(json: any, modelo: Cenario, nome: string): Cenario {
    const componentes = modelo.componentes
      .filter((c) => c.tipo !== 'parlamentar')
      .map((c) => ({ ...structuredClone(c), visible: false }));
    const porId = new Map(componentes.map((c) => [c.id, c]));
    const fontes = structuredClone(modelo.fontes || []);
    const fontesJaLidas = new Set<string>();

    MAPEAMENTO.forEach((m) => {
      const bloco = json[m.chave];
      const comp = porId.get(m.id);
      if (!bloco || !comp) return;

      this.aplicarPosicao(comp, bloco);
      m.fontes?.forEach((f) => this.aplicarFonte(fontes, f, bloco, fontesJaLidas));
    });

    const modeloParlamentar = modelo.componentes.find((c) => c.tipo === 'parlamentar');
    const parlamentares = Object.keys(json)
      .filter((k) => /^FrameParla\d+$/.test(k))
      .sort((a, b) => this.numeroParlamentar(a) - this.numeroParlamentar(b))
      .map((chave, i) => {
        const bloco = json[chave];
        FONTES_PARLAMENTAR.forEach((f) => this.aplicarFonte(fontes, f, bloco, fontesJaLidas));
        const comp: ComponenteEditor = {
          ...structuredClone(modeloParlamentar ?? ({} as ComponenteEditor)),
          id: `parlamentar-${i}`,
          tipo: 'parlamentar',
          dados: { ...(modeloParlamentar?.dados || {}), nome: `Parlamentar ${i + 1}` },
        } as ComponenteEditor;
        this.aplicarPosicao(comp, bloco);
        return comp;
      });

    const chavesUsadas = new Set([
      '@AL', '@LA', '@IM',
      ...MAPEAMENTO.filter((m) => porId.has(m.id)).map((m) => m.chave),
      ...Object.keys(json).filter((k) => /^FrameParla\d+$/.test(k)),
    ]);
    const legadoDelphi = Object.fromEntries(Object.entries(json).filter(([k]) => !chavesUsadas.has(k)));

    log.info(
      'Importar',
      `Cenário do Delphi lido: ${json['@LA']}x${json['@AL']}, ${parlamentares.length} parlamentares, ${Object.keys(legadoDelphi).length} chaves guardadas em legadoDelphi`,
    );

    return {
      ...modelo,
      nome,
      targetWidth: Number(json['@LA']) || modelo.targetWidth,
      targetHeight: Number(json['@AL']) || modelo.targetHeight,
      imagemFundo: json['@IM'] || '',
      backgroundImage: '',
      componentes: [...componentes, ...parlamentares],
      fontes,
      distribuicao: {
        exibirDe: Number(json['@P_PI']) || 0,
        exibirAte: Number(json['@P_PF']) || 0,
        offsetInicial: Number(json['@P_OF']) || 0,
      },
      legadoDelphi,
    };
  }

  private aplicarPosicao(comp: ComponenteEditor, bloco: any): void {
    comp.x = Number(bloco['@ES']) || 0;
    comp.y = Number(bloco['@TO']) || 0;
    comp.width = Number(bloco['@LA']) || comp.width;
    comp.height = Number(bloco['@AL']) || comp.height;
    comp.visible = bloco['@EX'] === true;
  }


  private aplicarFonte(
    fontes: FonteGrupo[],
    f: { familia: string; tamanho: string; tipo: string; subId: string },
    bloco: any,
    jaLidas: Set<string>,
  ): void {
    const chave = `${f.tipo}/${f.subId}`;
    const visivel = bloco['@EX'] === true;
    if (jaLidas.has(`${chave}:visivel`) || (jaLidas.has(chave) && !visivel)) return;

    const fonte = this.acharFonte(fontes, f.tipo, f.subId);
    const nome = bloco[f.familia];
    if (!fonte || typeof nome !== 'string') return;

    Object.assign(fonte, this.familiaDoDelphi(nome));
    if (Number(bloco[f.tamanho])) fonte.size = Number(bloco[f.tamanho]);
    jaLidas.add(chave);
    if (visivel) jaLidas.add(`${chave}:visivel`);
  }


  private acharFonte(fontes: FonteGrupo[], tipo: string, subId: string): FontConfig | undefined {
    return fontes.find((g) => g.tipo === tipo)?.subItens.find((s) => s.subId === subId)?.font;
  }

  private familiaParaDelphi(fonte: FontConfig): string {
    const primeira = (fonte.family || '').split(',')[0].replace(/['"]/g, '').trim() || 'Segoe UI';
    if (/semibold|bold|black|light/i.test(primeira)) return primeira;
    const peso = String(fonte.weight ?? 'normal');
    if (peso === '600') return `${primeira} Semibold`;
    if (peso === 'bold' || peso === '700') return `${primeira} Bold`;
    if (peso === '900') return `${primeira} Black`;
    if (peso === '300') return `${primeira} Light`;
    return primeira;
  }

  private familiaDoDelphi(nome: string): Pick<FontConfig, 'family' | 'weight'> {
    const pesos: [RegExp, string][] = [
      [/\s+semibold$/i, '600'],
      [/\s+bold$/i, 'bold'],
      [/\s+black$/i, '900'],
      [/\s+light$/i, '300'],
    ];
    for (const [sufixo, weight] of pesos) {
      if (sufixo.test(nome)) {
        const base = nome.replace(sufixo, '').trim();
        return { family: `'${nome}', '${base}', Roboto, Arial, sans-serif`, weight };
      }
    }
    return { family: `'${nome}', Roboto, Arial, sans-serif`, weight: 'normal' };
  }

  private numeroParlamentar(id: string): number {
    return Number(id.match(/(\d+)$/)?.[1] ?? 0);
  }
}
