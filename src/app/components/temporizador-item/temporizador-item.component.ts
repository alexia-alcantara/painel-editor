import { Component, Input, SimpleChanges } from '@angular/core';
import { FonteService } from '../../services/fonte.service';
import { FontConfig } from '../../models/fontes.model';
import { CommonModule } from '@angular/common';
import { alinhamentoFlex, converterCorLegis } from '../../utils/estilo-texto';

export interface CronometroData {
  cronometro: number;
  hora: number;
  minuto: number;
  segundo: number;
  modo: 'PARADO' | 'PROGRESSIVO' | 'REGRESSIVO';
  cor: string;
}

@Component({
  selector: 'app-temporizador-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './temporizador-item.component.html',
  styleUrl: './temporizador-item.component.css',
})
export class TemporizadorItemComponent {
  @Input() dados: CronometroData | undefined;
  
  @Input() numero?: number;
  @Input() modoEditor = false;

  tempoDisplay: string = '00:00';

  get textoExibido(): string {
    if (this.modoEditor && !this.dados) return `C${this.numero || 1}`;
    return this.tempoDisplay;
  }

  static numeroDoComponente(comp: { id: string; props?: { cronometro?: number } }): number {
    const doProps = Number(comp?.props?.cronometro);
    if (doProps >= 1) return doProps;
    const doId = Number((comp?.id || '').match(/(\d+)\s*$/)?.[1]);
    return doId >= 1 ? doId : 1;
  }

  static formatarTempo(totalSegundos: number): string {
    const total = Math.max(0, Math.floor(totalSegundos));
    const horas = Math.floor(total / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    const segundos = total % 60;
    const mm = minutos.toString().padStart(2, '0');
    const ss = segundos.toString().padStart(2, '0');
    return horas > 0 ? `${horas.toString().padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`;
  }


  corDisplay: string = '#FFFFFF';

  @Input() tempo?: string;
  @Input() icon?: boolean;

  @Input() width = 140;
  @Input() height = 35;

  private intervalId: any;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dados'] && this.dados) {
      this.atualizarCronometro();
    }
  }

  private atualizarCronometro(): void {
    clearInterval(this.intervalId);

    if (!this.dados) return;

    let totalSegundos =
      this.dados.hora * 3600 + this.dados.minuto * 60 + this.dados.segundo;
    this.corDisplay = this.dados.cor || '#FFFFFF';

    const tick = () => {
      this.tempoDisplay = TemporizadorItemComponent.formatarTempo(totalSegundos);

      // Lógica de contagem
      if (this.dados?.modo === 'PROGRESSIVO') {
        totalSegundos++;
      } else if (this.dados?.modo === 'REGRESSIVO') {
        if (totalSegundos > 0) {
          totalSegundos--;
        } else {
          clearInterval(this.intervalId); 
        }
      }
    };

    tick();

    if (this.dados.modo !== 'PARADO') {
      this.intervalId = setInterval(tick, 1000);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }

  constructor(private fonteService: FonteService) {}

  get fontConfig(): FontConfig {
    const fontes = this.fonteService.getFonteByTipo('temporizador-item');
    const fonte =
      fontes.find((f) => f.subId === `cronometro-${this.numero || 1}`) ||
      fontes.find((f) => f.subId === 'default');
    return (
      fonte?.font || {
        family: 'Inter, sans-serif',
        size: 14,
        weight: 'bold',
        color: '#FFFFFF',
      }
    );
  }

  get corExibida(): string {
    return converterCorLegis(this.dados?.cor) || this.fontConfig.color || '#FFFFFF';
  }

  get justificar(): string {
    return alinhamentoFlex(this.fontConfig.align);
  }
}
