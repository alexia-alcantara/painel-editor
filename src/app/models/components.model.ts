export interface ComponenteEditor {
  id: string;
  tipo: 'parlamentar' | 'status-reuniao' | 'totalizadores' | 'imagem' | 'cabecalho' | 'temporizador-item';
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
