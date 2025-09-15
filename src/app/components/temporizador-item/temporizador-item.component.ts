import { Component, Input, SimpleChanges } from '@angular/core';
import { FonteService } from '../../services/fonte.service';
import { FontConfig } from '../../models/fontes.model';
import { CommonModule } from '@angular/common';

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
  tempoDisplay: string = '00:00:00';
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
    // Limpa qualquer contador anterior
    clearInterval(this.intervalId);

    if (!this.dados) return;

    let totalSegundos =
      this.dados.hora * 3600 + this.dados.minuto * 60 + this.dados.segundo;
    this.corDisplay = this.dados.cor || '#FFFFFF';

    const tick = () => {
      const horas = Math.floor(totalSegundos / 3600);
      const minutos = Math.floor((totalSegundos % 3600) / 60);
      const segundos = totalSegundos % 60;

      this.tempoDisplay = `${horas.toString().padStart(2, '0')}:${minutos
        .toString()
        .padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

      // Lógica de contagem
      if (this.dados?.modo === 'PROGRESSIVO') {
        totalSegundos++;
      } else if (this.dados?.modo === 'REGRESSIVO') {
        if (totalSegundos > 0) {
          totalSegundos--;
        } else {
          clearInterval(this.intervalId); // Para a contagem quando chega a zero
        }
      }
    };

    tick();

    if (this.dados.modo !== 'PARADO') {
      this.intervalId = setInterval(tick, 1000);
    }
  }

  ngOnDestroy(): void {
    // Garante que o intervalo seja limpo ao sair da tela
    clearInterval(this.intervalId);
  }

  constructor(private fonteService: FonteService) {}

  get fontConfig(): FontConfig {
    const fonte = this.fonteService
      .getFonteByTipo('temporizador-item')
      .find((f) => f.subId === 'default');
    return (
      fonte?.font || {
        family: 'Inter, sans-serif',
        size: 14,
        weight: 'bold',
        color: '#FFFFFF',
      }
    );
  }
}
