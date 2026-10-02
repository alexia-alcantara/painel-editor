import { Component } from '@angular/core';
import { HeaderReuniaoComponent } from '../components/header-reuniao/header-reuniao.component';
import { CronometroComponent } from '../components/cronometro/cronometro.component';
import { ImagemReuniaoComponent } from '../components/imagem-reuniao/imagem-reuniao.component';
import { LayoutService } from '../services/layout.service';
import { Cenario } from '../models/cenario.model';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { AvisoService } from '../services/aviso.service';
import { log } from '../utils/log';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderReuniaoComponent,
    CronometroComponent,
    ImagemReuniaoComponent,
    RouterLink,
    MatIconModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  cenarios: Cenario[] = [];
  private cenariosSubscription: Subscription | undefined;
  constructor(
    private layoutService: LayoutService,
    private router: Router,
    private aviso: AvisoService,
  ) {}

  ngOnInit() {
    this.recarregarLista();

    this.cenariosSubscription = this.layoutService.cenarios$.subscribe(
      (novaLista) => {
        this.cenarios = novaLista;
      },
    );
  }

  ngOnDestroy() {
    this.cenariosSubscription?.unsubscribe();
  }

  recarregarLista(): void {
    this.layoutService.listarCenarios().subscribe((cenarios) => {
      this.cenarios = cenarios;
    });
  }

  criarNovoCenario(): void {
    const novoId = `cenario_${Date.now()}`;
    this.router.navigate(['/editor', novoId]);
  }

  async deletarCenario(idBackend: number, nome: string): Promise<void> {
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
        this.recarregarLista();
      },
      error: (err) => {
        log.erro('Cenários', `Erro ao deletar o cenário "${nome}" (id ${idBackend}):`, err);
        this.aviso.erro(`Erro ao deletar o cenário "${nome}".`);
      },
    });
  }
}
