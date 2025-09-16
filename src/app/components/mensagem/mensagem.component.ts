import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface MensagemData{
  texto: string;
}

@Component({
  selector: 'app-mensagem',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mensagem.component.html',
  styleUrl: './mensagem.component.css'
})
export class MensagemComponent {
  @Input() dados?: MensagemData;
}
