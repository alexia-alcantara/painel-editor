// CÓDIGO FINAL PARA O SEU cenario-dialog.component.ts
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ComponenteEditor } from '../../models/components.model';
import { LayoutService } from '../../services/layout.service';
import { LayoutExportService } from '../../services/layout-export.service';
import saveAs from 'file-saver';
import { Cenario } from '../../models/cenario.model';

@Component({
  selector: 'app-cenario-dialog',
  standalone: true,
  imports: [ CommonModule, MatDialogModule, MatButtonModule, MatListModule, MatIconModule ],
  templateUrl: './cenario-dialog.component.html',
  styleUrls: ['./cenario-dialog.component.css'],
})
export class CenarioDialogComponent implements OnInit {
  cenarios: Cenario[] = [];

  constructor(
    public dialogRef: MatDialogRef<CenarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { layoutAtual: ComponenteEditor[] },
    private layoutService: LayoutService,
    private layoutExportService: LayoutExportService
  ) {}

  ngOnInit(): void {
    this.carregarListaDeCenarios();
  }

  carregarListaDeCenarios(): void {
    this.cenarios = this.layoutService.listarCenarios();
  }

  carregarCenario(id: string): void {
    const cenario = this.layoutService.carregarCenario(id);
    this.dialogRef.close({ action: 'load', data: cenario });
  }

  removerCenario(id: string, nome: string): void {
    if (confirm(`Tem certeza que deseja remover o cenário "${nome}"?`)) {
      this.layoutService.removerCenario(id);
      this.carregarListaDeCenarios();
    }
  }

  exportarLayout(): void {
    const json = this.layoutExportService.converterParaFormatoOriginal(
      this.data.layoutAtual
    );
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, 'layout-exportado.json');
  }

  importarLayout(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    const file = element.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonDoArquivo = JSON.parse(e.target?.result as string);
          this.dialogRef.close({ action: 'import', data: jsonDoArquivo }); // Padronizado para 'data'
        } catch (error) {
          console.error('Erro ao parsear o JSON:', error);
          alert('Arquivo JSON inválido.');
        }
      };
      reader.readAsText(file);
    }
  }
  
}