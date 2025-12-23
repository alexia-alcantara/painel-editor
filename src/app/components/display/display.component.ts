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
import { OradorComponent } from '../orador/orador.component';
import { PartidoComponent } from '../partido/partido.component';
import { MateriaComponent } from '../materia/materia.component';

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
    MateriaComponent,
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
    const ipDaUrl = this.route.snapshot.queryParamMap.get('ip');
    const ipDoCenario = this.cenarioParaExibir?.idPainel;

    const ipDoPainel = ipDaUrl || ipDoCenario;

    console.log(
      `🔎 IP Detectado -> URL: ${ipDaUrl}, Salvo: ${ipDoCenario}. Usando: ${ipDoPainel}`
    );

    if (!ipDoPainel) {
      console.error(
        'ERRO: Nenhum ID de Painel foi encontrado no cenário ou na URL!'
      );
      return;
    }

    const frequenciaMs = 1000; // 1 segundo para ficar mais fluido

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
        if (dadosDaApi) {
          const dados = dadosDaApi.valor || dadosDaApi;
          this.atualizarCenarioComDadosReais(dadosDaApi);
        }
      });
  }

  private atualizarCenarioComDadosReais(dados: any): void {
    if (!this.cenarioParaExibir) return;

    const dadosApiValor = dados.valor || dados;
    console.log('Processando dados para o cenário...');

    let parlamentaresApi: any[] = [];
    let dadosPresencaResumo: any = {};

    try {
      const pData = dadosApiValor.parlamentares;
      if (pData) {
        let cursor = pData.presencas;

        if (Array.isArray(cursor)) cursor = cursor[0];

        if (cursor && cursor.presencas) {
          cursor = cursor.presencas;
        }

        dadosPresencaResumo = cursor || {};

        if (cursor && cursor.membros) {
          let listaCrua = cursor.membros;

          if (listaCrua.membros) {
            listaCrua = listaCrua.membros;
          }

          parlamentaresApi = Array.isArray(listaCrua) ? listaCrua : [listaCrua];
        }
      }
    } catch (e) {
      console.error('Erro ao extrair parlamentares:', e);
    }

    console.log(`Parlamentares processados: ${parlamentaresApi.length}`);

    const mostrarPlacar =
      dadosApiValor.configuracaoExibicao?.exibir?.TOTAIS_PARCIAIS !== 'false';

    const visibilidadeOriginal = this.cenarioParaExibir.componentes.reduce(
      (map: any, comp) => {
        map[comp.id] = comp.visible;
        return map;
      },
      {}
    );

    const cenarioAtualizado = structuredClone(this.cenarioParaExibir);

    const parlamentaresLayout = cenarioAtualizado.componentes.filter(
      (c) => c.tipo === 'parlamentar'
    );

    parlamentaresApi.forEach((membro: any, index: number) => {
      // O dado pode estar direto ou dentro de 'titular'
      const dadosP = membro.titular || membro;
      const layoutComp = parlamentaresLayout[index];

      if (layoutComp && dadosP) {
        layoutComp.visible = visibilidadeOriginal[layoutComp.id] ?? false;

        if (layoutComp.visible) {
          const votoString =
            typeof dadosP.voto === 'string' ? dadosP.voto.trim() : '';

          const votou = votoString !== '' && votoString !== '-';

          let textoParaExibir = '';
          let corParaExibir = '#FFFFFF';

          if (votou) {
            if (votoString === 'SIM') {
              textoParaExibir = 'S';
              corParaExibir = '#00FF00'; // Verde
            } else if (votoString === 'NAO' || votoString === 'NÃO') {
              textoParaExibir = 'N';
              corParaExibir = '#FF0000'; // Vermelho
            } else if (votoString.startsWith('ABST')) {
              textoParaExibir = 'A'; // Abstenção
              corParaExibir = '#FFFF00'; // Amarelo
            } else {
              textoParaExibir = votoString; // Outro caso
            }
          } else {
            // Se não votou, mostra status (PRESENTE / AUSENTE)
            textoParaExibir = dadosP.status || '';
            // Se for Ausente, fica branco ou cinza. Se for Presente, fica Verde.
            if (textoParaExibir === 'PRESENTE') corParaExibir = '#00FF00';
          }

          layoutComp.dados = {
            nome: dadosP.nome || 'Nome não informado',
            partido: dadosP.partido || '',
            voto: votoString || '-',
            status: textoParaExibir,
            cor: corParaExibir,
            foto: dadosP.foto,
          };
        }
      }
    });

    for (let i = parlamentaresApi.length; i < parlamentaresLayout.length; i++) {
      parlamentaresLayout[i].visible = false;
    }

    cenarioAtualizado.componentes.forEach((componente) => {
      if (componente.tipo !== 'parlamentar') {
        componente.visible = visibilidadeOriginal[componente.id] ?? false;
      }

      switch (componente.tipo as any) {
        case 'titulo':
          componente.dados = { texto: dadosApiValor.nomeReuniao || 'Sessão' };
          break;

        case 'subtitulo':
          const nomeVotacao = dadosApiValor.votacao?.nome;
          const categoria = dadosApiValor.categoriaReuniao;
          componente.dados = { texto: nomeVotacao || categoria || '' };
          break;

        case 'descricao':
          const ementa = dadosApiValor.votacao?.ementa;
          const statusR = dadosApiValor.statusReuniao;
          componente.dados = { texto: ementa || statusR || '' };
          break;

        case 'orador':
          componente.dados = {
            orador: dadosApiValor.tribuna?.orador || '',
            partido: dadosApiValor.tribuna?.partido || '',
          };
          break;

        case 'materia':
          componente.dados = {
            materia: dadosApiValor.tribuna?.materia || '',
            ementa: dadosApiValor.votacao?.ementa || '',
          };
          break;

        case 'temporizador-item':
          let listaCrono = dadosApiValor.cronometro;

          if (!listaCrono) listaCrono = [];
          else if (!Array.isArray(listaCrono)) listaCrono = [listaCrono];

          // Descobre qual ID numérico buscar (1, 2, 4...) baseado no ID string do componente
          let idBusca = 1;
          if (componente.id.includes('2')) idBusca = 2;
          if (componente.id.includes('3') || componente.id.includes('4'))
            idBusca = 4;

          const dadosC = listaCrono.find((c: any) => c.cronometro == idBusca);

          if (dadosC) {
            let h = 0,
              m = 0,
              s = 0;
            if (typeof dadosC.tempo === 'string') {
              const partes = dadosC.tempo.split(':');
              if (partes.length >= 2) {
                h = +partes[0] || 0;
                m = +partes[1] || 0;
                s = +partes[2] || 0;
              }
            } else if (typeof dadosC.segundos === 'number') {
              const total = dadosC.segundos;
              h = Math.floor(total / 3600);
              m = Math.floor((total % 3600) / 60);
              s = total % 60;
            }

            componente.dados = {
              cronometro: idBusca,
              hora: h,
              minuto: m,
              segundo: s,
              modo: dadosC.modo || 'PARADO',
              cor: dadosC.cor,
            };
          }
          break;

        case 'texto':
        case 'data-atual':
          if (componente.id === 'data-atual') {
            const hoje = new Date();
            componente.dados = { texto: hoje.toLocaleDateString('pt-BR') };
          }
          break;

        case 'status-item':
          const nomes = dadosApiValor.nomesTotalizadores || {};

          let mapaCores: any = {};
          if (dadosApiValor.paleta && dadosApiValor.paleta.cores) {
            const listaCores = Array.isArray(dadosApiValor.paleta.cores)
              ? dadosApiValor.paleta.cores
              : [dadosApiValor.paleta.cores];

            listaCores.forEach((c: any) => {
              mapaCores[c.nome] = c.valor;
            });
          }
          const corPresente = mapaCores['Cor_Presente'] || '#00FF00';
          const corAusente = mapaCores['Cor_Ausente'] || '#FF0000';
          const corObstrucao = mapaCores['Cor_Obstrucao'] || '#AA00FF';
          const corLicenciado = mapaCores['Cor_Licenciado'] || '#00FFFF';

          const votosSim = Number(dadosApiValor.votacao?.sim) || 0;
          const votosNao = Number(dadosApiValor.votacao?.nao) || 0;
          const votosAbs = Number(dadosApiValor.votacao?.abstencao) || 0;
          const totalVotosComputados = votosSim + votosNao + votosAbs;

          if (componente.id === 'status-presentes') {
            componente.props = {
              label: nomes.PRESENTES || 'PRESENTES',
              valor: dadosPresencaResumo.presentes || 0,
              cor: corPresente,
            };
            componente.style = { ...componente.style, color: corPresente };
          }
          if (componente.id === 'status-ausentes') {
            componente.props = {
              label: nomes.AUSENTES || 'AUSENTES',
              valor: dadosPresencaResumo.ausentes || 0,
              cor: corAusente,
            };
            componente.style = { ...componente.style, color: corAusente };
          }
          if (componente.id === 'status-quorum') {
            const valQuorum =
              dadosPresencaResumo.quorum || dadosPresencaResumo.presentes || 0;
            componente.props = {
              label: 'QUORUM',
              valor: valQuorum,
              cor: '#00FF00',
            };
          }
          if (
            componente.id === 'status-votos' ||
            componente.id === 'status-total-votos'
          ) {
            componente.props = {
              label: 'VOTOS',
              valor: totalVotosComputados,
              cor: '#FFFFFF',
            };
          }
          if (componente.id === 'status-licenciados') {
            componente.props = {
              label: nomes.LICENCIADOS || 'LICENÇA',
              valor: dadosPresencaResumo.licenciados || 0,
              cor: corLicenciado,
            };
            componente.style = { ...componente.style, color: corLicenciado };
          }
          if (componente.id === 'status-obstrucao') {
            componente.props = {
              label: nomes.OBSTRUCAO || 'OBSTRUÇÃO',
              valor: dadosPresencaResumo.obstrucao || 0,
              cor: corObstrucao,
            };
            componente.style = { ...componente.style, color: corObstrucao };
          }
          break;

        case 'resultado-votacao':
          const resultadoTxt = dadosApiValor.votacao?.resultado_texto;
          componente.visible =
            visibilidadeOriginal[componente.id] && !!resultadoTxt;
          if (componente.visible) {
            componente.dados = { texto: resultadoTxt };
          }
          break;

        case 'totalizadores':
          // Se tiver componente de totalizador unificado
          if (visibilidadeOriginal[componente.id] && dadosApiValor.votacao) {
            componente.dados = dadosApiValor.votacao;
          }
          break;
      }
    });

    const temVotacao = !!dadosApiValor.votacao;

    const compAbstencao = cenarioAtualizado.componentes.find(
      (c) => c.id === 'voto-abstencao'
    );
    if (compAbstencao) {
      compAbstencao.visible =
        (visibilidadeOriginal[compAbstencao.id] ?? false) &&
        temVotacao &&
        mostrarPlacar;
      if (compAbstencao.visible) {
        const val = dadosApiValor.votacao?.abstencao || 0;
        // Atualiza props e dados para garantir compatibilidade
        compAbstencao.props = { ...compAbstencao.props, valor: val };
        compAbstencao.dados = { ...compAbstencao.dados, valor: val };
      }
    }

    ['voto-sim', 'voto-nao'].forEach((id) => {
      const c = cenarioAtualizado.componentes.find((x) => x.id === id);
      if (c) {
        c.visible = (visibilidadeOriginal[c.id] ?? false) && temVotacao;
        if (c.visible) {
          const key = id.split('-')[1]; // 'sim' ou 'nao'
          const val = dadosApiValor.votacao?.[key] || 0;

          if (!c.props) c.props = {};
          c.props.valor = val;
          c.dados = { ...c.dados, valor: val };
        }
      }
    });

    // Atualiza a tela
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

    const scale = container.clientWidth / this.cenarioParaExibir.targetWidth;

    this.renderer.setStyle(target, 'transform-origin', 'top left');
    this.renderer.setStyle(target, 'transform', `scale(${scale})`);
  }

  private async carregarImagemDeFundo(id: string): Promise<void> {
    try {
      const arquivo = await this.imagemStorageService.carregarImagem(id);

      if (arquivo) {
        const url = URL.createObjectURL(arquivo);

        this.renderer.setStyle(
          this.wrapper.nativeElement,
          'backgroundImage',
          `url(${url})`
        );
        console.log(`Imagem de fundo com ID ${id} carregada.`);
      } else {
        console.warn(`Imagem de fundo com ID ${id} não encontrada.`);
      }
    } catch (err) {
      console.error('Erro ao carregar imagem de fundo:', err);
    }
  }
}
