import { Injectable } from '@angular/core';
import { ComponenteEditor } from '../models/components.model';
import { DistribuirConfig } from '../dialogs/distribuir-parlamentares/distribuir-parlamentares.component';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  // Chave para salvar o layout de trabalho atual (auto-save)
  private LAYOUT_ATUAL_KEY = 'layout_editor';
  
  // <<< CHAVE CENTRALIZADA PARA TODOS OS CENÁRIOS NOMEADOS >>>
  private CENARIOS_KEY = 'cenarios_editor';

  // Chave para salvar a configuração do modal de distribuição
  private DIST_CONFIG_KEY = 'distribuicao_config';

  /**
   * Salva o layout que está sendo editado no momento.
   * Usado para restaurar o trabalho em progresso.
   */
  salvarLayout(layout: ComponenteEditor[]): void {
    localStorage.setItem(this.LAYOUT_ATUAL_KEY, JSON.stringify(layout));
  }

  /**
   * Carrega o último layout que estava sendo editado.
   */
  carregarLayout(): ComponenteEditor[] {
    try {
      const layoutString = localStorage.getItem(this.LAYOUT_ATUAL_KEY);
      return layoutString ? JSON.parse(layoutString) : [];
    } catch (e) {
      console.error("Erro ao carregar layout do localStorage", e);
      return [];
    }
  }


  salvarCenario(nome: string, layout: ComponenteEditor[]): void {
    try {
      const cenarios = this.listarCenarios();
      cenarios[nome] = layout; // Adiciona ou atualiza o cenário no objeto
      localStorage.setItem(this.CENARIOS_KEY, JSON.stringify(cenarios));
    } catch (e) {
      console.error("Erro ao salvar cenário no localStorage", e);
    }
  }

  carregarCenario(nome: string): ComponenteEditor[] | null {
    const cenarios = this.listarCenarios();
    return cenarios[nome] || null;
  }

  listarCenarios(): Record<string, ComponenteEditor[]> {
    try {
      const data = localStorage.getItem(this.CENARIOS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error("Erro ao listar cenários do localStorage", e);
      return {};
    }
  }

  removerCenario(nome: string): void {
    const cenarios = this.listarCenarios();
    delete cenarios[nome];
    localStorage.setItem(this.CENARIOS_KEY, JSON.stringify(cenarios));
  }

  salvarConfigDistribuicao(config: DistribuirConfig): void {
    localStorage.setItem(this.DIST_CONFIG_KEY, JSON.stringify(config));
  }

  carregarConfigDistribuicao(): DistribuirConfig | null {
    const configString = localStorage.getItem(this.DIST_CONFIG_KEY);
    return configString ? JSON.parse(configString) : null;
  }

  get layoutAtual(): ComponenteEditor[] {
    return this.carregarLayout();
  }
}