import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Parlamentar } from '../lista-votacao/lista-votacao.component';
import { FonteService } from '../../services/fonte.service';
import { FontConfig } from '../../models/fontes.model';

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

  

  constructor(
    private fonteService: FonteService
  ){}

    get fontNome(): FontConfig {
    return this.fonteService.getFonteByTipo('parlamentar')
      .find(f => f.id === 'nome')?.font!;
  }

  get fontPartido(): FontConfig {
    return this.fonteService.getFonteByTipo('parlamentar')
      .find(f => f.id === 'partido')?.font!;
  }

  get fontVoto(): FontConfig {
    return this.fonteService.getFonteByTipo('parlamentar')
      .find(f => f.id === 'voto')?.font!;
  }
}
