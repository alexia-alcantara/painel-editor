import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Parlamentar } from '../lista-votacao/lista-votacao.component';

@Component({
  selector: 'app-parlamentar-item',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './parlamentar-item.component.html',
  styleUrl: './parlamentar-item.component.css'
})
export class ParlamentarItemComponent {
  @Input() parlamentar!: Parlamentar;
  @Input() height = 608;
  @Input() width = 38;

}
