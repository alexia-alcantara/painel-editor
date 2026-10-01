import { ComponenteEditor } from "./components.model";
import { FonteGrupo } from "./fontes.model";

export interface Cenario {
  id: string;
  nome: string;
  targetWidth: number;
  targetHeight: number;
  /** Antigo: imagem em base64 dentro do cenário. Não é mais salvo no backend (estourava o tamanho). */
  backgroundImage: string;
  /** Nome do arquivo da imagem de fundo, que fica na pasta "caminhoImagens" do config.json. */
  imagemFundo?: string;
  componentes: ComponenteEditor[];
  imagemFundoId?: string; 
  idPainel: string;
  slug: string;
  fontes?: FonteGrupo[];
  idBackend?: number;
  opcoes?: OpcoesCenario;
}

export interface OpcoesCenario {
  nomeNaCorDoVoto?: boolean;
  fundoParlamentares?: boolean;
  corFundoParlamentares?: string;
  opacidadeFundoParlamentares?: number;
}