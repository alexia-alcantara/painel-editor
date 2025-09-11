import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-resultado-votacao',
  standalone: true,
  imports: [],
  templateUrl: './resultado-votacao.component.html',
  styleUrl: './resultado-votacao.component.css'
})
export class ResultadoVotacaoComponent {
  @Input() dados: { texto: string } | null = null;
  @Input() width: number = 300;
  @Input() height: number = 100;
}
