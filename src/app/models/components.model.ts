export interface ComponenteEditor {
  id: string;
  tipo: 'parlamentar' | 'totalizadores' | 'timer' | 'imagem' | 'cabecalho';
  dados?: any;
  x: number;
  y: number;
  width: number;
  height: number;
}
