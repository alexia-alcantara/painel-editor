import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FonteService } from '../../services/fonte.service';
import { FontConfig, ComponenteTipo } from '../../models/fontes.model';

export interface CampoTextoData {
  texto: string;
}

@Component({
  selector: 'app-campo-texto',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './campo-texto.component.html',
  styleUrl: './campo-texto.component.css',
})
export class CampoTextoComponent {
  @Input() dados?: CampoTextoData;
  @Input() tipo: ComponenteTipo | '' = '';

  constructor(private fonteService: FonteService) {}

  get fontConfig(): FontConfig {
    const fonte = this.fonteService
      .getFonteByTipo(this.tipo as ComponenteTipo)
      .find((f) => f.subId === 'texto');
    return (
      fonte?.font || {
        family: 'Inter, sans-serif',
        size: 22,
        weight: '500',
        color: '#FFFFFF',
        style: 'normal',
      }
    );
  }
}