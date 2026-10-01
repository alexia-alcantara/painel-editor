import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FonteService } from '../../services/fonte.service';
import { FontConfig } from '../../models/fontes.model';
import { alinhamentoFlex } from '../../utils/estilo-texto';

@Component({
  selector: 'app-materia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './materia.component.html',
  styleUrls: ['./materia.component.css']
})
export class MateriaComponent {
  @Input() dados: any;
  @Input() props: any;

  constructor(private fonteService: FonteService) {}

  /** Fonte "Tribuna > Tema em discussão" do menu de fontes. */
  get fontConfig(): FontConfig {
    return (
      this.fonteService.getFonte('tribuna', 'materia')?.font || {
        family: 'Inter, sans-serif',
        size: this.props?.fontSize || 24,
        weight: '600',
        color: '#FFFFFF',
      }
    );
  }

  get justificar(): string {
    return alinhamentoFlex(this.fontConfig.align);
  }
}
