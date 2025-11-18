import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Cenario } from '../../models/cenario.model';
import { LayoutService } from '../../services/layout.service';
import { PainelService } from '../../services/painel.service';
import { Subscription, interval } from 'rxjs';

// Imports dos seus componentes visuais
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
import { MensagemComponent } from '../mensagem/mensagem.component';
import { TribunaComponent } from '../tribuna/tribuna.component';
import { ImagemStorageService } from '../../services/imagem-storage.service';
import { ResultadoVotacaoComponent } from '../resultado-votacao/resultado-votacao.component';
import { RelogioComponent } from '../relogio/relogio.component';
import { OradorComponent } from "../orador/orador.component";
import { PartidoComponent } from "../partido/partido.component";
import { MateriaComponent } from "../materia/materia.component";

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [
    CommonModule,
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
    MensagemComponent,
    TribunaComponent,
    ResultadoVotacaoComponent,
    RelogioComponent,
    OradorComponent,
    PartidoComponent,
    MateriaComponent
],
  templateUrl: './display.component.html',
  styleUrl: './display.component.css',
})
export class DisplayComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('wrapper') wrapper!: ElementRef<HTMLDivElement>;

  cenarioParaExibir: Cenario | null = null;

  private atualizacaoSubscription: Subscription | null = null;
  private readonly PAINEL_IDENTIFICADOR = '15';

  paletaDeCores: any = {};
  private painelSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private layoutService: LayoutService,
    private painelService: PainelService,
    private renderer: Renderer2,
    private imagemStorageService: ImagemStorageService,
    private cdRef: ChangeDetectorRef
  ) {}

  // Em display.component.ts

  ngOnInit(): void {
    const idCenario = this.route.snapshot.paramMap.get('id');

    if (idCenario) {
      this.cenarioParaExibir = this.layoutService.carregarCenario(idCenario);

      if (this.cenarioParaExibir) {
        if (this.cenarioParaExibir.imagemFundoId) {
          this.carregarImagemDeFundo(this.cenarioParaExibir.imagemFundoId);
        }

        this.iniciarAtualizacaoAutomatica();
      }
    }
  }

  private iniciarAtualizacaoAutomatica(): void {
    // pega o ID/IP do parâmetro da URL (ex: ...?ip=15)
    const ipDaUrl = this.route.snapshot.queryParamMap.get('ip');

    // 2. Se não houver na URL, pega o ID/IP que está salvo no cenário
    const ipDoCenario = this.cenarioParaExibir?.idPainel;

    // 3. Decide qual usar: o da URL tem prioridade para testes rápidos.
    const ipDoPainel = ipDaUrl || ipDoCenario;

    // 4. Se nenhum dos dois existir, para a execução e avisa no console.
    if (!ipDoPainel) {
      console.error(
        'ERRO: Nenhum ID de Painel foi encontrado no cenário ou na URL!'
      );
      return;
    }

    const frequenciaMs = 2000;

    // Cancela a inscrição anterior para evitar múltiplas chamadas
    if (this.atualizacaoSubscription) {
      this.atualizacaoSubscription.unsubscribe();
    }

    console.log(
      `%cIniciando busca de dados para o painel: ${ipDoPainel}`,
      'color: yellow; font-weight: bold;'
    );

    this.atualizacaoSubscription = this.painelService
      .getDadosPainelEmTempoReal(ipDoPainel, frequenciaMs)
      .subscribe((dadosDaApi) => {
        if (dadosDaApi && dadosDaApi['valor']) {
          this.atualizarCenarioComDadosReais(dadosDaApi['valor']);
        }
      });
  }

  private atualizarCenarioComDadosReais(dados: any): void {
    if (!this.cenarioParaExibir) return;

    const dadosApiValor = dados;

    if (dadosApiValor.paleta && dadosApiValor.paleta.cores) {
      this.paletaDeCores = dadosApiValor.paleta.cores.reduce(
        (acc: any, cor: any) => {
          acc[cor.nome] = cor.valor;
          return acc;
        },
        {}
      );
    }

    const visibilidadeOriginal = this.cenarioParaExibir.componentes.reduce(
      (map: { [key: string]: boolean }, comp) => {
        map[comp.id] = comp.visible;
        return map;
      },
      {}
    );

    const cenarioAtualizado = structuredClone(this.cenarioParaExibir);

    // --- Mapeamento de Parlamentares ---
    let parlamentaresApi: any[] = [];
    if (dadosApiValor.parlamentares?.presencas?.length > 0) {
      const membros = dadosApiValor.parlamentares.presencas[0].membros;
      if (membros) {
        parlamentaresApi = Array.isArray(membros) ? membros : [membros];
      }
    }

    const parlamentaresLayout = cenarioAtualizado.componentes.filter(
      (c) => c.tipo === 'parlamentar'
    );

    parlamentaresApi.forEach((membro: any, index: number) => {
      const parlamentarApi = membro.titular;
      const parlamentarLayoutComp = parlamentaresLayout[index];
      if (parlamentarLayoutComp && parlamentarApi) {
        // Garante que o parlamentar só seja visível se o seu componente de layout estiver marcado como visível.
        parlamentarLayoutComp.visible =
          visibilidadeOriginal[parlamentarLayoutComp.id] ?? false;
        if (parlamentarLayoutComp.visible) {
          parlamentarLayoutComp.dados = {
            nome: parlamentarApi.nome || 'Nome não informado',
            partido: parlamentarApi.partido || '-',
            voto: parlamentarApi.voto?.status || '-',
            status: parlamentarApi.status,
            cor: parlamentarApi.cor,
          };
        }
      }
    });

    // Oculta componentes de parlamentares que não têm dados correspondentes na API
    for (let i = parlamentaresApi.length; i < parlamentaresLayout.length; i++) {
      parlamentaresLayout[i].visible = false;
    }

    // --- Lógica Geral dos Componentes ---
    cenarioAtualizado.componentes.forEach((componente) => {
      componente.visible = visibilidadeOriginal[componente.id] ?? false;

      switch (componente.tipo) {
        case 'titulo':
          componente.dados = { texto: dadosApiValor.nomeReuniao || 'Reunião' };
          componente.visible = visibilidadeOriginal[componente.id] ?? false;
          break;

        case 'subtitulo':
          // O subtítulo mostra o nome da VOTAÇÃO se ela existir, senão mostra a CATEGORIA da reunião.
          if (dadosApiValor.votacao && dadosApiValor.votacao.nome) {
            componente.dados = { texto: dadosApiValor.votacao.nome };
          } else {
            componente.dados = { texto: dadosApiValor.categoriaReuniao || '' };
          }
          componente.visible = visibilidadeOriginal[componente.id] ?? false;
          break;

        case 'descricao':
          // SE HOUVER VOTAÇÃO, MOSTRA A EMENTA. SENÃO, O STATUS DA REUNIÃO.
          if (dadosApiValor.votacao && dadosApiValor.votacao.ementa) {
            componente.dados = { texto: dadosApiValor.votacao.ementa };
          } else {
            componente.dados = { texto: dadosApiValor.statusReuniao || '' };
          }
          break;

        case 'cabecalho':
          componente.dados = {
            ...componente.dados,
            texto: dadosApiValor.nomeCliente,
          };
          break;

        case 'mensagem':
          componente.visible =
            visibilidadeOriginal[componente.id] &&
            !!dadosApiValor.telaMensagem?.conteudo;
          if (componente.visible) {
            try {
              const conteudo = JSON.parse(dadosApiValor.telaMensagem.conteudo);
              componente.dados = {
                texto: conteudo.map((item: any) => item.texto).join('\n'),
              };
            } catch (e) {
              console.error('Erro ao processar telaMensagem:', e);
              componente.visible = false;
            }
          }
          break;

        case 'orador':
          componente.dados = {
            orador: dadosApiValor.tribuna?.orador || 'Nome do Orador',
          };
          break;

        case 'partido':
          componente.dados = {
            partido: dadosApiValor.tribuna?.partido || 'PARTIDO',
          };
          break;

        case 'materia':
          componente.dados = {
            materia: dadosApiValor.tribuna?.materia || 'Tema em Discussão',
            ementa: dadosApiValor.votacao?.ementa || '', 
          };
          break;

        case 'resultado-votacao':
          const votacaoFinalizada =
            dadosApiValor.votacao && !dadosApiValor.votacao.votando;
          const textoResultado = dadosApiValor.votacao?.resultado_texto;
          componente.visible =
            visibilidadeOriginal[componente.id] &&
            votacaoFinalizada &&
            !!textoResultado;

          if (componente.visible) {
            componente.dados = { texto: textoResultado };
          }
          break;

        case 'totalizadores': {

          const isVisibleInEditor =
            visibilidadeOriginal[componente.id] ?? false;
          const hasVotingData = !!dadosApiValor.votacao; 

          componente.visible = isVisibleInEditor && hasVotingData;

          if (componente.visible) {
            componente.dados = dadosApiValor.votacao;
          }
          break;
        }

        case 'temporizador-item':
          const idCompleto = componente.id; // ex: "temporizador-1"
          let idNumericoApi: number | null = null;

          // Mapeia o ID do seu componente para o ID do cronômetro da API
          if (idCompleto === 'temporizador-1') {
            idNumericoApi = 1;
          } else if (idCompleto === 'temporizador-2') {
            idNumericoApi = 2;
          } else if (idCompleto === 'temporizador-3') {
            idNumericoApi = 4;
          }

          if (idNumericoApi !== null) {
            const dadosCronometro = dadosApiValor.cronometro?.find(
              (c: any) => c.cronometro === idNumericoApi
            );

            if (dadosCronometro) {
              componente.dados = dadosCronometro;
            }
          }
          break;

        case 'status-item':
          const presencas = dadosApiValor.parlamentares?.presencas?.[0] || {};
          const nomesTotalizadores = dadosApiValor.nomesTotalizadores || {};

          if (componente.id === 'status-presentes') {
            componente.props = {
              label: nomesTotalizadores.PRESENTES || 'PRESENTES',
              valor: presencas.presentes || 0,
            };
          }
          if (componente.id === 'status-ausentes') {
            componente.props = {
              label: nomesTotalizadores.AUSENTES || 'AUSENTES',
              valor: presencas.ausentes || 0,
            };
          }
          if (componente.id === 'status-licenciados') {
            componente.props = {
              label: nomesTotalizadores.LICENCIADOS || 'LICENCIADOS',
              valor: presencas.licenciados || 0,
            };
          }
          if (componente.id === 'status-obstrucao') {
            componente.props = {
              label: nomesTotalizadores.OBSTRUCAO || 'OBSTRUCAO',
              valor: presencas.obstrucao || 0,
            };
          }
          if (componente.id === 'status-quorum') {
            componente.props = {
              label: nomesTotalizadores.QUORUM || 'QUORUM',
              valor: presencas.quorum || 0,
            };
          }
          if (componente.id === 'status-votos') {
            componente.props = {
              label: nomesTotalizadores.VOTOS || 'VOTOS',
              valor: dadosApiValor.votacao?.totalvotos ?? 0,
            };
          }
          break;
      }
    });

    // Atualiza os componentes de Votação (Sim, Não, Abstenção)
    const existeVotacao = !!dadosApiValor.votacao;
    ['voto-sim', 'voto-nao', 'voto-abstencao'].forEach((id) => {
      const comp = cenarioAtualizado.componentes.find((c) => c.id === id);
      if (comp) {
        comp.visible = visibilidadeOriginal[comp.id] && existeVotacao;
        if (comp.visible) {
          if (!comp.props) comp.props = {};
          const dataKey = id.split('-')[1]; // 'sim', 'nao', 'abstencao'
          comp.props.valor = dadosApiValor.votacao[dataKey] ?? 0;
        }
      }
    });

    this.cenarioParaExibir = cenarioAtualizado;
    this.cdRef.detectChanges();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.ajustarEscala(), 0);
  }

  ngOnDestroy(): void {
    if (this.atualizacaoSubscription) {
      this.atualizacaoSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize') onResize(): void {
    this.ajustarEscala();
  }

  private ajustarEscala(): void {
    if (!this.wrapper || !this.cenarioParaExibir) return;

    const container = this.wrapper.nativeElement.parentElement;
    const target = this.wrapper.nativeElement;

    if (!container) return;

    // Calcula a escala baseada na largura do container.
    const scale = container.clientWidth / this.cenarioParaExibir.targetWidth;

    this.renderer.setStyle(target, 'transform-origin', 'top left');
    this.renderer.setStyle(target, 'transform', `scale(${scale})`);
  }

  private async carregarImagemDeFundo(id: string): Promise<void> {
    try {
      const arquivo = await this.imagemStorageService.carregarImagem(id);

      if (arquivo) {
        // Cria uma URL local para o arquivo vindo do IndexedDB
        const url = URL.createObjectURL(arquivo);

        // Usa o Renderer2 para aplicar o estilo de fundo de forma segura
        this.renderer.setStyle(
          this.wrapper.nativeElement,
          'backgroundImage',
          `url(${url})`
        );
        console.log(`Imagem de fundo com ID ${id} carregada.`);
      } else {
        console.warn(
          `Imagem de fundo com ID ${id} não encontrada no banco de dados.`
        );
      }
    } catch (err) {
      console.error('Erro ao carregar imagem de fundo do IndexedDB:', err);
    }
  }
}
