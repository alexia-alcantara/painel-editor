import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface LinhaMensagem {
  linha: number;
  texto: string;
  fonte?: string;
  cor?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface MensagemData {
  texto?: string; 
  linhas?: LinhaMensagem[]; 
}

@Component({
  selector: 'app-mensagem',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mensagem.component.html',
  styleUrl: './mensagem.component.css',
})
export class MensagemComponent {
  @Input() dados?: MensagemData;
}