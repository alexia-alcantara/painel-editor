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

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [HeaderReuniaoComponent, ImagemReuniaoComponent, PainelParlamentaresComponent, CronometroComponent, ParlamentarItemComponent, VotacaoTotalComponent, StatusReuniaoComponent, TemporizadorItemComponent],
  templateUrl: './painel.component.html',
  styleUrl: './painel.component.css'
})
export class PainelComponent {
  layout = signal<ComponenteEditor[]>([]);

  constructor(private layoutService: LayoutService) {
    const carregado = layoutService.carregarLayout();
    if (carregado) this.layout.set(carregado);
  }


  // ngOnInit() {
  //   const layoutSalvo = this.layoutService.carregarLayout();
  //   if (layoutSalvo) {
  //     this.componentes.set(layoutSalvo);
  //   }
  // }

}
