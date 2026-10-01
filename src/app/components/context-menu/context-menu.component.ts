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
import { log } from '../../utils/log';

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
  opacity = 0;

  @Output() action = new EventEmitter<{
    action: string;
    data: any;
    component?: ComponenteEditor | null;
  }>();

  @ViewChild('menuRef') menuRef!: ElementRef;

  grupos: FonteGrupo[] = [];
  layoutCompleto: ComponenteEditor[] = [];
  public isEditorMode: boolean = true;

  constructor(
    private dialog: MatDialog, 
    private fonteService: FonteService,
    private layoutService: LayoutService
  ) {}


async ngOnInit() {
  document.addEventListener('click', this.onDocumentClick);
  this.grupos = this.fonteService.grupos(); 
}

  onFontChange(grupo: FonteGrupo, subId: string, config: FontConfig) {
    this.fonteService.updateFonte(grupo.tipo, subId, config);
  }

  openFontDialog(tipo: ComponenteTipo, subId: string) {

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

  openFontDialogTodos(grupo: FonteGrupo) {
    const primeiro = grupo.subItens[0];
    if (!primeiro) return;

    const dialogRef = this.dialog.open(FontDialogComponent, {
      width: '400px',
      panelClass: 'custom-dialog',
      autoFocus: false,
      restoreFocus: false,
      hasBackdrop: true,
      disableClose: false,
      data: { tipo: grupo.tipo, subId: primeiro.subId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        grupo.subItens.forEach((sub) => {
          this.fonteService.updateFonte(grupo.tipo, sub.subId, result);
          this.action.emit({
            action: 'updateFont',
            data: { tipo: grupo.tipo, subId: sub.subId, font: result },
            component: this.activeComponent,
          });
        });
      }
    });

    this.close();
  }

    alternarVisibilidadeFinal(): void {
    if (!this.activeComponent) return;
    this.action.emit({
      action: 'toggleVisible',
      data: { visible: !this.activeComponent.visible },
      component: this.activeComponent,
    });
    this.close();
  }

  abrirModalDistribuicao() {

    const configSalva = this.layoutService.carregarConfigDistribuicao();

        const padrao: DistribuirConfig = {
      qtdePorColuna: 8,
      qntTotal: 16,
      espacamentoVertical: 50,
      espacamentoHorizontal: 50,
      margemSuperior: 0,
      margemEsquerda: 0,
      exibirDe: 0,
      exibirAte: 0,
      offsetInicial: 0,
      posicaoX: 100,
      posicaoY: 100,
    };

    const configModal: DistribuirConfig = {
      ...padrao,
      ...(configSalva || {}),
      ...this.lerDistribuicaoAtual(),
    };

    const dialogRef = this.dialog.open(DistribuirParlamentaresComponent, {
      width: '400px',
      data: configModal,
    });

    dialogRef.afterClosed().subscribe((result: DistribuirConfig) => {
      if (result) {
        this.layoutService.salvarConfigDistribuicao(result);

        this.action.emit({
          action: 'distributeParliamentarians',
          data: result,
          component: this.activeComponent,
        });
      }
    });
    this.close();
  }

  private lerDistribuicaoAtual(): Partial<DistribuirConfig> {
    const itens = (this.layoutCompleto || []).filter((c) => c.tipo === 'parlamentar');
    if (!itens.length) return {};

    const primeiro = itens[0];
    const largura = Math.round(primeiro.width);
    const altura = Math.round(primeiro.height);

    const xsDistintos: number[] = [];
    itens.forEach((c) => {
      if (!xsDistintos.some((x) => Math.abs(x - c.x) <= 2)) xsDistintos.push(c.x);
    });
    xsDistintos.sort((a, b) => a - b);

    const primeiraColuna = itens
      .filter((c) => Math.abs(c.x - xsDistintos[0]) <= 2)
      .sort((a, b) => a.y - b.y);

    const resultado: Partial<DistribuirConfig> = {
      qntTotal: itens.length,
      qtdePorColuna: primeiraColuna.length,
      posicaoX: Math.round(Math.min(...itens.map((c) => c.x))),
      posicaoY: Math.round(Math.min(...itens.map((c) => c.y))),
      larguraItem: largura,
      alturaItem: altura,
    };
    if (primeiraColuna.length > 1) {
      resultado.espacamentoVertical = Math.max(0, Math.round(primeiraColuna[1].y - primeiraColuna[0].y - altura));
    }
    if (xsDistintos.length > 1) {
      resultado.espacamentoHorizontal = Math.max(0, Math.round(xsDistintos[1] - xsDistintos[0] - largura));
    }
    return resultado;
  }

  open(
    event: MouseEvent, 
    item: ComponenteEditor | undefined, 
    layout: ComponenteEditor[],
    isEditor: boolean = true
  ) {
  event.preventDefault();
  event.stopPropagation();

  this.isEditorMode = isEditor;

  this.opacity = 0;
  this.x = -9999;
  this.y = -9999;
  
  this.visible = true;
  this.activeComponent = item || null;
  this.layoutCompleto = layout;

    setTimeout(() => {
    const OFFSET = 5;
    const MARGEM = 8; // distância mínima das bordas da janela
    const menuElement = this.menuRef.nativeElement as HTMLElement;
    const menuHeight = menuElement.offsetHeight;
    const menuWidth = menuElement.offsetWidth;

    let y = event.clientY + OFFSET;
    if (y + menuHeight > window.innerHeight - MARGEM) {
      y = event.clientY - menuHeight - OFFSET;
    }
    y = Math.min(y, window.innerHeight - menuHeight - MARGEM);
    this.y = Math.max(MARGEM, y);

    let x = event.clientX + OFFSET;
    if (x + menuWidth > window.innerWidth - MARGEM) {
      x = event.clientX - menuWidth - OFFSET;
    }
    this.x = Math.max(MARGEM, x);

    this.opacity = 1;
  }, 0);
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
     else if (resultado && resultado.action === 'importar') {
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
