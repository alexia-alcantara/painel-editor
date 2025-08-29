import { Component, Input, SimpleChanges } from '@angular/core';
import { FontConfig } from '../../models/fontes.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subtitulo-reuniao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subtitulo-reuniao.component.html',
  styleUrl: './subtitulo-reuniao.component.css'
})
export class SubtituloReuniaoComponent {
 @Input() fontConfig: FontConfig | undefined;

  constructor() {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['fontConfig']) {
      console.warn('FONTE RECEBIDA E ATUALIZADA:', this.fontConfig);
    }
  }
}
