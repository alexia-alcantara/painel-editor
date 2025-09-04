import { Injectable, signal } from '@angular/core';
import { FonteGrupo, FontConfig, ComponenteTipo } from '../models/fontes.model';

@Injectable({
  providedIn: 'root',
})
export class FonteService {
  private _grupos = signal<FonteGrupo[]>([
    { tipo: 'parlamentar', label: 'Parlamentar', subItens: [ { subId: 'nome', label: 'Nome', font: { family: 'Arial', size: 16, color: '#FFFFFF', weight: '500' } }, { subId: 'partido', label: 'Partido', font: { family: 'Arial', size: 16, color: '#CCCCCC', weight: '500' } }, { subId: 'voto', label: 'Voto', font: { family: 'Arial', size: 16, color: '#36C26C', weight: '700' } } ] },
    { tipo: 'titulo', label: 'Título', subItens: [ { subId: 'titulo-texto', label: 'Texto', font: { family: 'Roboto', size: 24, color: '#FFFFFF', weight: 'bold' } } ] },
    { tipo: 'subtitulo', label: 'Subtítulo', subItens: [ { subId: 'subtitulo-texto', label: 'Texto', font: { family: 'Roboto', size: 18, color: '#CCCCCC', weight: 'normal' } } ] },
    { tipo: 'descricao', label: 'Descrição', subItens: [ { subId: 'default', label: 'Texto', font: { family: 'Inter', size: 14, color: '#9D9D9D', weight: 'normal' } } ] },
    { tipo: 'votacao-item', label: 'Votação', subItens: [ { subId: 'label', label: 'Rótulo', font: { family: 'Inter', size: 14, color: '#FFFFFF', weight: 'normal' } }, { subId: 'valor', label: 'Valor', font: { family: 'Inter', size: 20, color: '#00FF00', weight: 'normal' } } ] },
    { tipo: 'temporizador-item', label: 'Temporizador', subItens: [ { subId: 'default', label: 'Tempo', font: { family: 'Inter', size: 16, color: '#FFFFFF', weight: 'normal' } } ] },
  ]);

  public grupos = this._grupos.asReadonly();

  updateFonte(tipo: ComponenteTipo, subId: string, novaFonte: FontConfig) {
    this._grupos.update((gruposAtuais) => {
      return gruposAtuais.map((grupo) => {
        if (grupo.tipo !== tipo) {
          return grupo;
        }

        const novosSubItens = grupo.subItens.map((subItem) => {
          if (subItem.subId !== subId) {
            return subItem;
          }
          return { ...subItem, font: novaFonte };
        });

        return { ...grupo, subItens: novosSubItens };
      });
    });
  }
  
  getFonteByTipo(tipo: ComponenteTipo) {
    const grupo = this.grupos().find((g) => g.tipo === tipo);
    return grupo ? grupo.subItens : [];
  }
}
