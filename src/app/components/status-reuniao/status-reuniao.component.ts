import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-reuniao',
  standalone: true,
  imports: [],
  templateUrl: './status-reuniao.component.html',
  styleUrl: './status-reuniao.component.css'
})
export class StatusReuniaoComponent {

  // @Input() dados?: { presentes: number; votos: number; andamento: string };
  @Input() height = 135;
  @Input() width = 223;

}
