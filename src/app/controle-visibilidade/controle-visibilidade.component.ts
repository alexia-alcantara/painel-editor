import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ComponenteEditor } from '../models/components.model';

interface ItemLista {
  id: string;
  label: string;
  checked: boolean;
  ids: string[]; 
}

const ROTULOS: Record<string, string> = {
  titulo: 'Reunião',
  subtitulo: 'Matéria',
  descricao: 'Ementa',
  'resultado-votacao': 'Resultado',
  'voto-sim': 'Sim',
  'voto-nao': 'Não',
  'voto-abstencao': 'Abstenção',
  'status-presentes': 'Presentes',
  'status-votos': 'Votos',
  'status-ausentes': 'Ausentes',
  'status-licenciados': 'Licenciados',
  'status-quorum': 'Quorum',
  'status-obstrucao': 'Obstrução',
  'status-parlamentares': 'Parlamentares',
  'status-extras': 'Extras',
  'status-presencas-locais': 'Presenças Locais',
  'status-presencas-web': 'Presenças Web',
  'voto-branco': 'Branco',
  'turno-votacao-principal': 'Turno Votação',
  'modo-votacao-principal': 'Modo Votação',
  'parametro-votacao-principal': 'Parâmetro Votação',
  'categoria-reuniao-principal': 'Categoria Reunião',
  'temporizador-1': 'Cronômetro 1',
  'temporizador-2': 'Cronômetro 2',
  'temporizador-3': 'Cronômetro 3',
  'temporizador-4': 'Cronômetro 4',
  'autor-principal': 'Autor',
  'multimidia-principal': 'Multimídia',
  'tipo-fala-principal': 'Tipo de Fala',
  'nome-cronometro-1': 'Nome Cronômetro 1',
  'nome-cronometro-2': 'Nome Cronômetro 2',
  'nome-cronometro-3': 'Nome Cronômetro 3',
  'nome-cronometro-4': 'Nome Cronômetro 4',
  'mensagem-linha-1': 'Mensagem Linha 1',
  'mensagem-linha-2': 'Mensagem Linha 2',
  'mensagem-linha-3': 'Mensagem Linha 3',
  'mensagem-linha-4': 'Mensagem Linha 4',
  'relogio-sistema': 'Hora',
  'orador-principal': 'Orador',
  'partido-principal': 'Partido do Orador',
  'materia-principal': 'Tema em Discussão',
  'mensagem-principal': 'Mensagem',
  'data-atual': 'Data',
  cabecalho: 'Cabeçalho',
};

@Component({
  selector: 'app-controle-visibilidade',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './controle-visibilidade.component.html',
  styleUrl: './controle-visibilidade.component.css',
})
export class ControleVisibilidadeComponent implements OnChanges {
  @Input() componentes: ComponenteEditor[] = [];

  @Output() visibilityChanged = new EventEmitter<{ ids: string[]; visivel: boolean }>();

  itens: ItemLista[] = [];
  todosMarcados = true;

  ngOnChanges(): void {
    this.montarLista();
  }

  private montarLista(): void {
    const parlamentares = this.componentes.filter((c) => c.tipo === 'parlamentar');
    const outros = this.componentes.filter((c) => c.tipo !== 'parlamentar');

    const itens: ItemLista[] = outros.map((c) => ({
      id: c.id,
      label: ROTULOS[c.id] || c.id,
      checked: !c.ocultoNoEditor,
      ids: [c.id],
    }));

    if (parlamentares.length > 0) {
      itens.push({
        id: '__parlamentares__',
        label: 'Parlamentares',
        checked: parlamentares.some((c) => !c.ocultoNoEditor),
        ids: parlamentares.map((c) => c.id),
      });
    }

    itens.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));

    this.itens = itens;
    this.todosMarcados = itens.length > 0 && itens.every((i) => i.checked);
  }

  onItemChange(item: ItemLista, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.visibilityChanged.emit({ ids: item.ids, visivel: checked });
    item.checked = checked;
    this.todosMarcados = this.itens.every((i) => i.checked);
  }

  onTodosChange(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const todosIds = this.itens.flatMap((i) => i.ids);
    this.visibilityChanged.emit({ ids: todosIds, visivel: checked });
    this.itens.forEach((i) => (i.checked = checked));
    this.todosMarcados = checked;
  }
}