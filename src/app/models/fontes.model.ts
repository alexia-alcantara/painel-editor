
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
  | 'votacao-item'
  | 'tribuna'
  | 'resultado-votacao'
  | 'resultado-votacao'
  | 'turno-votacao'
  | 'modo-votacao'
  | 'parametro-votacao'
  | 'categoria-reuniao'
  | 'autor'
  | 'tipo-fala'
  | 'nome-cronometro'
  | 'mensagem-linha';

export interface FontConfig {
  family: string;
  size: number;
  weight?: string;
  color?: string;
  style?: string;
  align?: 'left' | 'center' | 'right';
}

export interface FonteSubItem {
  subId: string;       
  label: string;    
  font: FontConfig;
}

export interface FonteGrupo {
  tipo: ComponenteTipo;   // Qual componente
  label: string;          // Exibição no menu
  subItens: FonteSubItem[]; // Lista de subitens
}
