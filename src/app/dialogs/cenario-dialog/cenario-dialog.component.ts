import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import {
  ComponenteEditor,
  LayoutExportService,
} from '../../services/layout-export.service';
import { LayoutService } from '../../services/layout.service';
import saveAs from 'file-saver';

@Component({
  selector: 'app-cenario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './cenario-dialog.component.html',
  styleUrl: './cenario-dialog.component.css',
})
export class CenarioDialogComponent {
  cenarios: { nome: string; layout: ComponenteEditor[] }[] = [];
  cenarioSelecionado: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<CenarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { layoutAtual: ComponenteEditor[] },
    private layoutService: LayoutService,
    private layoutExportService: LayoutExportService
  ) {}

  ngOnInit(): void {
    this.carregarListaDeCenarios();
  }

  selecionarCenario(nome: string): void {
    this.cenarioSelecionado = nome;
    console.log('Cenário selecionado:', this.cenarioSelecionado);
  }

  carregarListaDeCenarios(): void {
    const cenariosSalvos = this.layoutService.listarCenarios();
    this.cenarios = Object.keys(cenariosSalvos).map((nome) => ({
      nome,
      layout: cenariosSalvos[nome],
    }));
  }

  carregarCenario(nome: string): void {
    const cenario = this.layoutService.carregarCenario(nome);
    this.dialogRef.close({ action: 'carregar', layout: cenario });
  }

  removerCenario(nome: string): void {
    if (confirm(`Tem certeza que deseja remover o cenário "${nome}"?`)) {
      this.layoutService.removerCenario(nome);
      this.carregarListaDeCenarios(); // Atualiza a lista na tela
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

  importarLayout(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        // Aqui você precisaria de um serviço para converter o JSON importado
        // de volta para o formato ComponenteEditor[]. Por enquanto, vamos fechar e passar o JSON.
        // O ideal é ter um `layoutImportService.converterDoFormatoOriginal(json)`
        alert('Funcionalidade de importação a ser implementada.');
        // this.dialogRef.close({ action: 'importar', data: json });
      } catch (error) {
        console.error('Erro ao importar o arquivo JSON:', error);
        alert('Arquivo JSON inválido.');
      }
    };

    reader.readAsText(file);
  }

  triggerFileInput(): void {
    document.getElementById('import-file-input')?.click();
  }
}
