import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-votacao-total',
  standalone: true,
  imports: [],
  templateUrl: './votacao-total.component.html',
  styleUrl: './votacao-total.component.css',
})
export class VotacaoTotalComponent {
  @Input() dados: { sim: number; nao: number; absten: number } = {
    sim: 0,
    nao: 0,
    absten: 0,
  };
}
