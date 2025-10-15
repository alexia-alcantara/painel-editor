import { Injectable, signal } from '@angular/core';
import { FonteGrupo, FontConfig, ComponenteTipo } from '../models/fontes.model';

@Injectable({
  providedIn: 'root',
})
export class FonteService {
  private readonly VALORES_INICIAIS: FonteGrupo[] = [
    {
      tipo: 'titulo',
      label: 'Título',
      subItens: [
        { subId: 'titulo-texto', label: 'Título Principal', font: { family: 'Segoe UI Semibold', size: 36, weight: '600', color: '#FFFFFF', style: 'normal' } },
      ],
    },
    {
      tipo: 'subtitulo',
      label: 'Subtítulo',
      subItens: [
        { subId: 'subtitulo-texto', label: 'Subtítulo (Votação/Tema)', font: { family: 'Segoe UI Semibold', size: 24, weight: 'normal', color: '#FFFFFF', style: 'normal' } },
      ],
    },
    {
      tipo: 'descricao',
      label: 'Descrição',
      subItens: [
        { subId: 'descricao-texto', label: 'Texto de Ementa/Status', font: { family: 'Segoe UI Semibold', size: 22, weight: 'normal', color: '#FFFFFF', style: 'normal' } }
      ],
    },
    {
      tipo: 'parlamentar',
      label: 'Parlamentar',
      subItens: [
        { subId: 'nome', label: 'Nome', font: { family: 'Segoe UI Semibold', size: 26, weight: '600', color: '#FFFFFF', style: 'normal' } },
        { subId: 'partido', label: 'Partido', font: { family: 'Segoe UI Semibold', size: 26, weight: '600', color: '#FFFFFF', style: 'normal' } },
      ],
    },
    {
      tipo: 'tribuna',
      label: 'Tribuna',
      subItens: [
        { subId: 'orador', label: 'Nome do Orador', font: { family: 'Segoe UI Semibold', size: 24, weight: '600', color: '#FFFFFF', style: 'normal' } },
        { subId: 'partido', label: 'Partido do Orador', font: { family: 'Segoe UI Semibold', size: 24, weight: 'normal', color: '#FFFFFF', style: 'normal' } },
      ],
    },
    {
      tipo: 'resultado-votacao',
      label: 'Resultado da Votação',
      subItens: [
        { subId: 'resultado-texto', label: 'Texto (Aprovado/etc)', font: { family: 'Segoe UI Semibold', size: 28, weight: 'bold', color: '#FFFF00', style: 'normal' } }
      ]
    },
       {
      tipo: 'votacao-item',
      label: 'Totalizadores de Votos', 
      subItens: [
        { 
          subId: 'label', 
          label: 'Rótulo (Sim, Não, Abst.)', 
          font: { family: 'Segoe UI Semibold', size: 26, weight: '600', color: '#FFFFFF', style: 'normal' } 
        },
        { 
          subId: 'valor', 
          label: 'Valor (Contador)', 
          font: { family: 'Segoe UI Semibold', size: 26, weight: '600', color: '#FFFFFF', style: 'normal' } 
        }
      ]
    },
    {
      tipo: 'temporizador-item',
      label: 'Temporizador',
      subItens: [
        { subId: 'default', label: 'Tempo', font: { family: 'Segoe UI Semibold', size: 28, weight: '600', color: '#FFFFFF', style: 'normal' } }
      ],
    },
  ];

  private _grupos = signal<FonteGrupo[]>(structuredClone(this.VALORES_INICIAIS));
  public grupos = this._grupos.asReadonly();

  updateFonte(tipo: ComponenteTipo, subId: string, novaFonte: FontConfig) {
    this._grupos.update((gruposAtuais) => {
      return gruposAtuais.map((grupo) => {
        if (grupo.tipo !== tipo) return grupo;
        
        const novosSubItens = grupo.subItens.map((subItem) => {
          if (subItem.subId !== subId) return subItem;
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


  getFonte(tipo: ComponenteTipo, subId: string) {
      const grupo = this.grupos().find(g => g.tipo === tipo);
      return grupo?.subItens.find(s => s.subId === subId);
  }


  setGrupos(novosGrupos: FonteGrupo[]) {
      this._grupos.set(novosGrupos);
  }
  

  obterGruposPadrao(): FonteGrupo[] {
    return structuredClone(this.VALORES_INICIAIS);
  }
}