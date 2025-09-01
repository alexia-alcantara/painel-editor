import { FormsModule } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Cenario } from '../../models/cenario.model';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from '../../services/layout.service';
import { CommonModule } from '@angular/common';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { ComponenteEditor } from '../../models/components.model';
import { HeaderReuniaoComponent } from '../header-reuniao/header-reuniao.component';
import { ImagemReuniaoComponent } from '../imagem-reuniao/imagem-reuniao.component';
import { ParlamentarItemComponent } from '../parlamentar-item/parlamentar-item.component';
import { VotacaoTotalComponent } from '../votacao-total/votacao-total.component';
import { DescricaoReuniaoComponent } from '../descricao-reuniao/descricao-reuniao.component';
import { TituloReuniaoComponent } from '../titulo-reuniao/titulo-reuniao.component';
import { SubtituloReuniaoComponent } from '../subtitulo-reuniao/subtitulo-reuniao.component';
import { StatusReuniaoComponent } from '../status-reuniao/status-reuniao.component';
import { TemporizadorItemComponent } from '../temporizador-item/temporizador-item.component';
import { VotoItemComponent } from '../votacao-total/voto-item/voto-item.component';
import { StatusItemComponent } from '../status-reuniao/status-item/status-item.component';


@Component({
  selector: 'app-display',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    DragDropModule,
    HeaderReuniaoComponent,
    ImagemReuniaoComponent,
    ParlamentarItemComponent,
    VotacaoTotalComponent,
    DescricaoReuniaoComponent,
    TituloReuniaoComponent,
    SubtituloReuniaoComponent,
    StatusReuniaoComponent,
    TemporizadorItemComponent,
    VotoItemComponent,
    StatusItemComponent
  ],
  templateUrl: './display.component.html',
  styleUrl: './display.component.css',
})
export class DisplayComponent implements OnInit{
  cenarioParaExibir: Cenario | null = null;

  constructor(
    private route: ActivatedRoute,
    private layoutService: LayoutService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cenarioParaExibir = this.layoutService.carregarCenario(id);
    }
  }

  onDragEnded(event: CdkDragEnd, item: ComponenteEditor) {
    const newPosition = event.source.getFreeDragPosition();
    item.x = newPosition.x;
    item.y = newPosition.y;
  }

  toggleVisibility(item: ComponenteEditor) {
    item.visible = !item.visible;
  }
}
