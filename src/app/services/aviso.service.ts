import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import {
  AvisoDialogComponent,
  AvisoDialogDados,
} from '../dialogs/aviso-dialog/aviso-dialog.component';

export type TipoToast = 'sucesso' | 'erro' | 'aviso' | 'info';


@Injectable({ providedIn: 'root' })
export class AvisoService {
  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  toast(mensagem: string, tipo: TipoToast = 'info', duracaoMs?: number): void {
    this.snackBar.open(mensagem, 'OK', {
      duration: duracaoMs ?? (tipo === 'erro' ? 6000 : 3500),
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['toast-painel', `toast-${tipo}`],
    });
  }

  sucesso(mensagem: string): void {
    this.toast(mensagem, 'sucesso');
  }

  erro(mensagem: string): void {
    this.toast(mensagem, 'erro');
  }

  async confirmar(dados: Omit<AvisoDialogDados, 'campo'>): Promise<boolean> {
    const ref = this.dialog.open(AvisoDialogComponent, {
      data: { icone: dados.perigo ? 'warning' : 'help_outline', ...dados },
      panelClass: 'modal-painel',
      autoFocus: false,
    });
    return (await firstValueFrom(ref.afterClosed())) === true;
  }

  async pedirTexto(dados: {
    titulo: string;
    rotulo: string;
    valor?: string;
    mensagem?: string;
    textoConfirmar?: string;
    placeholder?: string;
  }): Promise<string | null> {
    const ref = this.dialog.open(AvisoDialogComponent, {
      data: {
        titulo: dados.titulo,
        mensagem: dados.mensagem,
        icone: 'edit',
        textoConfirmar: dados.textoConfirmar,
        campo: { rotulo: dados.rotulo, valor: dados.valor ?? '', placeholder: dados.placeholder },
      } as AvisoDialogDados,
      panelClass: 'modal-painel',
      autoFocus: false,
    });
    const resultado = await firstValueFrom(ref.afterClosed());
    return typeof resultado === 'string' ? resultado : null;
  }
}
