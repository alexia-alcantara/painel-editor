import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

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

  
}
