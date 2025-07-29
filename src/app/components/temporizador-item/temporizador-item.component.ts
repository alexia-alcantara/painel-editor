import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-temporizador-item',
  standalone: true,
  imports: [],
  templateUrl: './temporizador-item.component.html',
  styleUrl: './temporizador-item.component.css'
})
export class TemporizadorItemComponent {
  @Input() tempo?: string;
  @Input() icon?: boolean;

  @Input() width = 140;
  @Input() height = 35;
}
