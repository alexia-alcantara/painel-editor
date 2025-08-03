import { ComponenteEditor } from '../models/components.model';

export const LAYOUT_DEFAULT: ComponenteEditor[] = [
  // Cabeçalho (logo)
  { id: '1', tipo: 'cabecalho', x: 40,  y: 40,  width: 220, height: 60 },

  // Título e Subtítulo
  { id: '2', tipo: 'titulo', x: 280,  y: 40, width: 400, height: 40 },
  { id: '3', tipo: 'subtitulo', x: 280,  y: 80, width: 400, height: 30 },

  // Descrição
  { id: '4', tipo: 'descricao', x: 280,  y: 120, width: 400, height: 100 },

  // Imagem à direita
  { id: '5', tipo: 'imagem', x: 700, y: 40, width: 420, height: 220 },

  // Totalizadores (direita)
  { id: '6', tipo: 'totalizadores', x: 940, y: 280, width: 180, height: 100 },

  // Status à esquerda da imagem
  { id: '7', tipo: 'status-reuniao', x: 700, y: 280, width: 220, height: 100 },

  // Temporizadores (centralizados embaixo)
  { id: '8', tipo: 'temporizador-item', x: 700, y: 400, width: 80, height: 40, props: { tempo: '00:00', icon: false } },
{ id: '9', tipo: 'temporizador-item', x: 800, y: 400, width: 80, height: 40, props: { tempo: '00:00', icon: false } },
  { id: '10', tipo: 'temporizador-item', x: 900, y: 400, width: 140, height: 40, props: { tempo: '08:45:10', icon: true } },

  // Lista de parlamentares ocupando largura total
  { id: '11', tipo: 'parlamentar', x: 40,  y: 460, width: 1080, height: 300 },
];

