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
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent {
  modoEditor = false;
  router = inject(Router);
  layout: ComponenteEditor[] = [];

  parlamentarMock = {
    nome: 'Fulano',
    partido: 'ABC',
    voto: 'S',
  };

  votacaoMock = {
    sim: 10,
    nao: 5,
    absten: 2,
  };

  componentes = signal<ComponenteEditor[]>([
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
      id: 'parlamentar',
      tipo: 'parlamentar',
      x: 50,
      y: 150,
      width: 608,
      height: 39,
      dados: {
        nome: 'Arlene McCoy',
        partido: 'PARTIDO',
        voto: 'S',
      },
    },

    {
      id: 'totalizadores',
      tipo: 'totalizadores',
      x: 300,
      y: 150,
      width: 150,
      height: 100,
      dados: {
        sim: 15,
        nao: 6,
        absten: 0,
      },
    },
    {
      id: 'status-reuniao',
      tipo: 'status-reuniao',
      x: 300,
      y: 170,
      width: 223,
      height: 135,
    },
    {
      id: 'temporizador-1',
      tipo: 'temporizador-item',
      x: 10,
      y: 250,
      width: 70,
      height: 32,
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
      width: 70,
      height: 32,
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
      width: 110,
      height: 32,
      props: {
        tempo: '08:45:10',
        icon: true,
      },
    },
  ]);

  constructor(private layoutService: LayoutService) {
    this.router.events.subscribe(() => {
      this.modoEditor = this.router.url.includes('/editor');
    });

    console.log('[DEBUG] Componentes:', this.componentes());
  }

  ngOnInit() {
    const layoutSalvo = this.layoutService.carregarLayout();
    if (layoutSalvo.length) {
      this.componentes.set(layoutSalvo);
    }
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

  // onDragEnd(event: CdkDragEnd, item: ComponenteEditor) {
  //   const element = event.source.element.nativeElement as HTMLElement;

  //   const novoX = element.offsetLeft;
  //   const novoY = element.offsetTop;

  //   const index = this.componentes().findIndex((c) => c.id === item.id);
  //   if (index !== -1) {
  //     const atualizados = [...this.componentes()];
  //     atualizados[index] = {
  //       ...atualizados[index],
  //       x: novoX,
  //       y: novoY,
  //     };
  //     this.componentes.set(atualizados);
  //   }
  // }

  salvar() {
    console.log('[DEBUG] Salvando layout:', this.componentes());
    this.layoutService.salvarLayout(this.componentes());
  }
}
