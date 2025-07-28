import { Component, signal } from '@angular/core';
import { ComponenteEditor } from '../../models/components.model';
import { LayoutService } from '../../services/layout.service';
import { HeaderReuniaoComponent } from "../header-reuniao/header-reuniao.component";
import { ImagemReuniaoComponent } from "../imagem-reuniao/imagem-reuniao.component";
import { PainelParlamentaresComponent } from "../painel-parlamentares/painel-parlamentares.component";
import { CronometroComponent } from "../cronometro/cronometro.component";
import { ParlamentarItemComponent } from "../parlamentar-item/parlamentar-item.component";
import { VotacaoTotalComponent } from "../votacao-total/votacao-total.component";
import { StatusReuniaoComponent } from "../status-reuniao/status-reuniao.component";
import { TemporizadorItemComponent } from "../temporizador-item/temporizador-item.component";
import { DescricaoReuniaoComponent } from "../descricao-reuniao/descricao-reuniao.component";
import { TituloReuniaoComponent } from "../titulo-reuniao/titulo-reuniao.component";
import { SubtituloReuniaoComponent } from "../subtitulo-reuniao/subtitulo-reuniao.component";

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [HeaderReuniaoComponent, ImagemReuniaoComponent, PainelParlamentaresComponent, CronometroComponent, ParlamentarItemComponent, VotacaoTotalComponent, StatusReuniaoComponent, TemporizadorItemComponent, DescricaoReuniaoComponent, TituloReuniaoComponent, SubtituloReuniaoComponent],
  templateUrl: './painel.component.html',
  styleUrl: './painel.component.css'
})
export class PainelComponent {
  layout = signal<ComponenteEditor[]>([]);

  constructor(private layoutService: LayoutService) {
    const carregado = layoutService.carregarLayout();
    if (carregado) this.layout.set(carregado);
  }


}
