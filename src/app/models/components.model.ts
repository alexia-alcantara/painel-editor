export interface ComponenteEditor {
  id: string | number;
  tipo: 'parlamentar' | 'votacao-total' | 'status-reuniao' | 'totalizadores' | 'imagem' | 'cabecalho' | 'descricao' | 'titulo' | 'subtitulo' |'temporizador-item';
  dados?: any;
  x: number;
  y: number;
  width: number;
  height: number;
  props?: {
    tempo: string;
    icon: boolean;
  }
}
