import { CommonModule } from '@angular/common';
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';

export interface DistribuirConfig {
  qtdePorColuna: number;
  espacamentoVertical: number;
  espacamentoHorizontal: number;
  qntTotal: number;
  margemSuperior: number;
  margemEsquerda: number;
  exibirDe: number;
  exibirAte: number;
  offsetInicial: number;
  posicaoX: number;
  posicaoY: number;
}

@Component({
  selector: 'app-distribuir-parlamentares',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './distribuir-parlamentares.component.html',
  styleUrl: './distribuir-parlamentares.component.css',
  encapsulation: ViewEncapsulation.None
})
export class DistribuirParlamentaresComponent {

  constructor(
    public dialogRef: MatDialogRef<DistribuirParlamentaresComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DistribuirConfig
  ){
    //definir valores para as novas propriedades
    if(this.data.posicaoX === undefined){
      this.data.posicaoX = 100;
    }
    if(this.data.posicaoY === undefined){
      this.data.posicaoY = 100;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
