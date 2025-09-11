import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface TribunaData{
  orador?: string;
  partido?: string;
  fotoUrl?: string;
  materia?: string;
  ementa?: string;
}

@Component({
  selector: 'app-tribuna',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tribuna.component.html',
  styleUrl: './tribuna.component.css'
})
export class TribunaComponent {
  @Input() width: number = 300;
  @Input() height: number = 100;
  @Input() dados?: TribunaData;
}
