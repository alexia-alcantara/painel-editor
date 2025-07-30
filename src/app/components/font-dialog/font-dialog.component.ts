import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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

  constructor(
    public dialogRef: MatDialogRef<FontDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  close() {
    this.dialogRef.close({
      font: this.selectedFont,
      style: this.selectedStyle,
      size: this.selectedSize,
    });
    const fontConfig = {
      font: this.selectedFont,
      style: this.selectedStyle,
      size: this.selectedSize,
    };

    // Aplica globalmente no body
    document.body.style.fontFamily = fontConfig.font;
    document.body.style.fontSize = fontConfig.size + 'px';
    document.body.style.fontWeight = fontConfig.style.includes('Bold')
      ? 'bold'
      : 'normal';
    document.body.style.fontStyle = fontConfig.style.includes('Italic')
      ? 'italic'
      : 'normal';

    this.dialogRef.close(fontConfig);
  }
}
