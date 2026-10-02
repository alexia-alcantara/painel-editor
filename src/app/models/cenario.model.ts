import { ComponenteEditor } from "./components.model";
import { FonteGrupo } from "./fontes.model";

export interface Cenario {
  id: string;
  nome: string;
  targetWidth: number;
  targetHeight: number;
  backgroundImage: string;
  imagemFundo?: string;
  componentes: ComponenteEditor[];
  imagemFundoId?: string; 
  idPainel: string;
  slug: string;
  fontes?: FonteGrupo[];
  idBackend?: number;
  opcoes?: OpcoesCenario;
  distribuicao?: DistribuicaoParlamentares;
  legadoDelphi?: Record<string, any>;
}

export interface DistribuicaoParlamentares {
  exibirDe: number;
  exibirAte: number;
  offsetInicial: number;
}

export interface OpcoesCenario {
  nomeNaCorDoVoto?: boolean;
  fundoParlamentares?: boolean;
  corFundoParlamentares?: string;
  opacidadeFundoParlamentares?: number;
}