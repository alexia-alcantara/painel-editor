
export type ComponenteTipo =
  | 'parlamentar'
  | 'totalizadores'
  | 'imagem'
  | 'cabecalho'
  | 'descricao'
  | 'titulo'
  | 'subtitulo'
  | 'status-reuniao'
  | 'temporizador-item'
  | 'votacao-item';

export interface FontConfig {
  family: string;
  size: number;
  weight?: string;
  color?: string;
}

export interface FonteSubItem {
  id: string;       // ex: 'nome', 'partido', 'cronometro1'
  label: string;    // ex: 'Nome', 'Partido', 'Cronômetro 1'
  font: FontConfig; // Configuração da fonte
}

export interface FonteGrupo {
  tipo: ComponenteTipo;   // Qual componente
  label: string;          // Exibição no menu
  subItens: FonteSubItem[]; // Lista de subitens
}
