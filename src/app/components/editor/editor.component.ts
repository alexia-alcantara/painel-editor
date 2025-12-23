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
import { MultimidiaComponent } from '../multimidia/multimidia.component';

import { PainelService } from '../../services/painel.service';
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
    MultimidiaComponent,
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
  private routeSub: Subscription | undefined;

  private imagemFundoAtual: File | null = null;
  scale = 1;

  private atualizacaoSubscription: Subscription | undefined;

  constructor(
    private layoutService: LayoutService,
    private route: ActivatedRoute,
    private layoutExport: LayoutExportService,
    private fonteService: FonteService,
    private renderer: Renderer2,
    private imagemStorageService: ImagemStorageService,
    private painelService: PainelService
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

      this.iniciarAtualizacaoAutomatica();
      this.onItemChange();
      this.dispararAutosave();
    });
  }

  @HostListener('window:resize')
  onResize() {
    this.updateScale();
  }

  onIpChanged(): void {
    this.iniciarAtualizacaoAutomatica();
  }

  iniciarAtualizacaoAutomatica(): void {
    const frequenciaMs = 2000;

    const ipDaUrl = this.route.snapshot.queryParamMap.get('ip');

    // Tenta pegar o IP de variáveis comuns. Se sua variável tiver outro nome, ajuste aqui.
    // O (this as any) permite acessar propriedades dinâmicas para evitar erro se o nome variar.
    const cenario =
      (this as any).cenario ||
      (this as any).cenarioParaExibir ||
      (this as any).cenarioAtual;
    const ipDoCenario = cenario?.idPainel;

    const ipParaConectar = ipDaUrl || ipDoCenario;

    if (!ipParaConectar) return;

    if (this.atualizacaoSubscription) {
      this.atualizacaoSubscription.unsubscribe();
    }

    console.log(`Conectando ao painel (Modo Editor): ${ipParaConectar}...`);

    this.atualizacaoSubscription = this.painelService
      .getDadosPainelEmTempoReal(ipParaConectar, frequenciaMs)
      .subscribe({
        next: (dadosDaApi) => {
          if (!dadosDaApi) return;

          // CORREÇÃO 1: 'as any' para evitar erro de propriedade 'valor' inexistente
          const payload = dadosDaApi as any;
          const dadosReais = payload.valor ? payload.valor : payload;

          // Transforma em texto para comparar se mudou
          const estadoAtualJson = JSON.stringify(dadosReais);

          // Se o dado é idêntico ao anterior, não faz nada (economiza processamento)
          if (this.ultimoEstadoJson === estadoAtualJson) {
            return;
          }

          this.ultimoEstadoJson = estadoAtualJson;

          console.log('Dados mudaram! Recebido no Editor:', dadosReais);
        },
        error: (err) => console.error('Erro na conexão do Editor:', err),
      });
  }

  private atualizarDadosNaTela(dadosApi: any) {
    if (!dadosApi) return;

    // 1. Título e Subtítulo
    const componenteTitulo = this.cenarioAtual.componentes.find(
      (c) => c.tipo === 'titulo'
    );
    if (componenteTitulo) {
      componenteTitulo.dados.texto =
        dadosApi.nomeReuniao || dadosApi.nomeCliente || 'Sem Título';
    }

    const componenteSubtitulo = this.cenarioAtual.componentes.find(
      (c) => c.tipo === 'subtitulo'
    );
    if (componenteSubtitulo) {
      componenteSubtitulo.dados.texto = dadosApi.categoriaReuniao || '';
    }

    // 2. Status da Reunião
    const componenteDescricao = this.cenarioAtual.componentes.find(
      (c) => c.tipo === 'descricao'
    );
    if (componenteDescricao && dadosApi.statusReuniao) {
      componenteDescricao.dados.texto = dadosApi.statusReuniao;
    }

    // 3. Orador
    // Atualização da lógica do Orador
    const componenteOrador = this.cenarioAtual.componentes.find(
      (c) => c.tipo === 'orador'
    );

    if (componenteOrador) {
      if (dadosApi.tribuna) {
        // Se tem orador, preenche e MOSTRA
        componenteOrador.visible = true;
        componenteOrador.dados.orador =
          dadosApi.tribuna.nomeParlamentar || dadosApi.tribuna.nome;
        componenteOrador.dados.partido = dadosApi.tribuna.partido;

        // Se tiver o componente de tema/matéria, atualiza também
        const componenteMateria = this.cenarioAtual.componentes.find(
          (c) => c.tipo === 'materia'
        );
        if (componenteMateria) {
          componenteMateria.visible = true;
        }
      } else {
        componenteOrador.visible = false;

        const componenteMateria = this.cenarioAtual.componentes.find(
          (c) => c.tipo === 'materia'
        );
        if (componenteMateria) componenteMateria.visible = false;

        const componentePartido = this.cenarioAtual.componentes.find(
          (c) => c.tipo === 'partido'
        );
        if (componentePartido) componentePartido.visible = false;
      }
    }

    // 4. Parlamentares (Correção: Acessar presencas[0].membros)
    if (
      dadosApi.parlamentares &&
      Array.isArray(dadosApi.parlamentares.presencas) &&
      dadosApi.parlamentares.presencas.length > 0
    ) {
      // Entramos no primeiro item de 'presencas' e pegamos a lista de 'membros'
      const listaMembros = dadosApi.parlamentares.presencas[0].membros;

      if (Array.isArray(listaMembros)) {
        const componentesParlamentar = this.cenarioAtual.componentes.filter(
          (c) => c.tipo === 'parlamentar'
        );

        componentesParlamentar.forEach((comp, index) => {
          // Pega o membro correspondente na lista da API
          const membroApi = listaMembros[index];

          const dadosReais = membroApi ? membroApi.titular : null;

          if (dadosReais) {
            comp.visible = true;
            comp.dados.nome = dadosReais.nome;
            comp.dados.partido = dadosReais.partido;
            comp.dados.voto = dadosReais.voto;
          } else {
            comp.visible = false;
          }
        });
      }
    }

    // Atualiza a tela
    this.cenarioAtual.componentes = [...this.cenarioAtual.componentes];
    this.componentes.set(this.cenarioAtual.componentes);
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

    // --- CONFIGURAÇÃO DE ESTILO ---
    const defaultFont: FontConfig = {
      family: 'Arial, sans-serif',
      size: 20,
      color: '#FFFFFF',
      weight: 'bold',
    };

    const corVerde = '#00FF00';
    const corVermelha = '#FF0000';
    const corAmarela = '#FFFF00';
    const corCiano = '#00FFFF';
    const corRoxa = '#AA00FF';

    // --- VARIÁVEIS DE POSICIONAMENTO GERAL ---
    const xMargemEsquerda = 80;
    const yBlocoCentral = 350; 
    
    // Variáveis Status
    const xPlacar = xMargemEsquerda;
    const xStatus = xPlacar + 320; 
    const yStatusBase = yBlocoCentral; 
    const wStatus = 250;
    const hStatus = 45;
    const fontSizeStatus = 22;

    // --- VARIÁVEIS DA IMAGEM / ORADOR (Definidas aqui para serem usadas abaixo) ---
    const xImagem = 800;         // Posição X da área de vídeo
    const yImagem = 60;          // Posição Y da área de vídeo
    const larguraImagem = 800;   // Largura do vídeo
    const alturaImagem = 450;    // Altura do vídeo

    // -----------------------------------------------------------------------

    // Cabeçalho
    const cabecalho: ComponenteEditor = {
      id: 'cabecalho', tipo: 'cabecalho', x: xMargemEsquerda, y: 60, width: 600, height: 60, visible: true,
    };

    // Títulos
    const xTitulos = xMargemEsquerda + 50;
    const titulo: ComponenteEditor = {
      id: 'titulo', tipo: 'titulo', x: xTitulos, y: 140, width: 500, height: 40, visible: true, dados: { texto: 'Título da Reunião' }, fontes: [{ subId: 'titulo-texto', label: 'Título', font: { ...defaultFont, size: 36 } }],
    };
    const subtitulo: ComponenteEditor = {
      id: 'subtitulo', tipo: 'subtitulo', x: xTitulos, y: 190, width: 500, height: 30, visible: true, dados: { texto: 'Subtítulo da Reunião' }, fontes: [{ subId: 'subtitulo-texto', label: 'Subtítulo', font: { ...defaultFont, size: 24 } }],
    };
    const descricao: ComponenteEditor = {
      id: 'descricao', tipo: 'descricao', x: xTitulos, y: 230, width: 500, height: 40, dados: { texto: 'Status da Reunião' }, fontes: [{ subId: 'desc-texto', label: 'Texto', font: { ...defaultFont, size: 16, weight: 'normal' } }], visible: true,
    };

    // --- PLACAR ESQUERDA ---
    const gapPlacar = 50;
    const votacaoSim: ComponenteEditor = { id: 'voto-sim', tipo: 'votacao-item', x: xPlacar, y: yBlocoCentral, width: 280, height: 45, props: { label: 'SIM', cor: corVerde, valor: 0, fontSize: 32 }, visible: true };
    const votacaoNao: ComponenteEditor = { id: 'voto-nao', tipo: 'votacao-item', x: xPlacar, y: yBlocoCentral + gapPlacar, width: 280, height: 45, props: { label: 'NÃO', cor: corVermelha, valor: 0, fontSize: 32 }, visible: true };
    const votacaoAbstencao: ComponenteEditor = { id: 'voto-abstencao', tipo: 'votacao-item', x: xPlacar, y: yBlocoCentral + (gapPlacar * 2), width: 280, height: 45, props: { label: 'ABSTENÇÃO', cor: corAmarela, valor: 0, fontSize: 32 }, visible: true };

    // --- STATUS DIREITA ---
    const statusPresentes: ComponenteEditor = { id: 'status-presentes', tipo: 'status-item', x: xStatus, y: yStatusBase, width: wStatus, height: hStatus, visible: true, props: { label: 'PRESENTES', valor: 0, cor: '#FFFFFF', fontSize: fontSizeStatus } };
    const statusVotos: ComponenteEditor = { id: 'status-votos', tipo: 'status-item', x: xStatus, y: yStatusBase + 55, width: wStatus, height: hStatus, visible: true, props: { label: 'VOTOS', valor: 0, cor: '#FFFFFF', fontSize: fontSizeStatus } };
    const statusAusentes: ComponenteEditor = { id: 'status-ausentes', tipo: 'status-item', x: xStatus, y: yStatusBase + 110, width: wStatus, height: hStatus, visible: true, props: { label: 'AUSENTES', valor: 0, cor: '#FFFFFF', fontSize: fontSizeStatus } };
    
    const statusQuorum: ComponenteEditor = { id: 'status-quorum', tipo: 'status-item', x: xStatus, y: yStatusBase + 160, width: wStatus, height: hStatus, visible: false, props: { label: 'QUORUM', valor: 0 } };
    const statusLicenciados: ComponenteEditor = { id: 'status-licenciados', tipo: 'status-item', x: xStatus, y: yStatusBase + 200, width: wStatus, height: hStatus, visible: false, props: { label: 'LICENCIADOS', valor: 0 } };
    const statusObstrucao: ComponenteEditor = { id: 'status-obstrucao', tipo: 'status-item', x: xStatus, y: yStatusBase + 240, width: wStatus, height: hStatus, visible: false, props: { label: 'OBSTRUÇÃO', valor: 0 } };

    // --- RODAPÉ / RELÓGIOS ---
    const yRelogios = 650;
    const relogioSistema: ComponenteEditor = { id: 'relogio-sistema', tipo: 'relogio', x: xMargemEsquerda + 350, y: yRelogios, width: 200, height: 60, visible: true };
    const temporizadores: ComponenteEditor[] = [
      { id: 'temporizador-1', tipo: 'temporizador-item', x: xMargemEsquerda, y: yRelogios, width: 200, height: 60, props: { tempo: '00:00:00' }, visible: true },
      { id: 'temporizador-2', tipo: 'temporizador-item', x: xMargemEsquerda + 180, y: yRelogios, width: 200, height: 60, props: { tempo: '00:00:00' }, visible: true }
    ];
    const dataAtual: ComponenteEditor = { id: 'data-atual', tipo: 'titulo', x: xMargemEsquerda + 350, y: yRelogios - 40, width: 200, height: 40, visible: true, dados: { texto: 'DD/MM/AAAA' } };
    
    // --- MULTIMÍDIA E ORADORES (Agora as variáveis já existem!) ---
    
    const multimidia: ComponenteEditor = { 
        id: 'multimidia-principal', 
        tipo: 'multimidia', 
        x: xImagem, 
        y: yImagem, 
        width: larguraImagem, 
        height: alturaImagem, 
        visible: true, 
        dados: { label: '' } 
    };

    const orador: ComponenteEditor = { 
        id: 'orador-principal', 
        tipo: 'orador', 
        x: xImagem + 100, // Agora xImagem já está declarado!
        y: yImagem + alturaImagem + 20, // Agora yImagem e alturaImagem existem!
        width: 600, 
        height: 60, 
        visible: true, 
        dados: { orador: 'Nome do Orador' } 
    };

    const partido: ComponenteEditor = { 
        id: 'partido-principal', 
        tipo: 'partido', 
        x: xImagem + 100, 
        y: yImagem + alturaImagem + 70, 
        width: 600, 
        height: 40, 
        visible: true, 
        dados: { partido: 'PARTIDO' } 
    };

    const materia: ComponenteEditor = { 
        id: 'materia-principal', 
        tipo: 'materia', 
        x: xImagem + 100, 
        y: yImagem + alturaImagem + 110, 
        width: 600, 
        height: 100, 
        visible: true, 
        dados: { materia: 'Tema em Discussão...' } 
    };

    const resultadoVotacao: ComponenteEditor = { id: 'resultado-votacao', tipo: 'resultado-votacao', x: xTitulos + 100, y: yRelogios + 80, width: 400, height: 50, visible: true, dados: { texto: 'Resultado da Votação' } };
    const mensagem: ComponenteEditor = { id: 'mensagem-principal', tipo: 'mensagem', x: 1300, y: 800, width: 300, height: 50, visible: true, dados: { texto: 'Mensagem' } };

    // Lista Parlamentares
    const configParlamentares: DistribuirConfig = { qtdePorColuna: 8, qntTotal: 14, espacamentoVertical: 45, espacamentoHorizontal: 10, margemSuperior: 0, margemEsquerda: 0, exibirDe: 0, exibirAte: 0, offsetInicial: 0, posicaoX: 800, posicaoY: 750 };
    const parlamentares = this.montarComponentesParlamentares(configParlamentares);

    // LISTA FINAL
    const componentesIniciais = [
      multimidia, cabecalho, titulo, subtitulo, descricao,
      relogioSistema, ...temporizadores, dataAtual,
      statusPresentes, statusVotos, statusAusentes, 
      statusQuorum, statusLicenciados, statusObstrucao, 
      votacaoSim, votacaoNao, votacaoAbstencao, resultadoVotacao,
      orador, partido, materia, mensagem,
      ...parlamentares
    ];

    const nomePadrao = 'Cenário Padrão Visual';
    return {
      id: `cenario_${Date.now()}`,
      nome: nomePadrao,
      targetWidth: larguraTela,
      targetHeight: alturaTela,
      backgroundImage: '',
      componentes: componentesIniciais,
      idPainel: '15',
      slug: this.gerarSlug(nomePadrao),
    };
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
