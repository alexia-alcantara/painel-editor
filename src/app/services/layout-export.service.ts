import { Injectable } from '@angular/core';

export interface ComponenteEditor {
  id: string;
  tipo:
    | 'parlamentar'
    | 'votacao-total'
    | 'votacao-item'
    | 'status-reuniao'
    | 'totalizadores'
    | 'imagem'
    | 'cabecalho'
    | 'descricao'
    | 'titulo'
    | 'subtitulo'
    | 'temporizador-item'
    | 'multimidia';
  x: number;
  y: number;
  width: number;
  height: number;
  visible?: boolean;
  dados?: any;
  props?: {
    fontFamily?: string; // Fonte escolhida pelo usuário
    tempo?: string;
    icon?: boolean;
    label?: string;
    cor?: string;
    valor?: number;
  };
  children?: ComponenteEditor[];
}

@Injectable({
  providedIn: 'root',
})
export class LayoutExportService {
  constructor() {}

  converterParaFormatoOriginal(layout: ComponenteEditor[]): any {
    const resultado: any = {
      '@AL': 1080,
      '@LA': 1920,
      '@NC': 1,
      '@NL': 1,
      '@TN': 15,
      '@TP': 5,
      '@TS': 2,
      '@TR': 8,
      '@TV': 8,
      '@TC': 0,
      '@IM': 'Painel_Generico_1920x1080_BG2.jpg',
      '@P_QT': 6,
      '@P_QC': 6,
      '@P_MS': 35,
      '@P_ME': 920,
      '@P_EV': 8,
      '@P_EH': 8,
      '@P_PI': 1,
      '@P_PF': 14,
      '@P_OF': 0,
      '@C_QT': 0,
      '@C_QC': 0,
      '@C_MS': 0,
      '@C_ME': 0,
      '@C_EV': 0,
      '@C_EH': 0,
      '@C_PI': 0,
      '@C_PF': 0,
      '@C_OF': 0,
    };

    let countParlamentar = 1;
    let countTemporizador = 1;
    let countTotalizador = 1;
    let countMultimidia = 1;
    let countVotacaoTotal = 1;
    let countVotacaoItem = 1;
    let countStatusReuniao = 1;

    layout.forEach((item) => {
      const baseFrame = {
        '@EX': item.visible ?? true,
        '@TO': item.y,
        '@ES': item.x,
        '@AL': item.height,
        '@LA': item.width,
      };

      const font = item.props?.fontFamily ?? 'Ubuntu';

      switch (item.tipo) {
        case 'parlamentar':
          resultado[`FrameParla${countParlamentar++}`] = {
            ...baseFrame,
            '@NF': font,
            '@NT': 18,
            '@PF': font,
            '@PT': 18,
            '@VF': font,
            '@VT': 18,
          };
          break;

        case 'temporizador-item':
          resultado[`FrameTemporizador${countTemporizador++}`] = {
            ...baseFrame,
            '@TF': font,
            '@TT': 48,
          };
          break;

        case 'totalizadores':
          resultado[`FrameTotalizador${countTotalizador++}`] = {
            ...baseFrame,
            '@LF': font,
            '@LT': 24,
          };
          break;

        case 'votacao-total':
          resultado[`FrameVotacaoTotal${countVotacaoTotal++}`] = {
            ...baseFrame,
            '@VF': font,
            '@VT': 22,
          };
          break;

        case 'votacao-item':
          resultado[`FrameVotacaoItem${countVotacaoItem++}`] = {
            ...baseFrame,
            '@VF': font,
            '@VT': 20,
          };
          break;

        case 'status-reuniao':
          resultado[`FrameStatusReuniao${countStatusReuniao++}`] = {
            ...baseFrame,
            '@SF': font,
            '@ST': 18,
          };
          break;

        case 'titulo':
          resultado['FrameTitulo'] = {
            ...baseFrame,
            '@MF': font,
            '@MT': 30,
          };
          break;

        case 'subtitulo':
          resultado['FrameSubTitulo'] = {
            ...baseFrame,
            '@MF': font,
            '@MT': 24,
          };
          break;

        case 'descricao':
          resultado['FrameDescricao'] = {
            ...baseFrame,
            '@MF': font,
            '@MT': 20,
          };
          break;

        case 'cabecalho':
          resultado['JvPaReuniao'] = {
            ...baseFrame,
            '@TC': false,
            '@EX': item.visible ?? true,
            '@MF': font,
            '@MT': 36,
          };
          break;

        case 'multimidia':
          resultado[`JvPaMultimidia${countMultimidia++}`] = {
            ...baseFrame,
            '@TC': false,
            '@EX': item.visible ?? false,
            '@MF': font,
            '@MT': 24,
          };
          break;

        case 'imagem':
          resultado['@IM'] = item.dados?.arquivo ?? resultado['@IM'];
          break;

        default:
          console.warn(`Tipo ${item.tipo} ainda não mapeado.`);
          break;
      }
    });

    return resultado;
  }
}
