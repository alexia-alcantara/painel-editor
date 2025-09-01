import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-item.component.html',
  styleUrl: './status-item.component.css'
})
export class StatusItemComponent {

  @Input() width: number = 100;
  @Input() height: number = 30;
  @Input() label: string = '';
  @Input() valor: number = 0;
}
