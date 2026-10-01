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
import { ComponenteEditor } from '../../models/components.model';
import { VotoItemComponent } from '../votacao-total/voto-item/voto-item.component';
import { StatusItemComponent } from '../status-reuniao/status-item/status-item.component';
import { MensagemComponent } from '../mensagem/mensagem.component';
import { ImagemStorageService } from '../../services/imagem-storage.service';
import { FonteService } from '../../services/fonte.service';
import { ResultadoVotacaoComponent } from '../resultado-votacao/resultado-votacao.component';
import { RelogioComponent } from '../relogio/relogio.component';
import { MultimidiaComponent } from '../multimidia/multimidia.component';
import { OradorComponent } from '../orador/orador.component';
import { PartidoComponent } from '../partido/partido.component';
import { MateriaComponent } from '../materia/materia.component';
import { CampoTextoComponent } from '../campo-texto/campo-texto.component';
import { LegisSocketService } from '../../services/legis-socket.service';
import { log } from '../../utils/log';
import { urlImagemFundo } from '../../config/runtime-config';

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
    ResultadoVotacaoComponent,
    RelogioComponent,
    MultimidiaComponent,
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
    private legisSocket: LegisSocketService,
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

    log.info('Display', `Painel: ${ipDoPainel} (endereço: ${ipDaUrl ?? '-'}, cenário: ${ipDoCenario ?? '-'}).`);

    if (!ipDoPainel) {
      log.erro('Display', 'Nenhum painel definido: escolha o Painel Alvo no cenário ou use ?ip= no endereço.');
      return;
    }

    const frequenciaMs = 1000;

    if (this.atualizacaoSubscription) {
      this.atualizacaoSubscription.unsubscribe();
    }


    this.legisSocket.conectar(String(ipDoPainel));

    this.atualizacaoSubscription = this.painelService
      .getDadosPainelComAvisos(
        ipDoPainel,
        this.legisSocket.avisos$,
        () => this.legisSocket.estaConectado(),
        frequenciaMs,
      )
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
            log.info('Display', `Trocando para o cenário ${novoIdCenario} (Controle Cenários).`);

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
      log.erro('Display', 'Falha ao ler a lista de parlamentares.', e);
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
    const paleta = this.lerPaleta(dadosApiValor);
    // Votação secreta: o Legis pede para esconder os votos no painel
    const votosMascarados =
      String(dadosApiValor.configuracaoExibicao?.exibir?.MASCARAR_VOTOS) === 'true';
    // Títulos, ementa, resultado, cronômetros e relógio passam a usar as cores da paleta
    this.fonteService.aplicarCoresDaPaleta(paleta);

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

            const cargo = String(dadosP.cargo || membro.cargo || '').trim().toUpperCase();
            const ehPresidente = cargo.startsWith('PRESID');

            const corNome = this.converterCor(dadosP.cor);

            let letra = '';
            let corVoto = '';

            if (votou) {
              const voto = votoString.toUpperCase();
              if (voto === 'SIM') {
                letra = 'S';
                corVoto = paleta['Cor_Voto_Sim'] || '#00FF00';
              } else if (voto === 'NAO' || voto === 'NÃO') {
                letra = 'N';
                corVoto = paleta['Cor_Voto_Nao'] || '#FF0000';
              } else if (voto.startsWith('ABST')) {
                letra = 'A';
                corVoto = paleta['Cor_Voto_Abstencao'] || '#FFFF00';
              } else if (voto.startsWith('BRANC')) {
                letra = 'B';
                corVoto = paleta['Cor_Voto_Branco'] || '#FFFFFF';
              } else if (voto === 'SECRETO') {
                letra = 'V'; // votou, mas o voto não pode ser mostrado
              }

              // Votação secreta/mascarada: mostra só que votou (V), sem revelar o voto nem a cor
              if (votosMascarados && letra) {
                letra = 'V';
                corVoto = '';
              }
            }

            // Presidente: se não ficou nenhuma letra de voto (não votou, ou a API mandou
            // um valor que não é Sim/Não/Abstenção/Branco/Secreto), mostra "P" como no legado
            if (!letra && (ehPresidente || votoString.toUpperCase().startsWith('PRESID'))) {
              letra = 'P';
            }

            layoutComp.dados = {
              nome: dadosP.nome || 'Nome não informado',
              partido: dadosP.partido || '',
              voto: votoString || '-',
              letra,
              corVoto,
              corNome,
              presenca: dadosP.status || '',
              presidente: ehPresidente,
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
          let listaCrono =
            dadosApiValor.cronometro?.cronometro ?? dadosApiValor.cronometro;
          if (!listaCrono || typeof listaCrono !== 'object') listaCrono = [];
          else if (!Array.isArray(listaCrono)) listaCrono = [listaCrono];

          const idBusca = TemporizadorItemComponent.numeroDoComponente(componente);

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

          // Cores da paleta do Legis (já convertidas do formato "$" do Delphi)
          const corPresente = paleta['Cor_Presente'] || '#00FF00';
          const corAusente = paleta['Cor_Ausente'] || '#FF0000';
          const corObstrucao = paleta['Cor_Obstrucao'] || '#AA00FF';
          const corLicenciado = paleta['Cor_Licenciado'] || '#00FFFF';
          const corTextos = paleta['Cor_TextosTela'] || '#FFFFFF';

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
              label: nomes.VOTOS || 'VOTOS',
              valor: totalVotosComputados,
              cor: paleta['Cor_Voto_Total'] || '#FFFFFF',
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
              cor: corTextos,
            };
          }
          if (componente.id === 'status-extras') {
            componente.props = {
              label: nomes.PRESENCA_EXTRA || 'EXTRA',
              valor: dadosPresencaResumo.presentesExtra || 0,
              cor: paleta['Cor_Presente_Extra'] || '#389cc7',
            };
          }
          if (componente.id === 'status-presencas-locais') {
            componente.props = {
              label: nomes.PRESENCA_LOCAL || 'PLENÁRIO',
              valor: dadosPresencaResumo.presencasLocais || 0,
              cor: paleta['Cor_Presente_Local'] || '#FFFFFF',
            };
          }
          if (componente.id === 'status-presencas-web') {
            componente.props = {
              label: nomes.PRESENCA_REMOTA || 'VIRTUAL',
              valor: dadosPresencaResumo.presencasWeb || 0,
              cor: paleta['Cor_Presente_Web'] || '#FFFFFF',
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
          
        case 'tipo-fala':
          // Tipo da fala de quem está na tribuna (ex.: DISCUSSÃO, APARTE)
          componente.dados = { texto: this.textoSimples(dadosApiValor.tribuna?.tipo) };
          break;

        case 'nome-cronometro': {
          // Nome do cronômetro N enviado pelo Legis (ex.: DISCUSSÃO); some quando parado
          const numero = TemporizadorItemComponent.numeroDoComponente(componente);
          const crono = this.listaCronometros(dadosApiValor).find(
            (c: any) => Number(c.cronometro) === numero,
          );
          componente.dados = {
            texto: this.textoSimples(crono?.nome),
            cor: this.converterCor(crono?.cor) || undefined,
          };
          break;
        }

        case 'mensagem-linha': {
          // Uma linha da mensagem do Legis, com cor/negrito/alinhamento definidos pelo operador
          const numeroLinha = Number(componente.props?.linha) || 1;
          const linha = this.linhasMensagem(dadosApiValor).find(
            (l: any) => Number(l?.linha) === numeroLinha - 1,
          );
          const alinhamento = ['left', 'center', 'right'].includes(linha?.align)
            ? linha.align
            : undefined;
          componente.dados = {
            texto: typeof linha?.texto === 'string' ? linha.texto : '',
            cor: this.converterCor(linha?.cor) || undefined,
            negrito: typeof linha?.bold === 'boolean' ? linha.bold : undefined,
            italico: typeof linha?.italic === 'boolean' ? linha.italic : undefined,
            sublinhado: linha?.underline === true,
            alinhamento,
          };
          break;
        }

        case 'autor':
          componente.dados = { texto: this.textoSimples(dadosApiValor.votacao?.autoria) };
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
        const cor = paleta['Cor_Voto_Abstencao'] || compAbstencao.props?.cor;
        compAbstencao.props = { ...compAbstencao.props, valor: val, cor };
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
        const cor = paleta['Cor_Voto_Branco'] || compBranco.props?.cor;
        compBranco.props = { ...compBranco.props, valor: val, cor };
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
          const corPaleta = paleta[key === 'sim' ? 'Cor_Voto_Sim' : 'Cor_Voto_Nao'];
          if (corPaleta) c.props.cor = corPaleta;
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
    this.legisSocket.desconectar();
    if (this.timerPaginacao) {
      clearInterval(this.timerPaginacao);
    }
  }

  @HostListener('window:resize') onResize(): void {
    this.ajustarEscala();
  }

  /** Imagem de fundo: arquivo da pasta do servidor (novo) ou base64 antigo, se ainda existir. */
  get fundoDisplay(): string {
    const c = this.cenarioParaExibir;
    if (!c) return 'none';
    const url = urlImagemFundo(c.imagemFundo) || c.backgroundImage;
    return url ? `url("${url}")` : 'none';
  }

  numeroCronometro(item: ComponenteEditor): number {
    return TemporizadorItemComponent.numeroDoComponente(item);
  }

  private lerPaleta(dadosApiValor: any): Record<string, string> {
    const mapa: Record<string, string> = {};
    let cores = dadosApiValor?.paleta?.cores;
    if (!cores) return mapa;
    if (!Array.isArray(cores)) cores = [cores];
    cores.forEach((c: any) => {
      const cor = this.converterCor(c?.valor);
      if (c?.nome && cor) mapa[c.nome] = cor;
    });
    return mapa;
  }


  private converterCor(valor: any): string {
    if (typeof valor !== 'string') return '';
    const v = valor.trim();
    if (v.startsWith('#')) return v;
    if (v.startsWith('$')) {
      const hex = v.slice(1).padStart(6, '0').slice(-6);
      const bb = hex.slice(0, 2);
      const gg = hex.slice(2, 4);
      const rr = hex.slice(4, 6);
      return `#${rr}${gg}${bb}`;
    }
    return '';
  }

  /** Lista de cronômetros da resposta (o XML pode trazer um só ou vários). */
  private listaCronometros(dadosApiValor: any): any[] {
    const lista = dadosApiValor?.cronometro?.cronometro ?? dadosApiValor?.cronometro;
    if (!lista || typeof lista !== 'object') return [];
    return Array.isArray(lista) ? lista : [lista];
  }

  /** Linhas da mensagem que o operador mandou pelo Legis (vêm como texto JSON). */
  private linhasMensagem(dadosApiValor: any): any[] {
    const conteudo = dadosApiValor?.telaMensagem?.conteudo;
    if (typeof conteudo !== 'string' || !conteudo.trim()) return [];
    try {
      const linhas = JSON.parse(conteudo);
      return Array.isArray(linhas) ? linhas : [];
    } catch {
      return [];
    }
  }

  private textoSimples(valor: any): string {
    return typeof valor === 'string' || typeof valor === 'number' ? String(valor).trim() : '';
  }

  private ajustarEscala(): void {
    if (!this.wrapper || !this.cenarioParaExibir) return;

    const target = this.wrapper.nativeElement;

    // O cenário é exibido sempre na resolução fixa que foi salva no editor (escala 1).
    // Antes ele era esticado até encostar na borda da tela, e por isso crescia ao dar F11.
    // Para voltar a ajustar à tela, abra o display com ?ajustar=1 na URL.
    const ajustarATela = this.route.snapshot.queryParamMap.get('ajustar') === '1';

    let scale = 1;
    if (ajustarATela) {
      const scaleX = window.innerWidth / this.cenarioParaExibir.targetWidth;
      const scaleY = window.innerHeight / this.cenarioParaExibir.targetHeight;
      scale = Math.min(scaleX, scaleY);
    }

   const centralizar = this.route.snapshot.queryParamMap.get('centralizar') === '1';

    let margemEsquerda = 0;
    let margemTopo = 0;

    if (centralizar) {
      const larguraEscalada = this.cenarioParaExibir.targetWidth * scale;
      const alturaEscalada = this.cenarioParaExibir.targetHeight * scale;
      margemEsquerda = (window.innerWidth - larguraEscalada) / 2;
      margemTopo = (window.innerHeight - alturaEscalada) / 2;
    }

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
      }
    } catch (err) {
      log.erro('Display', 'Falha ao carregar a imagem de fundo.', err);
    }
  }
}