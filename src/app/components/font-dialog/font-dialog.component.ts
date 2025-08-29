import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FontConfig } from '../../models/fontes.model';
@Component({
  selector: 'app-font-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './font-dialog.component.html',
  styleUrl: './font-dialog.component.css',
})
export class FontDialogComponent {
  fonts = [
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Tahoma', value: 'Tahoma, sans-serif' },
    { name: 'Times New Roman', value: '"Times New Roman", serif' },
    { name: 'Courier New', value: '"Courier New", monospace' },
    { name: 'Inter', value: '"Inter", sans-serif' },
    { name: 'Ubuntu', value: '"Ubuntu", sans-serif' },
  ];
  styles = ['Regular', 'Bold', 'Italic', 'Bold Italic'];
  sizes = [8, 9, 10, 11, 12, 14, 16, 18, 20];

  selectedFont = 'Tahoma';
  selectedStyle = 'Regular';
  selectedSize = 12;
  selectedColor = '#FFFFFF';

  constructor(
    public dialogRef: MatDialogRef<FontDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

close() {
  // Cria o objeto base da configuração
  const fontConfig: FontConfig = {
    family: this.selectedFont,
    size: this.selectedSize,
    color: this.selectedColor || '#FFFFFF',
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
