import { Component, inject, signal } from '@angular/core';
import { ComponenteEditor } from '../../models/components.model';
import { LayoutService } from '../../services/layout.service';
import { CommonModule } from '@angular/common';
import { HeaderReuniaoComponent } from '../header-reuniao/header-reuniao.component';
import { Router } from '@angular/router';

import {CdkDragEnd, DragDropModule} from '@angular/cdk/drag-drop';
import { ImagemReuniaoComponent } from '../imagem-reuniao/imagem-reuniao.component';
import { ParlamentarItemComponent } from '../parlamentar-item/parlamentar-item.component';
import { VotacaoTotalComponent } from '../votacao-total/votacao-total.component';
import { TimerComponent } from '../timer/timer.component';

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
    TimerComponent
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css'
})
export class EditorComponent {

  modoEditor = false;
  router = inject(Router);

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
      width: 200,
      height: 200,
    },
    {
      id: 'parlamentar',
      tipo: 'parlamentar',
      x: 50,
      y: 150,
      width: 200,
      height: 100,
      dados: {
        nome: 'Fulano',
      },
    },
    {
      id: 'totalizadores',
      tipo: 'totalizadores',
      x: 300,
      y: 150,
      width: 150,
      height: 100,
    },
    {
      id: 'timer',
      tipo: 'timer',
      x: 600,
      y: 150,
      width: 100,
      height: 60,
    },
  ]);

   constructor(
    private layoutService: LayoutService
  ) {
    this.router.events.subscribe(() => {
      this.modoEditor = this.router.url.includes('/editor');
    });

    console.log('[DEBUG] Componentes:', this.componentes());
  }

  onDragEnd(event: CdkDragEnd, item: ComponenteEditor) {
    const element = event.source.element.nativeElement as HTMLElement;

    const novoX = element.offsetLeft;
    const novoY = element.offsetTop;

    const index = this.componentes().findIndex((c) => c.id === item.id);
    if (index !== -1) {
      const atualizados = [...this.componentes()];
      atualizados[index] = {
        ...atualizados[index],
        x: novoX,
        y: novoY,
      };
      this.componentes.set(atualizados);
    }
  }

  salvar() {
    this.layoutService.salvarLayout(this.componentes());
    console.log('[DEBUG] Layout salvo:', this.componentes());
  }
}
