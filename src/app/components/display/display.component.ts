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
import { Subscription, interval, firstValueFrom } from 'rxjs';

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
import { FonteService } from '../../services/fonte.service';
import { ResultadoVotacaoComponent } from '../resultado-votacao/resultado-votacao.component';
import { RelogioComponent } from '../relogio/relogio.component';
import { OradorComponent } from '../orador/orador.component';
import { PartidoComponent } from '../partido/partido.component';
import { MateriaComponent } from '../materia/materia.component';
import { CampoTextoComponent } from '../campo-texto/campo-texto.component';

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
    CampoTextoComponent,
  ],
  templateUrl: './display.component.html',
  styleUrl: './display.component.css',
})
export class DisplayComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('wrapper') wrapper!: ElementRef<HTMLDivElement>;

  cenarioBase: Cenario | null = null;
  cenarioParaExibir: Cenario | null = null;

  private paginaAtualParlamentares = 0;
  private timerPaginacao: any;

  private atualizacaoSubscription: Subscription | null = null;
  private ultimoIdCenarioTentado: string | null = null;
  private ultimoDadosJson: string = '';

  paletaDeCores: any = {};
  private painelSubscription: Subscription | undefined;

  constructor(
    private el: ElementRef,
    private route: ActivatedRoute,
    private layoutService: LayoutService,
    private painelService: PainelService,
    private renderer: Renderer2,
    private imagemStorageService: ImagemStorageService,
    private fonteService: FonteService,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const idCenario = this.route.snapshot.paramMap.get('id');

    if (idCenario) {
      this.layoutService.carregarCenario(idCenario).subscribe((cenario) => {
        this.cenarioBase = cenario;

        if (this.cenarioBase) {
          this.fonteService.carregarGrupos(this.cenarioBase.fontes);
          this.cenarioParaExibir = structuredClone(this.cenarioBase);

          if (this.cenarioBase.imagemFundoId) {
            this.carregarImagemDeFundo(this.cenarioBase.imagemFundoId);
          }

          this.iniciarAtualizacaoAutomatica();
        }
      });
    }
  }

  private iniciarAtualizacaoAutomatica(): void {
    const ipDaUrl = this.route.snapshot.queryParamMap.get('ip');
    const ipDoCenario = this.cenarioBase?.idPainel;

    const ipDoPainel = ipDaUrl || ipDoCenario;

    console.log(
      `IP Detectado -> URL: ${ipDaUrl}, Salvo: ${ipDoCenario}. Usando: ${ipDoPainel}`,
    );

    if (!ipDoPainel) {
      console.error(
        'ERRO: Nenhum ID de Painel foi encontrado no cenário ou na URL!',
      );
      return;
    }

    const frequenciaMs = 1000;

    if (this.atualizacaoSubscription) {
      this.atualizacaoSubscription.unsubscribe();
    }

    console.log(
      `%cIniciando busca de dados para o painel: ${ipDoPainel}`,
      'color: yellow; font-weight: bold;',
    );

    this.atualizacaoSubscription = this.painelService
      .getDadosPainelEmTempoReal(ipDoPainel, frequenciaMs)
      .subscribe(async (dadosDaApi) => {
        if (dadosDaApi) {
          const dados = dadosDaApi.valor || dadosDaApi;

          const idBruto = dados.idCenarioAtivo || dados.idCenario;
          const novoIdCenario =
            typeof idBruto === 'string' || typeof idBruto === 'number'
              ? String(idBruto).trim()
              : '';

          const base = this.cenarioBase;
          const ehOMesmo =
            !!base &&
            [base.id, base.slug, String(base.idBackend ?? '')].includes(
              novoIdCenario,
            );

          if (
            novoIdCenario &&
            base &&
            !ehOMesmo &&
            novoIdCenario !== this.ultimoIdCenarioTentado
          ) {
            this.ultimoIdCenarioTentado = novoIdCenario;
            console.log(
              `Trocando layout automaticamente para o cenário ID: ${novoIdCenario}`,
            );

            const novoCenario = await firstValueFrom(
              this.layoutService.carregarCenario(novoIdCenario),
            );

            if (novoCenario) {
              this.cenarioBase = novoCenario;
              this.fonteService.carregarGrupos(novoCenario.fontes);
              this.cenarioParaExibir = structuredClone(novoCenario);

              this.paginaAtualParlamentares = 0;
              if (this.timerPaginacao) {
                clearInterval(this.timerPaginacao);
                this.timerPaginacao = null;
              }

              if (this.cenarioBase.imagemFundoId) {
                await this.carregarImagemDeFundo(
                  this.cenarioBase.imagemFundoId,
                );
              }

              // Reajusta proporções
              setTimeout(() => this.ajustarEscala(), 0);
            }
          }

          const dadosBrutos = dadosDaApi.valor || dadosDaApi;
          const dadosJson = JSON.stringify(dadosBrutos);
          if (dadosJson === this.ultimoDadosJson) {
            return; 
          }
          this.ultimoDadosJson = dadosJson;

          this.atualizarCenarioComDadosReais(dadosDaApi);
        }
      });
  }

  private atualizarCenarioComDadosReais(dados: any): void {
    if (!this.cenarioBase) return;

    const dadosApiValor = dados.valor || dados;
    console.log('Processando dados para o cenário...');

    let parlamentaresApi: any[] = [];
    let dadosPresencaResumo: any = {};

    try {
      const pData = dadosApiValor.parlamentares;
      if (pData) {
        let cursor = pData.presencas;
        if (Array.isArray(cursor)) cursor = cursor[0];
        if (cursor && cursor.presencas) cursor = cursor.presencas;

        dadosPresencaResumo = cursor || {};

        if (cursor && cursor.membros) {
          let listaCrua = cursor.membros;
          if (listaCrua.membros) listaCrua = listaCrua.membros;
          parlamentaresApi = Array.isArray(listaCrua) ? listaCrua : [listaCrua];
        }
      }
    } catch (e) {
      console.error('Erro ao extrair parlamentares:', e);
    }

    const mostrarPlacar =
      dadosApiValor.configuracaoExibicao?.exibir?.TOTAIS_PARCIAIS !== 'false';

    const visibilidadeOriginal = this.cenarioBase.componentes.reduce(
      (map: any, comp) => {
        map[comp.id] = comp.visible;
        return map;
      },
      {},
    );

    const cenarioAtualizado = structuredClone(this.cenarioBase);

    const parlamentaresLayout = cenarioAtualizado.componentes.filter(
      (c) => c.tipo === 'parlamentar',
    );

    const tamanhoPagina = parlamentaresLayout.length;

    if (tamanhoPagina > 0 && parlamentaresApi.length > 0) {
      if (!this.timerPaginacao && parlamentaresApi.length > tamanhoPagina) {
        this.timerPaginacao = setInterval(() => {
          const totalPaginas = Math.ceil(
            parlamentaresApi.length / tamanhoPagina,
          );
          this.paginaAtualParlamentares =
            (this.paginaAtualParlamentares + 1) % totalPaginas;
        }, 10000); // 10 segundos por página
      }

      if (parlamentaresApi.length <= tamanhoPagina && this.timerPaginacao) {
        clearInterval(this.timerPaginacao);
        this.timerPaginacao = null;
        this.paginaAtualParlamentares = 0;
      }

      const inicio = this.paginaAtualParlamentares * tamanhoPagina;
      const fim = inicio + tamanhoPagina;
      const parlamentaresDaPagina = parlamentaresApi.slice(inicio, fim);

      parlamentaresDaPagina.forEach((membro: any, index: number) => {
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
                corParaExibir = '#00FF00';
              } else if (votoString === 'NAO' || votoString === 'NÃO') {
                textoParaExibir = 'N';
                corParaExibir = '#FF0000';
              } else if (votoString.startsWith('ABST')) {
                textoParaExibir = 'A';
                corParaExibir = '#FFFF00';
              } else {
                textoParaExibir = votoString;
              }
            } else {
              const situacao = dadosP.status || '';
              textoParaExibir =
                situacao === 'PRESENTE'
                  ? 'P'
                  : situacao === 'AUSENTE'
                    ? ''
                    : situacao;
              if (situacao === 'PRESENTE') corParaExibir = '#00FF00';
            }

            layoutComp.dados = {
              nome: dadosP.nome || 'Nome não informado',
              partido: dadosP.partido || '',
              voto: votoString || '-',
              status: textoParaExibir,
              presenca: dadosP.status || '',
              cor: corParaExibir,
              foto: dadosP.foto,
            };
          }
        }
      });

      for (let i = parlamentaresDaPagina.length; i < tamanhoPagina; i++) {
        parlamentaresLayout[i].visible = false;
      }
    } else {
      parlamentaresLayout.forEach((comp) => (comp.visible = false));
    }

    cenarioAtualizado.componentes.forEach((componente) => {
      if (componente.tipo !== 'parlamentar') {
        componente.visible = visibilidadeOriginal[componente.id] ?? false;
      }


      if (componente.id === 'data-atual') {
        componente.dados = { texto: new Date().toLocaleDateString('pt-BR') };
        return;
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
          const temOrador =
            dadosApiValor.tribuna &&
            Object.keys(dadosApiValor.tribuna).length > 0;
          if (!temOrador) {
            componente.visible = false;
          } else {
            componente.dados = {
              orador:
                dadosApiValor.tribuna.orador ||
                dadosApiValor.tribuna.nomeParlamentar ||
                dadosApiValor.tribuna.nome ||
                '',
              partido: dadosApiValor.tribuna.partido || '',
            };
          }
          break;

        case 'partido':
          const temPartido =
            dadosApiValor.tribuna && dadosApiValor.tribuna.partido;
          if (!temPartido) {
            componente.visible = false;
          } else {
            componente.dados = {
              partido: dadosApiValor.tribuna.partido,
            };
          }
          break;

        case 'mensagem': {
          let linhasMensagem: any[] = [];
          const conteudoMensagem = dadosApiValor.telaMensagem?.conteudo;
          if (typeof conteudoMensagem === 'string' && conteudoMensagem.trim()) {
            try {
              const parsed = JSON.parse(conteudoMensagem);
              if (Array.isArray(parsed)) linhasMensagem = parsed;
            } catch {}
          }
          if (linhasMensagem.length > 0) {
            componente.dados = { ...componente.dados, linhas: linhasMensagem };
          }
          break;
        }

        case 'materia':
          const textoMateria =
            dadosApiValor.tribuna?.materia || dadosApiValor.votacao?.ementa;
          if (
            !textoMateria ||
            (typeof textoMateria === 'object' &&
              Object.keys(textoMateria).length === 0)
          ) {
            componente.visible = false;
          } else {
            componente.dados = {
              materia: dadosApiValor.tribuna?.materia || '',
              ementa: dadosApiValor.votacao?.ementa || '',
            };
          }
          break;

        case 'temporizador-item':
          // A API manda um <cronometro> dentro do outro: valor.cronometro.cronometro (um ou vários)
          let listaCrono =
            dadosApiValor.cronometro?.cronometro ?? dadosApiValor.cronometro;
          if (!listaCrono || typeof listaCrono !== 'object') listaCrono = [];
          else if (!Array.isArray(listaCrono)) listaCrono = [listaCrono];

          let idBusca = 1;
          if (componente.id.includes('2')) idBusca = 2;
          if (componente.id.includes('3') || componente.id.includes('4'))
            idBusca = 4;

          const dadosC = listaCrono.find(
            (c: any) => Number(c.cronometro) === idBusca,
          );

          if (dadosC) {
            let h = Number(dadosC.hora) || 0;
            let m = Number(dadosC.minuto) || 0;
            let s = Number(dadosC.segundo) || 0;

            if (dadosC.hora === undefined) {
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
          if (componente.id === 'status-parlamentares') {
            const totalParlamentares =
              (Number(dadosPresencaResumo.presentes) || 0) +
              (Number(dadosPresencaResumo.ausentes) || 0) +
              (Number(dadosPresencaResumo.licenciados) || 0);
            componente.props = {
              label: nomes.PARLAMENTARES || 'PARLAMENTARES',
              valor: totalParlamentares,
              cor: '#FFFFFF',
            };
          }
          if (componente.id === 'status-extras') {
            componente.props = {
              label: nomes.PRESENCA_EXTRA || 'EXTRA',
              valor: dadosPresencaResumo.presentesExtra || 0,
              cor: '#389cc7',
            };
          }
          if (componente.id === 'status-presencas-locais') {
            componente.props = {
              label: nomes.PRESENCA_LOCAL || 'PLENÁRIO',
              valor: dadosPresencaResumo.presencasLocais || 0,
              cor: '#FFFFFF',
            };
          }
          if (componente.id === 'status-presencas-web') {
            componente.props = {
              label: nomes.PRESENCA_REMOTA || 'VIRTUAL',
              valor: dadosPresencaResumo.presencasWeb || 0,
              cor: '#FFFFFF',
            };
          }
          break;

        case 'turno-votacao':
          componente.dados = {
            texto: dadosApiValor.votacao?.turno?.nome || '',
          };
          break;

        case 'modo-votacao':
          componente.dados = {
            texto: dadosApiValor.votacao?.modovotacao || '',
          };
          break;

        case 'parametro-votacao':
          componente.dados = {
            texto: dadosApiValor.votacao?.parametrosvotacao?.nome || '',
          };
          break;

        case 'categoria-reuniao':
          componente.dados = { texto: dadosApiValor.categoriaReuniao || '' };
          break;

        case 'resultado-votacao':
          const resultadoTxt = dadosApiValor.votacao?.resultado_texto;
          const exibirResultado =
            String(dadosApiValor.votacao?.exibirresultado) === 'true';
          componente.visible =
            visibilidadeOriginal[componente.id] &&
            exibirResultado &&
            !!resultadoTxt;
          if (componente.visible) {
            componente.dados = { texto: resultadoTxt };
          }
          break;

        case 'totalizadores':
          if (visibilidadeOriginal[componente.id] && dadosApiValor.votacao) {
            componente.dados = dadosApiValor.votacao;
          }
          break;
      }
    });

    const temVotacao =
      dadosApiValor.votacao && Object.keys(dadosApiValor.votacao).length > 0;

    const compAbstencao = cenarioAtualizado.componentes.find(
      (c) => c.id === 'voto-abstencao',
    );
    if (compAbstencao) {
      compAbstencao.visible =
        (visibilidadeOriginal[compAbstencao.id] ?? false) &&
        temVotacao &&
        mostrarPlacar;
      if (compAbstencao.visible) {
        const val = dadosApiValor.votacao?.abstencao || 0;
        compAbstencao.props = { ...compAbstencao.props, valor: val };
        compAbstencao.dados = { ...compAbstencao.dados, valor: val };
      }
    }

    const compBranco = cenarioAtualizado.componentes.find(
      (c) => c.id === 'voto-branco',
    );
    if (compBranco) {
      compBranco.visible =
        (visibilidadeOriginal[compBranco.id] ?? false) &&
        temVotacao &&
        mostrarPlacar;
      if (compBranco.visible) {
        const val = dadosApiValor.votacao?.brancos || 0;
        compBranco.props = { ...compBranco.props, valor: val };
        compBranco.dados = { ...compBranco.dados, valor: val };
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
    if (this.timerPaginacao) {
      clearInterval(this.timerPaginacao);
    }
  }

  @HostListener('window:resize') onResize(): void {
    this.ajustarEscala();
  }

  private ajustarEscala(): void {
    if (!this.wrapper || !this.cenarioParaExibir) return;

    const target = this.wrapper.nativeElement;

    const scaleX = window.innerWidth / this.cenarioParaExibir.targetWidth;
    const scaleY = window.innerHeight / this.cenarioParaExibir.targetHeight;
    const scale = Math.min(scaleX, scaleY);

    const larguraEscalada = this.cenarioParaExibir.targetWidth * scale;
    const alturaEscalada = this.cenarioParaExibir.targetHeight * scale;

    const margemEsquerda = (window.innerWidth - larguraEscalada) / 2;
    const margemTopo = (window.innerHeight - alturaEscalada) / 2;

    this.renderer.setStyle(target, 'transform-origin', 'top left');
    this.renderer.setStyle(
      target,
      'transform',
      `translate(${margemEsquerda}px, ${margemTopo}px) scale(${scale})`,
    );
  }

  private async carregarImagemDeFundo(id: string): Promise<void> {
    try {
      const dataUrl = await firstValueFrom(
        this.imagemStorageService.carregarImagem(id),
      );

      if (dataUrl) {
        if (this.cenarioParaExibir)
          this.cenarioParaExibir.backgroundImage = dataUrl;
        if (this.cenarioBase) this.cenarioBase.backgroundImage = dataUrl;

        this.cdRef.detectChanges();
        console.log(`Imagem de fundo vinculada com sucesso!`);
      }
    } catch (err) {
      console.error('Erro ao carregar imagem de fundo:', err);
    }
  }
}