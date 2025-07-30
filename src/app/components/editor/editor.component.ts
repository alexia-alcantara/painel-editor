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

// metodo que monta a posiçao inicial dos componentes
private montarLayoutInicial(): ComponenteEditor[] {
  const larguraImagem = 750;
  const alturaImagem = 421;
  const xImagem = 750;
  const yImagem = 70;

  const espacamentoHorizontal = 85;
  const espacamentoTemporizador = 42;
  const xBase = 235;

  // Alturas fixas dos blocos
  const cabecalhoHeight = 50;
  const tituloHeight = 25;
  const subtituloHeight = 20;
  const descricaoHeight = 90;
  const totalizadoresHeight = 25;
  const statusReuniaoHeight = 135;

  let yAtual = yImagem;

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
    width: xImagem - espacamentoHorizontal,
    height: cabecalhoHeight,
  };
  yAtual += cabecalho.height + 12;

  // Título
  const titulo: ComponenteEditor = {
    id: 'titulo',
    tipo: 'titulo',
    x: xBase,
    y: yAtual,
    width: xImagem - espacamentoHorizontal,
    height: tituloHeight,
  };
  yAtual += titulo.height + 12;

  // Subtítulo
  const subtitulo: ComponenteEditor = {
    id: 'subtitulo',
    tipo: 'subtitulo',
    x: xBase,
    y: yAtual,
    width: xImagem - espacamentoHorizontal,
    height: subtituloHeight,
  };
  yAtual += subtitulo.height + 12;

  // Descrição
  const descricao: ComponenteEditor = {
    id: 'descricao',
    tipo: 'descricao',
    x: cabecalho.x,
    y: yAtual,
    width: cabecalho.width,
    height: descricaoHeight,
  };
  yAtual += descricao.height + 12;

  // Blocos Totalizadores
  const totalizadores: ComponenteEditor = {
    id: 'totalizadores',
    tipo: 'totalizadores',
    x: xBase,
    y: yAtual,
    width: 172,
    height: totalizadoresHeight,
    dados: this.votacaoMock,
  };

  const votacaoTotal: ComponenteEditor = {
    id: 'votacao-total',
    tipo: 'votacao-total',
    x: xBase + totalizadores.width + espacamentoHorizontal,
    y: yAtual,
    width: 250,
    height: statusReuniaoHeight,
  };

  const statusReuniao: ComponenteEditor = {
    id: 'status-reuniao',
    tipo: 'status-reuniao',
    x: xBase + totalizadores.width + espacamentoHorizontal,
    y: yAtual,
    width: 223,
    height: statusReuniaoHeight,
  };

  // Temporizadores alinhados ao final da imagem
  const temporizadoresBase = [
    { id: 'temporizador-1', width: 127, height: 20, tempo: '00:00', icon: false },
    { id: 'temporizador-2', width: 127, height: 20, tempo: '00:00', icon: false },
    { id: 'temporizador-3', width: 172, height: 35, tempo: '08:45:10', icon: true },
  ];

  const alturaTemporizadores = Math.max(...temporizadoresBase.map(t => t.height));
  const yTemporizadores = yImagem + alturaImagem - alturaTemporizadores;

  const temporizadores: ComponenteEditor[] = temporizadoresBase.map((item, index) => {
    const x = xBase + temporizadoresBase
      .slice(0, index)
      .reduce((acc, prev) => acc + prev.width + espacamentoTemporizador, 0);

    return {
      id: item.id,
      tipo: 'temporizador-item',
      x,
      y: yTemporizadores,
      width: item.width,
      height: item.height,
      props: { tempo: item.tempo, icon: item.icon },
    };
  });

  // Parlamentares começam abaixo da imagem com uma margem
  const margemParlamentares = 45;
  const yParlamentares = yImagem + alturaImagem + margemParlamentares;

  const parlamentares = this.montarComponentesParlamentares(yParlamentares);

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
    console.log('Salvando layout:', this.componentes());
    this.layoutService.salvarLayout(this.componentes());
  }
}
