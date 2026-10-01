import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FonteService } from '../../services/fonte.service';
import { alinhamentoFlex } from '../../utils/estilo-texto';
import { FontConfig, ComponenteTipo } from '../../models/fontes.model';

export interface CampoTextoData {
  texto: string;
  cor?: string;
  negrito?: boolean;
  italico?: boolean;
  sublinhado?: boolean;
  alinhamento?: 'left' | 'center' | 'right';
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
  @Input() subId = 'texto';

  constructor(private fonteService: FonteService) {}

  get fontConfig(): FontConfig {
    const fontes = this.fonteService.getFonteByTipo(this.tipo as ComponenteTipo);
    const fonte = fontes.find((f) => f.subId === this.subId) || fontes.find((f) => f.subId === 'texto');
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

  get alinhamento(): string {
    return this.dados?.alinhamento || this.fontConfig.align || 'center';
  }

  get justificar(): string {
    return alinhamentoFlex(this.alinhamento);
  }

  get estilo(): Record<string, any> {
    const f = this.fontConfig;
    const d = this.dados;
    return {
      'font-family': f.family,
      'font-size.px': f.size,
      'font-weight': d?.negrito === undefined ? f.weight : d.negrito ? 'bold' : 'normal',
      'font-style': d?.italico === undefined ? f.style : d.italico ? 'italic' : 'normal',
      'text-decoration': d?.sublinhado ? 'underline' : 'none',
      color: d?.cor || f.color,
    };
  }
}
