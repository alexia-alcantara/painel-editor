// Importe as interfaces de fontes do arquivo correto
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
  };
  fontes?: FonteSubItem[]; 
  children?: ComponenteEditor[];
}
