import { Component } from '@angular/core';
import { HeaderReuniaoComponent } from '../components/header-reuniao/header-reuniao.component';
import { CronometroComponent } from '../components/cronometro/cronometro.component';
import { ImagemReuniaoComponent } from '../components/imagem-reuniao/imagem-reuniao.component';
import { LayoutService } from '../services/layout.service';
import { Cenario } from '../models/cenario.model';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

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
  constructor(private layoutService: LayoutService, private router: Router) {}

  ngOnInit() {
    this.cenarios = this.layoutService.listarCenarios();

    this.cenariosSubscription = this.layoutService.cenarios$.subscribe(
      (novaLista) => {
        this.cenarios = novaLista;
      }
    );
  }

  ngOnDestroy() {
    this.cenariosSubscription?.unsubscribe();
  }

  recarregarLista(): void {
    this.cenarios = this.layoutService.listarCenarios();
  }

  criarNovoCenario(): void {
    const novoId = `cenario_${Date.now()}`;
    this.router.navigate(['/editor', novoId]);
  }

  deletarCenario(id: string, nome: string): void {
    if (confirm(`Tem certeza que deseja deletar o cenário "${nome}"?`)) {
      this.layoutService.removerCenario(id);
      this.recarregarLista();
    }
  }
}
