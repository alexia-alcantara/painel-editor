import { CommonModule } from '@angular/common';
import { Component, computed, Input } from '@angular/core';
import { FonteService } from '../../../services/fonte.service';

@Component({
  selector: 'app-status-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-item.component.html',
  styleUrl: './status-item.component.css',
})
export class StatusItemComponent {
  @Input() height: number = 30;
  @Input() label: string = '';
  @Input() valor: number = 0;
  @Input() cor: string = '';
  @Input() props: any;

  constructor(private fonteService: FonteService){}

  fontLabel = computed(() => {
    const fonte = this.fonteService.getFonte('votacao-item', 'label');
    return (
      fonte?.font || {
        family: 'Inter, sans-serif',
        size: 18,
        weight: '600',
        color: '#FFFFFF',
        style: 'normal',
      }
    );
  });

  fontValor = computed(() => {
    const fonte = this.fonteService.getFonte('votacao-item', 'valor');
    return (
      fonte?.font || {
        family: 'Inter, sans-serif',
        size: 18,
        weight: '600',
        color: '#FFFFFF',
        style: 'normal',
      }
    );
  });

 labelStyle() {  
  const config = this.fontLabel(); 
  
  // ler o "this.cor" atualizado toda vez que rodar
  const corEfetiva = this.props?.cor || this.cor || config.color;

  return {
    'font-family': config.family,
    'font-size.px': config.size,
    'font-weight': config.weight,
    'font-style': config.style,
    'color': corEfetiva,
      'text-align': config.align || 'left'
  };
}

valorStyle() {
  const config = this.fontValor();
  const corEfetiva = this.props?.cor || this.cor || config.color;

  return {
    'font-family': config.family,
    'font-size.px': config.size,
    'font-weight': config.weight,
    'font-style': config.style,
    'color': corEfetiva,
      'text-align': config.align || 'center'
  };
}
}
