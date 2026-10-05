import { ComponenteEditor } from './components.model';

export const ID_PARLAMENTARES = '__parlamentares__';

export interface CampoDisponivel {
  id: string;
  rotulo: string;
}

const ROTULOS_CAMPOS: Record<string, string> = {
  titulo: 'Reunião',
  subtitulo: 'Matéria',
  descricao: 'Ementa',
  'resultado-votacao': 'Resultado',
  'voto-sim': 'Sim',
  'voto-nao': 'Não',
  'voto-abstencao': 'Abstenção',
  'voto-branco': 'Branco',
  'status-presentes': 'Presentes',
  'status-votos': 'Votos',
  'status-ausentes': 'Ausentes',
  'status-licenciados': 'Licenciados',
  'status-quorum': 'Quorum',
  'status-obstrucao': 'Obstrução',
  'status-parlamentares': 'Parlamentares (total)',
  'status-extras': 'Extras',
  'status-presencas-locais': 'Presenças Locais',
  'status-presencas-web': 'Presenças Web',
  'turno-votacao-principal': 'Turno Votação',
  'modo-votacao-principal': 'Modo Votação',
  'parametro-votacao-principal': 'Parâmetro Votação',
  'categoria-reuniao-principal': 'Categoria Reunião',
  'temporizador-1': 'Cronômetro 1',
  'temporizador-2': 'Cronômetro 2',
  'temporizador-3': 'Cronômetro 3',
  'temporizador-4': 'Cronômetro 4',
  'nome-cronometro-1': 'Nome Cronômetro 1',
  'nome-cronometro-2': 'Nome Cronômetro 2',
  'nome-cronometro-3': 'Nome Cronômetro 3',
  'nome-cronometro-4': 'Nome Cronômetro 4',
  'mensagem-linha-1': 'Mensagem Linha 1',
  'mensagem-linha-2': 'Mensagem Linha 2',
  'mensagem-linha-3': 'Mensagem Linha 3',
  'mensagem-linha-4': 'Mensagem Linha 4',
  'mensagem-principal': 'Mensagem',
  'autor-principal': 'Autor',
  'multimidia-principal': 'Multimídia',
  'tipo-fala-principal': 'Tipo de Fala',
  'relogio-sistema': 'Hora',
  'data-atual': 'Data',
  'orador-principal': 'Orador',
  'partido-principal': 'Partido do Orador',
  'materia-principal': 'Tema em Discussão',
  cabecalho: 'Cabeçalho',
  [ID_PARLAMENTARES]: 'Parlamentares',
};

export function rotuloCampo(comp: { id: string; tipo?: ComponenteEditor['tipo'] }): string {
  if (comp.tipo === 'parlamentar') return ROTULOS_CAMPOS[ID_PARLAMENTARES];
  return ROTULOS_CAMPOS[comp.id] ?? comp.id;
}
