import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Cenario } from '../../models/cenario.model';
import { ComponenteEditor } from '../../models/components.model';
import { PainelService, ReuniaoDTO } from '../../services/painel.service';

// Imports dos componentes visuais necessários
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
  private updateSubscription: Subscription | undefined;
  private readonly PAINEL_IDENTIFICADOR = '15'; // O identificador do seu painel!

  constructor(
    private painelService: PainelService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.iniciarAtualizacaoAutomatica();
  }

  ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  private iniciarAtualizacaoAutomatica(): void {
    this.updateSubscription = interval(1000) 
      .pipe(
        switchMap(() => this.painelService.getDadosPainel(this.PAINEL_IDENTIFICADOR))
      )
      .subscribe({
        next: (dadosDaApi) => {
          console.log('Dados recebidos da API:', dadosDaApi);
          if(dadosDaApi && dadosDaApi['valor']){
            this.cenarioParaExibir = this.adaptarDtoParaCenario(dadosDaApi);
            this.ngAfterViewInit();
          }else{
            console.warn('sem dados de painel', dadosDaApi);
            this.cenarioParaExibir = null;
          }
        }
      });
  }

  /**
   * Esta é uma função CRÍTICA. Ela traduz os dados do backend
   * para o formato que seus componentes frontend entendem.
   * Você precisará ajustar este código para corresponder aos dados reais da API.
   */
  private adaptarDtoParaCenario(dto: ReuniaoDTO): Cenario {
    // Mapear os dados reais do DTO para a estrutura de componentes
    const componentes: ComponenteEditor[] = [
      { id: 'titulo', tipo: 'titulo', x: 235, y: 132, width: 430, height: 25, visible: true, dados: { texto: dto['tituloReuniao'] } },
      { id: 'subtitulo', tipo: 'subtitulo', x: 235, y: 169, width: 430, height: 20, visible: true, dados: { texto: dto['subtituloReuniao'] } },
      // ... mapear todos os outros componentes (parlamentares, votação, etc.)
    ];

    const cenario: Cenario = {
      id: `painel_${this.PAINEL_IDENTIFICADOR}`,
      nome: dto['nomePainel'] || 'Painel em Tempo Real',
      targetWidth: 1920, // Pode vir do DTO também
      targetHeight: 1080, // Pode vir do DTO também
      backgroundImage: dto['urlImagemFundo'] || '',
      componentes: componentes,
    };

    return cenario;
  }

  ngAfterViewInit(): void {
    // Usamos um pequeno timeout para garantir que o DOM foi atualizado
    setTimeout(() => this.ajustarEscala(), 0);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.ajustarEscala();
  }

  private ajustarEscala(): void {
    if (!this.wrapper || !this.cenarioParaExibir) {
      return;
    }
    const container = this.wrapper.nativeElement.parentElement;
    const target = this.wrapper.nativeElement;
    if (!container) return;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const targetWidth = this.cenarioParaExibir.targetWidth;
    const targetHeight = this.cenarioParaExibir.targetHeight;
    const scaleX = containerWidth / targetWidth;
    const scaleY = containerHeight / targetHeight;
    const scale = Math.min(scaleX, scaleY);
    this.renderer.setStyle(target, 'transform-origin', 'top left');
    this.renderer.setStyle(target, 'transform', `scale(${scale})`);
  }
}

