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
    | 'tipo-fala'
    | 'nome-cronometro'
    | 'mensagem-linha'
  dados?: any;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  props?: {
    fontFamily?: string;
    tempo?: string;
    icon?: boolean;
    label?: string;
    cor?: string;
    valor?: number;
    fontSize?: number;
    cronometro?: number;
    linha?: number;
  };
  style?: { [key: string]: string | number };
  fontes?: FonteSubItem[]; 
  children?: ComponenteEditor[];
}
