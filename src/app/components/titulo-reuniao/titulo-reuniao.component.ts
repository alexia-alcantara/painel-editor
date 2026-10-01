import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontConfig } from '../../models/fontes.model';
import { FonteService } from '../../services/fonte.service';
import { alinhamentoFlex } from '../../utils/estilo-texto';

@Component({
  selector: 'app-titulo-reuniao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './titulo-reuniao.component.html',
  styleUrl: './titulo-reuniao.component.css'
})
export class TituloReuniaoComponent {
  @Input() dados: { texto: string } | undefined;
  /** Id do bloco: o bloco da data ("data-atual") usa a fonte "Data" de Tempo e Data. */
  @Input() componenteId = '';

  constructor(private fonteService: FonteService) {}

  get fontConfig(): FontConfig | undefined {
    if (this.componenteId === 'data-atual') {
      const fonteData = this.fonteService.getFonte('temporizador-item', 'data')?.font;
      if (fonteData) return fonteData;
    }
    return this.fonteService.getFonteByTipo('titulo')
      .find(f => f.subId === 'titulo-texto')?.font;
  }

  get justificar(): string {
    return alinhamentoFlex(this.fontConfig?.align);
  }
}