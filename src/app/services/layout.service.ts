import { Injectable } from '@angular/core';
import { DistribuirConfig } from '../dialogs/distribuir-parlamentares/distribuir-parlamentares.component';
import { Cenario } from '../models/cenario.model';
import { Subject } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private cenariosAtualizados = new Subject<Cenario[]>();
  cenarios$ = this.cenariosAtualizados.asObservable();

  private LAYOUT_ATUAL_KEY = 'layout_editor_atual';
  
  private CENARIOS_KEY = 'cenarios_editor_salvos';

  private DIST_CONFIG_KEY = 'distribuicao_config';

salvarLayoutAtual(layout: Cenario): void {
  const layoutParaSalvar = { ...layout };

  delete (layoutParaSalvar as any).imagemFundoId;
  delete (layoutParaSalvar as any).imagemFundoFile; 

  localStorage.setItem('layout_editor_atual', JSON.stringify(layoutParaSalvar));
}

   carregarLayoutAtual(): Cenario | null {
    try {
      const cenarioString = localStorage.getItem(this.LAYOUT_ATUAL_KEY);
      return cenarioString ? JSON.parse(cenarioString) : null;
    } catch (e) {
      console.error("Erro ao carregar cenário atual do localStorage", e);
      return null;
    }
  }

   salvarCenario(cenarioParaSalvar: Cenario): void {
    try {
      const cenarios = this.listarCenarios();
      const index = cenarios.findIndex(c => c.id === cenarioParaSalvar.id);

      if (index > -1) {
        cenarios[index] = cenarioParaSalvar;
      } else {
        cenarios.push(cenarioParaSalvar);
      }
      localStorage.setItem(this.CENARIOS_KEY, JSON.stringify(cenarios));
      
      this.cenariosAtualizados.next(cenarios); 
    } catch (e) {
      console.error("Erro ao salvar cenário no localStorage", e);
    }
  }

   carregarCenario(slug: string): Cenario | null {
    const cenarios = this.listarCenarios();
    return cenarios.find(c => c.slug === slug || c.id === slug) || null;
  }

  listarCenarios(): Cenario[] {
    try {
      const data = localStorage.getItem(this.CENARIOS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Erro ao listar cenários do localStorage", e);
      return [];
    }
  }

   removerCenario(id: string): void {
    let cenarios = this.listarCenarios();
    cenarios = cenarios.filter(c => c.id !== id);
    localStorage.setItem(this.CENARIOS_KEY, JSON.stringify(cenarios));
    
    this.cenariosAtualizados.next(cenarios);
  }

  salvarConfigDistribuicao(config: DistribuirConfig): void {
    localStorage.setItem(this.DIST_CONFIG_KEY, JSON.stringify(config));
  }

  carregarConfigDistribuicao(): DistribuirConfig | null {
    const configString = localStorage.getItem(this.DIST_CONFIG_KEY);
    return configString ? JSON.parse(configString) : null;
  }

}