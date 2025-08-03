import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { VotoItemComponent } from '../voto-item/voto-item.component';

@Component({
  selector: 'app-votacao-total',
  standalone: true,
  imports: [CommonModule, VotoItemComponent],
  templateUrl: './votacao-total.component.html',
  styleUrl: './votacao-total.component.css',
})
export class VotacaoTotalComponent {
  @Input() dados?: { sim: number; nao: number; abstencao: number };

  @Input() height = 135;
  @Input() width = 240;

  votos = {
    sim: 15,
    nao: 6,
    abstencao: 0,
  };

  get votosLista() {
    return [
      { label: 'SIM', valor: this.votos.sim, cor: '#22C55E', x: 10, y: 10 },
      { label: 'NÃO', valor: this.votos.nao, cor: '#F97316', x: 10, y: 50 },
      { label: 'ABSTENÇÃO', valor: this.votos.abstencao, cor: '#FACC15', x: 10, y: 85 },
    ];
  }
}
