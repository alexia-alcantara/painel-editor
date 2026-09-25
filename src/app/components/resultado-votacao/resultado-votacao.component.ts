import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontConfig } from '../../models/fontes.model';
import { FonteService } from '../../services/fonte.service';

@Component({
  selector: 'app-resultado-votacao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultado-votacao.component.html',
  styleUrl: './resultado-votacao.component.css'
})
export class ResultadoVotacaoComponent {
  @Input() dados: { texto: string } | null = null;

  constructor(private fonteService: FonteService) {}

  get fontConfig(): FontConfig {
    const fonte = this.fonteService
      .getFonteByTipo('resultado-votacao')
      .find((f) => f.subId === 'resultado-texto');
    return (
      fonte?.font || {
        family: 'Inter, sans-serif',
        size: 28,
        weight: 'bold',
        color: '#FACC15',
        style: 'normal',
      }
    );
  }
}
