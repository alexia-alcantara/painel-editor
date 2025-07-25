import { Component } from '@angular/core';
import { HeaderReuniaoComponent } from "../components/header-reuniao/header-reuniao.component";
import { CronometroComponent } from "../components/cronometro/cronometro.component";
import { ImagemReuniaoComponent } from "../components/imagem-reuniao/imagem-reuniao.component";
import { PainelParlamentaresComponent } from "../components/painel-parlamentares/painel-parlamentares.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderReuniaoComponent, CronometroComponent, ImagemReuniaoComponent, PainelParlamentaresComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
