// src/app/services/fonte.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FonteGrupo, FontConfig, ComponenteTipo } from '../models/fontes.model';

@Injectable({ providedIn: 'root' })
export class FonteService {
  private grupos: FonteGrupo[] = [
    {
      tipo: 'parlamentar',
      label: 'Parlamentar',
      subItens: [
        {
          id: 'nome',
          label: 'Nome',
          font: { family: 'Arial', size: 16, color: '#FFFFFF' },
        },
        {
          id: 'partido',
          label: 'Partido',
          font: { family: 'Arial', size: 16, color: '#CCCCCC' },
        },
        {
          id: 'voto',
          label: 'Voto',
          font: { family: 'Arial', size: 16, color: '#36C26C' },
        },
      ],
    },
    {
      tipo: 'titulo',
      label: 'Título',
      subItens: [
        {
          id: 'default',
          label: 'Texto',
          font: { family: 'Roboto', size: 24, color: '#FFD700' },
        },
      ],
    },
    {
      tipo: 'subtitulo',
      label: 'Subtítulo',
      subItens: [
        {
          id: 'default',
          label: 'Texto',
          font: { family: 'Roboto', size: 18, color: '#CCCCCC' },
        },
      ],
    },
    {
      tipo: 'descricao',
      label: 'Descrição',
      subItens: [
        {
          id: 'default',
          label: 'Texto',
          font: { family: 'Inter', size: 14, color: '#9D9D9D' },
        },
      ],
    },
    {
      tipo: 'votacao-item',
      label: 'Votação',
      subItens: [
        {
          id: 'label',
          label: 'Rótulo',
          font: { family: 'Inter', size: 14, color: '#FFFFFF' },
        },
        {
          id: 'valor',
          label: 'Valor',
          font: { family: 'Inter', size: 20, color: '#00FF00' },
        },
      ],
    },
    {
      tipo: 'temporizador-item',
      label: 'Temporizador',
      subItens: [
        {
          id: 'default',
          label: 'Tempo',
          font: { family: 'Inter', size: 16, color: '#FFFFFF' },
        },
      ],
    },
  ];

  private fontsSubject = new BehaviorSubject<Record<string, FontConfig>>({});
  public fonts$ = this.fontsSubject.asObservable();

   constructor() {
    // Inicializa o dicionário com os valores padrão
    const inicial: Record<string, FontConfig> = {};
    this.grupos.forEach((grupo) => {
      grupo.subItens.forEach((sub) => {
        const key = `${grupo.tipo}-${sub.id}`.toLowerCase();
        inicial[key] = sub.font;
      });
    });
    this.fontsSubject.next(inicial);
  }

  //retorna os grupos
  getGrupos(): FonteGrupo[] {
    return this.grupos;
  }

  //retorna subitens de um grupo específico
  getFonteByTipo(tipo: ComponenteTipo) {
    return this.grupos.find((g) => g.tipo === tipo)?.subItens ?? [];
  }

  // Atualiza uma fonte específica
  updateFonte(tipo: ComponenteTipo, subId: string, font: FontConfig) {
    const grupo = this.grupos.find((g) => g.tipo === tipo);
    const subItem = grupo?.subItens.find((s) => s.id === subId);
    if (subItem) subItem.font = font;
  }

  //guarda os grupos
  async loadGrupos() {
    return this.grupos;
  }
  //   async loadGrupos() {
  //     const grupos = await firstValueFrom(this.fetchGrupos());
  //     console.log(grupos);
  //     return grupos;
  //   }
}
