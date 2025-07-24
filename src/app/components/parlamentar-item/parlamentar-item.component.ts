import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

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
  @Input() dados: any;

}
