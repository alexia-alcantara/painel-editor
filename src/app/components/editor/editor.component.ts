import { Subscription } from 'rxjs';
import {
  Component,
  ElementRef,
  inject,
  signal,
  ViewChild,
  AfterViewInit,
  OnInit,
  OnDestroy,
  Renderer2,
  HostListener,
} from '@angular/core';
import { ComponenteEditor } from '../../models/components.model';
import { LayoutService } from '../../services/layout.service';
import { CommonModule } from '@angular/common';
import { HeaderReuniaoComponent } from '../header-reuniao/header-reuniao.component';
import { ActivatedRoute, Router } from '@angular/router';

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
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { VotoItemComponent } from '../votacao-total/voto-item/voto-item.component';
import { LayoutExportService } from '../../services/layout-export.service';
import saveAs from 'file-saver';
import { ComponenteTipo, FontConfig } from '../../models/fontes.model';
import { DistribuirConfig } from '../../dialogs/distribuir-parlamentares/distribuir-parlamentares.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ControleVisibilidadeComponent } from '../../controle-visibilidade/controle-visibilidade.component';
import { MatIconModule } from '@angular/material/icon';
import { Cenario } from '../../models/cenario.model';
import { FormsModule } from '@angular/forms';
import { FonteService } from '../../services/fonte.service';
import { StatusItemComponent } from '../status-reuniao/status-item/status-item.component';
import { SubtituloReuniaoComponent } from '../subtitulo-reuniao/subtitulo-reuniao.component';

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
    StatusItemComponent,
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('editorWrapper', { static: true }) editorWrapperRef!: ElementRef;
  @ViewChild(ContextMenuComponent)
  contextMenu!: ContextMenuComponent;

  modoEditor = false;
  router = inject(Router);
  layout: ComponenteEditor[] = [];

  votacaoMock = {
    sim: 10,
    nao: 5,
    absten: 2,
  };

  componentes = signal<ComponenteEditor[]>([]);
  mostrarControleVisibilidade = false;

  cenarioAtual: Cenario = {
    id: `cenario_${Date.now()}`,
    nome: 'Novo Cenário',
    targetWidth: 1920,
    targetHeight: 1080,
    backgroundImage: '',
    componentes: [],
  };

  constructor(
    private layoutService: LayoutService,
    private route: ActivatedRoute,
    private layoutExport: LayoutExportService,
    private fonteService: FonteService,
    private renderer: Renderer2,
    private hostElement: ElementRef
  ) {}

  @HostListener('window:resize')
  onResize(): void {
    this.ajustarEscala();
  }

  private ajustarEscala(): void {
    const wrapperRef = this.editorWrapperRef;
    if (!wrapperRef || !this.cenarioAtual) {
      return;
    }

    const container = wrapperRef.nativeElement.parentElement;
    const target = wrapperRef.nativeElement;

    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const targetWidth = this.cenarioAtual.targetWidth;
    const targetHeight = this.cenarioAtual.targetHeight;

    const scaleX = (containerWidth * 1.1) / targetWidth;
    const scaleY = (containerHeight * 1.1) / targetHeight;

    const scale = Math.min(scaleX, scaleY);

    this.renderer.setStyle(target, 'transform', `scale(${scale})`);
    this.renderer.setStyle(target, 'transform-origin', 'top left');
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;

        this.cenarioAtual.backgroundImage = base64Image;

        localStorage.setItem('bg_temporary', base64Image);

        input.value = '';
      };
      reader.readAsDataURL(file);
    }
  }

  onComponentVisibilityChange(event: { id: string; visivel: boolean }) {
    const compIndex = this.cenarioAtual.componentes.findIndex(
      (c) => c.id === event.id
    );

    if (compIndex > -1) {
      this.cenarioAtual.componentes[compIndex].visible = event.visivel;
      this.cenarioAtual.componentes = [...this.cenarioAtual.componentes];
    }
  }

  private routeSub: Subscription | undefined;

  ngOnInit() {
    this.routeSub = this.route.params.subscribe((params) => {
      const idDoCenario = params['id'];
      let cenarioCarregado = null;
      if (idDoCenario) {
        cenarioCarregado = this.layoutService.carregarCenario(idDoCenario);
      }

      if (cenarioCarregado) {
        this.cenarioAtual = cenarioCarregado;
      } else {
        this.cenarioAtual = this.montarLayoutInicial();
        if (idDoCenario) {
          this.cenarioAtual.id = idDoCenario;
        }
      }
      this.onItemChange();

      const imagemTemporaria = localStorage.getItem('bg_temporary');
      if (imagemTemporaria && !this.cenarioAtual.backgroundImage) {
        console.log('Imagem de fundo encontrada. Aplicando...');
        this.cenarioAtual.backgroundImage = imagemTemporaria;
      }
      this.dispararAutosave();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.ajustarEscala(), 0);
  }

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
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
          const tempParlamentaresMock = Array.from({ length: 24 }, (_, i) => ({
            nome: `Parlamentar ${i + 1}`,
            partido: 'PART',
            voto: '-',
          }));
          layoutFinal = this.layoutExport.converterDoFormatoOriginal(
            event.data,
            tempParlamentaresMock,
            this.votacaoMock
          );
        }
        this.cenarioAtual.componentes = layoutFinal;
        this.layoutService.salvarLayoutAtual(this.cenarioAtual);
        break;
    }
  }

  onFontSelected(event: {
    tipo: ComponenteTipo;
    subId: string;
    font: FontConfig;
  }) {
    this.fonteService.updateFonte(event.tipo, event.subId, event.font);
  }

  redistribuirParlamentares(config: DistribuirConfig) {
    const componentesAtuais = this.cenarioAtual.componentes;
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
    this.cenarioAtual.componentes = layoutFinal;

    this.dispararAutosave();
  }

  onDragEnd(event: CdkDragEnd, itemArrastado: ComponenteEditor) {
    const novaPosicao = event.source.getFreeDragPosition();

    console.log(
      `[DRAG END] Item: ${itemArrastado.id}, Nova Posição: X=${Math.round(
        novaPosicao.x
      )}, Y=${Math.round(novaPosicao.y)}`
    );

    const index = this.cenarioAtual.componentes.findIndex(
      (c) => c.id === itemArrastado.id
    );
    if (index !== -1) {
      this.cenarioAtual.componentes[index].x = Math.round(novaPosicao.x);
      this.cenarioAtual.componentes[index].y = Math.round(novaPosicao.y);
      this.cenarioAtual.componentes = [...this.cenarioAtual.componentes];
      this.dispararAutosave();
    }
  }

  onRightClick(event: MouseEvent, component: ComponenteEditor) {
    event.preventDefault();

    if (this.contextMenu) {
      this.contextMenu.open(event, component, this.componentes());
    }
  }

  private montarLayoutInicial(): Cenario {
    const larguraImagem = 650;
    const alturaImagem = 365;
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
      weight: 'normal',
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
      dados: { texto: 'Título da Reunião' },
      fontes: [
        {
          subId: 'titulo-texto',
          label: 'Título da Reunião',
          font: { ...defaultFont, size: 24, weight: 'bold' }, // Fonte padrão para o título
        },
      ],
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
      dados: { texto: 'Subtítulo da Reunião' },
      fontes: [
        {
          subId: 'subtitulo-texto',
          label: 'Subtítulo da Reunião',
          font: { ...defaultFont, size: 18, weight: 'normal' },
        },
      ],
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
      dados: { texto: 'Status da Reunião' },
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

    // Totalizadores
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

    const baseXStatus = statusReuniao.x + 15;
    const baseYStatus = statusReuniao.y + 15;
    const larguraStatusItem = statusReuniao.width - 30;
    const alturaStatusItem = 25;
    const espacoVerticalStatus = 10;

    //item Presentes
    const statusPresentes: ComponenteEditor = {
      id: 'status-presentes',
      tipo: 'status-item',
      x: baseXStatus,
      y: baseYStatus,
      width: larguraStatusItem,
      height: alturaStatusItem,
      props: { label: 'PRESENTES', valor: 26 },
      visible: true,
    };

    const statusVotos: ComponenteEditor = {
      id: 'status-votos',
      tipo: 'status-item',
      x: baseXStatus,
      y: baseYStatus + alturaStatusItem + espacoVerticalStatus,
      width: larguraStatusItem,
      height: alturaStatusItem,
      props: { label: 'VOTOS', valor: 21 },
      visible: true,
    };

    // Temporizadores
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

    const componentesIniciais = [
      imagem,
      cabecalho,
      titulo,
      subtitulo,
      descricao,
      totalizadores,
      // votacaoTotal,
      statusReuniao,
      statusPresentes,
      statusVotos,

      votacaoSim,
      votacaoNao,
      votacaoAbstencao,
      ...temporizadores,
      ...parlamentares,
    ];

    const cenarioPadrao: Cenario = {
      id: `cenario_${Date.now()}`,
      nome: 'Novo Cenário',
      targetWidth: 1920,
      targetHeight: 1080,
      backgroundImage: '',
      componentes: componentesIniciais,
    };

    return cenarioPadrao;
  }

  private montarComponentesParlamentares(
    yBase: number = 480,
    config: DistribuirConfig
  ): ComponenteEditor[] {
    const itensPorColuna = config.qtdePorColuna > 0 ? config.qtdePorColuna : 1;
    const totalDeParlamentares = config.qntTotal;

    const parlamentaresDeExemplo = Array.from(
      { length: totalDeParlamentares },
      (_, i) => ({
        nome: `Parlamentar ${i + 1}`,
        partido: 'PART',
        voto: '-',
      })
    );

    if (parlamentaresDeExemplo.length === 0) {
      return [];
    }

    const larguraItem = 608;
    const alturaItem = 20;
    const xBase = 234;

    return parlamentaresDeExemplo.map((parlamentar, i) => {
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

  onItemChange() {
    this.layoutService.salvarLayoutAtual(this.cenarioAtual);
  }

  async salvar() {
    const idDoCenarioNaUrl = this.route.snapshot.paramMap.get('id');
    if (!idDoCenarioNaUrl) {
      alert('ERRO: Não foi possível identificar o ID do cenário na URL.');
      return;
    }

    const nomeCenario = prompt(
      'Digite um nome para o cenário:',
      this.cenarioAtual.nome || 'novo-cenario'
    );

    if (!nomeCenario) {
      return; // Usuário cancelou
    }

    // --- INÍCIO DA CORREÇÃO ---

    // 1. Cria uma CÓPIA PROFUNDA e 100% independente do estado atual.
    //    Nenhum processo "fantasma" pode alterar este clone.
    const cenarioParaSalvar = structuredClone(this.cenarioAtual);

    // 2. Atualiza a ID e o nome no clone, não no objeto original.
    cenarioParaSalvar.id = idDoCenarioNaUrl;
    cenarioParaSalvar.nome = nomeCenario;

    // --- FIM DA CORREÇÃO ---

    try {
      // 3. Passa a cópia segura e imutável para o serviço.
      this.layoutService.salvarCenario(cenarioParaSalvar);

      // 4. LÓGICA DE DOWNLOAD RESTAURADA
      const layoutParaExportar = this.layoutExport.converterParaFormatoOriginal(
        cenarioParaSalvar.componentes
      );
      const blob = new Blob([JSON.stringify(layoutParaExportar, null, 2)], {
        type: 'application/json',
      });
      saveAs(blob, `${nomeCenario}.json`); // Pede para o usuário salvar o arquivo

      alert(`Cenário "${nomeCenario}" salvo com sucesso!`);
    } catch (error) {
      console.error('Falha grave ao salvar o cenário:', error);
      alert('Ocorreu um erro ao salvar o cenário.');
    }
  }

  private dispararAutosave(): void {
    this.componentes.set(this.cenarioAtual.componentes);
    this.onItemChange();
  }
}
