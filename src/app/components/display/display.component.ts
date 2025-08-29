import { FormsModule } from '@angular/forms';
import { Component } from '@angular/core';
import { Cenario } from '../../models/cenario.model';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from '../../services/layout.service';
import { CommonModule } from '@angular/common';
import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { ComponenteEditor } from '../../models/components.model';


@Component({
  selector: 'app-display',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './display.component.html',
  styleUrl: './display.component.css',
})
export class DisplayComponent {
  cenarioParaExibir: Cenario | null = null;

  constructor(
    private route: ActivatedRoute,
    private layoutService: LayoutService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cenarioParaExibir = this.layoutService.carregarCenario(id);
    }
  }

  onDragEnded(event: CdkDragEnd, item: ComponenteEditor) {
    const newPosition = event.source.getFreeDragPosition();
    item.x = newPosition.x;
    item.y = newPosition.y;
  }

  toggleVisibility(item: ComponenteEditor) {
    item.visible = !item.visible;
  }
}
