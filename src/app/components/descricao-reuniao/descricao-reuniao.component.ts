import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontConfig } from '../../models/fontes.model';
import { FonteService } from '../../services/fonte.service';

@Component({
  selector: 'app-descricao-reuniao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './descricao-reuniao.component.html',
  styleUrl: './descricao-reuniao.component.css'
})
export class DescricaoReuniaoComponent {
  @Input() dados: { texto: string } | undefined;
  
  constructor(private fonteService: FonteService) {}

  get fontConfig(): FontConfig | undefined {
    return this.fonteService.getFonteByTipo('descricao')
      .find(f => f.subId === 'default')?.font;
  }
}