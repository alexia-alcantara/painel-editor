import { CommonModule, Location } from '@angular/common';
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
import { Router } from '@angular/router';
import { Subscription } from 'rxjs'; 
import { log } from '../../utils/log';
import { AvisoService } from '../../services/aviso.service';

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
  styleUrls: ['./cenario-dialog.component.css'],
})
export class CenarioDialogComponent implements OnInit {
  cenarios: Cenario[] = [];
  private cenariosSub!: Subscription;

  constructor(
    public dialogRef: MatDialogRef<CenarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { layoutAtual: ComponenteEditor[]; cenarioAtual?: Cenario | null },
    private layoutService: LayoutService,
    private layoutExportService: LayoutExportService,
    private router: Router,
    private location: Location,
    private aviso: AvisoService,
  ) {}

  ngOnInit(): void {
    this.layoutService.listarCenarios().subscribe((cenarios) => {
      this.cenarios = cenarios;
    });

    this.cenariosSub = this.layoutService.cenarios$.subscribe(cenariosAtualizados => {
      this.cenarios = cenariosAtualizados;
    });
  }

    ngOnDestroy(): void {
    if (this.cenariosSub) {
      this.cenariosSub.unsubscribe();
    }
  }

  abrirDisplay(cenario: Cenario): void { 
    const identificadorUrl = cenario.slug || cenario.id;

    if (identificadorUrl) {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/display', identificadorUrl])
      );
            window.open(this.location.prepareExternalUrl(url), '_blank');
      this.dialogRef.close();
    } else {
      this.aviso.erro(`Cenário "${cenario.nome}" sem identificador.`);
    }
  }

  async editarCenario(cenario: Cenario): Promise<void> {
    const identificadorUrl = cenario.slug || cenario.id;

    if (!identificadorUrl) {
      this.aviso.erro(`Cenário "${cenario.nome}" sem identificador.`);
      return;
    }

    const confirmou = await this.aviso.confirmar({
      titulo: 'Abrir no editor',
      mensagem: `Abrir "${cenario.nome}" no editor? O que não foi salvo no cenário atual será perdido.`,
      textoConfirmar: 'Abrir',
    });
    if (!confirmou) return;

    this.dialogRef.close();
    this.router.navigate(['/editor', identificadorUrl]);
  }
  
  async removerCenario(idBackend: number, nome: string): Promise<void> {
    const confirmou = await this.aviso.confirmar({
      titulo: 'Deletar cenário',
      mensagem: `Tem certeza que deseja deletar o cenário "${nome}"? Essa ação não pode ser desfeita.`,
      textoConfirmar: 'Deletar',
      perigo: true,
    });
    if (!confirmou) return;

    this.layoutService.removerCenario(idBackend).subscribe({
      next: () => {
        log.info('Cenários', `Cenário "${nome}" (id ${idBackend}) deletado`);
        this.aviso.sucesso(`Cenário "${nome}" deletado.`);
      },
      error: (err) => {
        log.erro('Cenários', `Erro ao deletar o cenário "${nome}" (id ${idBackend}):`, err);
        this.aviso.erro(`Erro ao deletar o cenário "${nome}".`);
      },
    });
  }

  exportarCenario(cenario: Cenario): void {
    this.baixarJson(this.layoutExportService.paraFormatoDelphi(cenario), cenario.slug || cenario.nome);
  }

  exportarLayout(): void {
    const atual = this.data.cenarioAtual;
    if (!atual) {
      this.aviso.erro('Nenhum cenário aberto para exportar.');
      return;
    }
    this.baixarJson(this.layoutExportService.paraFormatoDelphi(atual), atual.slug || atual.nome);
  }

  private baixarJson(conteudo: any, nome: string): void {
    const nomeArquivo = `${(nome || 'cenario').replace(/[^\w\-]+/g, '_')}.json`;
    const blob = new Blob([JSON.stringify(conteudo, null, 2)], {
      type: 'application/json',
    });
    saveAs(blob, nomeArquivo);
    log.info('Exportar', `Cenário exportado: ${nomeArquivo}`);
    this.aviso.sucesso(`Cenário exportado: ${nomeArquivo}`);
  }

  importarLayout(event: Event) {
    const element = event.currentTarget as HTMLInputElement;
    const file = element.files?.[0];
    element.value = ''; // permite importar o mesmo arquivo de novo

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      let jsonDoArquivo: any;
      try {
        jsonDoArquivo = JSON.parse(e.target?.result as string);
      } catch (error) {
        log.erro('Importar', `Erro ao ler o arquivo "${file.name}":`, error);
        this.aviso.erro(`Arquivo "${file.name}" inválido.`);
        return;
      }

      const nome = file.name.replace(/\.json$/i, '');

      if (this.layoutExportService.ehFormatoDelphi(jsonDoArquivo)) {
        log.info('Importar', `Importando ${file.name} (formato do Delphi)`);
        this.dialogRef.close({ action: 'importarDelphi', json: jsonDoArquivo, nome });
        return;
      }

      const cenario = this.layoutService.lerCenarioImportado(jsonDoArquivo);
      if (cenario) {
        log.info('Importar', `Importando o cenário "${cenario.nome}" de ${file.name}`);
        this.dialogRef.close({ action: 'importarCenario', cenario });
        return;
      }

      log.erro('Importar', `${file.name} não está em nenhum formato de cenário conhecido`);
      this.aviso.erro(`Arquivo "${file.name}" inválido.`);
    };
    reader.readAsText(file);
  }
  
}