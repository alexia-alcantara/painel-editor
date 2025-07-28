import { Component, inject, signal } from '@angular/core';
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
    ListaVotacaoComponent
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent {
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
        this.componentes.set([
          {
            id: 'cabecalho',
            tipo: 'cabecalho',
            x: 20,
            y: 20,
            width: 400,
            height: 58,
          },
          {
            id: 'imagem',
            tipo: 'imagem',
            x: 750,
            y: 20,
            width: 750,
            height: 421,
          },
          {
            id: 'totalizadores',
            tipo: 'totalizadores',
            x: 300,
            y: 150,
            width: 172,
            height: 50,
            dados: this.votacaoMock,
          },
          {
            id: 'status-reuniao',
            tipo: 'status-reuniao',
            x: 500,
            y: 170,
            width: 223,
            height: 135,
          },
          {
            id: 'temporizador-1',
            tipo: 'temporizador-item',
            x: 10,
            y: 250,
            width: 127,
            height: 41,
            props: {
              tempo: '00:00',
              icon: false,
            },
          },
          {
            id: 'temporizador-2',
            tipo: 'temporizador-item',
            x: 90,
            y: 250,
            width: 127,
            height: 41,
            props: {
              tempo: '00:00',
              icon: false,
            },
          },
          {
            id: 'temporizador-3',
            tipo: 'temporizador-item',
            x: 170,
            y: 250,
            width: 172,
            height: 45,
            props: {
              tempo: '08:45:10',
              icon: true,
            },
        },
          ...this.montarComponentesParlamentares(),
        ]);
      }
    }
  });
}




private montarComponentesParlamentares(): ComponenteEditor[] {
  const larguraItem = 608;
  const alturaItem = 39; 
  const larguraColuna = 300;
  const espacamentoHorizontal = 50;
  const espacamentoVertical = 45;
  const xBase = 50;
  const yBase = 460;

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
