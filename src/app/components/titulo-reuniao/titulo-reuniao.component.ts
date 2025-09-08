import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontConfig } from '../../models/fontes.model';
import { FonteService } from '../../services/fonte.service';

@Component({
  selector: 'app-titulo-reuniao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './titulo-reuniao.component.html',
  styleUrl: './titulo-reuniao.component.css'
})
export class TituloReuniaoComponent {
  @Input() dados: { texto: string } | undefined;

  constructor(private fonteService: FonteService) {}

  get fontConfig(): FontConfig | undefined {
    return this.fonteService.getFonteByTipo('titulo')
      .find(f => f.subId === 'titulo-texto')?.font;
  }
}