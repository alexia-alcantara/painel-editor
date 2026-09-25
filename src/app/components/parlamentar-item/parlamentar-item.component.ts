import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FonteService } from '../../services/fonte.service';
import { FontConfig } from '../../models/fontes.model';

export interface DadosParlamentar {
  nome: string;
  partido: string;
  voto: string;
  status: 'PRESENTE' | 'AUSENTE' | string;
  presenca?: string; 
  cor: string;
}

@Component({
  selector: 'app-parlamentar-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parlamentar-item.component.html',
  styleUrl: './parlamentar-item.component.css',
})
export class ParlamentarItemComponent {
  @Input() parlamentar!: DadosParlamentar;
  @Input() paleta: any = {};
  @Input() height = 608;
  @Input() width = 38;

  constructor(private fonteService: FonteService) {}

  private get defaultFont(): FontConfig {
    return { family: 'Inter, sans-serif', size: 18, color: '#FFFFFF' };
  }

  get fontNome(): FontConfig {
    const fonte = this.fonteService.getFonteByTipo('parlamentar').find((f) => f.subId === 'nome');
    return fonte?.font || { ...this.defaultFont, weight: '500' };
  }

  get fontPartido(): FontConfig {
    const fonte = this.fonteService.getFonteByTipo('parlamentar').find((f) => f.subId === 'partido');
    return fonte?.font || { ...this.defaultFont, weight: '500' };
  }


  get tamanhoNome(): string {
    const base = this.fontNome.size || 18;
    const letras = (this.parlamentar?.nome || '').length || 1;
    return `max(14px, min(${base}px, ${(100 / (letras * 0.72)).toFixed(2)}cqw))`;
  }


  get tamanhoPartido(): string {
    const base = this.fontPartido.size || 18;
    const letras = (this.parlamentar?.partido || 'PARTIDO').length;
    return `min(${base}px, ${(100 / (letras * 0.75)).toFixed(2)}cqw)`;
  }

  get fontVoto(): FontConfig {
    const fonte = this.fonteService.getFonteByTipo('parlamentar').find((f) => f.subId === 'voto');
    return fonte?.font || { ...this.defaultFont, weight: '700' };
  }

  //pegar a cor do voto na paleta
  get corDoStatus(): string {
    if (this.parlamentar?.status === 'PRESENTE') {
      return this.paleta['Cor_Presente'] || '#0bef26';
    }
    if (this.parlamentar?.status === 'AUSENTE') {
      return this.paleta['Cor_Ausente'] || '#fb0909';
    }
    return '#FFFFFF';
  }
}