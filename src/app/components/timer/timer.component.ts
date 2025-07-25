import { Component } from '@angular/core';

@Component({
  selector: 'app-timer',
  standalone: true,
  imports: [],
  templateUrl: './timer.component.html',
  styleUrl: './timer.component.css',
})
export class TimerComponent {
  temporizadores = [
    { tempo: '00:00', icon: false },
    { tempo: '00:00', icon: false },
    { tempo: '08:45:10', icon: true },
  ];
}
