import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FonteService } from '../../services/fonte.service';
import { FontConfig } from '../../models/fontes.model';

export interface DadosParlamentar {
  nome: string;
  partido: string;
  voto: string;
  status: 'PRESENTE' | 'AUSENTE' | string; 
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
  return { family: 'Inter, sans-serif', size: 14, color: '#FFFFFF' };
}

get fontNome(): FontConfig {
  const fonte = this.fonteService.getFonteByTipo('parlamentar').find(f => f.subId === 'nome');
  return fonte?.font || { ...this.defaultFont, weight: "500" };
}

get fontPartido(): FontConfig {
  const fonte = this.fonteService.getFonteByTipo('parlamentar').find(f => f.subId === 'partido');
  const baseFont = fonte?.font || { ...this.defaultFont, weight: "500" };

  const limiteCaracteres = 7; // Se o nome tiver mais de 7 caracteres, a fonte diminui.
  const fontSize = 11; // Novo tamanho da fonte para nomes longos.

  if (this.parlamentar?.partido && this.parlamentar.partido.length > limiteCaracteres) {
    return { ...baseFont, size: fontSize };
  }

  return baseFont;
}

get fontVoto(): FontConfig {
  const fonte = this.fonteService.getFonteByTipo('parlamentar').find(f => f.subId === 'voto');
  return fonte?.font || { ...this.defaultFont, weight: "700" };
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
