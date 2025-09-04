import { Component, Input } from '@angular/core';
import { FonteService } from '../../services/fonte.service';
import { FontConfig } from '../../models/fontes.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-temporizador-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './temporizador-item.component.html',
  styleUrl: './temporizador-item.component.css'
})
export class TemporizadorItemComponent {
  @Input() tempo?: string;
  @Input() icon?: boolean;

  @Input() width = 140;
  @Input() height = 35;

  constructor(private fonteService: FonteService) {}

   get fontConfig(): FontConfig {
    const fonte = this.fonteService.getFonteByTipo('temporizador-item').find(f => f.subId === 'default');
    return fonte?.font || { family: 'Inter, sans-serif', size: 14, weight: 'bold', color: '#FFFFFF' };
  }
}
