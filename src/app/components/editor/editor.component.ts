import {
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { ComponenteEditor, FontConfig } from '../../models/components.model';
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
import {
  ListaVotacaoComponent,
  Parlamentar,
} from '../lista-votacao/lista-votacao.component';
import { DescricaoReuniaoComponent } from '../descricao-reuniao/descricao-reuniao.component';
import { TituloReuniaoComponent } from '../titulo-reuniao/titulo-reuniao.component';
import { SubtituloReuniaoComponent } from '../subtitulo-reuniao/subtitulo-reuniao.component';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { VotoItemComponent } from '../voto-item/voto-item.component';
import { LayoutExportService } from '../../services/layout-export.service';
import saveAs from 'file-saver';
import { ComponenteTipo } from '../../models/fontes.model';
import { DistribuirConfig } from '../../dialogs/distribuir-parlamentares/distribuir-parlamentares.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ControleVisibilidadeComponent } from '../../controle-visibilidade/controle-visibilidade.component';
import { MatIconModule } from '@angular/material/icon';

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
    ContextMenuComponent,
    VotoItemComponent,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    ControleVisibilidadeComponent,
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent {
  @ViewChild('editorWrapper', { static: true }) editorWrapperRef!: ElementRef;
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
  mostrarControleVisibilidade = false;

  constructor(
    private layoutService: LayoutService,
    private layoutExport: LayoutExportService
  ) {}

  onComponentVisibilityChange(event: { id: string; visivel: boolean }) {
    const componentesAtuais = this.componentes();
    const compIndex = componentesAtuais.findIndex((c) => c.id === event.id);

    if (compIndex > -1) {
      componentesAtuais[compIndex].visible = event.visivel;
      this.componentes.set([...componentesAtuais]);
    }
  }

  ngOnInit() {
    this.modoEditor = this.router.url.includes('/editor');
  }

  ngAfterViewInit() {
    if (!this.modoEditor) return;

    setTimeout(() => {
      const layoutSalvo = this.layoutService.carregarLayout();
      if (layoutSalvo?.length) {
        this.componentes.set(layoutSalvo);
      } else {
        this.componentes.set(this.montarLayoutInicial());
      }
    }, 0);
  }

  toggleControleVisibilidade(): void {
    this.mostrarControleVisibilidade = !this.mostrarControleVisibilidade;
  }

  onMenuAction(event: {
    action: string;
    data: any;
    component?: ComponenteEditor | null;
  }) {
    switch (event.action) {
      case 'updateFont':
        this.onFontSelected(event.data);
        break;

      case 'distributeParliamentarians':
        this.redistribuirParlamentares(event.data);
        break;

      case 'loadLayout':
        let layoutFinal: ComponenteEditor[];
        if (Array.isArray(event.data)) {
          layoutFinal = event.data;
        } else {
          layoutFinal = this.layoutExport.converterDoFormatoOriginal(
            event.data,
            this.parlamentaresMock,
            this.votacaoMock
          );
        }
        this.componentes.set(layoutFinal);
        this.layoutService.salvarLayout(layoutFinal);
        break;
    }
  }

  onFontSelected(event: {
    tipo: ComponenteTipo;
    subId: string;
    font: FontConfig;
  }) {
    const layout = this.componentes();
    const comp = layout.find((c) => c.tipo === event.tipo);

    if (comp?.fontes) {
      const fonte = comp.fontes.find((f) => f.subId === event.subId);
      if (fonte) fonte.font = event.font;
    }

    this.componentes.set([...layout]);
  }

  redistribuirParlamentares(config: DistribuirConfig) {
    const componentesAtuais = this.componentes();
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
    this.componentes.set(layoutFinal);
    this.layoutService.salvarLayout(layoutFinal);
  }

  onDragEnd(event: CdkDragEnd, item: ComponenteEditor) {
    const position = event.source.getFreeDragPosition();

    const atualizados = this.componentes().map((c) =>
      c.id === item.id
        ? { ...c, x: Math.round(position.x), y: Math.round(position.y) }
        : c
    );

    this.componentes.set(atualizados);
    this.layoutService.salvarLayout(atualizados);
  }

  onRightClick(event: MouseEvent, component: ComponenteEditor) {
    // 1. Previne o menu padrão do navegador de aparecer
    event.preventDefault();

    if (this.contextMenu) {
      this.contextMenu.open(event, component, this.componentes());
    }
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
    const totalizadoresHeight = 135;
    const statusReuniaoHeight = 135;

    const larguraVotacaoItem = 223;
    const alturaVotacaoItem = 30;

    let yAtual = yImagem;

    const defaultFont: FontConfig = {
      family: 'Inter, sans-serif',
      size: 14,
      color: '#FFFFFF',
    };

    // Imagem da reunião
    const imagem: ComponenteEditor = {
      id: 'imagem-reuniao',
      tipo: 'imagem',
      x: xImagem,
      y: yImagem,
      width: larguraImagem,
      height: alturaImagem,
      visible: true,
    };

    // Cabeçalho
    const cabecalho: ComponenteEditor = {
      id: 'cabecalho',
      tipo: 'cabecalho',
      x: xBase,
      y: yAtual,
      width: xImagem - espacamentoHorizontal,
      height: cabecalhoHeight,
      visible: true,
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
      visible: true,
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
      visible: true,
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
      fontes: [
        {
          subId: 'descricao-texto',
          label: 'Descrição',
          font: { ...defaultFont },
        },
      ],
      visible: true,
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
      visible: true,
    };

    const votacaoTotal: ComponenteEditor = {
      id: 'votacao-total',
      tipo: 'votacao-total',
      x: xBase + totalizadores.width + espacamentoHorizontal,
      y: yAtual,
      width: 250,
      height: statusReuniaoHeight,
      visible: true,
    };

    const margemInternaX = 10; // margem lateral dentro da caixa
    const margemInternaY = 10; // margem superior
    const espacoVertical = 10;

    const totalAlturaItens = alturaVotacaoItem * 3 + espacoVertical * 2;
    const margemSuperior = (totalizadores.height - totalAlturaItens) / 2;

    const baseX = totalizadores.x + margemInternaX;
    const baseY = totalizadores.y + margemInternaY;

    const votacaoSim: ComponenteEditor = {
      id: 'voto-sim',
      tipo: 'votacao-item',
      x: baseX,
      y: baseY,
      width: larguraVotacaoItem,
      height: alturaVotacaoItem,
      props: { label: 'SIM', cor: '#22C55E', valor: 15 },
      visible: true,
    };

    const votacaoNao: ComponenteEditor = {
      id: 'voto-nao',
      tipo: 'votacao-item',
      x: baseX,
      y: baseY + alturaVotacaoItem + espacoVertical,
      width: larguraVotacaoItem,
      height: alturaVotacaoItem,
      props: { label: 'NÃO', cor: '#F97316', valor: 6 },
      visible: true,
    };

    const votacaoAbstencao: ComponenteEditor = {
      id: 'voto-abstencao',
      tipo: 'votacao-item',
      x: baseX,
      y: baseY + (alturaVotacaoItem + espacoVertical) * 2,
      width: larguraVotacaoItem,
      height: alturaVotacaoItem,
      props: { label: 'ABSTENÇÃO', cor: '#FFCC66', valor: 20 },
      visible: true,
    };

    const statusReuniao: ComponenteEditor = {
      id: 'status-reuniao',
      tipo: 'status-reuniao',
      x: xBase + totalizadores.width + espacamentoHorizontal,
      y: yAtual,
      width: 223,
      height: statusReuniaoHeight,
      visible: true,
    };

    // Temporizadores alinhados ao final da imagem
    const temporizadoresBase = [
      {
        id: 'temporizador-1',
        width: 127,
        height: 20,
        tempo: '00:00',
        icon: false,
      },
      {
        id: 'temporizador-2',
        width: 127,
        height: 20,
        tempo: '00:00',
        icon: false,
      },
      {
        id: 'temporizador-3',
        width: 172,
        height: 35,
        tempo: '08:45:10',
        icon: true,
      },
    ];

    const alturaTemporizadores = Math.max(
      ...temporizadoresBase.map((t) => t.height)
    );
    const yTemporizadores = yImagem + alturaImagem - alturaTemporizadores;

    const temporizadores: ComponenteEditor[] = temporizadoresBase.map(
      (item, index) => {
        const x =
          xBase +
          temporizadoresBase
            .slice(0, index)
            .reduce(
              (acc, prev) => acc + prev.width + espacamentoTemporizador,
              0
            );

        return {
          id: item.id,
          tipo: 'temporizador-item',
          x,
          y: yTemporizadores,
          width: item.width,
          height: item.height,
          props: { tempo: item.tempo, icon: item.icon },
          visible: true,
        };
      }
    );

    // Parlamentares começam abaixo da imagem com uma margem
    const margemParlamentares = 45;
    const yParlamentares = yImagem + alturaImagem + margemParlamentares;
    const defaultConfig: DistribuirConfig = {
      qtdePorColuna: 5,
      qntTotal: 10,
      espacamentoVertical: 50,
      espacamentoHorizontal: 50,
      margemSuperior: 0,
      margemEsquerda: 0,
      exibirDe: 0,
      exibirAte: 0,
      offsetInicial: 0,
    };

    const parlamentares = this.montarComponentesParlamentares(
      yParlamentares,
      defaultConfig
    );

    return [
      imagem,
      cabecalho,
      titulo,
      subtitulo,
      descricao,
      totalizadores,
      votacaoTotal,
      statusReuniao,
      votacaoSim,
      votacaoNao,
      votacaoAbstencao,
      ...temporizadores,
      ...parlamentares,
    ];
  }

  private montarComponentesParlamentares(
    yBase: number = 480,
    config: DistribuirConfig
  ): ComponenteEditor[] {
    const larguraItem = 608;
    const alturaItem = 39;
    const xBase = 234;
    const larguraTotalItem = larguraItem + config.espacamentoHorizontal;
    const parlamentaresParaExibir = this.parlamentaresMock.slice(
      0,
      config.qntTotal
    );
    const itensPorColunaConfigurado =
      config.qtdePorColuna > 0 ? config.qtdePorColuna : 1;
    const containerElement = this.editorWrapperRef.nativeElement as HTMLElement;
    const containerWidth = containerElement.getBoundingClientRect().width;
    const maxColumnsResponsivo = Math.max(
      1,
      Math.floor(
        (containerWidth - xBase + config.espacamentoHorizontal) /
          larguraTotalItem
      )
    );
    const colunasRequeridasPeloUsuario = Math.ceil(
      parlamentaresParaExibir.length / itensPorColunaConfigurado
    );
    const usarLogicaResponsiva =
      colunasRequeridasPeloUsuario > maxColumnsResponsivo;

    return parlamentaresParaExibir.map((parlamentar, i) => {
      let coluna: number;
      let linha: number;

      if (usarLogicaResponsiva) {
        coluna = i % maxColumnsResponsivo;
        linha = Math.floor(i / maxColumnsResponsivo);
      } else {
        coluna = Math.floor(i / itensPorColunaConfigurado);
        linha = i % itensPorColunaConfigurado;
      }

      const posX = xBase + coluna * larguraTotalItem;
      const posY =
        yBase +
        config.margemSuperior +
        linha * (alturaItem + config.espacamentoVertical - 11);

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

  onItemChange() {
    this.layoutService.salvarLayout(this.layout);
  }

  salvar() {
    const layoutAtual = this.componentes();

    const nomeCenario = prompt(
      'Digite um nome para o cenário:',
      'novo-cenario'
    );

    if (!nomeCenario) {
      return;
    }

    // salva o cenário na lista para o modal gerenciar cenarios
    this.layoutService.salvarCenario(nomeCenario, layoutAtual);

    // converte para o formato antigo e exporta o arquivo .json
    const layoutAntigo =
      this.layoutExport.converterParaFormatoOriginal(layoutAtual);
    const blob = new Blob([JSON.stringify(layoutAntigo, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, `${nomeCenario}.json`);

    alert(`Cenário "${nomeCenario}" salvo com sucesso!`);
  }
}
