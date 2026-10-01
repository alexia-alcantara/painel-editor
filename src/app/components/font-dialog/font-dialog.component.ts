// src/app/dialogs/font-dialog/font-dialog.component.ts

import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FontConfig, ComponenteTipo } from '../../models/fontes.model';
import { MatButtonModule } from '@angular/material/button';
import { FonteService } from '../../services/fonte.service'; 
import { log } from '../../utils/log';

interface EstiloFonte {
  nome: string;
  weight: string;
  style: 'normal' | 'italic';
}

@Component({
  selector: 'app-font-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule],
  templateUrl: './font-dialog.component.html',
  styleUrls: ['./font-dialog.component.css'],
})
export class FontDialogComponent implements OnInit {
  fonts = [
    { name: 'Segoe UI', value: 'Segoe UI, sans-serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Tahoma', value: 'Tahoma, sans-serif' },
    { name: 'Times New Roman', value: '"Times New Roman", serif' },
    { name: 'Courier New', value: '"Courier New", monospace' },
    { name: 'Inter', value: '"Inter", sans-serif' },
  ];
  styles: EstiloFonte[] = [
    { nome: 'Leve', weight: '300', style: 'normal' },
    { nome: 'Itálico leve', weight: '300', style: 'italic' },
    { nome: 'Regular', weight: 'normal', style: 'normal' },
    { nome: 'Itálico', weight: 'normal', style: 'italic' },
    { nome: 'Semi-negrito', weight: '600', style: 'normal' },
    { nome: 'Itálico e semi-negrito', weight: '600', style: 'italic' },
    { nome: 'Negrito', weight: 'bold', style: 'normal' },
    { nome: 'Itálico e negrito', weight: 'bold', style: 'italic' },
    { nome: 'Preto', weight: '900', style: 'normal' },
    { nome: 'Itálico preto', weight: '900', style: 'italic' },
  ];
  sizes = [ 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 36, 48, 72 ];

  selectedFont: string = 'Segoe UI, sans-serif';
  selectedStyle: string = 'Regular';
  selectedSize: number = 16;
  selectedAlign: 'left' | 'center' | 'right' = 'center';

  alinhamentos: { valor: 'left' | 'center' | 'right'; nome: string; icone: string }[] = [
    { valor: 'left', nome: 'Esquerda', icone: 'fa-align-left' },
    { valor: 'center', nome: 'Centro', icone: 'fa-align-center' },
    { valor: 'right', nome: 'Direita', icone: 'fa-align-right' },
  ];

  private originalFontConfig!: FontConfig; 

  constructor(
    public dialogRef: MatDialogRef<FontDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tipo: ComponenteTipo, subId: string },
    private fonteService: FonteService 
  ) {}

  ngOnInit(): void {
    const fonteAtual = this.fonteService.getFonte(this.data.tipo, this.data.subId);

    if (fonteAtual) {
      this.originalFontConfig = fonteAtual.font; 
      const config = this.originalFontConfig;

      const fontFamilyMatch = this.fonts.find(f => config.family.includes(f.name));
      this.selectedFont = fontFamilyMatch ? fontFamilyMatch.value : config.family;
      
      this.selectedSize = config.size;
      this.selectedAlign = config.align || this.alinhamentoPadrao();

      this.selectedStyle = this.estiloDaConfig(config.weight, config.style);
    } else {
        log.aviso('Fontes', `Fonte não encontrada (${this.data.tipo}/${this.data.subId}). Usando a padrão.`);
        this.originalFontConfig = { family: 'Arial', size: 16, color: '#FFFFFF', weight: 'normal', style: 'normal' };
    }
  }

  private alinhamentoPadrao(): 'left' | 'center' | 'right' {
    return this.data.subId === 'label' || this.data.subId === 'nome' ? 'left' : 'center';
  }

  private tamanhoValido(): number {
    const n = Math.round(Number(this.selectedSize));
    if (!Number.isFinite(n) || n <= 0) return 16;
    return Math.min(400, Math.max(6, n));
  }

  get estiloSelecionado(): EstiloFonte {
    return this.styles.find((e) => e.nome === this.selectedStyle) ?? this.styles[2];
  }

  private estiloDaConfig(weight?: string, style?: string): string {
    const pesos: Record<string, number> = { normal: 400, bold: 700, lighter: 300, bolder: 900 };
    const w = String(weight ?? 'normal').trim().toLowerCase();
    const numero = pesos[w] ?? (Number(w) || 400);
    const italico = style === 'italic';

    let peso = 'normal';
    if (numero <= 350) peso = '300';
    else if (numero >= 550 && numero < 650) peso = '600';
    else if (numero >= 650 && numero < 850) peso = 'bold';
    else if (numero >= 850) peso = '900';

    const encontrado = this.styles.find(
      (e) => e.weight === peso && (e.style === 'italic') === italico,
    );
    return encontrado?.nome ?? 'Regular';
  }

  close() {
    const fontConfig: FontConfig = {
      family: this.selectedFont,
      size: this.tamanhoValido(),
      color: this.originalFontConfig.color || '#FFFFFF',
      align: this.selectedAlign,
    };

    const estilo = this.estiloSelecionado;
    fontConfig.weight = estilo.weight;
    fontConfig.style = estilo.style;

    this.dialogRef.close(fontConfig);
  }
}