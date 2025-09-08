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
  ],
  templateUrl: './display.component.html',
  styleUrl: './display.component.css',
})
export class DisplayComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('wrapper') wrapper!: ElementRef<HTMLDivElement>;

  cenarioParaExibir: Cenario | null = null;

  private atualizacaoSubscription: Subscription | null = null;
  private readonly PAINEL_IDENTIFICADOR = '15';

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
    this.buscarEAtualizarDados();

    /*
    this.atualizacaoSubscription = interval(5000).subscribe(() => {
      this.buscarEAtualizarDados();
    });
    */
  }

  private buscarEAtualizarDados(): void {
    this.painelService.getDadosPainel(this.PAINEL_IDENTIFICADOR).subscribe({
      next: (dadosDaApi) => {
        console.log(
          'Dados (já convertidos de XML) recebidos da API:',
          dadosDaApi
        );

        // Verificamos se recebemos dados válidos no campo 'valor'
        if (this.cenarioParaExibir && dadosDaApi && dadosDaApi['valor']) {
          this.atualizarCenarioComDadosReais(dadosDaApi['valor']);
        } else {
          console.warn(
            'Backend respondeu com sucesso, mas sem dados de painel (valor is null).'
          );
        }
      },
      error: (err) => console.error('Erro ao buscar dados do painel:', err),
    });
  }

private atualizarCenarioComDadosReais(dados: any): void {
    if (!this.cenarioParaExibir) return;

    // Usamos structuredClone para criar uma nova cópia do cenário e evitar mutações inesperadas
    const cenarioAtualizado = structuredClone(this.cenarioParaExibir);

    // --- Mapear Parlamentares ---
    let parlamentaresApi: any[] = [];
    // O caminho correto no JSON é: parlamentares -> presencas (que é um array) -> primeiro item -> membros
    if (dados.parlamentares && dados.parlamentares.presencas && dados.parlamentares.presencas.length > 0) {
        const membros = dados.parlamentares.presencas[0].membros;
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
                voto: parlamentarApi.voto?.status || '-', // O 'voto' pode ser nulo
            };
            parlamentaresLayout[index].visible = true; // Garante que o componente seja visível
        }
    });

    // Esconde os componentes de parlamentar que não receberam dados da API
    for (let i = parlamentaresApi.length; i < parlamentaresLayout.length; i++) {
        parlamentaresLayout[i].visible = false;
    }

    cenarioAtualizado.componentes.forEach((componente) => {
        switch (componente.tipo) {
            case 'titulo':
                componente.dados = { texto: dados.nomeReuniao || 'Reunião' };
                break;
            case 'subtitulo':
                componente.dados = { texto: dados.categoriaReuniao || 'Status' };
                break;
            case 'descricao':
                componente.dados = { texto: dados.statusReuniao || '' };
                break;
            case 'status-item':
                // O caminho correto para os dados de presença
                const presencas = dados.parlamentares?.presencas?.[0] || {};
                
                if (componente.id === 'status-presentes') {
                    componente.props = {
                        label: 'PRESENTES',
                        valor: presencas.presentes || 0,
                    };
                }
                if (componente.id === 'status-votos') {
                    // Lógica para calcular o total de votos. Adapte se necessário.
                    const totalVotos = (Number(presencas.presentes) || 0) - (Number(presencas.abstencao) || 0);
                    componente.props = { label: 'VOTOS', valor: totalVotos };
                }
                break;
        }
    });

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
    const scale = Math.min(
      container.clientWidth / this.cenarioParaExibir.targetWidth,
      container.clientHeight / this.cenarioParaExibir.targetHeight
    );
    this.renderer.setStyle(target, 'transform-origin', 'top left');
    this.renderer.setStyle(target, 'transform', `scale(${scale})`);
  }
}
