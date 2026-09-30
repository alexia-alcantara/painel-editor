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
import { ImagemStorageService } from '../../services/imagem-storage.service';
import { ResultadoVotacaoComponent } from '../resultado-votacao/resultado-votacao.component';
import { RelogioComponent } from '../relogio/relogio.component';
import { OradorComponent } from '../orador/orador.component';
import { MateriaComponent } from '../materia/materia.component';
import { PartidoComponent } from '../partido/partido.component';

import { PainelService } from '../../services/painel.service';
import { CampoTextoComponent } from '../campo-texto/campo-texto.component';

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
    OradorComponent,
    MateriaComponent,
    PartidoComponent,
    ResultadoVotacaoComponent,
    RelogioComponent,
    CampoTextoComponent
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('editorWrapper', { static: true }) editorWrapperRef!: ElementRef;
  @ViewChild(ContextMenuComponent)
  contextMenu!: ContextMenuComponent;
  private ultimoEstadoJson: string = '';

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
  };

  votacaoMock = {
    sim: 10,
    nao: 5,
    absten: 2,
  };

  componentes = signal<ComponenteEditor[]>([]);
  mostrarControleVisibilidade = false;
  mostrarBlocosOcultos = true;
  private routeSub: Subscription | undefined;

  private imagemFundoAtual: File | null = null;
  scale = 1;

  private atualizacaoSubscription: Subscription | undefined;
   listaPaineis: any[] = [];

  constructor(
    private layoutService: LayoutService,
    private route: ActivatedRoute,
    private layoutExport: LayoutExportService,
    private fonteService: FonteService,
    private renderer: Renderer2,
    private imagemStorageService: ImagemStorageService,
    private painelService: PainelService,
  ) {}

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

  onComponentVisibilityChange(event: { ids: string[]; visivel: boolean }) {
    const idsParaMudar = new Set(event.ids);

    this.cenarioAtual.componentes.forEach((c) => {
      if (idsParaMudar.has(c.id)) c.ocultoNoEditor = !event.visivel;
    });
    this.cenarioAtual.componentes = [...this.cenarioAtual.componentes];
  }
  ngOnInit() {
    this.updateScale();

    this.routeSub = this.route.paramMap.subscribe((params) => {
      if (params.has('id')) {
        // MODO DE EDIÇÃO
        this.isEditingMode = true;
        this.cenarioId = params.get('id');
        console.log(`Modo de Edição. Carregando cenário: ${this.cenarioId}`);

        this.layoutService
          .carregarCenario(this.cenarioId!)
          .subscribe((cenarioCarregado) => {
            if (cenarioCarregado) {
              this.cenarioAtual = cenarioCarregado;
              this.prepararCenarioParaEdicao(this.cenarioAtual);
              this.fonteService.carregarGrupos(cenarioCarregado.fontes);
            } else {
              alert(
                'Cenário não encontrado! Redirecionando para um novo cenário.',
              );
              this.router.navigate(['/editor']);
              return;
            }

            this.onItemChange();
            this.dispararAutosave();
            this.carregarListaPaineis();
          });
      } else {
        this.isEditingMode = false;
        this.cenarioId = null;
        console.log('Modo cenário novo');
        this.cenarioAtual = this.montarLayoutInicial();
        this.fonteService.carregarGrupos(this.cenarioAtual.fontes);

        this.onItemChange();
        this.dispararAutosave();
        this.carregarListaPaineis();
      }
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.updateScale();
  }

  onIpChanged(): void {
    // O editor não busca mais dados ao vivo — isso só acontece no /display.
  }

  carregarListaPaineis() {
    this.painelService.listarPaineis().subscribe({
      next: (lista) => {
        // Se a API responder, atualiza com a lista completa e real.
        if (lista && lista.length > 0) {
          this.listaPaineis = lista.map((item: any) => ({
            nome: item.nome,
            identificador: item.periferico?.endereco,
            ambiente: item.periferico?.ambiente?.nome,
          }));
        }
      },
      error: (err) => {
        // Se der erro (CORS/Bloqueio), não faz nada.
        console.warn(
          'Não foi possível carregar a lista automática. Usando manual.',
        );
      },
    });
  }

  iniciarAtualizacaoAutomatica(): void {
    const frequenciaMs = 2000;

    const ipDaUrl = this.route.snapshot.queryParamMap.get('ip');

    const cenario =
      (this as any).cenario ||
      (this as any).cenarioParaExibir ||
      (this as any).cenarioAtual;
    const ipDoCenario = cenario?.idPainel;

    const ipParaConectar = ipDaUrl || ipDoCenario;

    if (!ipParaConectar) return;

    console.log(`Conectando ao painel modo editor: ${ipParaConectar}...`);
    if (this.atualizacaoSubscription) {
      this.atualizacaoSubscription.unsubscribe();
    }

    console.log(`Conectando ao painel (Modo Editor): ${ipParaConectar}...`);

    this.atualizacaoSubscription = this.painelService
      .getDadosPainelEmTempoReal(ipParaConectar, frequenciaMs)
      .subscribe({
        next: (dadosDaApi) => {
          if (!dadosDaApi) return;

          const payload = dadosDaApi as any;
          const dadosReais = payload.valor ? payload.valor : payload;

          const estadoAtualJson = JSON.stringify(dadosReais);

          if (this.ultimoEstadoJson === estadoAtualJson) {
            return;
          }

          this.ultimoEstadoJson = estadoAtualJson;

          console.log('Dados mudaram! Recebido no Editor:', dadosReais);
          this.atualizarDadosNaTela(dadosReais);
        },
        error: (err) => console.error('Erro na conexão do Editor:', err),
      });
  }

  private atualizarDadosNaTela(dadosApi: any) {
    if (!dadosApi) return;

    // No editor a API só serve para pré-visualizar textos reais.
    // A visibilidade (`visible`) é decisão de quem monta o cenário e NÃO é alterada aqui;
    // quem esconde o que não se aplica em cada momento é o display, em tempo real.
    const achar = (tipo: string) =>
      this.cenarioAtual.componentes.find((c) => c.tipo === tipo);

    const componenteTitulo = this.cenarioAtual.componentes.find(
      (c) => c.tipo === 'titulo' && c.id !== 'data-atual',
    );
    if (componenteTitulo) {
      componenteTitulo.dados = {
        ...componenteTitulo.dados,
        texto: dadosApi.nomeReuniao || dadosApi.nomeCliente || 'Sem Título',
      };
    }

    const componenteSubtitulo = achar('subtitulo');
    if (componenteSubtitulo) {
      componenteSubtitulo.dados = {
        ...componenteSubtitulo.dados,
        texto:
          dadosApi.votacao?.nome ||
          dadosApi.categoriaReuniao ||
          componenteSubtitulo.dados?.texto ||
          '',
      };
    }

    const componenteDescricao = achar('descricao');
    if (componenteDescricao) {
      const texto = dadosApi.votacao?.ementa || dadosApi.statusReuniao;
      if (texto) {
        componenteDescricao.dados = { ...componenteDescricao.dados, texto };
      }
    }

    if (dadosApi.tribuna) {
      const tribuna = dadosApi.tribuna;

      const componenteOrador = achar('orador');
      if (componenteOrador) {
        componenteOrador.dados = {
          ...componenteOrador.dados,
          orador: tribuna.nomeParlamentar || tribuna.nome || tribuna.orador,
          partido: tribuna.partido,
        };
      }

      const componentePartido = achar('partido');
      if (componentePartido && tribuna.partido) {
        componentePartido.dados = {
          ...componentePartido.dados,
          partido: tribuna.partido,
        };
      }

      const componenteMateria = achar('materia');
      if (componenteMateria) {
        componenteMateria.dados = {
          ...componenteMateria.dados,
          materia: tribuna.materia || componenteMateria.dados?.materia,
          ementa: dadosApi.votacao?.ementa || '',
        };
      }
    }

    // Mesma leitura do display: a API pode mandar `presencas` como objeto único (não só lista)
    const membros = this.extrairMembros(dadosApi);
    if (membros.length > 0) {
      const componentesParlamentar = this.cenarioAtual.componentes.filter(
        (c) => c.tipo === 'parlamentar',
      );

      componentesParlamentar.forEach((comp, index) => {
        const membro = membros[index];
        const dadosReais = membro?.titular || membro;

        // Slots além do total real continuam mostrando o exemplo, para o layout seguir visível
        if (dadosReais && dadosReais.nome) {
          comp.dados = {
            ...comp.dados,
            nome: dadosReais.nome,
            partido: dadosReais.partido,
            voto: dadosReais.voto,
          };
        }
      });
    }

    // Atualiza a tela
    this.cenarioAtual.componentes = [...this.cenarioAtual.componentes];
    this.componentes.set(this.cenarioAtual.componentes);
  }

  /** Lista de membros vinda da API, aceitando as variações de formato que o display já trata. */
  private extrairMembros(dadosApi: any): any[] {
    const pData = dadosApi?.parlamentares;
    if (!pData) return [];

    let cursor = pData.presencas;
    if (Array.isArray(cursor)) cursor = cursor[0];
    if (cursor && cursor.presencas) cursor = cursor.presencas;
    if (!cursor || !cursor.membros) return [];

    let lista = cursor.membros;
    if (lista.membros) lista = lista.membros;
    return Array.isArray(lista) ? lista : [lista];
  }

  updateScale() {
    const baseWidth = 1660;
    const baseHeight = 1080;

    const scaleX = window.innerWidth / baseWidth;
    const scaleY = window.innerHeight / baseHeight;

    // pega o menor para caber na tela inteira
    this.scale = Math.min(scaleX, scaleY);
  }

  ngAfterViewInit(): void {}

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

      case 'toggleVisible': {
        const comp = event.component;
        if (comp) {
          comp.visible = event.data.visible;
          // Ao mudar a visibilidade final, garante que o bloco continue aparecendo no editor
          comp.ocultoNoEditor = false;
          this.cenarioAtual.componentes = [...this.cenarioAtual.componentes];
          this.dispararAutosave();
        }
        break;
      }

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
            this.votacaoMock,
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
      (c) => c.tipo !== 'parlamentar',
    );

    // Se a configuração não informar o tamanho do item, mantém o dos parlamentares atuais
    const atual = this.cenarioAtual.componentes.find(
      (c) => c.tipo === 'parlamentar',
    );
    const novosParlamentares = this.montarComponentesParlamentares({
      ...config,
      larguraItem: config.larguraItem ?? atual?.width,
      alturaItem: config.alturaItem ?? atual?.height,
    });

    this.cenarioAtual.componentes = [
      ...componentesSemParlamentares,
      ...novosParlamentares,
    ];
    this.dispararAutosave();
  }

  onDragEnd(event: CdkDragEnd, itemArrastado: ComponenteEditor) {
    const novaPosicao = event.source.getFreeDragPosition();

    console.log(
      `Item: ${itemArrastado.id}, Nova Posição: X=${Math.round(
        novaPosicao.x,
      )}, Y=${Math.round(novaPosicao.y)}`,
    );

    const index = this.cenarioAtual.componentes.findIndex(
      (c) => c.id === itemArrastado.id,
    );
    if (index !== -1) {
      this.cenarioAtual.componentes[index].x = Math.round(novaPosicao.x);
      this.cenarioAtual.componentes[index].y = Math.round(novaPosicao.y);
      this.cenarioAtual.componentes = [...this.cenarioAtual.componentes];
      this.dispararAutosave();
    }
  }

  private redimensionando: {
    item: ComponenteEditor;
    x0: number;
    y0: number;
    largura0: number;
    altura0: number;
  } | null = null;

  iniciarRedimensionar(event: MouseEvent, item: ComponenteEditor): void {
    event.stopPropagation(); // não deixa o arrastar (cdkDrag) começar
    event.preventDefault();
    this.redimensionando = {
      item,
      x0: event.clientX,
      y0: event.clientY,
      largura0: item.width,
      altura0: item.height,
    };
  }

  @HostListener('document:mousemove', ['$event'])
  aoMoverMouse(event: MouseEvent): void {
    const r = this.redimensionando;
    if (!r) return;

    // Não deixa passar da borda do cenário
    const larguraMax = this.cenarioAtual.targetWidth - r.item.x;
    const alturaMax = this.cenarioAtual.targetHeight - r.item.y;

    r.item.width = Math.min(
      Math.max(20, Math.round(r.largura0 + (event.clientX - r.x0))),
      larguraMax,
    );
    r.item.height = Math.min(
      Math.max(20, Math.round(r.altura0 + (event.clientY - r.y0))),
      alturaMax,
    );
  }

  @HostListener('document:mouseup')
  aoSoltarMouse(): void {
    if (!this.redimensionando) return;
    this.redimensionando = null;
    this.cenarioAtual.componentes = [...this.cenarioAtual.componentes];
    this.dispararAutosave();
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
    const larguraTela = 1920;
    const alturaTela = 1080;

    const corVerde = '#00FF00';
    const corVermelha = '#FF0000';
    const corAmarela = '#FFFF00';

    const xTexto = 36;
    const wTexto = 863;

    const xTabela = 29;
    const wTabela = 486;
    const hLinha = 90;
    const yLinhas = [667, 761, 854, 949];

    const texto = (
      id: string,
      tipo: ComponenteEditor['tipo'],
      y: number,
      height: number,
      visible: boolean,
      dados: any,
    ): ComponenteEditor => ({
      id,
      tipo,
      x: xTexto,
      y,
      width: wTexto,
      height,
      visible,
      dados,
    });

    const linhaTabela = (
      id: string,
      tipo: 'votacao-item' | 'status-item',
      linha: number,
      label: string,
      cor: string,
      visible: boolean,
    ): ComponenteEditor => ({
      id,
      tipo,
      x: xTabela,
      y: yLinhas[linha],
      width: wTabela,
      height: hLinha,
      visible,
      props: { label, valor: 0, cor },
    });

    const componentes: ComponenteEditor[] = [
      texto('titulo', 'titulo', 257, 72, true, { texto: 'Nome da Reunião' }),
      texto('subtitulo', 'subtitulo', 331, 64, true, {
        texto: 'Matéria em Votação',
      }),
      texto('descricao', 'descricao', 396, 197, true, {
        texto:
          'Ementa da matéria em votação. Este texto é só um exemplo para o editor.',
      }),
      texto('resultado-votacao', 'resultado-votacao', 594, 70, true, {
        texto: 'Resultado da Votação',
      }),

      linhaTabela('voto-sim', 'votacao-item', 0, 'SIM', corVerde, true),
      linhaTabela('voto-nao', 'votacao-item', 1, 'NÃO', corVermelha, true),
      linhaTabela(
        'voto-abstencao',
        'votacao-item',
        2,
        'ABSTENÇÃO',
        corAmarela,
        true,
      ),
      linhaTabela(
        'status-presentes',
        'status-item',
        3,
        'PRESENTES',
        '#FFFFFF',
        true,
      ),

      {
        id: 'temporizador-1',
        tipo: 'temporizador-item',
        x: 598,
        y: 718,
        width: 250,
        height: 86,
        props: { cronometro: 1 },
        visible: true,
      },
      {
        id: 'temporizador-2',
        tipo: 'temporizador-item',
        x: 598,
        y: 816,
        width: 250,
        height: 86,
        props: { cronometro: 2 },
        visible: true,
      },
            {
        id: 'temporizador-3',
        tipo: 'temporizador-item',
        x: 340,
        y: 718,
        width: 250,
        height: 86,
        props: { cronometro: 3 },
        visible: false,
      },
      {
        id: 'temporizador-4',
        tipo: 'temporizador-item',
        x: 340,
        y: 816,
        width: 250,
        height: 86,
        props: { cronometro: 4 },
        visible: false,
      },
      {
        id: 'relogio-sistema',
        tipo: 'relogio',
        x: 598,
        y: 917,
        width: 250,
        height: 86,
        visible: true,
      },


      linhaTabela('status-votos', 'status-item', 0, 'VOTOS', '#FFFFFF', false),
      linhaTabela(
        'status-ausentes',
        'status-item',
        1,
        'AUSENTES',
        '#FFFFFF',
        false,
      ),
      linhaTabela(
        'status-licenciados',
        'status-item',
        2,
        'LICENCIADOS',
        '#FFFFFF',
        false,
      ),
      linhaTabela(
        'status-quorum',
        'status-item',
        3,
        'QUORUM',
        '#FFFFFF',
        false,
      ),
      linhaTabela(
        'status-obstrucao',
        'status-item',
        3,
        'OBSTRUÇÃO',
        '#FFFFFF',
        false,
      ),
      linhaTabela('status-parlamentares', 'status-item', 0, 'PARLAMENTARES', '#FFFFFF', false),
      linhaTabela('status-extras', 'status-item', 1, 'EXTRA', '#389cc7', false),
      linhaTabela('status-presencas-locais', 'status-item', 2, 'PLENÁRIO', '#FFFFFF', false),
      linhaTabela('status-presencas-web', 'status-item', 3, 'VIRTUAL', '#FFFFFF', false),
      linhaTabela('voto-branco', 'votacao-item', 2, 'BRANCO', '#FFFFFF', false),
      { id: 'turno-votacao-principal', tipo: 'turno-votacao', x: xTexto, y: 675, width: wTexto,
        height: 50, visible: false, dados: { texto: '1º Turno' } },
      { id: 'modo-votacao-principal', tipo: 'modo-votacao', x: xTexto, y: 735, width: wTexto,
        height: 50, visible: false, dados: { texto: 'Modo de Votação' } },
      { id: 'parametro-votacao-principal', tipo: 'parametro-votacao', x: xTexto, y: 795, width: wTexto,
        height: 50, visible: false, dados: { texto: 'Parâmetro de Votação' } },
      { id: 'categoria-reuniao-principal', tipo: 'categoria-reuniao', x: xTexto, y: 855, width: wTexto,
        height: 50, visible: false, dados: { texto: 'Categoria da Reunião' } },

      texto('orador-principal', 'orador', 331, 64, false, {
        orador: 'Nome do Orador',
      }),
      texto('partido-principal', 'partido', 395, 40, false, {
        partido: 'PARTIDO',
      }),
      texto('materia-principal', 'materia', 440, 150, false, {
        materia: 'Tema em Discussão',
      }),

      texto('mensagem-principal', 'mensagem', 594, 70, false, {
        texto: 'Mensagem',
      }),
      {
        id: 'data-atual',
        tipo: 'titulo',
        x: 640,
        y: 200,
        width: 259,
        height: 50,
        visible: false,
        dados: { texto: 'DD/MM/AAAA' },
      },

      {
        id: 'cabecalho',
        tipo: 'cabecalho',
        x: xTexto,
        y: 60,
        width: 480,
        height: 60,
        visible: false,
      },
    ];

    componentes.push({
      id: 'autor-principal',
      tipo: 'autor',
      x: xTexto,
      y: 915,
      width: wTexto,
      height: 50,
      visible: false,
      dados: { texto: 'Autor' },
    });


  
    const parlamentares = this.montarComponentesParlamentares({
      qtdePorColuna: 14,
      qntTotal: 14,
      espacamentoVertical: 10,
      espacamentoHorizontal: 10,
      margemSuperior: 0,
      margemEsquerda: 0,
      exibirDe: 0,
      exibirAte: 0,
      offsetInicial: 0,
      posicaoX: 920,
      posicaoY: 20,
      larguraItem: 940,
      alturaItem: 65,
    });

    const nomePadrao = 'Cenário Padrão Visual';
    return {
      id: `cenario_${Date.now()}`,
      nome: nomePadrao,
      targetWidth: larguraTela,
      targetHeight: alturaTela,
      backgroundImage: '',
      componentes: [...componentes, ...parlamentares],
      idPainel: '',
      slug: this.gerarSlug(nomePadrao),
      fontes: this.fonteService.obterGruposPadraoVisual(),
      opcoes: { nomeNaCorDoVoto: false, fundoParlamentares: true },
    };
  }

  private prepararCenarioParaEdicao(cenario: Cenario): void {
    const padrao = this.montarLayoutInicial();
    const idsExistentes = new Set(cenario.componentes.map((c) => c.id));

    const faltando = padrao.componentes.filter(
      (c) => c.tipo !== 'parlamentar' && !idsExistentes.has(c.id),
    );
    faltando.forEach((c) => (c.visible = false));

    cenario.componentes = [...cenario.componentes, ...faltando];
    cenario.componentes.forEach((c) => (c.ocultoNoEditor = false));

    cenario.opcoes = {
      nomeNaCorDoVoto: cenario.opcoes?.nomeNaCorDoVoto ?? false,
      fundoParlamentares: cenario.opcoes?.fundoParlamentares ?? true,
    };
  }

  numeroCronometro(item: ComponenteEditor): number {
    return TemporizadorItemComponent.numeroDoComponente(item);
  }

  alterarOpcao(chave: 'nomeNaCorDoVoto' | 'fundoParlamentares', valor: boolean): void {
    this.cenarioAtual.opcoes = { ...this.cenarioAtual.opcoes, [chave]: valor };
    this.dispararAutosave();
  }

  private montarComponentesParlamentares(
    config: DistribuirConfig,
  ): ComponenteEditor[] {
    const itensPorColuna = config.qtdePorColuna > 0 ? config.qtdePorColuna : 1;
    const totalDeParlamentares = config.qntTotal;

    const parlamentaresDeExemplo = Array.from(
      { length: totalDeParlamentares },
      (_, i) => ({
        nome: `Parlamentar ${i + 1}`,
        partido: 'PART',
        voto: '-',
        letra: 'S',
        corVoto: '#00FF00',
        presenca: 'PRESENTE',
      }),
    );

    if (parlamentaresDeExemplo.length === 0) {
      return [];
    }

    const larguraItem = config.larguraItem ?? 608;
    const alturaItem = config.alturaItem ?? 20;

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
    console.log(
      '%c[SALVAR] Método iniciado',
      'color: cyan; font-weight: bold;',
    );

    const nomeCenario = prompt(
      'Digite um nome para o cenário:',
      this.cenarioAtual.nome || 'novo-cenario',
    );

    console.log('[SALVAR] Nome digitado:', nomeCenario);

    if (!nomeCenario) {
      console.log('[SALVAR] Nome vazio, abortando.');
      return;
    }

    this.cenarioAtual.nome = nomeCenario;
    // Guarda as fontes junto do cenário, para o display usar as mesmas do editor
    this.cenarioAtual.fontes = structuredClone(this.fonteService.grupos());

    this.cenarioAtual.slug = this.gerarSlug(nomeCenario);

    if (!this.cenarioAtual.id) {
      this.cenarioAtual.id = `cenario_${Date.now()}`;
    }

    console.log(
      '[SALVAR] Prosseguindo, isEditingMode:',
      this.isEditingMode,
      'imagemFundoAtual:',
      this.imagemFundoAtual,
    );

    if (this.imagemFundoAtual) {
      try {
        console.log(`Salvando imagem de fundo: ${this.imagemFundoAtual.name}`);
        const idImagem = await new Promise<number>((resolve, reject) => {
          this.imagemStorageService
            .salvarImagem(this.imagemFundoAtual!)
            .subscribe({
              next: resolve,
              error: reject,
            });
        });
        this.cenarioAtual.imagemFundoId = String(idImagem);
        this.imagemFundoAtual = null;
      } catch (err) {
        console.error('Falha ao salvar a imagem de fundo:', err);
        alert(
          'Ocorreu um erro grave ao salvar a imagem de fundo. O cenário será salvo sem ela.',
        );
        delete this.cenarioAtual.imagemFundoId;
      }
    }

    if (this.isEditingMode) {
      console.log('[SALVAR] Chamando salvarCenario() (modo edição)...');
      this.layoutService.salvarCenario(this.cenarioAtual).subscribe({
        next: (cenarioSalvo) => {
          console.log('[SALVAR] Sucesso! Cenário retornado:', cenarioSalvo);
          this.cenarioAtual = cenarioSalvo;
          alert(`Cenário "${nomeCenario}" atualizado com sucesso!`);
        },
        error: (error) => {
          console.error('[SALVAR] Erro ao atualizar:', error);
          alert('Ocorreu um erro ao atualizar o cenário.');
        },
      });
    } else {
      console.log('[SALVAR] Chamando salvarCenario() (novo cenário)...');
      this.layoutService.salvarCenario(this.cenarioAtual).subscribe({
        next: (cenarioSalvo) => {
          console.log('[SALVAR] Sucesso! Cenário retornado:', cenarioSalvo);
          this.cenarioAtual = cenarioSalvo;
          alert(`Cenário "${nomeCenario}" salvo com sucesso!`);
          this.router.navigate(['/editor', this.cenarioAtual.slug]);
        },
        error: (error) => {
          console.error('[SALVAR] Erro ao salvar:', error);
          alert('Ocorreu um erro ao salvar o cenário.');
        },
      });
    }
  }

  private dispararAutosave(): void {
    this.componentes.set(this.cenarioAtual.componentes);
    this.onItemChange();
  }
}
