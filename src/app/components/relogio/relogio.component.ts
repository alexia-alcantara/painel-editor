import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FontConfig } from '../../models/fontes.model';
import { FonteService } from '../../services/fonte.service';

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

  // O relógio usa a mesma fonte dos temporizadores, como no legado.
  get fontConfig(): FontConfig {
    const fonte = this.fonteService
      .getFonteByTipo('temporizador-item')
      .find((f) => f.subId === 'default');
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
