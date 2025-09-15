import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-relogio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relogio.component.html',
  styleUrl: './relogio.component.css'
})
export class RelogioComponent {
  horaAtual: string = '';
  private intervalId: any;

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      const data = new Date();
      this.horaAtual = data.toLocaleTimeString('pt-BR');
    }, 1000);
  }

    ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
