import { Component, inject, signal, ViewChild } from '@angular/core';
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

  constructor(
    private layoutService: LayoutService,
    private layoutExport: LayoutExportService
  ) {
    // this.router.events.subscribe(() => {
    //   this.modoEditor = this.router.url.includes('/editor');
    //   if (this.modoEditor) {
    //     const layoutSalvo = this.layoutService.carregarLayout();
    //     if (layoutSalvo.length) {
    //       this.componentes.set(layoutSalvo);
    //     } else {
    //       this.componentes.set(this.montarLayoutInicial());
    //     }
    //   }
    // });
  }

  exportarJSON() {
    const layout = this.layoutService.layoutAtual; // sempre o mais recente
    const json = this.layoutExport.converterParaFormatoOriginal(layout);
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, 'layout.json');
  }

  ngOnInit() {
    //detecta se está na rota editor
    this.modoEditor = this.router.url.includes('/editor');

    if (!this.modoEditor) return;

    //carrega layout salvo ou monta o layout inicial
    const layoutSalvo = this.layoutService.carregarLayout();

    if (layoutSalvo?.length) {
      this.componentes.set(layoutSalvo);
    } else {
      this.componentes.set(this.montarLayoutInicial());
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

    this.componentes.set([...layout]); // Atualiza Angular Signal
  }

  onDragEnd(event: CdkDragEnd, item: ComponenteEditor) {
    const position = event.source.getFreeDragPosition();

    const atualizados = this.componentes().map((c) =>
      c.id === item.id
        ? { ...c, x: Math.round(position.x), y: Math.round(position.y) }
        : c
    );

    this.componentes.set(atualizados);
    this.layoutService.salvarLayout(atualizados); // opcional: salvar localmente
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
      fontes: [
        {
          subId: 'descricao-texto',
          label: 'Descrição',
          font: { ...defaultFont },
        },
      ],
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
    };

    const votacaoNao: ComponenteEditor = {
      id: 'voto-nao',
      tipo: 'votacao-item',
      x: baseX,
      y: baseY + alturaVotacaoItem + espacoVertical,
      width: larguraVotacaoItem,
      height: alturaVotacaoItem,
      props: { label: 'NÃO', cor: '#F97316', valor: 6 },
    };

    const votacaoAbstencao: ComponenteEditor = {
      id: 'voto-abstencao',
      tipo: 'votacao-item',
      x: baseX,
      y: baseY + (alturaVotacaoItem + espacoVertical) * 2,
      width: larguraVotacaoItem,
      height: alturaVotacaoItem,
      props: { label: 'ABSTENÇÃO', cor: '#FFCC66', valor: 20 },
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
        };
      }
    );

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
      votacaoSim,
      votacaoNao,
      votacaoAbstencao,
      ...temporizadores,
      ...parlamentares,
    ];
  }

  private montarComponentesParlamentares(
    yBase: number = 480
  ): ComponenteEditor[] {
    const larguraItem = 608;
    const alturaItem = 39;
    const larguraColuna = 300;
    const espacamentoHorizontal = 50;
    const espacamentoVertical = 50;
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
        dados: parlamentar,
      };
    });
  }

  // onDragEnd(event: CdkDragEnd, item: ComponenteEditor) {
  //   const position = event.source.getFreeDragPosition();

  //   const index = this.componentes().findIndex((c) => c.id === item.id);
  //   if (index !== -1) {
  //     const atualizados = [...this.componentes()];
  //     atualizados[index] = {
  //       ...atualizados[index],
  //       x: Math.round(position.x),
  //       y: Math.round(position.y),
  //     };
  //     this.componentes.set(atualizados);

  //     this.layoutService.salvarLayout(atualizados);
  //   }
  // }

  onItemChange() {
    this.layoutService.salvarLayout(this.layout);
  }

  listarCenarios() {
    console.log('Cenários salvos:', this.layoutService.listarCenarios());
  }

  carregarCenario(nome: string) {
    const layout = this.layoutService.carregarCenario(nome);
    if (layout.length) {
      this.componentes.set(layout);
    } else {
      console.warn(`Cenário "${nome}" não encontrado`);
    }
  }

  salvar() {
    const layoutAtual = this.componentes(); // array do tipo ComponenteEditor
    const nomeCenario = prompt(
      'Digite um nome para o cenário:',
      'cenario-1-angular'
    );
    if (!nomeCenario) return;

    // Salvar no localStorage a versão nova (caso queira)
    this.layoutService.salvarCenario(nomeCenario, layoutAtual);

    // ✅ Converter para formato antigo antes de baixar
    const layoutAntigo =
      this.layoutExport.converterParaFormatoOriginal(layoutAtual);

    // Baixar o JSON já convertido
    const blob = new Blob([JSON.stringify(layoutAntigo, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${nomeCenario}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }
}
