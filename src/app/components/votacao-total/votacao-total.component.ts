import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-votacao-total',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './votacao-total.component.html',
  styleUrl: './votacao-total.component.css',
})
export class VotacaoTotalComponent {
  @Input() dados?: { sim: number; nao: number; abstencao: number };

  @Input() height = 135;
  @Input() width = 240;
  
  get votos() {
    return this.dados || { sim: 15, nao: 6, abstencao: 0 }; // Mock
  }
}
