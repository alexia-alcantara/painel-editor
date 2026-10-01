import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FonteService } from '../../services/fonte.service';
import { FontConfig } from '../../models/fontes.model';
import { alinhamentoFlex } from '../../utils/estilo-texto';

@Component({
  selector: 'app-orador',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orador.component.html',
  styleUrls: ['./orador.component.css']
})
export class OradorComponent {
  @Input() dados: any;
  @Input() props: any;

  constructor(private fonteService: FonteService) {}

  /** Fonte "Tribuna > Nome do Orador" do menu de fontes. */
  get fontConfig(): FontConfig {
    return (
      this.fonteService.getFonte('tribuna', 'orador')?.font || {
        family: 'Inter, sans-serif',
        size: this.props?.fontSize || 32,
        weight: 'bold',
        color: '#FFFFFF',
      }
    );
  }

  get justificar(): string {
    return alinhamentoFlex(this.fontConfig.align);
  }
}
