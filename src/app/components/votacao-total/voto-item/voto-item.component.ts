import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FonteService } from '../../../services/fonte.service';
import { FontConfig } from '../../../models/fontes.model';

@Component({
  selector: 'app-voto-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voto-item.component.html',
  styleUrl: './voto-item.component.css'
})
export class VotoItemComponent {
  @Input() width: number = 100;
  @Input() height: number = 30;

  @Input() label: string = '';
  @Input() cor: string = '#FFFFFF';
  @Input() valor: number = 0;

  constructor(private fonteService: FonteService) {}

    get fontLabel(): FontConfig {
    const fonte = this.fonteService.getFonteByTipo('votacao-item').find(f => f.subId === 'label');
    return fonte?.font || { family: 'Inter, sans-serif', size: 18, weight: '600', color: this.cor };
  }

   get fontValor(): FontConfig {
    const fonte = this.fonteService.getFonteByTipo('votacao-item').find(f => f.subId === 'valor');
    return fonte?.font || { family: 'Inter, sans-serif', size: 18, weight: '600', color: this.cor };
  }
  
}
