import { CommonModule } from '@angular/common';
import { Component, computed, Input } from '@angular/core';
import { ParlamentarItemComponent } from '../parlamentar-item/parlamentar-item.component';

export interface Parlamentar {
  nome: string;
  partido: string;
  voto: 'S' | 'N' | '-';
}

@Component({
  selector: 'app-lista-votacao',
  standalone: true,
  imports: [CommonModule, ParlamentarItemComponent],
  templateUrl: './lista-votacao.component.html',
  styleUrl: './lista-votacao.component.css',
})
export class ListaVotacaoComponent {
  @Input() parlamentares: Parlamentar[] = [];

  colunas = computed(() => {
    const metade = Math.ceil(this.parlamentares.length / 2);
    return [
      this.parlamentares.slice(0, metade),
      this.parlamentares.slice(metade),
    ];
  });
}
