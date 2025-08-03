import { Injectable } from '@angular/core';
import { ComponenteEditor } from '../models/components.model';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private STORAGE_KEY = 'layout_editor';

  /** Salva o layout atual (cenário único) */
  salvarLayout(layout: ComponenteEditor[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(layout));
  }

  /** Carrega o layout atual */
  carregarLayout(): ComponenteEditor[] {
    const layoutString = localStorage.getItem(this.STORAGE_KEY);
    return layoutString ? JSON.parse(layoutString) : [];
  }

  /** Salva múltiplos cenários com nomes */
  salvarCenario(nome: string, layout: ComponenteEditor[]) {
    const cenarios = this.listarCenarios();
    cenarios[nome] = layout;
    localStorage.setItem('cenarios_editor', JSON.stringify(cenarios));
  }

  /** Carrega um cenário pelo nome */
  carregarCenario(nome: string): ComponenteEditor[] {
    const cenarios = this.listarCenarios();
    return cenarios[nome] ?? [];
  }

  /** Lista todos os cenários salvos */
  listarCenarios(): Record<string, ComponenteEditor[]> {
    const data = localStorage.getItem('cenarios_editor');
    return data ? JSON.parse(data) : {};
  }

  /** Remove um cenário específico */
  removerCenario(nome: string) {
    const cenarios = this.listarCenarios();
    delete cenarios[nome];
    localStorage.setItem('cenarios_editor', JSON.stringify(cenarios));
  }

  /** (Opcional) Simula envio para backend */
  enviarLayoutParaBackend(layout: ComponenteEditor[]) {
    console.log('Enviando para backend:', layout);
    // return this.http.post('/api/layout', layout).subscribe();
  }

  get layoutAtual(): ComponenteEditor[] {
    return this.carregarLayout();
  }
}
