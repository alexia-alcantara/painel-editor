import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { FontDialogComponent } from '../font-dialog/font-dialog.component';

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

  constructor(private dialog: MatDialog) {}

onClick(op: string) {
  console.log('Opção selecionada:', op);

  if (op === 'Configurar Tela') {
    const dialogRef = this.dialog.open(FontDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
      autoFocus: false,
      restoreFocus: false,
      hasBackdrop: true,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Fonte escolhida:', result);
        // aplica a fonte ao componente selecionado
      }
    });
  }

  this.close();
}


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
