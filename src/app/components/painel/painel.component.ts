import { Component, OnInit, signal, HostBinding } from '@angular/core'; // Adiciona OnInit, HostBinding
import { Cenario } from '../../models/cenario.model'; // ✅ Importa o Cenario
import { ComponenteEditor } from '../../models/components.model';
import { LayoutService } from '../../services/layout.service';

import { HeaderReuniaoComponent } from "../header-reuniao/header-reuniao.component";
import { ImagemReuniaoComponent } from "../imagem-reuniao/imagem-reuniao.component";
import { ParlamentarItemComponent } from "../parlamentar-item/parlamentar-item.component";
import { VotacaoTotalComponent } from "../votacao-total/votacao-total.component";
import { DescricaoReuniaoComponent } from "../descricao-reuniao/descricao-reuniao.component";
import { TituloReuniaoComponent } from "../titulo-reuniao/titulo-reuniao.component";
import { SubtituloReuniaoComponent } from "../subtitulo-reuniao/subtitulo-reuniao.component";
import { StatusReuniaoComponent } from "../status-reuniao/status-reuniao.component";
import { TemporizadorItemComponent } from "../temporizador-item/temporizador-item.component";
// ... etc.

@Component({
  selector: 'app-painel',
  standalone: true,
  imports: [ParlamentarItemComponent, VotacaoTotalComponent, ImagemReuniaoComponent, HeaderReuniaoComponent, DescricaoReuniaoComponent, TituloReuniaoComponent, SubtituloReuniaoComponent, StatusReuniaoComponent, TemporizadorItemComponent],
  templateUrl: './painel.component.html',
  styleUrls: ['./painel.component.css']
})
export class PainelComponent implements OnInit { 

  cenario = signal<Cenario | null>(null);

  @HostBinding('style.background-image')
  get backgroundImage() {
    const bgImage = this.cenario()?.backgroundImage;
    return bgImage ? `url(${bgImage})` : 'none';
  }

  @HostBinding('style.background-size')
  backgroundSize = 'cover';

  @HostBinding('style.background-position')
  backgroundPosition = 'center';

  constructor(private layoutService: LayoutService) { }

  ngOnInit(): void {
    const cenarioCarregado = this.layoutService.carregarLayoutAtual();
    
    if (cenarioCarregado) {
      this.cenario.set(cenarioCarregado);
    }
  }
}