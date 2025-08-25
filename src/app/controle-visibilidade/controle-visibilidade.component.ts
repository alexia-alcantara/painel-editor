import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponenteEditor } from '../models/components.model';

@Component({
  selector: 'app-controle-visibilidade',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './controle-visibilidade.component.html',
  styleUrl: './controle-visibilidade.component.css'
})
export class ControleVisibilidadeComponent {

  @Input() componentes: ComponenteEditor[] = [];
  @Output() visibilityChanged = new EventEmitter<{ id: string; visivel: boolean }>();

   onVisibilityChange(event: Event, id: string): void {
    const input = event.target as HTMLInputElement;
    const isChecked = input.checked;
    
    // Emite o evento para o pai com o ID do componente e o novo estado (marcado/desmarcado)
    this.visibilityChanged.emit({ id: id, visivel: isChecked });
  }
}
