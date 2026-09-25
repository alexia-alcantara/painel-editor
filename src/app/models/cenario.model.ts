import { ComponenteEditor } from "./components.model";
import { FonteGrupo } from "./fontes.model";

export interface Cenario {
  id: string;
  nome: string;
  targetWidth: number;
  targetHeight: number;
  backgroundImage: string; // Armazenará a imagem em base64
  componentes: ComponenteEditor[];
  imagemFundoId?: string; 
  idPainel: string;
  slug: string;
  fontes?: FonteGrupo[];
  idBackend?: number;
}