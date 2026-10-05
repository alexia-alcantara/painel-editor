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
import {
  previasDeFundo,
  urlImagemFundo,
  verificarImagemFundo,
} from '../../config/runtime-config';
import { ComponenteEditor } from '../../models/components.model';
import { LayoutService } from '../../services/layout.service';
import { CommonModule } from '@angular/common';
import { HeaderReuniaoComponent } from '../header-reuniao/header-reuniao.component';
import { ActivatedRoute, Router } from '@angular/router';

import { ImagemReuniaoComponent } from '../imagem-reuniao/imagem-reuniao.component';
import { ParlamentarItemComponent } from '../parlamentar-item/parlamentar-item.component';
import { VotacaoTotalComponent } from '../votacao-total/votacao-total.component';
import { StatusReuniaoComponent } from '../status-reuniao/status-reuniao.component';
import { TemporizadorItemComponent } from '../temporizador-item/temporizador-item.component';
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
import { MatIconModule } from '@angular/material/icon';
import {
  Cenario,
  OpcoesCenario,
  VideowallConfig,
} from '../../models/cenario.model';
import { FormsModule } from '@angular/forms';
import { FonteService } from '../../services/fonte.service';
import { StatusItemComponent } from '../status-reuniao/status-item/status-item.component';
import { SubtituloReuniaoComponent } from '../subtitulo-reuniao/subtitulo-reuniao.component';
import { MensagemComponent } from '../mensagem/mensagem.component';
import { ImagemStorageService } from '../../services/imagem-storage.service';
import { ResultadoVotacaoComponent } from '../resultado-votacao/resultado-votacao.component';
import { RelogioComponent } from '../relogio/relogio.component';
import { MultimidiaComponent } from '../multimidia/multimidia.component';
import { OradorComponent } from '../orador/orador.component';
import { MateriaComponent } from '../materia/materia.component';
import { PartidoComponent } from '../partido/partido.component';

import { PainelService } from '../../services/painel.service';
import { CampoTextoComponent } from '../campo-texto/campo-texto.component';
import { log } from '../../utils/log';
import { AvisoService } from '../../services/aviso.service';
import { AdicionarCampoComponent } from '../adicionar-campo/adicionar-campo.component';
import {
  CampoDisponivel,
  ID_PARLAMENTARES,
  rotuloCampo,
} from '../../models/campos';

const DISTRIBUICAO_PADRAO: DistribuirConfig = {
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
};

@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderReuniaoComponent,
    ImagemReuniaoComponent,
    ParlamentarItemComponent,
    VotacaoTotalComponent,
    TemporizadorItemComponent,
    StatusReuniaoComponent,
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
    AdicionarCampoComponent,
    StatusItemComponent,
    MensagemComponent,
    OradorComponent,
    MateriaComponent,
    PartidoComponent,
    ResultadoVotacaoComponent,
    RelogioComponent,
    MultimidiaComponent,
    CampoTextoComponent,
  ],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.css',
})
export class EditorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(ContextMenuComponent)
  contextMenu!: ContextMenuComponent;

  router = inject(Router);
  private aviso = inject(AvisoService);

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

  componentes = signal<ComponenteEditor[]>([]);
  mostrarBlocosOcultos = true;

  private catalogo: ComponenteEditor[] | null = null;

  zoom = 1;
  @ViewChild('areaEditor') areaEditorRef?: ElementRef<HTMLElement>;
  private routeSub: Subscription | undefined;

  private imagemFundoAtual: File | null = null;

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
    const file = input.files?.[0];
    if (!file) return;

    const anterior = previasDeFundo.get(file.name);
    if (anterior) URL.revokeObjectURL(anterior);
    previasDeFundo.set(file.name, URL.createObjectURL(file));

    this.cenarioAtual.imagemFundo = file.name;
    this.cenarioAtual.backgroundImage = '';
    input.value = '';
  }

  alterarNomeImagemFundo(nome: string): void {
    this.cenarioAtual.imagemFundo = nome.trim();
    this.cenarioAtual.backgroundImage = '';
  }
  removerImagemFundo(): void {
    this.alterarNomeImagemFundo('');
  }

  get fundoEditor(): string {
    const nome = this.cenarioAtual.imagemFundo || '';
    const daPasta = urlImagemFundo(nome);
    const url =
      previasDeFundo.get(nome) || daPasta || this.cenarioAtual.backgroundImage;

    if (url === daPasta) {
      verificarImagemFundo(daPasta, (endereco) => {
        log.aviso(
          'Editor',
          `Imagem de fundo "${nome}" não encontrada em ${endereco}`,
        );
        this.aviso.toast(
          `Imagem de fundo "${nome}" não encontrada no servidor.`,
          'aviso',
        );
      });
    }
    return url ? `url("${url}")` : 'none';
  }

  private get catalogoCampos(): ComponenteEditor[] {
    if (!this.catalogo) {
      this.catalogo = this.montarLayoutInicial().componentes.filter(
        (c) => c.tipo !== 'parlamentar',
      );
    }
    return this.catalogo;
  }

  get camposDisponiveis(): CampoDisponivel[] {
    const idsNoCenario = new Set(this.cenarioAtual.componentes.map((c) => c.id));
    const lista: CampoDisponivel[] = this.catalogoCampos
      .filter((c) => !idsNoCenario.has(c.id))
      .map((c) => ({ id: c.id, rotulo: rotuloCampo(c) }));

    const temParlamentares = this.cenarioAtual.componentes.some(
      (c) => c.tipo === 'parlamentar',
    );
    if (!temParlamentares) {
      lista.push({ id: ID_PARLAMENTARES, rotulo: rotuloCampo({ id: ID_PARLAMENTARES }) });
    }

    return lista.sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'));
  }

  rotulo(item: ComponenteEditor): string {
    return rotuloCampo(item);
  }

  alternarVideowall(ativo: boolean): void {
    this.cenarioAtual.videowall = ativo ? { colunas: 2, linhas: 2 } : undefined;
    this.dispararAutosave();
  }

  alterarVideowall(campo: keyof VideowallConfig, valor: number): void {
    if (!this.cenarioAtual.videowall) return;
    this.cenarioAtual.videowall = {
      ...this.cenarioAtual.videowall,
      [campo]: Math.max(1, Math.round(valor) || 1),
    };
    this.dispararAutosave();
  }

  get tamanhoTelaVideowall(): string {
    const videowall = this.cenarioAtual.videowall;
    if (!videowall) return '';
    const largura = Math.round(this.cenarioAtual.targetWidth / videowall.colunas);
    const altura = Math.round(this.cenarioAtual.targetHeight / videowall.linhas);
    return `${largura} x ${altura}`;
  }

  get divisoesVideowall(): { verticais: number[]; horizontais: number[] } {
    const videowall = this.cenarioAtual.videowall;
    if (!videowall) return { verticais: [], horizontais: [] };
    return {
      verticais: this.posicoesDasDivisoes(this.cenarioAtual.targetWidth, videowall.colunas),
      horizontais: this.posicoesDasDivisoes(this.cenarioAtual.targetHeight, videowall.linhas),
    };
  }

  cruzaDivisaoVideowall(item: ComponenteEditor): boolean {
    const { verticais, horizontais } = this.divisoesVideowall;
    return (
      verticais.some((x) => x > item.x && x < item.x + item.width) ||
      horizontais.some((y) => y > item.y && y < item.y + item.height)
    );
  }

  private posicoesDasDivisoes(tamanhoTotal: number, quantidadeTelas: number): number[] {
    return Array.from({ length: Math.max(0, quantidadeTelas - 1) }, (_, i) =>
      Math.round((tamanhoTotal * (i + 1)) / quantidadeTelas),
    );
  }

  private encaixarNaTelaDoVideowall(item: ComponenteEditor): void {
    const { verticais, horizontais } = this.divisoesVideowall;
    item.x = this.encaixarNoEixo(item.x, item.width, verticais, this.cenarioAtual.targetWidth);
    item.y = this.encaixarNoEixo(item.y, item.height, horizontais, this.cenarioAtual.targetHeight);
  }

  private encaixarNoEixo(
    inicio: number,
    tamanho: number,
    divisoes: number[],
    tamanhoTotal: number,
  ): number {
    const limites = [0, ...divisoes, tamanhoTotal];
    const centro = inicio + tamanho / 2;
    const indiceTela = limites.findIndex(
      (limite, i) => centro >= limite && centro <= limites[i + 1],
    );
    if (indiceTela < 0) return inicio;

    const inicioTela = limites[indiceTela];
    const fimTela = limites[indiceTela + 1];
    if (tamanho > fimTela - inicioTela) return inicio;

    return Math.min(Math.max(inicio, inicioTela), fimTela - tamanho);
  }

  escalaBotaoRemover(item: ComponenteEditor): number {
    const tamanhoBotao = 22;
    const escalaMaximaNoBloco = (Math.min(item.width, item.height) - 4) / tamanhoBotao;
    return Math.max(0.5, Math.min(1 / this.zoom, escalaMaximaNoBloco));
  }

  adicionarCampo(id: string): void {
    if (id === ID_PARLAMENTARES) {
      this.cenarioAtual.distribuicao = undefined;
      this.cenarioAtual.componentes = [
        ...this.cenarioAtual.componentes,
        ...this.montarComponentesParlamentares(DISTRIBUICAO_PADRAO, this.divisoesVideowall),
      ];
    } else {
      const modelo = this.catalogoCampos.find((c) => c.id === id);
      if (!modelo) {
        log.aviso('Editor', `Erro ao adicionar campo: "${id}" não existe no catálogo`);
        return;
      }
      const { targetWidth, targetHeight } = this.cenarioAtual;
      const campo: ComponenteEditor = { ...structuredClone(modelo), visible: true };
      campo.width = Math.min(campo.width, targetWidth);
      campo.height = Math.min(campo.height, targetHeight);
      campo.x = Math.min(campo.x, Math.max(0, targetWidth - campo.width));
      campo.y = Math.min(campo.y, Math.max(0, targetHeight - campo.height));

      this.cenarioAtual.componentes = [...this.cenarioAtual.componentes, campo];
    }

    log.info('Editor', `Campo "${rotuloCampo({ id })}" adicionado`);
    this.dispararAutosave();
  }

  async removerCampo(item: ComponenteEditor): Promise<void> {
    if (item.tipo === 'parlamentar') {
      const confirmou = await this.aviso.confirmar({
        titulo: 'Remover parlamentares',
        mensagem: 'Remover todos os parlamentares do cenário?',
        textoConfirmar: 'Remover',
        perigo: true,
      });
      if (!confirmou) return;

      this.cenarioAtual.componentes = this.cenarioAtual.componentes.filter(
        (c) => c.tipo !== 'parlamentar',
      );
      this.cenarioAtual.distribuicao = undefined;
    } else {
      this.cenarioAtual.componentes = this.cenarioAtual.componentes.filter(
        (c) => c.id !== item.id,
      );
    }

    log.info('Editor', `Campo "${rotuloCampo(item)}" removido`);
    this.dispararAutosave();
  }

  ngOnInit() {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      if (params.has('id')) {
        // MODO DE EDIÇÃO
        this.isEditingMode = true;
        this.cenarioId = params.get('id');
        log.info('Editor', `Abrindo o cenário "${this.cenarioId}"`);

        this.layoutService
          .carregarCenario(this.cenarioId!)
          .subscribe((cenarioCarregado) => {
            if (cenarioCarregado) {
              this.cenarioAtual = cenarioCarregado;
              this.prepararCenarioParaEdicao(this.cenarioAtual);
              this.fonteService.carregarGrupos(cenarioCarregado.fontes);
            } else {
              this.aviso.erro(`Cenário "${this.cenarioId}" não encontrado.`);
              this.router.navigate(['/editor']);
              return;
            }

            this.onItemChange();
            this.dispararAutosave();
            this.carregarListaPaineis();
            setTimeout(() => this.zoomInicial());
          });
      } else {
        this.isEditingMode = false;
        this.cenarioId = null;
        this.cenarioAtual = this.montarCenarioNovo();
        this.fonteService.carregarGrupos(this.cenarioAtual.fontes);

        this.onItemChange();
        this.dispararAutosave();
        this.carregarListaPaineis();
        setTimeout(() => this.zoomInicial());
      }
    });
  }

   async novoCenario(): Promise<void> {
    const confirmou = await this.aviso.confirmar({
      titulo: 'Novo cenário',
      mensagem: 'Abrir um cenário novo? O que não foi salvo no cenário atual será perdido.',
      textoConfirmar: 'Criar novo',
    });
    if (!confirmou) return;

    log.info('Editor', 'Abrindo um cenário novo');

    if (this.isEditingMode) {
      this.router.navigate(['/editor']);
      return;
    }

    this.cenarioAtual = this.montarCenarioNovo();
    this.fonteService.carregarGrupos(this.cenarioAtual.fontes);
    this.dispararAutosave();
    setTimeout(() => this.zoomInicial());
  }

  carregarListaPaineis() {
    this.painelService.listarPaineis().subscribe({
      next: (lista) => {
        if (lista && lista.length > 0) {
          this.listaPaineis = lista.map((item: any) => ({
            nome: item.nome,
            identificador: item.periferico?.endereco,
            ambiente: item.periferico?.ambiente?.nome,
          }));
        }
      },
      error: (err) => {
        log.aviso('Editor', 'Erro ao carregar a lista de painéis:', err);
      },
    });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy() {
    if (this.routeSub) {
      this.routeSub.unsubscribe();
    }
  }

  get zoomPercentual(): number {
    return Math.round(this.zoom * 100);
  }

  aumentarZoom(): void {
    this.zoom = Math.min(2, Math.round((this.zoom + 0.1) * 10) / 10);
  }

  diminuirZoom(): void {
    this.zoom = Math.max(0.1, Math.round((this.zoom - 0.1) * 10) / 10);
  }

  zoomTamanhoReal(): void {
    this.zoom = 1;
  }

  ajustarZoom(): void {
    const area = this.areaEditorRef?.nativeElement;
    if (
      !area ||
      !this.cenarioAtual?.targetWidth ||
      !this.cenarioAtual?.targetHeight
    )
      return;
    const escalaX = (area.clientWidth - 16) / this.cenarioAtual.targetWidth;
    const escalaY = (area.clientHeight - 16) / this.cenarioAtual.targetHeight;
    this.zoom = Math.max(
      0.1,
      Math.min(1, Math.floor(Math.min(escalaX, escalaY) * 100) / 100),
    );
  }

  private zoomInicial(): void {
    const area = this.areaEditorRef?.nativeElement;
    if (!area) return;
    const cabe =
      this.cenarioAtual.targetWidth <= area.clientWidth &&
      this.cenarioAtual.targetHeight <= area.clientHeight;
    if (cabe) this.zoom = 1;
    else this.ajustarZoom();
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
          this.cenarioAtual.componentes = [...this.cenarioAtual.componentes];
          this.dispararAutosave();
        }
        break;
      }

      case 'importCenario':
        this.importarCenario(event.data);
        break;

      case 'importDelphi': {
        const cenarioDelphi = this.layoutExport.deFormatoDelphi(
          event.data.json,
          this.montarLayoutInicial(),
          event.data.nome,
        );
        cenarioDelphi.componentes = cenarioDelphi.componentes.filter((c) => c.visible);
        this.importarCenario(cenarioDelphi);
        break;
      }
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

    const atual = this.cenarioAtual.componentes.find(
      (c) => c.tipo === 'parlamentar',
    );
    const novosParlamentares = this.montarComponentesParlamentares(
      {
        ...config,
        larguraItem: config.larguraItem ?? atual?.width,
        alturaItem: config.alturaItem ?? atual?.height,
      },
      this.divisoesVideowall,
    );

    // Guarda no cenário (vai junto pro Legis) para o display aplicar
    this.cenarioAtual.distribuicao = {
      exibirDe: Math.max(0, Number(config.exibirDe) || 0),
      exibirAte: Math.max(0, Number(config.exibirAte) || 0),
      offsetInicial: Math.max(0, Number(config.offsetInicial) || 0),
    };

    this.cenarioAtual.componentes = [
      ...componentesSemParlamentares,
      ...novosParlamentares,
    ];
    this.dispararAutosave();
  }

  private arrastando: {
    item: ComponenteEditor;
    x0: number;
    y0: number;
    itemX0: number;
    itemY0: number;
    moveu: boolean;
  } | null = null;

  iniciarArraste(event: MouseEvent, item: ComponenteEditor): void {
    if (event.button !== 0) return;
    event.preventDefault();
    this.arrastando = {
      item,
      x0: event.clientX,
      y0: event.clientY,
      itemX0: item.x,
      itemY0: item.y,
      moveu: false,
    };
  }

  private moverArraste(event: MouseEvent): void {
    const a = this.arrastando;
    if (!a) return;
    const dx = (event.clientX - a.x0) / this.zoom;
    const dy = (event.clientY - a.y0) / this.zoom;
    if (!a.moveu && Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
    a.moveu = true;

    const maxX = Math.max(0, this.cenarioAtual.targetWidth - a.item.width);
    const maxY = Math.max(0, this.cenarioAtual.targetHeight - a.item.height);
    a.item.x = Math.min(Math.max(0, Math.round(a.itemX0 + dx)), maxX);
    a.item.y = Math.min(Math.max(0, Math.round(a.itemY0 + dy)), maxY);
  }

  private redimensionando: {
    item: ComponenteEditor;
    x0: number;
    y0: number;
    largura0: number;
    altura0: number;
  } | null = null;

  iniciarRedimensionar(event: MouseEvent, item: ComponenteEditor): void {
    event.stopPropagation();
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
    if (this.arrastando) {
      this.moverArraste(event);
      return;
    }
    const r = this.redimensionando;
    if (!r) return;

    const larguraMax = this.cenarioAtual.targetWidth - r.item.x;
    const alturaMax = this.cenarioAtual.targetHeight - r.item.y;

    r.item.width = Math.min(
      Math.max(20, Math.round(r.largura0 + (event.clientX - r.x0) / this.zoom)),
      larguraMax,
    );
    r.item.height = Math.min(
      Math.max(20, Math.round(r.altura0 + (event.clientY - r.y0) / this.zoom)),
      alturaMax,
    );
  }

  @HostListener('document:mouseup')
  aoSoltarMouse(): void {
    if (this.arrastando) {
      const { item, moveu } = this.arrastando;
      this.arrastando = null;
      if (moveu) {
        this.encaixarNaTelaDoVideowall(item);
        this.cenarioAtual.componentes = [...this.cenarioAtual.componentes];
        this.dispararAutosave();
      }
      return;
    }
    if (!this.redimensionando) return;
    this.redimensionando = null;
    this.cenarioAtual.componentes = [...this.cenarioAtual.componentes];
    this.dispararAutosave();
  }

  onRightClick(event: MouseEvent, component: ComponenteEditor) {
    event.preventDefault();

    if (this.contextMenu) {
      this.contextMenu.distribuicaoDoCenario =
        this.cenarioAtual.distribuicao ?? null;
      this.contextMenu.cenarioDoEditor = {
        ...this.cenarioAtual,
        fontes: structuredClone(this.fonteService.grupos()),
      };
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
      linhaTabela(
        'status-parlamentares',
        'status-item',
        0,
        'PARLAMENTARES',
        '#FFFFFF',
        false,
      ),
      linhaTabela('status-extras', 'status-item', 1, 'EXTRA', '#389cc7', false),
      linhaTabela(
        'status-presencas-locais',
        'status-item',
        2,
        'PLENÁRIO',
        '#FFFFFF',
        false,
      ),
      linhaTabela(
        'status-presencas-web',
        'status-item',
        3,
        'VIRTUAL',
        '#FFFFFF',
        false,
      ),
      linhaTabela('voto-branco', 'votacao-item', 2, 'BRANCO', '#FFFFFF', false),
      {
        id: 'turno-votacao-principal',
        tipo: 'turno-votacao',
        x: xTexto,
        y: 675,
        width: wTexto,
        height: 50,
        visible: false,
        dados: { texto: '1º Turno' },
      },
      {
        id: 'modo-votacao-principal',
        tipo: 'modo-votacao',
        x: xTexto,
        y: 735,
        width: wTexto,
        height: 50,
        visible: false,
        dados: { texto: 'Modo de Votação' },
      },
      {
        id: 'parametro-votacao-principal',
        tipo: 'parametro-votacao',
        x: xTexto,
        y: 795,
        width: wTexto,
        height: 50,
        visible: false,
        dados: { texto: 'Parâmetro de Votação' },
      },
      {
        id: 'categoria-reuniao-principal',
        tipo: 'categoria-reuniao',
        x: xTexto,
        y: 855,
        width: wTexto,
        height: 50,
        visible: false,
        dados: { texto: 'Categoria da Reunião' },
      },

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
      id: 'tipo-fala-principal',
      tipo: 'tipo-fala',
      x: xTexto,
      y: 540,
      width: wTexto,
      height: 50,
      visible: false,
      dados: { texto: 'Tipo de Fala' },
    });

    const posicoesCronometros: Record<number, { x: number; y: number }> = {
      1: { x: 598, y: 718 },
      2: { x: 598, y: 816 },
      3: { x: 340, y: 718 },
      4: { x: 340, y: 816 },
    };
    [1, 2, 3, 4].forEach((n) => {
      const pos = posicoesCronometros[n];
      componentes.push({
        id: `nome-cronometro-${n}`,
        tipo: 'nome-cronometro',
        x: pos.x,
        y: pos.y - 34,
        width: 250,
        height: 32,
        visible: false,
        props: { cronometro: n },
        dados: { texto: `Nome C${n}` },
      });
    });

    [1, 2, 3, 4].forEach((n) => {
      componentes.push({
        id: `mensagem-linha-${n}`,
        tipo: 'mensagem-linha',
        x: xTexto,
        y: 594 + (n - 1) * 60,
        width: wTexto,
        height: 56,
        visible: false,
        props: { linha: n },
        dados: { texto: `Mensagem Linha ${n}` },
      });
    });

    componentes.push({
      id: 'multimidia-principal',
      tipo: 'multimidia',
      x: 1100,
      y: 700,
      width: 480,
      height: 270,
      visible: false,
    });

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

    const parlamentares =
      this.montarComponentesParlamentares(DISTRIBUICAO_PADRAO);

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
      opcoes: {
        nomeNaCorDoVoto: false,
        fundoParlamentares: true,
        corFundoParlamentares: '#334155',
        opacidadeFundoParlamentares: 100,
      },
    };
  }

  private montarCenarioNovo(): Cenario {
    const cenario = this.montarLayoutInicial();
    cenario.componentes = cenario.componentes.filter((c) => c.visible);
    return cenario;
  }

  private prepararCenarioParaEdicao(cenario: Cenario): void {
    cenario.opcoes = {
      nomeNaCorDoVoto: cenario.opcoes?.nomeNaCorDoVoto ?? false,
      fundoParlamentares: cenario.opcoes?.fundoParlamentares ?? true,
      corFundoParlamentares: cenario.opcoes?.corFundoParlamentares ?? '#334155',
      opacidadeFundoParlamentares:
        cenario.opcoes?.opacidadeFundoParlamentares ?? 100,
    };
  }

  numeroCronometro(item: ComponenteEditor): number {
    return TemporizadorItemComponent.numeroDoComponente(item);
  }

  alterarOpcao(
    chave: keyof OpcoesCenario,
    valor: boolean | string | number,
  ): void {
    this.cenarioAtual.opcoes = { ...this.cenarioAtual.opcoes, [chave]: valor };
    this.dispararAutosave();
  }

  private montarComponentesParlamentares(
    config: DistribuirConfig,
    divisoes: { verticais: number[]; horizontais: number[] } = { verticais: [], horizontais: [] },
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

    const offset = Math.max(0, Number(config.offsetInicial) || 0);
    const primeiro = Math.max(1, Number(config.exibirDe) || 1);
    const ultimo = Number(config.exibirAte) || 0;
    parlamentaresDeExemplo.forEach((parlamentar, i) => {
      const numero = primeiro + (i - offset);
      const vazio = i < offset || (ultimo > 0 && numero > ultimo);
      parlamentar.nome = vazio ? '(vazio)' : `Parlamentar ${numero}`;
      if (vazio) {
        parlamentar.partido = '';
        parlamentar.letra = '';
      }
    });

    const { verticais, horizontais } = divisoes;
    const quantidadeColunas = Math.ceil(totalDeParlamentares / itensPorColuna);
    const posicoesX = this.posicoesSemCruzarDivisoes(
      config.posicaoX,
      larguraItem,
      config.espacamentoHorizontal,
      quantidadeColunas,
      verticais,
    );
    const posicoesY = this.posicoesSemCruzarDivisoes(
      config.posicaoY,
      alturaItem,
      config.espacamentoVertical,
      itensPorColuna,
      horizontais,
    );

    return parlamentaresDeExemplo.map((parlamentar, i) => {
      const colunaAtual = Math.floor(i / itensPorColuna);
      const linhaAtual = i % itensPorColuna;

      return {
        id: `parlamentar-${i}`,
        tipo: 'parlamentar',
        x: posicoesX[colunaAtual],
        y: posicoesY[linhaAtual],
        width: larguraItem,
        height: alturaItem,
        dados: parlamentar,
        visible: true,
      };
    });
  }

  private posicoesSemCruzarDivisoes(
    inicio: number,
    tamanho: number,
    espacamento: number,
    quantidade: number,
    divisoes: number[],
  ): number[] {
    const posicoes: number[] = [];
    let posicaoAtual = inicio;

    for (let i = 0; i < quantidade; i++) {
      posicaoAtual = this.pularDivisao(posicaoAtual, tamanho, divisoes);
      posicoes.push(posicaoAtual);
      posicaoAtual += tamanho + espacamento;
    }
    return posicoes;
  }

  private pularDivisao(inicio: number, tamanho: number, divisoes: number[]): number {
    const cruza = (posicao: number) =>
      divisoes.find((divisao) => divisao > posicao && divisao < posicao + tamanho);

    const divisaoCruzada = cruza(inicio);
    if (divisaoCruzada === undefined) return inicio;

    return cruza(divisaoCruzada) === undefined ? divisaoCruzada : inicio;
  }

  onItemChange() {
    this.layoutService.salvarLayoutAtual(this.cenarioAtual);
  }

  async salvar() {
    const nomeCenario = await this.aviso.pedirTexto({
      titulo: 'Salvar cenário',
      rotulo: 'Nome do cenário',
      valor: this.cenarioAtual.nome || 'novo-cenario',
      textoConfirmar: 'Salvar',
    });

    if (!nomeCenario) {
      return;
    }

    this.cenarioAtual.nome = nomeCenario;
    this.cenarioAtual.fontes = structuredClone(this.fonteService.grupos());

    this.cenarioAtual.slug = this.gerarSlug(nomeCenario);

    if (!this.cenarioAtual.id) {
      this.cenarioAtual.id = `cenario_${Date.now()}`;
    }

    if (this.imagemFundoAtual) {
      try {
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
        log.erro(
          'Editor',
          'Erro ao salvar a imagem de fundo, salvando o cenário sem ela:',
          err,
        );
        this.aviso.toast('Erro ao salvar a imagem de fundo.', 'aviso');
        delete this.cenarioAtual.imagemFundoId;
      }
    }

    if (this.isEditingMode) {
      this.layoutService.salvarCenario(this.cenarioAtual).subscribe({
        next: (cenarioSalvo) => {
          log.info(
            'Editor',
            `Cenário "${nomeCenario}" (id ${cenarioSalvo.idBackend}) atualizado`,
          );
          this.cenarioAtual = cenarioSalvo;
          this.aviso.sucesso(`Cenário "${nomeCenario}" atualizado.`);
        },
        error: (error) => {
          log.erro(
            'Editor',
            `Erro ao atualizar o cenário "${nomeCenario}":`,
            error,
          );
          this.aviso.erro(
            /painel/i.test(error?.message)
              ? `${error.message}.`
              : `Erro ao atualizar o cenário "${nomeCenario}".`,
          );
        },
      });
    } else {
      this.layoutService.salvarCenario(this.cenarioAtual).subscribe({
        next: (cenarioSalvo) => {
          log.info(
            'Editor',
            `Cenário "${nomeCenario}" criado (id ${cenarioSalvo.idBackend})`,
          );
          this.cenarioAtual = cenarioSalvo;
          this.aviso.sucesso(`Cenário "${nomeCenario}" salvo.`);
          this.router.navigate(['/editor', this.cenarioAtual.slug]);
        },
        error: (error) => {
          log.erro(
            'Editor',
            `Erro ao criar o cenário "${nomeCenario}":`,
            error,
          );
          this.aviso.erro(
            /painel/i.test(error?.message)
              ? `${error.message}.`
              : `Erro ao salvar o cenário "${nomeCenario}".`,
          );
        },
      });
    }
  }

  private importarCenario(importado: Cenario): void {
    const atual = this.cenarioAtual;
    const manterIdentidade = this.isEditingMode && !!atual?.idBackend;

    const cenario: Cenario = {
      ...importado,
      id: manterIdentidade ? atual.id : `cenario_${Date.now()}`,
      idBackend: manterIdentidade ? atual.idBackend : undefined,
      nome: manterIdentidade
        ? atual.nome
        : importado.nome || 'cenario-importado',
      slug: manterIdentidade
        ? atual.slug
        : this.gerarSlug(importado.nome || 'cenario-importado'),
      backgroundImage: importado.backgroundImage || '',
    };

    this.cenarioAtual = cenario;
    this.prepararCenarioParaEdicao(this.cenarioAtual);
    this.fonteService.carregarGrupos(this.cenarioAtual.fontes);
    this.dispararAutosave();
    setTimeout(() => this.zoomInicial());

    log.info(
      'Importar',
      `Cenário "${cenario.nome}" importado (${cenario.componentes.length} blocos)`,
    );
    this.aviso.toast(`Cenário "${cenario.nome}" importado.`, 'sucesso');
  }

  private dispararAutosave(): void {
    this.componentes.set(this.cenarioAtual.componentes);
    this.onItemChange();
  }
}
