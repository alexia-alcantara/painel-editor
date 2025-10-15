// src/app/dialogs/font-dialog/font-dialog.component.ts

import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FontConfig, ComponenteTipo } from '../../models/fontes.model';
import { MatButtonModule } from '@angular/material/button';
import { FonteService } from '../../services/fonte.service'; 

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
  styles = ['Regular', 'Italic', 'Bold', 'Bold Italic'];
  sizes = [ 8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 36, 48, 72 ];

  selectedFont: string = 'Segoe UI, sans-serif';
  selectedStyle: string = 'Regular';
  selectedSize: number = 16;

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

      if ((config.weight === 'bold' || config.weight === '600') && config.style === 'italic') {
        this.selectedStyle = 'Bold Italic';
      } else if (config.weight === 'bold' || config.weight === '600') {
        this.selectedStyle = 'Bold';
      } else if (config.style === 'italic') {
        this.selectedStyle = 'Italic';
      } else {
        this.selectedStyle = 'Regular';
      }
    } else {
        console.warn(`Fonte não encontrada para ${this.data.tipo} - ${this.data.subId}. Usando valores padrão.`);
        this.originalFontConfig = { family: 'Arial', size: 16, color: '#FFFFFF', weight: 'normal', style: 'normal' };
    }
  }

  close() {
    const fontConfig: FontConfig = {
      family: this.selectedFont,
      size: this.selectedSize,
      color: this.originalFontConfig.color || '#FFFFFF',
    };

    switch (this.selectedStyle) {
      case 'Regular':
        fontConfig.weight = 'normal';
        fontConfig.style = 'normal';
        break;
      case 'Italic':
        fontConfig.weight = 'normal';
        fontConfig.style = 'italic';
        break;
      case 'Bold':
        fontConfig.weight = 'bold';
        fontConfig.style = 'normal';
        break;
      case 'Bold Italic':
        fontConfig.weight = 'bold';
        fontConfig.style = 'italic';
        break;
    }

    this.dialogRef.close(fontConfig);
  }
}