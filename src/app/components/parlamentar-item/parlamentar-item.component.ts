import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FonteService } from '../../services/fonte.service';
import { FontConfig } from '../../models/fontes.model';

export interface DadosParlamentar {
  nome: string;
  partido: string;
  letra?: string;
  corVoto?: string;
  corNome?: string;
  presenca?: string;
  presidente?: boolean;

  voto?: string;
  status?: string;
  cor?: string;
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

  @Input() nomeNaCorDoVoto = false;
  @Input() mostrarFundo = true;

  private readonly COR_PRESENTE = '#00FF00';

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

  get fontVoto(): FontConfig {
    const fonte = this.fonteService.getFonteByTipo('parlamentar').find((f) => f.subId === 'voto');
    return fonte?.font || { ...this.defaultFont, weight: '700' };
  }

  get letra(): string {
    const p = this.parlamentar;
    if (!p) return '';
    if (p.letra !== undefined) return p.letra;
    const antigo = (p.status || '').trim();
    return antigo.length > 0 && antigo.length <= 2 ? antigo : 'S';
  }

  get corVoto(): string {
    const p = this.parlamentar;
    if (!p) return '';
    if (p.corVoto !== undefined) return p.corVoto;
    return p.cor || this.COR_PRESENTE;
  }

  get presenca(): string {
    return (this.parlamentar?.presenca ?? this.parlamentar?.status ?? '').toString();
  }

  get ausente(): boolean {
    return this.presenca === 'AUSENTE';
  }

  get corNome(): string {
    if (this.nomeNaCorDoVoto && this.corVoto) return this.corVoto;
    if (this.parlamentar?.corNome) return this.parlamentar.corNome;
    if (this.presenca === 'PRESENTE') return this.COR_PRESENTE;
    return this.fontNome?.color || '#FFFFFF';
  }

  get corPartido(): string {
    if (this.nomeNaCorDoVoto && this.corVoto) return this.corVoto;
    if (this.parlamentar?.corNome) return this.parlamentar.corNome;
    return this.fontPartido?.color || '#CBD5E1';
  }

  get corLetra(): string {
    if (this.corVoto) return this.corVoto;
    if (this.letra === 'P' && this.parlamentar?.corNome) return this.parlamentar.corNome;
    return this.fontVoto?.color || '#FFFFFF';
  }

  get tamanhoPartido(): string {
    const base = this.fontPartido.size || 18;
    const letras = (this.parlamentar?.partido || 'PARTIDO').length;
    return `min(${base}px, ${(100 / (letras * 0.75)).toFixed(2)}cqw)`;
  }
}