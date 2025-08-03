import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { FontDialogComponent } from '../font-dialog/font-dialog.component';
import { ComponenteTipo, FontConfig, FonteGrupo } from '../../models/fontes.model';
import { FonteService } from '../../services/fonte.service';

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

   @Output() fontUpdated = new EventEmitter<{ 
    tipo: ComponenteTipo; 
    subId: string; 
    font: FontConfig 
  }>();

  @ViewChild('menuRef') menuRef!: ElementRef;

  grupos: FonteGrupo[] = [];

  constructor(private dialog: MatDialog, private fonteService: FonteService) {}

  async ngOnInit() {
    document.addEventListener('click', this.onDocumentClick);
    this.grupos = await this.fonteService.loadGrupos();
  }

  onFontChange(grupo: FonteGrupo, subId: string, config: FontConfig) {
    this.fonteService.updateFonte(grupo.tipo, subId, config);
  }

  onClick(tipo: ComponenteTipo, subId: string) {
  console.log('Subitem selecionado:', tipo, subId);

  // Caso especial, se quiser manter alguma opção tipo "Configurar Tela"
  if (subId !== 'configurar-tela') {
    const dialogRef = this.dialog.open(FontDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
      autoFocus: false,
      restoreFocus: false,
      hasBackdrop: true,
      disableClose: false,
      data: { tipo, subId }, // 🔹 Passa os dados para o dialog
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Fonte escolhida para', tipo, subId, ':', result);
        
        // 🔹 Aplica a fonte ao subitem correspondente
        this.fonteService.updateFonte(tipo, subId, result);

        // Aqui você pode disparar um evento para o Editor atualizar a tela
        this.fontUpdated.emit({ tipo, subId, font: result });
      }
    });
  }

  this.close();
}


  // onClick(op: string) {
  //   console.log('Opção selecionada:', op);

  //   if (op !== 'Configurar Tela') {
  //     const dialogRef = this.dialog.open(FontDialogComponent, {
  //       width: '400px',
  //       panelClass: 'custom-dialog',
  //       autoFocus: false,
  //       restoreFocus: false,
  //       hasBackdrop: true,
  //       disableClose: false,
  //     });

  //     dialogRef.afterClosed().subscribe((result) => {
  //       if (result) {
  //         console.log('Fonte escolhida:', result);
  //         // aplica a fonte ao componente selecionado
  //       }
  //     });
  //   }

  //   this.close();
  // }

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

  ngOnDestroy(): void {
    document.removeEventListener('click', this.onDocumentClick);
  }

  onDocumentClick = (event: MouseEvent) => {
    if (!this.menuRef?.nativeElement?.contains(event.target)) {
      this.close();
    }
  };
}
