export interface FontConfig {
  family: string;
  size: number;
  weight?: string;
  color?: string;
}

export interface FonteSubItem {
  subId: string;   // ex: 'descricao-texto' ou 'titulo-principal'
  label: string;   // rótulo amigável
  font: FontConfig;
}

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
    | 'temporizador-item';
  dados?: any;
  x: number;
  y: number;
  width: number;
  height: number;
  props?: {
    tempo?: string;
    icon?: boolean;
    label?: string;
    cor?: string;
    valor?: number;
  };
  fontes?: FonteSubItem[]; // ✅ NOVO
  children?: ComponenteEditor[];
}
