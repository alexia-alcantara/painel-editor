import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FontConfig } from '../../models/fontes.model';
import { FonteService } from '../../services/fonte.service';
import { alinhamentoFlex } from '../../utils/estilo-texto';

@Component({
  selector: 'app-relogio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relogio.component.html',
  styleUrl: './relogio.component.css'
})
export class RelogioComponent implements OnInit, OnDestroy {
  horaAtual: string = '';
  private intervalId: any;

  constructor(private fonteService: FonteService) {}

  // Fonte própria da hora; cenários antigos usam a fonte única "Tempo".
  get fontConfig(): FontConfig {
    const fontes = this.fonteService.getFonteByTipo('temporizador-item');
    const fonte =
      fontes.find((f) => f.subId === 'relogio') ||
      fontes.find((f) => f.subId === 'default');
    return (
      fonte?.font || {
        family: 'Inter, sans-serif',
        size: 32,
        weight: 'bold',
        color: '#FFFFFF',
        style: 'normal',
      }
    );
  }

  get justificar(): string {
    return alinhamentoFlex(this.fontConfig.align);
  }

  ngOnInit(): void {
    this.horaAtual = new Date().toLocaleTimeString('pt-BR');
    this.intervalId = setInterval(() => {
      this.horaAtual = new Date().toLocaleTimeString('pt-BR');
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
