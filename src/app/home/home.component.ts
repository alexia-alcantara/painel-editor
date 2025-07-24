import { Component } from '@angular/core';
import { HeaderReuniaoComponent } from "../components/header-reuniao/header-reuniao.component";
import { ResumoVotacaoComponent } from "../components/resumo-votacao/resumo-votacao.component";
import { CronometroComponent } from "../components/cronometro/cronometro.component";
import { ImagemReuniaoComponent } from "../components/imagem-reuniao/imagem-reuniao.component";
import { PainelParlamentaresComponent } from "../components/painel-parlamentares/painel-parlamentares.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderReuniaoComponent, ResumoVotacaoComponent, CronometroComponent, ImagemReuniaoComponent, PainelParlamentaresComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
