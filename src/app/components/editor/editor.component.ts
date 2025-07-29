import { Component, inject, signal, ViewChild } from '@angular/core';
import { ComponenteEditor } from '../../models/components.model';
import { LayoutService } from '../../services/layout.service';
import { CommonModule } from '@angular/common';
import { HeaderReuniaoComponent } from '../header-reuniao/header-reuniao.component';
import { Router } from '@angular/router';

import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { ImagemReuniaoComponent } from '../imagem-reuniao/imagem-reuniao.component';
import { ParlamentarItemComponent } from '../parlamentar-item/parlamentar-item.component';
import { VotacaoTotalComponent } from '../votacao-total/votacao-total.component';
import { TimerComponent } from '../timer/timer.component';
import { StatusReuniaoComponent } from '../status-reuniao/status-reuniao.component';
import { TemporizadorItemComponent } from '../temporizador-item/temporizador-item.component';
import { ListaVotacaoComponent, Parlamentar } from '../lista-votacao/lista-votacao.component';
import { DescricaoReuniaoComponent } from "../descricao-reuniao/descricao-reuniao.component";
import { TituloReuniaoComponent } from "../titulo-reuniao/titulo-reuniao.component";
import { SubtituloReuniaoComponent } from "../subtitulo-reuniao/subtitulo-reuniao.component";
import { ContextMenuComponent } from "../context-menu/context-menu.component";

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    HeaderReuniaoComponent,
    DragDropModule,
    ImagemReuniaoComponent,
    ParlamentarItemComponent,
    VotacaoTotalComponent,
    TimerComponent,
    TemporizadorItemComponent,
    StatusReuniaoComponent,
    ListaVotacaoComponent,
    DescricaoReuniaoComponent,
    TituloReuniaoComponent,
    SubtituloReuniaoComponent,
    ContextMenuComponent
],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent {
  @ViewChild(ContextMenuComponent)
  contextMenu!: ContextMenuComponent;

  modoEditor = false;
  router = inject(Router);
  layout: ComponenteEditor[] = [];

parlamentaresMock: Parlamentar[] = [
  { nome: 'Arlene McCoy', partido: 'PARTIDO', voto: 'S' },
  { nome: 'Devon Lane', partido: 'PARTIDO', voto: 'N' },
  { nome: 'Floyd Miles', partido: 'PARTIDO', voto: 'N' },
  { nome: 'Darlene Robertson', partido: 'PARTIDO', voto: 'N' },
  { nome: 'Marvin McKinney', partido: 'PARTIDO', voto: '-' },
  { nome: 'Kathryn Murphy', partido: 'PARTIDO', voto: '-' },
  { nome: 'Brooklyn Simmons', partido: 'PARTIDO', voto: 'S' },
  { nome: 'Annette Black', partido: 'PARTIDO', voto: 'S' },
  { nome: 'Esther Howard', partido: 'PARTIDO', voto: 'S' },
  { nome: 'Guy Hawkins', partido: 'PARTIDO', voto: 'N' },
  { nome: 'Albert Flores', partido: 'PARTIDO', voto: 'N' },
  { nome: 'Jerome Bell', partido: 'PARTIDO', voto: 'S' },
  { nome: 'Savannah Nguyen', partido: 'PARTIDO', voto: 'S' },
  { nome: 'Wade Warren', partido: 'PARTIDO', voto: 'S' },
  { nome: 'Dianne Russell', partido: 'PARTIDO', voto: '-' },
  { nome: 'Cameron Williamson', partido: 'PARTIDO', voto: '-' },
  { nome: 'Courtney Henry', partido: 'PARTIDO', voto: '-' },
  { nome: 'Bessie Cooper', partido: 'PARTIDO', voto: 'S' },
  { nome: 'Jacob Jones', partido: 'PARTIDO', voto: 'N' },
  { nome: 'Jane Cooper', partido: 'PARTIDO', voto: 'S' },
];


  votacaoMock = {
    sim: 10,
    nao: 5,
    absten: 2,
  };

componentes = signal<ComponenteEditor[]>([]);

constructor(private layoutService: LayoutService) {
  this.router.events.subscribe(() => {
    this.modoEditor = this.router.url.includes('/editor');

    if (this.modoEditor) {
      const layoutSalvo = this.layoutService.carregarLayout();

      if (layoutSalvo.length) {
        this.componentes.set(layoutSalvo);
      } else {
        this.componentes.set(this.montarLayoutInicial());
      }
    }
  });
}

private montarLayoutInicial(): ComponenteEditor[] {

  const larguraImagem = 750;
  const alturaImagem = 421;
  const xImagem = 750;
  const yImagem = 70;

  const espacamentoVertical = 20;
  const espacamentoHorizontal = 85;

  // Base para os blocos à esquerda da imagem 
  const xBase = 235;
  let yAtual = yImagem; // começa no topo da imagem

  // Imagem da reunião
  const imagem: ComponenteEditor = {
    id: 'imagem-reuniao',
    tipo: 'imagem',
    x: xImagem,
    y: yImagem,
    width: larguraImagem,
    height: alturaImagem,
  };

  // Cabeçalho
  const cabecalho: ComponenteEditor = {
    id: 'cabecalho',
    tipo: 'cabecalho',
    x: xBase,
    y: yAtual,
    width: xImagem - espacamentoHorizontal, // alinhado ao início da imagem
    height: 58,
  };
  yAtual += cabecalho.height + espacamentoVertical;

  // Título
  const titulo: ComponenteEditor = {
    id: 'titulo',
    tipo: 'titulo',
    x: xBase,
    y: yAtual,
    width: xImagem - espacamentoHorizontal,
    height: 40,
  };
  yAtual += titulo.height + 5;

  //Subtítulo
  const subtitulo: ComponenteEditor = {
    id: 'subtitulo',
    tipo: 'subtitulo',
    x: xBase,
    y: yAtual,
    width: xImagem - espacamentoHorizontal,
    height: 30,
  };
  yAtual += subtitulo.height + espacamentoVertical;

  // Descrição
  const descricao: ComponenteEditor = {
    id: 'descricao',
    tipo: 'descricao',
    x: xBase,
    y: yAtual,
    width: xImagem - espacamentoHorizontal,
    height: 130,
  };
  yAtual += descricao.height + espacamentoVertical;

  //  Blocos Totalizadores 
  const totalizadores: ComponenteEditor = {
    id: 'totalizadores',
    tipo: 'totalizadores',
    x: xBase,
    y: yAtual,
    width: 172,
    height: 50,
    dados: this.votacaoMock,
  };

   const votacaoTotal: ComponenteEditor = {
    id: 'votacao-total',
    tipo: 'votacao-total',
    x: xBase + totalizadores.width + espacamentoHorizontal,
    y: yAtual - 0, 
    width: 250,
    height: 135,
  };

  const statusReuniao: ComponenteEditor = {
    id: 'status-reuniao',
    tipo: 'status-reuniao',
    x: xBase + totalizadores.width + espacamentoHorizontal,
    y: yAtual - 0, 
    width: 223,
    height: 135,
  };
  yAtual += statusReuniao.height + espacamentoVertical;

  //Temporizadores 
  const temporizadores: ComponenteEditor[] = [
    {
      id: 'temporizador-1',
      tipo: 'temporizador-item',
      x: xBase,
      y: yAtual,
      width: 127,
      height: 41,
      props: { tempo: '00:00', icon: false },
    },
    {
      id: 'temporizador-2',
      tipo: 'temporizador-item',
      x: xBase + 140,
      y: yAtual,
      width: 127,
      height: 41,
      props: { tempo: '00:00', icon: false },
    },
    {
      id: 'temporizador-3',
      tipo: 'temporizador-item',
      x: xBase + 280,
      y: yAtual,
      width: 172,
      height: 45,
      props: { tempo: '08:45:10', icon: true },
    },
  ];

  // Parlamentares 
  const parlamentares = this.montarComponentesParlamentares(yAtual + 60);

  return [
    imagem,
    cabecalho,
    titulo,
    subtitulo,
    descricao,
    totalizadores,
    votacaoTotal,
    statusReuniao,
    ...temporizadores,
    ...parlamentares,
  ];
}



private montarComponentesParlamentares(yBase: number = 480): ComponenteEditor[] {
  const larguraItem = 608;
  const alturaItem = 39; 
  const larguraColuna = 300;
  const espacamentoHorizontal = 50;
  const espacamentoVertical = 45;
  const xBase = 234;

  return this.parlamentaresMock.map((parlamentar, i) => {
    const coluna = i % 2;
    const linha = Math.floor(i / 2);
    return {
      id: `parlamentar-${i}`,
      tipo: 'parlamentar',
      x: xBase + coluna * (larguraItem + espacamentoHorizontal),
      y: yBase + linha * espacamentoVertical,
      width: larguraItem,
      height: alturaItem,
      dados: parlamentar
    };
  });
}

  onDragEnd(event: CdkDragEnd, item: ComponenteEditor) {
    const position = event.source.getFreeDragPosition();

    const index = this.componentes().findIndex((c) => c.id === item.id);
    if (index !== -1) {
      const atualizados = [...this.componentes()];
      atualizados[index] = {
        ...atualizados[index],
        x: Math.round(position.x),
        y: Math.round(position.y),
      };
      this.componentes.set(atualizados);

      this.layoutService.salvarLayout(atualizados);
    }
  }

  onItemChange() {
    this.layoutService.salvarLayout(this.layout);
  }

  salvar() {
    console.log('[DEBUG] Salvando layout:', this.componentes());
    this.layoutService.salvarLayout(this.componentes());
  }
}
