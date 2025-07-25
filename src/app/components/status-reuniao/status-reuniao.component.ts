import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-reuniao',
  standalone: true,
  imports: [],
  templateUrl: './status-reuniao.component.html',
  styleUrl: './status-reuniao.component.css'
})
export class StatusReuniaoComponent {

  @Input() presentes: number = 0;
  @Input() votos: number = 0;
  @Input() andamento: string = 'ANDAMENTO';
  @Input() height = 135;
  @Input() width = 223;
}
