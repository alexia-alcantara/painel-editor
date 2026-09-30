import { FonteSubItem } from './fontes.model';

export interface ComponenteEditor {
  id: string;
  tipo:
    | 'parlamentar'
    | 'votacao-total'
    | 'votacao-item'
    | 'status-reuniao'
    | 'status-item'
    | 'totalizadores'
    | 'imagem'
    | 'cabecalho'
    | 'descricao'
    | 'titulo'
    | 'subtitulo'
    | 'temporizador-item'
    | 'multimidia'
    | 'mensagem'
    | 'orador'
    | 'partido'
    | 'materia'
    | 'resultado-votacao'
    | 'relogio'
    | 'relogio'
    | 'turno-votacao'
    | 'modo-votacao'
    | 'parametro-votacao'
    | 'categoria-reuniao'
    | 'autor'
  dados?: any;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  ocultoNoEditor?: boolean;
  props?: {
    fontFamily?: string;
    tempo?: string;
    icon?: boolean;
    label?: string;
    cor?: string;
    valor?: number;
    fontSize?: number;
    cronometro?: number;
  };
  style?: { [key: string]: string | number };
  fontes?: FonteSubItem[]; 
  children?: ComponenteEditor[];
}
