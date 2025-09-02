import { FormsModule } from '@angular/forms';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
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
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { ControleVisibilidadeComponent } from '../../controle-visibilidade/controle-visibilidade.component';
import { Parlamentar } from '../lista-votacao/lista-votacao.component';
import { DistribuirConfig } from '../../dialogs/distribuir-parlamentares/distribuir-parlamentares.component';

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    ContextMenuComponent,
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
    StatusItemComponent,
    ControleVisibilidadeComponent,
  ],
  templateUrl: './display.component.html',
  styleUrl: './display.component.css',
})
export class DisplayComponent implements OnInit, AfterViewInit {
  @ViewChild('contextMenu') contextMenu!: ContextMenuComponent;
  @ViewChild('wrapper') wrapper!: ElementRef<HTMLDivElement>;

  cenarioParaExibir: Cenario | null = null;
  mostrarControleVisibilidade = false;

  toggleControleVisibilidade(): void {
    this.mostrarControleVisibilidade = !this.mostrarControleVisibilidade;
  }

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

  constructor(
    private route: ActivatedRoute,
    private layoutService: LayoutService,
    private renderer: Renderer2,
    private hostElement: ElementRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const cenarioOriginal = this.layoutService.carregarCenario(id);
      if (cenarioOriginal) {
        this.cenarioParaExibir = structuredClone(cenarioOriginal);
      }
    }
  }

  onComponentVisibilityChange(event: { id: string; visivel: boolean }) {
    const compIndex = this.cenarioParaExibir?.componentes.findIndex(
      (c) => c.id === event.id
    );

    if (this.cenarioParaExibir && compIndex !== undefined && compIndex > -1) {
      this.cenarioParaExibir.componentes[compIndex].visible = event.visivel;
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.ajustarEscala(), 0);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.ajustarEscala();
  }

private ajustarEscala(): void {
  const wrapperRef = (this as any).editorWrapperRef || (this as any).wrapper;
  
  const cenario = (this as any).cenarioAtual || (this as any).cenarioParaExibir;

  if (!wrapperRef || !cenario) {
    return;
  }

  const container = wrapperRef.nativeElement.parentElement;
  const target = wrapperRef.nativeElement;

  if (!container) return;

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientHeight;

  const targetWidth = cenario.targetWidth;
  const targetHeight = cenario.targetHeight;

  const scaleX = containerWidth / targetWidth;
  const scaleY = containerHeight / targetHeight;

  const scale = Math.min(scaleX, scaleY);

  this.renderer.setStyle(target, 'transform', `scale(${scale})`);
}

  onDragEnd(event: CdkDragEnd, item: ComponenteEditor) {
    const position = event.source.getFreeDragPosition();
    item.x = Math.round(position.x);
    item.y = Math.round(position.y);
  }

  onRightClick(event: MouseEvent, component: ComponenteEditor) {
    event.preventDefault();
    if (this.contextMenu) {
      this.contextMenu.open(
        event,
        component,
        this.cenarioParaExibir?.componentes ?? [],
        false
      );
    }
  }

  onMenuAction(event: {
    action: string;
    data?: any;
    component?: ComponenteEditor | null;
  }) {
    if (!this.cenarioParaExibir) return;

    switch (event.action) {
      case 'toggleVisibility':
        if (event.component) {
          const compIndex = this.cenarioParaExibir.componentes.findIndex(
            (c) => c.id === event.component?.id
          );
          if (compIndex > -1) {
            this.cenarioParaExibir.componentes[compIndex].visible =
              !this.cenarioParaExibir.componentes[compIndex].visible;
          }
        }
        break;

      case 'distributeParliamentarians':
        this.redistribuirParlamentares(event.data);
        break;
    }
  }

  toggleVisibility(item: ComponenteEditor) {
    item.visible = !item.visible;
  }

 redistribuirParlamentares(config: DistribuirConfig) {
    if (!this.cenarioParaExibir) return;

    const componentesAtuais = this.cenarioParaExibir.componentes;
    const componentesSemParlamentares = componentesAtuais.filter(
      (c) => c.tipo !== 'parlamentar'
    );
    const yBaseComponenteImagem =
      componentesAtuais.find((c) => c.tipo === 'imagem')?.y ?? 70;
    const alturaComponenteImagem =
      componentesAtuais.find((c) => c.tipo === 'imagem')?.height ?? 421;
    const yBaseParlamentares =
      yBaseComponenteImagem + alturaComponenteImagem + 45;

    const novosParlamentares = this.montarComponentesParlamentares(
      yBaseParlamentares,
      config
    );
    const layoutFinal = [...componentesSemParlamentares, ...novosParlamentares];
    this.cenarioParaExibir.componentes = layoutFinal;
  }

  private montarComponentesParlamentares(
  yBase: number = 480,
  config: DistribuirConfig
): ComponenteEditor[] {
  const itensPorColuna = config.qtdePorColuna > 0 ? config.qtdePorColuna : 1;
  const totalDeParlamentares = config.qntTotal;

  const parlamentaresParaExibir = this.parlamentaresMock.slice(
    0,
    totalDeParlamentares
  );

  if (parlamentaresParaExibir.length === 0) {
    return [];
  }

  const larguraItem = 608;
  const alturaItem = 20;
  const xBase = 234;

  return parlamentaresParaExibir.map((parlamentar, i) => {
    const colunaAtual = Math.floor(i / itensPorColuna);
    const linhaAtual = i % itensPorColuna;

    const posX =
      xBase +
      config.margemEsquerda +
      colunaAtual * (larguraItem + config.espacamentoHorizontal);
    const posY =
      yBase +
      config.margemSuperior +
      linhaAtual * (alturaItem + config.espacamentoVertical);
      
    return {
      id: `parlamentar-${i}`,
      tipo: 'parlamentar',
      x: posX,
      y: posY,
      width: larguraItem,
      height: alturaItem,
      dados: parlamentar,
      visible: true,
    };
  });
}
}
