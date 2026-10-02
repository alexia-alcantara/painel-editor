import { Component, ElementRef, Inject, ViewChild, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

/** O que o modal recebe (usado pelo AvisoService). */
export interface AvisoDialogDados {
  titulo: string;
  mensagem?: string;
  /** Quando preenchido, o modal mostra um campo de texto (substitui o prompt). */
  campo?: { rotulo: string; valor: string; placeholder?: string };
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Botão de confirmar em vermelho (ações que não têm volta, como deletar). */
  perigo?: boolean;
  icone?: string;
}

/**
 * Modal único do editor, no lugar de prompt() e confirm().
 * Fecha com: true (confirmou), o texto digitado (quando tem campo) ou undefined (cancelou).
 */
@Component({
  selector: 'app-aviso-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule],
  template: `
    <div class="aviso">
      <div class="aviso-topo">
        @if (data.icone) {
          <mat-icon class="aviso-icone" [class.perigo]="data.perigo">{{ data.icone }}</mat-icon>
        }
        <h2>{{ data.titulo }}</h2>
      </div>

      @if (data.mensagem) {
        <p class="aviso-mensagem">{{ data.mensagem }}</p>
      }

      @if (data.campo) {
        <label class="aviso-rotulo" for="aviso-campo">{{ data.campo.rotulo }}</label>
        <input #campo id="aviso-campo" class="aviso-campo" type="text"
          [value]="data.campo.valor" [placeholder]="data.campo.placeholder || ''"
          (keydown.enter)="confirmar()" (input)="erro = ''">
        @if (erro) {
          <span class="aviso-erro">{{ erro }}</span>
        }
      }

      <div class="aviso-botoes">
        <button type="button" class="botao botao-secundario" (click)="cancelar()">
          {{ data.textoCancelar || 'Cancelar' }}
        </button>
        <button type="button" class="botao" [class.botao-perigo]="data.perigo" [class.botao-primario]="!data.perigo"
          (click)="confirmar()">
          {{ data.textoConfirmar || 'OK' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .aviso {
      background: var(--painel-superficie);
      color: var(--painel-texto);
      padding: 22px 24px 18px;
      min-width: 340px;
      max-width: 480px;
      font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    }
    .aviso-topo { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .aviso-topo h2 { margin: 0; font-size: 18px; font-weight: 600; font-family: inherit; }
    .aviso-icone { color: var(--painel-primaria); }
    .aviso-icone.perigo { color: var(--painel-perigo); }
    .aviso-mensagem { margin: 0 0 16px; font-size: 14px; line-height: 1.5; color: var(--painel-texto-suave); }
    .aviso-rotulo { display: block; font-size: 13px; margin: 6px 0; color: var(--painel-texto-suave); }
    .aviso-campo {
      width: 100%;
      box-sizing: border-box;
      padding: 9px 12px;
      font-size: 15px;
      border-radius: 8px;
      border: 1px solid var(--painel-borda);
      background: var(--painel-fundo);
      color: var(--painel-texto);
      outline: none;
    }
    .aviso-campo:focus { border-color: var(--painel-primaria); box-shadow: 0 0 0 2px var(--painel-primaria-suave); }
    .aviso-erro { display: block; margin-top: 6px; font-size: 12px; color: var(--painel-perigo); }
    .aviso-botoes { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
    .botao {
      font-size: 14px;
      font-weight: 500;
      padding: 8px 18px;
      border-radius: 8px;
      border: 1px solid transparent;
      cursor: pointer;
      font-family: inherit;
    }
    .botao-primario { background: var(--painel-primaria); color: #fff; }
    .botao-primario:hover { filter: brightness(1.1); }
    .botao-perigo { background: var(--painel-perigo); color: #fff; }
    .botao-perigo:hover { filter: brightness(1.1); }
    .botao-secundario { background: transparent; color: var(--painel-texto); border-color: var(--painel-borda); }
    .botao-secundario:hover { background: var(--painel-fundo); }
  `],
})
export class AvisoDialogComponent implements AfterViewInit {
  @ViewChild('campo') campo?: ElementRef<HTMLInputElement>;
  erro = '';

  constructor(
    private dialogRef: MatDialogRef<AvisoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AvisoDialogDados,
  ) {}

  ngAfterViewInit(): void {
    // Já deixa o texto selecionado, como o prompt fazia
    setTimeout(() => this.campo?.nativeElement.select());
  }

  confirmar(): void {
    if (!this.data.campo) {
      this.dialogRef.close(true);
      return;
    }
    const texto = (this.campo?.nativeElement.value || '').trim();
    if (!texto) {
      this.erro = 'Preencha este campo.';
      return;
    }
    this.dialogRef.close(texto);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
