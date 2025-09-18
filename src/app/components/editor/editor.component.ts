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
import { ListaVotacaoComponent } from '../lista-votacao/lista-votacao.component';
import { DescricaoReuniaoComponent } from '../descricao-reuniao/descricao-reuniao.component';
import { TituloReuniaoComponent } from '../titulo-reuniao/titulo-reuniao.component';
import { ContextMenuComponent } from '../context-menu/context-menu.component';
import { VotoItemComponent } from '../votacao-total/voto-item/voto-item.component';
import { LayoutExportService } from '../../services/layout-export.service';
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
import { MensagemComponent } from '../mensagem/mensagem.component';
import { TribunaComponent } from '../tribuna/tribuna.component';
import { ImagemStorageService } from '../../services/imagem-storage.service';
import { ResultadoVotacaoComponent } from '../resultado-votacao/resultado-votacao.component';
import { RelogioComponent } from '../relogio/relogio.component';

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
    MensagemComponent,
    TribunaComponent,
    ResultadoVotacaoComponent,
    RelogioComponent,
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

  isEditingMode = false;
  cenarioId: string | null = null;
  cenarioAtual: Cenario = {
    id: '',
    nome: '',
    targetWidth: 0,
    targetHeight: 0,
    backgroundImage: '',
    componentes: [],
    idPainel: '',
    slug: '',
    imagemFundoId: undefined,
  }

  votacaoMock = {
    sim: 10,
    nao: 5,
    absten: 2,
  };

  componentes = signal<ComponenteEditor[]>([]);
  mostrarControleVisibilidade = false;
  private routeSub: Subscription | undefined;

  private imagemFundoAtual: File | null = null;
   scale = 1;

  constructor(
    private layoutService: LayoutService,
    private route: ActivatedRoute,
    private layoutExport: LayoutExportService,
    private fonteService: FonteService,
    private renderer: Renderer2,
    private imagemStorageService: ImagemStorageService
  ) {}

  // @HostListener('window:resize')
  // onResize(): void {
  //   this.ajustarEscala();
  // }



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

  ngOnInit() {
    this.updateScale();

    this.routeSub = this.route.paramMap.subscribe((params) => {
      if (params.has('id')) {
        // MODO DE EDIÇÃO
        this.isEditingMode = true;
        this.cenarioId = params.get('id');
        console.log(`Modo de Edição. Carregando cenário: ${this.cenarioId}`);

        const cenarioCarregado = this.layoutService.carregarCenario(
          this.cenarioId!
        );
        if (cenarioCarregado) {
          this.cenarioAtual = cenarioCarregado;
        } else {
          alert('Cenário não encontrado! Redirecionando para um novo cenário.');
          this.router.navigate(['/editor']);
        }
      } else {
        this.isEditingMode = false;
        this.cenarioId = null;
        console.log('Modo cenário novo');
        this.cenarioAtual = this.montarLayoutInicial();
      }

      this.onItemChange();
      this.dispararAutosave();
    });
  }

    @HostListener('window:resize')
  onResize() {
    this.updateScale();
  }

  
  updateScale() {
    const baseWidth = 1660;
    const baseHeight = 1080;

    const scaleX = window.innerWidth / baseWidth;
    const scaleY = window.innerHeight / baseHeight;

    // pega o menor para caber na tela inteira
    this.scale = Math.min(scaleX, scaleY);
  }

  ngAfterViewInit(): void {
    // setTimeout(() => this.ajustarEscala(), 0);
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
    const componentesSemParlamentares = this.cenarioAtual.componentes.filter(
      (c) => c.tipo !== 'parlamentar'
    );

    const novosParlamentares = this.montarComponentesParlamentares(config);

    this.cenarioAtual.componentes = [
      ...componentesSemParlamentares,
      ...novosParlamentares,
    ];
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

  private gerarSlug(texto: string): string {
    return texto
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  private montarLayoutInicial(): Cenario {
    const larguraTela = 1660;
    const alturaTela = 1080;

    const larguraImagem = 650;
    const alturaImagem = 365;
    const xImagem = 850;
    const yImagem = 70;

    const espacamentoHorizontalBlocos = 85;
    const espacamentoInternoComponentes = 20;
    const espacamentoTemporizador = 42;

    const xBase = 235;

    const cabecalhoHeight = 50;
    const tituloHeight = 25;
    const subtituloHeight = 20;
    const descricaoHeight = 90;
    const totalizadoresHeight = 135;
    const statusReuniaoHeight = 220;

    const larguraVotacaoItem = 223;
    const alturaVotacaoItem = 30;

    let yAtualEsquerda = yImagem;

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
      y: yAtualEsquerda,
      width: xImagem - espacamentoHorizontalBlocos,
      height: cabecalhoHeight,
      visible: true,
    };
    yAtualEsquerda += cabecalho.height + espacamentoInternoComponentes;

    // Título
    const titulo: ComponenteEditor = {
      id: 'titulo',
      tipo: 'titulo',
      x: xBase,
      y: yAtualEsquerda,
      width: 420,
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
    yAtualEsquerda += titulo.height + espacamentoInternoComponentes;

    // Subtítulo
    const subtitulo: ComponenteEditor = {
      id: 'subtitulo',
      tipo: 'subtitulo',
      x: xBase,
      y: yAtualEsquerda,
      width: cabecalho.width,
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
    yAtualEsquerda += subtitulo.height + espacamentoInternoComponentes;

    // Descrição
    const descricao: ComponenteEditor = {
      id: 'descricao',
      tipo: 'descricao',
      x: cabecalho.x,
      y: yAtualEsquerda,
      width: 420,
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
    yAtualEsquerda += descricao.height + espacamentoInternoComponentes;

    // Totalizadores
    const totalizadores: ComponenteEditor = {
      id: 'totalizadores',
      tipo: 'totalizadores',
      x: xBase,
      y: yAtualEsquerda,
      width: 172,
      height: totalizadoresHeight,
      dados: this.votacaoMock,
      visible: true,
    };
    const relogioSistema: ComponenteEditor = {
      id: 'relogio-sistema',
      tipo: 'relogio',
      x: 573, // Posição X do antigo timer principal
      y: 456, // Posição Y do antigo timer principal
      width: 172,
      height: 35,
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

    const larguraStatusReuniao = 250; // Largura do bloco de status
    const xStatusReuniao = totalizadores.x + totalizadores.width + 150;

    const statusReuniao: ComponenteEditor = {
      id: 'status-reuniao',
      tipo: 'status-reuniao',
      x: xStatusReuniao,
      y: yAtualEsquerda,
      width: larguraStatusReuniao,
      height: statusReuniaoHeight,
      visible: true,
    };

    const baseXStatus = statusReuniao.x + 15;
    const baseYStatus = statusReuniao.y + 15;
    const larguraStatusItem = statusReuniao.width - 55;
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

    const statusAusentes: ComponenteEditor = {
      id: 'status-ausentes',
      tipo: 'status-item',
      x: baseXStatus,
      y: baseYStatus + (alturaStatusItem + espacoVerticalStatus) * 2,
      width: larguraStatusItem,
      height: alturaStatusItem,
      props: { label: 'AUSENTES', valor: 23 },
      visible: true,
    };

    const statusQuorum: ComponenteEditor = {
      id: 'status-quorum',
      tipo: 'status-item',
      x: baseXStatus,
      y: baseYStatus + (alturaStatusItem + espacoVerticalStatus) * 3,
      width: larguraStatusItem,
      height: alturaStatusItem,
      props: { label: 'QUORUM', valor: 13 },
      visible: false,
    };

    const statusLicenciados: ComponenteEditor = {
      id: 'status-licenciados',
      tipo: 'status-item',
      x: baseXStatus,
      y: baseYStatus + (alturaStatusItem + espacoVerticalStatus) * 4,
      width: larguraStatusItem,
      height: alturaStatusItem,
      props: { label: 'LICENCIADOS', valor: 0 },
      visible: false,
    };

    const statusObstrucao: ComponenteEditor = {
      id: 'status-obstrucao',
      tipo: 'status-item',
      x: baseXStatus,
      y: baseYStatus + (alturaStatusItem + espacoVerticalStatus) * 5,
      width: larguraStatusItem,
      height: alturaStatusItem,
      props: { label: 'OBSTRUÇÃO', valor: 0 },
      visible: false,
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
    ];

    const yTemporizadores =
      yAtualEsquerda +
      Math.max(totalizadores.height, statusReuniao.height) +
      30;

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

    const margemParlamentares = 200;
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
      posicaoX: 230,
      posicaoY: 700,
    };

    const mensagem: ComponenteEditor = {
      id: 'mensagem-principal',
      tipo: 'mensagem',
      x: 1200,
      y: 450,
      width: 300,
      height: 100,
      visible: true,
      dados: { texto: 'Mensagem em Tela' },
    };

    const tribuna: ComponenteEditor = {
      id: 'tribuna-principal',
      tipo: 'tribuna',
      x: 900,
      y: 465,
      width: 400,
      height: 150,
      visible: true,
      dados: {
        orador: 'Nome do Orador',
        partido: 'PARTIDO',
        materia: 'Tema em Discussão',
      },
    };

    const resultadoVotacao: ComponenteEditor = {
      id: 'resultado-votacao',
      tipo: 'resultado-votacao',
      x: 700,
      y: 600,
      width: 300,
      height: 100,
      visible: true,
      dados: { texto: 'Resultado da Votação' },
    };

    const parlamentares = this.montarComponentesParlamentares(defaultConfig);

    const componentesIniciais = [
      imagem,
      cabecalho,
      titulo,
      subtitulo,
      descricao,
      totalizadores,
      statusReuniao,
      statusPresentes,
      statusVotos,
      statusAusentes,
      statusQuorum,
      statusLicenciados,
      statusObstrucao,
      votacaoSim,
      votacaoNao,
      votacaoAbstencao,
      mensagem,
      tribuna,
      resultadoVotacao,
      ...temporizadores,
      ...parlamentares,
      relogioSistema
    ];

    const nomePadrao = 'Novo Cenário';
    const cenarioPadrao: Cenario = {
      id: `cenario_${Date.now()}`,
      nome: nomePadrao,
      targetWidth: larguraTela,
      targetHeight: alturaTela,
      backgroundImage: '',
      componentes: componentesIniciais,
      idPainel: '15',
      slug: this.gerarSlug(nomePadrao),
    };

    return cenarioPadrao;
  }

  private montarComponentesParlamentares(
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

    return parlamentaresDeExemplo.map((parlamentar, i) => {
      const colunaAtual = Math.floor(i / itensPorColuna);
      const linhaAtual = i % itensPorColuna;

      const posX =
        config.posicaoX +
        colunaAtual * (larguraItem + config.espacamentoHorizontal);

      const posY =
        config.posicaoY +
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
    const nomeCenario = prompt(
      'Digite um nome para o cenário:',
      this.cenarioAtual.nome || 'novo-cenario'
    );

    if (!nomeCenario) {
      return;
    }

    this.cenarioAtual.nome = nomeCenario;

    this.cenarioAtual.slug = this.gerarSlug(nomeCenario);

    if (this.imagemFundoAtual) {
      if (!this.cenarioAtual.id) {
        this.cenarioAtual.id = `cenario_${Date.now()}`;
      }

      this.cenarioAtual.imagemFundoId = this.cenarioAtual.id;

      try {
        console.log(`Salvando imagem com ID: ${this.cenarioAtual.id}`);
        await this.imagemStorageService.salvarImagem(
          this.cenarioAtual.id,
          this.imagemFundoAtual
        );
        this.imagemFundoAtual = null;
      } catch (err) {
        console.error('Falha ao salvar a imagem de fundo:', err);
        alert(
          'Ocorreu um erro grave ao salvar a imagem de fundo. O cenário será salvo sem ela.'
        );
        delete this.cenarioAtual.imagemFundoId;
      }
    }

    if (this.isEditingMode) {
      try {
        this.layoutService.salvarCenario(this.cenarioAtual);
        alert(`Cenário "${nomeCenario}" atualizado com sucesso!`);
      } catch (error) {
        console.error('Falha ao atualizar o cenário:', error);
        alert('Ocorreu um erro ao atualizar o cenário.');
      }
    } else {
      try {
        // A APIdeve gerar o ID e nos retornar
        const novoId = `cenario_${Date.now()}`;
        this.cenarioAtual.id = novoId;

        this.layoutService.salvarCenario(this.cenarioAtual);

        alert(`Cenário "${nomeCenario}" salvo com sucesso!`);

        this.router.navigate(['/editor', this.cenarioAtual.slug]);
      } catch (error) {
        console.error('Falha grave ao salvar o cenário:', error);
        alert('Ocorreu um erro ao salvar o cenário.');
      }
    }
  }

  private dispararAutosave(): void {
    this.componentes.set(this.cenarioAtual.componentes);
    this.onItemChange();
  }
}
