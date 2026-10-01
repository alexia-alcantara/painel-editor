import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FonteService } from '../../services/fonte.service';
import { FontConfig } from '../../models/fontes.model';
import { alinhamentoFlex } from '../../utils/estilo-texto';

@Component({
  selector: 'app-partido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './partido.component.html',
  styleUrls: ['./partido.component.css']
})
export class PartidoComponent {
  @Input() dados: any;
  @Input() props: any;

  constructor(private fonteService: FonteService) {}

  /** Fonte "Tribuna > Partido do Orador" do menu de fontes. */
  get fontConfig(): FontConfig {
    return (
      this.fonteService.getFonte('tribuna', 'partido')?.font || {
        family: 'Inter, sans-serif',
        size: this.props?.fontSize || 18,
        weight: '500',
        color: '#D1D5DB',
      }
    );
  }

  get justificar(): string {
    return alinhamentoFlex(this.fontConfig.align);
  }
}
