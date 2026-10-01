import { Injectable } from '@angular/core';
import { ComponenteEditor } from '../models/components.model';
import { log } from '../utils/log';

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
          log.aviso('Exportar', `Bloco "${item.tipo}" não existe no formato antigo e foi ignorado.`);
          break;
      }
    });

    return resultado;
  }


 converterDoFormatoOriginal(
  dadosImportados: any,
  parlamentaresMock: any[],
  votacaoMock: any
): ComponenteEditor[] {
  const layout: ComponenteEditor[] = [];

  // 1. Reconstrói todos os componentes fixos usando uma função auxiliar robusta
  const componentesFixos = this.recriarComponentesBase(dadosImportados, votacaoMock);
  layout.push(...componentesFixos);

  // 2. Reconstrói apenas os parlamentares, pois a quantidade deles é dinâmica
  Object.keys(dadosImportados).forEach(key => {
    if (key.startsWith('FrameParla')) {
      const itemJson = dadosImportados[key];
      const index = parseInt(key.replace('FrameParla', ''), 10) - 1;
      if (parlamentaresMock[index]) {
        layout.push({
          id: key,
          tipo: 'parlamentar',
          x: itemJson['@ES'],
          y: itemJson['@TO'],
          width: itemJson['@LA'],
          height: itemJson['@AL'],
          visible: itemJson['@EX'],
          dados: parlamentaresMock[index],
        });
      }
    }
  });

  return layout;
}

private recriarComponentesBase(dadosImportados: any, votacaoMock: any): ComponenteEditor[] {
  // Função para pegar as coordenadas do JSON, ou usar um valor padrão se não existir
  const getPos = (key: string, defaults: {x: number, y: number, w: number, h: number}) => {
    const frame = dadosImportados[key];
    return frame 
      ? { x: frame['@ES'], y: frame['@TO'], width: frame['@LA'], height: frame['@AL'], visible: frame['@EX'] }
      : { x: defaults.x, y: defaults.y, width: defaults.w, height: defaults.h, visible: true };
  };

  const componentes: ComponenteEditor[] = [
    // Recria cada componente fixo, buscando sua posição no JSON
    { id: 'imagem-reuniao', tipo: 'imagem', ...getPos('FrameImagem', {x: 750, y: 70, w: 750, h: 421}), dados: { arquivo: dadosImportados['@IM'] } },
    { id: 'cabecalho', tipo: 'cabecalho', ...getPos('JvPaReuniao', {x: 235, y: 70, w: 665, h: 50}) },
    { id: 'titulo', tipo: 'titulo', ...getPos('FrameTitulo', {x: 235, y: 132, w: 665, h: 25}) },
    { id: 'subtitulo', tipo: 'subtitulo', ...getPos('FrameSubTitulo', {x: 235, y: 167, w: 665, h: 20}) },
    { id: 'descricao', tipo: 'descricao', ...getPos('FrameDescricao', {x: 235, y: 199, w: 665, h: 90}) },
    { id: 'totalizadores', tipo: 'totalizadores', ...getPos('FrameTotalizador1', {x: 235, y: 301, w: 172, h: 25}), dados: votacaoMock },
    { id: 'votacao-total', tipo: 'votacao-total', ...getPos('FrameVotacaoTotal1', {x: 492, y: 301, w: 250, h: 135}) },
    { id: 'status-reuniao', tipo: 'status-reuniao', ...getPos('FrameStatusReuniao1', {x: 492, y: 301, w: 223, h: 135}) },
    
    // Recria os itens de votação (SIM/NÃO/ABSTENÇÃO) com base na posição do 'totalizadores'
    { id: 'voto-sim', tipo: 'votacao-item', x: 245, y: 311, width: 223, height: 30, props: { label: 'SIM', cor: '#22C55E', valor: votacaoMock.sim }, visible: true },
    { id: 'voto-nao', tipo: 'votacao-item', x: 245, y: 351, width: 223, height: 30, props: { label: 'NÃO', cor: '#F97316', valor: votacaoMock.nao }, visible: true },
    { id: 'voto-abstencao', tipo: 'votacao-item', x: 245, y: 391, width: 223, height: 30, props: { label: 'ABSTENÇÃO', cor: '#FFCC66', valor: votacaoMock.absten }, visible: true },

    // Recria os timers
    { id: 'temporizador-1', tipo: 'temporizador-item', ...getPos('FrameTemporizador1', {x: 235, y: 456, w: 127, h: 20}), props: { tempo: '00:00', icon: false } },
    { id: 'temporizador-2', tipo: 'temporizador-item', ...getPos('FrameTemporizador2', {x: 404, y: 456, w: 127, h: 20}), props: { tempo: '00:00', icon: false } },
    { id: 'temporizador-3', tipo: 'temporizador-item', ...getPos('FrameTemporizador3', {x: 573, y: 456, w: 172, h: 35}), props: { tempo: '08:45:10', icon: true } },
  ];

  return componentes;
}

}
