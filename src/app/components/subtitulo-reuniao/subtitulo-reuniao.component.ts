import { Component, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontConfig } from '../../models/fontes.model';
import { FonteService } from '../../services/fonte.service';

@Component({
  selector: 'app-subtitulo-reuniao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './subtitulo-reuniao.component.html',
  styleUrl: './subtitulo-reuniao.component.css'
})
export class SubtituloReuniaoComponent {
  
  fontConfig: Signal<FontConfig | undefined>;

  constructor(private fonteService: FonteService) {
    this.fontConfig = computed(() => {
      const grupo = this.fonteService.grupos().find(g => g.tipo === 'subtitulo');
      const config = grupo?.subItens.find(f => f.subId === 'subtitulo-texto')?.font;
      console.log('FONTE DO SUBTÍTULO RECALCULADA:', config); 
      return config;
    });
  }
}
