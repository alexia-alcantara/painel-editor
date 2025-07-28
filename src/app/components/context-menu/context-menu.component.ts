import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [MatMenuModule, MatButtonModule],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.css',
})
export class ContextMenuComponent implements OnInit, OnDestroy {
  x = 0;
  y = 0;
  visible = false;

  @ViewChild('menuRef') menuRef!: ElementRef;

  open(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.x = event.clientX;
    this.y = event.clientY;
    this.visible = true;
  }

  close() {
    this.visible = false;
  }

  onClick(op: string) {
    console.log('Opção selecionada:', op);
    this.close();
  }

  ngOnInit(): void {
    document.addEventListener('click', this.onDocumentClick);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick);
  }

  onDocumentClick = (event: MouseEvent) => {
    if (!this.menuRef?.nativeElement?.contains(event.target)) {
      this.close();
    }
  };
}
