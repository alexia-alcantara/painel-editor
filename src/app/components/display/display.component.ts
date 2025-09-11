import {
  AfterViewInit,
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
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const idCenario = this.route.snapshot.paramMap.get('id');
    if (idCenario) {
      this.cenarioParaExibir = this.layoutService.carregarCenario(idCenario);
    }
    if (this.cenarioParaExibir) {
      this.iniciarAtualizacaoAutomatica();
    }
  }

  private iniciarAtualizacaoAutomatica(): void {
    const ipDoPainel = '15';
    const frequenciaMs = 2000;

    this.atualizacaoSubscription = this.painelService
      .getDadosPainelEmTempoReal(ipDoPainel, frequenciaMs)
      .subscribe((dadosDaApi) => {
        if (dadosDaApi && dadosDaApi['valor']) {
          this.atualizarCenarioComDadosReais(dadosDaApi['valor']);
        }
      });
  }

  private buscarEAtualizarDados(): void {
    this.painelService.getDadosPainel(this.PAINEL_IDENTIFICADOR).subscribe({
      next: (dadosDaApi) => {
        console.log('Dados recebidos da API:', dadosDaApi);

        // Verifica se recebe dados válidos no campo 'valor'
        if (this.cenarioParaExibir && dadosDaApi && dadosDaApi['valor']) {
          this.atualizarCenarioComDadosReais(dadosDaApi['valor']);
        } else {
          console.warn(
            'Backend respondeu com sucesso, mas sem dados de painel .'
          );
        }
      },
      error: (err) => console.error('Erro ao buscar dados do painel:', err),
    });
  }

  private atualizarCenarioComDadosReais(dados: any): void {
    if (!this.cenarioParaExibir) return;

    console.log(
      'ESTRUTURA DOS COMPONENTES:',
      this.cenarioParaExibir.componentes
    );

    const dadosApiValor = dados;

    console.log('OBJETO VOTACAO RECEBIDO:', dadosApiValor.votacao);

    if (dadosApiValor.paleta && dadosApiValor.paleta.cores) {
      this.paletaDeCores = dadosApiValor.paleta.cores.reduce(
        (acc: any, cor: any) => {
          acc[cor.nome] = cor.valor;
          return acc;
        },
        {}
      );
    }

    const cenarioAtualizado = structuredClone(this.cenarioParaExibir);

    // --- Mapear Parlamentares ---
    let parlamentaresApi: any[] = [];
    if (
      dadosApiValor.parlamentares &&
      dadosApiValor.parlamentares.presencas &&
      dadosApiValor.parlamentares.presencas.length > 0
    ) {
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
      if (parlamentaresLayout[index] && parlamentarApi) {
        parlamentaresLayout[index].dados = {
          nome: parlamentarApi.nome || 'Nome não informado',
          partido: parlamentarApi.partido || '-',
          voto: parlamentarApi.voto?.status || '-',
          status: parlamentarApi.status,
          cor: parlamentarApi.cor,
        };
        parlamentaresLayout[index].visible = true; // Garante que o componente seja visível
      }
    });

    for (let i = parlamentaresApi.length; i < parlamentaresLayout.length; i++) {
      parlamentaresLayout[i].visible = false;
    }

    cenarioAtualizado.componentes.forEach((componente) => {
      switch (componente.tipo) {
        case 'subtitulo':
          componente.dados = {
            texto: dadosApiValor.categoriaReuniao || 'Status',
          };
          break;
        case 'descricao':
          componente.dados = { texto: dadosApiValor.statusReuniao || '' };
          break;
        case 'cabecalho':
          componente.dados = {
            ...componente.dados,
            texto: dadosApiValor.nomeCliente,
          };
          break;

        case 'mensagem':
          componente.visible = !!dadosApiValor.telaMensagem;
          if (
            dadosApiValor.telaMensagem &&
            dadosApiValor.telaMensagem.conteudo
          ) {
            try {
              const conteudoMensagem = JSON.parse(
                dadosApiValor.telaMensagem.conteudo
              );

              if (
                Array.isArray(conteudoMensagem) &&
                conteudoMensagem.length > 0
              ) {
                // Pega o texto da primeira linha (ex: "Votação")
                const linhaTitulo = conteudoMensagem[0]?.texto || '';

                // Pega o texto da última linha (ex: "Aberta")
                const linhaStatus =
                  conteudoMensagem[conteudoMensagem.length - 1]?.texto || '';

                // Combina apenas o título e o status, ignorando o nome da votação que já está no título principal.
                const textoFinal = [linhaTitulo, linhaStatus]
                  .filter(Boolean)
                  .join('\n');

                componente.dados = { texto: textoFinal };
              } else {
                // Se o formato não for o esperado, esconde o componente para evitar erros.
                componente.visible = false;
              }
            } catch (e) {
              console.error('Erro ao processar o conteúdo da telaMensagem:', e);
              componente.visible = false;
            }
          }
          break;

        case 'tribuna':
          componente.visible = !!dadosApiValor.tribuna;
          if (dadosApiValor.tribuna) {
            componente.dados = {
              orador: dadosApiValor.tribuna.nome,
              partido: dadosApiValor.tribuna.partido,
              materia: ' ',
            };
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
          if (componente.id === 'status-quorum') {
            componente.props = {
              label: nomesTotalizadores.QUORUM || 'QUORUM',
              valor: presencas.quorum || 0,
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
          break;
      }
    });

    const votacaoAtiva = !!dadosApiValor.votacao;

    const votacaoSimComp = cenarioAtualizado.componentes.find(
      (c) => c.id === 'voto-sim'
    );
    const votacaoNaoComp = cenarioAtualizado.componentes.find(
      (c) => c.id === 'voto-nao'
    );
    const votacaoAbstencaoComp = cenarioAtualizado.componentes.find(
      (c) => c.id === 'voto-abstencao'
    );
    const tituloComp = cenarioAtualizado.componentes.find(
      (c) => c.tipo === 'titulo'
    );

    if (tituloComp) {
      if (votacaoAtiva) {
        // Se a votação está ativa, mostra o nome do projeto
        const nomeVotacao = dadosApiValor.votacao.nome || 'Votação';
        const statusVotacao =
          dadosApiValor.votacao.status?.replace('_', ' ') || ''; // Transforma "CHAMADA_1" em "CHAMADA 1"
        tituloComp.dados = { texto: `${nomeVotacao} (${statusVotacao})` };
      } else {
        // Se não há votação, mostra o nome da reunião normal
        tituloComp.dados = { texto: dadosApiValor.nomeReuniao || 'Reunião' };
      }
    }

    // Atualiza os componentes de Votação (Sim, Não, Abstenção)
    if (votacaoSimComp) {
      votacaoSimComp.visible = votacaoAtiva;
      if (votacaoAtiva) {
        if (!votacaoSimComp.props) votacaoSimComp.props = {};
        votacaoSimComp.props.valor = dadosApiValor.votacao.sim;
      }
    }
    if (votacaoNaoComp) {
      votacaoNaoComp.visible = votacaoAtiva;
      if (votacaoAtiva) {
        if (!votacaoNaoComp.props) votacaoNaoComp.props = {};
        votacaoNaoComp.props.valor = dadosApiValor.votacao.nao;
      }
    }
    if (votacaoAbstencaoComp) {
      votacaoAbstencaoComp.visible = votacaoAtiva;
      if (votacaoAtiva) {
        if (!votacaoAbstencaoComp.props) votacaoAbstencaoComp.props = {};
        votacaoAbstencaoComp.props.valor = dadosApiValor.votacao.abstencao;
      }
    }

    this.cenarioParaExibir = cenarioAtualizado;
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
}
