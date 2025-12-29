import { CommonModule } from '@angular/common';
import { Component, computed, Input } from '@angular/core';
import { FonteService } from '../../../services/fonte.service';

@Component({
  selector: 'app-voto-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './voto-item.component.html',
  styleUrl: './voto-item.component.css',
})
export class VotoItemComponent {
  @Input() height: number = 30;
  @Input() label: string = '';
  @Input() cor: string = '#FFFFFF';
  @Input() valor: number = 0;

  constructor(private fonteService: FonteService) {}

  fontLabel = computed(() => {
    const fonte = this.fonteService.getFonte('votacao-item', 'label');
    return fonte?.font || { family: 'Inter, sans-serif', size: 18, weight: '600', color: '#FFFFFF', style: 'normal' };
  });

  fontValor = computed(() => {
    const fonte = this.fonteService.getFonte('votacao-item', 'valor');
    return fonte?.font || { family: 'Inter, sans-serif', size: 18, weight: '600', color: '#FFFFFF', style: 'normal' };
  });

    labelStyle = computed(() => {
    const config = this.fontLabel();
    return {
      'font-family': config.family,
      'font-size.px': config.size,
      'font-weight': config.weight,
      'font-style': config.style,
      'color': this.cor || config.color 
    };
  });

    valorStyle = computed(() => {
    const config = this.fontValor();
    return {
      'font-family': config.family,
      'font-size.px': config.size,
      'font-weight': config.weight,
      'font-style': config.style,
      'color': this.cor || config.color 
    };
  });
}
