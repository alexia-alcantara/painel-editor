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
import {
  ComponenteTipo,
  FontConfig,
  FonteGrupo,
} from '../../models/fontes.model';
import { FonteService } from '../../services/fonte.service';
import { ComponenteEditor } from '../../models/components.model';
import {
  DistribuirConfig,
  DistribuirParlamentaresComponent,
} from '../../dialogs/distribuir-parlamentares/distribuir-parlamentares.component';
import { LayoutService } from '../../services/layout.service';
import { CenarioDialogComponent } from '../../dialogs/cenario-dialog/cenario-dialog.component';

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
  activeComponent: ComponenteEditor | null = null;

  @Output() action = new EventEmitter<{
    action: string;
    data: any;
    component?: ComponenteEditor | null;
  }>();

  @ViewChild('menuRef') menuRef!: ElementRef;

  grupos: FonteGrupo[] = [];
  layoutCompleto: ComponenteEditor[] = [];

  constructor(
    private dialog: MatDialog, 
    private fonteService: FonteService,
    private layoutService: LayoutService
  ) {}

  async ngOnInit() {
    document.addEventListener('click', this.onDocumentClick);
    this.grupos = await this.fonteService.loadGrupos();
  }

  onFontChange(grupo: FonteGrupo, subId: string, config: FontConfig) {
    this.fonteService.updateFonte(grupo.tipo, subId, config);
  }

  openFontDialog(tipo: ComponenteTipo, subId: string) {
    console.log('Abrindo editor de fonte para:', tipo, subId);

    if (subId !== 'configurar-tela') {
      const dialogRef = this.dialog.open(FontDialogComponent, {
        width: '400px',
        panelClass: 'custom-dialog',
        autoFocus: false,
        restoreFocus: false,
        hasBackdrop: true,
        disableClose: false,
        data: { tipo, subId },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          console.log('Fonte escolhida para', tipo, subId, ':', result);
          this.fonteService.updateFonte(tipo, subId, result);

          this.action.emit({
            action: 'updateFont',
            data: { tipo, subId, font: result },
            component: this.activeComponent,
          });
        }
      });
    }

    this.close();
  }

  abrirModalDistribuicao() {
    console.log('Abrindo modal de distribuição...');

    const configModal: DistribuirConfig = {
      qtdePorColuna: 8,
      espacamentoVertical: 50,
      espacamentoHorizontal: 50,
      qntTotal: 0,
      margemSuperior: 0,
      margemEsquerda: 0,
      exibirDe: 0,
      exibirAte: 0,
      offsetInicial: 0,
    };

    const dialogRef = this.dialog.open(DistribuirParlamentaresComponent, {
      width: '400px',
      data: configModal,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Emite uma ação diferente para o editor saber o que fazer
        this.action.emit({
          action: 'distributeParliamentarians',
          data: result, // 'result' contém as novas configurações
          component: this.activeComponent,
        });
      }
    });
    this.close();
  }

  open(event: MouseEvent, item: ComponenteEditor | undefined, layout: ComponenteEditor[]) {
    event.preventDefault();
    event.stopPropagation();
    this.x = event.clientX;
    this.y = event.clientY;
    this.visible = true;
    this.activeComponent = item || null;
    this.layoutCompleto = layout;
  }

  close() {
    this.visible = false;
  }

  abrirModalConfiguracaoTela() {
  const dialogRef = this.dialog.open(CenarioDialogComponent, {
    width: '500px',
    data: { layoutAtual: this.layoutCompleto } 
  });

  dialogRef.afterClosed().subscribe(resultado => {
    if (resultado && resultado.action === 'carregar') {
      // Emite a ação para o editor carregar o novo layout
      this.action.emit({ action: 'loadLayout', data: resultado.layout });
    }
  });
  this.close();
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
