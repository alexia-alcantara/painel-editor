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
        {
          subId: 'titulo-texto',
          label: 'Título Principal',
          font: {
            family: 'Segoe UI Semibold',
            size: 36,
            weight: '600',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'subtitulo',
      label: 'Subtítulo',
      subItens: [
        {
          subId: 'subtitulo-texto',
          label: 'Subtítulo (Votação/Tema)',
          font: {
            family: 'Segoe UI Semibold',
            size: 24,
            weight: 'normal',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'descricao',
      label: 'Descrição',
      subItens: [
        {
          subId: 'descricao-texto',
          label: 'Texto de Ementa/Status',
          font: {
            family: 'Segoe UI Semibold',
            size: 22,
            weight: 'normal',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'parlamentar',
      label: 'Parlamentar',
      subItens: [
        {
          subId: 'nome',
          label: 'Nome',
          font: {
            family: 'Segoe UI Semibold',
            size: 26,
            weight: '600',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
        {
          subId: 'partido',
          label: 'Partido',
          font: {
            family: 'Segoe UI Semibold',
            size: 26,
            weight: '600',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
        {
          subId: 'voto',
          label: 'Voto / Status',
          font: {
            family: 'Segoe UI Semibold',
            size: 18,
            weight: '700',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'tribuna',
      label: 'Tribuna',
      subItens: [
        {
          subId: 'orador',
          label: 'Nome do Orador',
          font: {
            family: 'Segoe UI Semibold',
            size: 24,
            weight: '600',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
        {
          subId: 'partido',
          label: 'Partido do Orador',
          font: {
            family: 'Segoe UI Semibold',
            size: 24,
            weight: 'normal',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'resultado-votacao',
      label: 'Resultado da Votação',
      subItens: [
        {
          subId: 'resultado-texto',
          label: 'Texto (Aprovado/etc)',
          font: {
            family: 'Segoe UI Semibold',
            size: 28,
            weight: 'bold',
            color: '#FFFF00',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'turno-votacao',
      label: 'Turno Votação',
      subItens: [
        {
          subId: 'texto',
          label: 'Texto',
          font: {
            family: 'Segoe UI Semibold',
            size: 22,
            weight: '500',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'modo-votacao',
      label: 'Modo Votação',
      subItens: [
        {
          subId: 'texto',
          label: 'Texto',
          font: {
            family: 'Segoe UI Semibold',
            size: 22,
            weight: '500',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'parametro-votacao',
      label: 'Parâmetro Votação',
      subItens: [
        {
          subId: 'texto',
          label: 'Texto',
          font: {
            family: 'Segoe UI Semibold',
            size: 22,
            weight: '500',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'categoria-reuniao',
      label: 'Categoria Reunião',
      subItens: [
        {
          subId: 'texto',
          label: 'Texto',
          font: {
            family: 'Segoe UI Semibold',
            size: 22,
            weight: '500',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'votacao-item',
      label: 'Totalizadores de Votos',
      subItens: [
        {
          subId: 'label',
          label: 'Rótulo (Sim, Não, Abst.)',
          font: {
            family: 'Segoe UI Semibold',
            size: 26,
            weight: '600',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
        {
          subId: 'valor',
          label: 'Valor (Contador)',
          font: {
            family: 'Segoe UI Semibold',
            size: 26,
            weight: '600',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'temporizador-item',
      label: 'Temporizador',
      subItens: [
        {
          subId: 'default',
          label: 'Tempo',
          font: {
            family: 'Segoe UI Semibold',
            size: 28,
            weight: '600',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
  ];

  // Tamanhos do "Cenário Padrão Visual" do legado (Delphi): Reunião 36, Matéria 26,
  // Ementa 22, Totalizadores/Resultado 36, Temporizadores 48, Parlamentares 36.
  // Fica salvo junto do cenário (Cenario.fontes), então editor e display usam os mesmos valores.
  private readonly FAMILIA_PADRAO_VISUAL =
    "'Segoe UI Semibold', 'Segoe UI', Roboto, Arial, sans-serif";

  private readonly VALORES_PADRAO_VISUAL: FonteGrupo[] = [
    {
      tipo: 'titulo',
      label: 'Título',
      subItens: [
        {
          subId: 'titulo-texto',
          label: 'Título Principal',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 36,
            weight: '600',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'subtitulo',
      label: 'Subtítulo',
      subItens: [
        {
          subId: 'subtitulo-texto',
          label: 'Subtítulo (Votação/Tema)',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 26,
            weight: '600',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'descricao',
      label: 'Descrição',
      subItens: [
        {
          subId: 'descricao-texto',
          label: 'Texto de Ementa/Status',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 22,
            weight: 'normal',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'parlamentar',
      label: 'Parlamentar',
      subItens: [
        {
          subId: 'nome',
          label: 'Nome',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 36,
            weight: '600',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
        {
          subId: 'partido',
          label: 'Partido',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 30,
            weight: '600',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
        {
          subId: 'voto',
          label: 'Voto / Status',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 24,
            weight: '700',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'tribuna',
      label: 'Tribuna',
      subItens: [
        {
          subId: 'orador',
          label: 'Nome do Orador',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 24,
            weight: '600',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
        {
          subId: 'partido',
          label: 'Partido do Orador',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 24,
            weight: 'normal',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'resultado-votacao',
      label: 'Resultado da Votação',
      subItens: [
        {
          subId: 'resultado-texto',
          label: 'Texto (Aprovado/etc)',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 36,
            weight: 'bold',
            color: '#FFFF00',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'turno-votacao',
      label: 'Turno Votação',
      subItens: [
        {
          subId: 'texto',
          label: 'Texto',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 22,
            weight: '500',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'modo-votacao',
      label: 'Modo Votação',
      subItens: [
        {
          subId: 'texto',
          label: 'Texto',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 22,
            weight: '500',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'parametro-votacao',
      label: 'Parâmetro Votação',
      subItens: [
        {
          subId: 'texto',
          label: 'Texto',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 22,
            weight: '500',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'categoria-reuniao',
      label: 'Categoria Reunião',
      subItens: [
        {
          subId: 'texto',
          label: 'Texto',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 22,
            weight: '500',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'votacao-item',
      label: 'Totalizadores de Votos',
      subItens: [
        {
          subId: 'label',
          label: 'Rótulo (Sim, Não, Abst.)',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 36,
            weight: '600',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
        {
          subId: 'valor',
          label: 'Valor (Contador)',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 36,
            weight: '600',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'temporizador-item',
      label: 'Temporizador',
      subItens: [
        {
          subId: 'default',
          label: 'Tempo',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 48,
            weight: '600',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
  ];

  private readonly GRUPOS_EXTRAS: FonteGrupo[] = [
    {
      tipo: 'autor',
      label: 'Autor',
      subItens: [
        {
          subId: 'texto',
          label: 'Texto',
          font: {
            family: this.FAMILIA_PADRAO_VISUAL,
            size: 22,
            weight: '500',
            color: '#FFFFFF',
            style: 'normal',
          },
        },
      ],
    },
    {
      tipo: 'tipo-fala',
      label: 'Tipo de Fala',
      subItens: [
        {
          subId: 'texto',
          label: 'Texto',
          font: { family: this.FAMILIA_PADRAO_VISUAL, size: 24, weight: '600', color: '#FFFFFF', style: 'normal' },
        },
      ],
    },
    {
      tipo: 'nome-cronometro',
      label: 'Nome do Cronômetro',
      subItens: [
        {
          subId: 'texto',
          label: 'Texto',
          font: { family: this.FAMILIA_PADRAO_VISUAL, size: 20, weight: '600', color: '#FFFFFF', style: 'normal' },
        },
      ],
    },
    {
      tipo: 'mensagem-linha',
      label: 'Mensagem',
      subItens: [1, 2, 3, 4].map((n) => ({
        subId: `linha-${n}`,
        label: `Linha ${n}`,
        font: {
          family: this.FAMILIA_PADRAO_VISUAL,
          size: n === 1 ? 32 : 26,
          weight: n === 1 ? 'bold' : 'normal',
          color: '#FFFFFF',
          style: 'normal',
        },
      })),
    },
  ];

  private _grupos = signal<FonteGrupo[]>(
        this.completarGrupos(structuredClone(this.VALORES_INICIAIS)),
  );
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
    const grupo = this.grupos().find((g) => g.tipo === tipo);
    return grupo?.subItens.find((s) => s.subId === subId);
  }

  setGrupos(novosGrupos: FonteGrupo[]) {
    this._grupos.set(novosGrupos);
  }

   obterGruposPadrao(): FonteGrupo[] {
    return this.completarGrupos(structuredClone(this.VALORES_INICIAIS));
  }

  obterGruposPadraoVisual(): FonteGrupo[] {
      return this.completarGrupos(structuredClone(this.VALORES_PADRAO_VISUAL));
  }


   carregarGrupos(fontes?: FonteGrupo[] | null): void {
    this.ultimaPaletaAplicada = ''; 
    this._grupos.set(
      this.completarGrupos(
        fontes && fontes.length
          ? structuredClone(fontes)
          : structuredClone(this.VALORES_INICIAIS),
      ),
    );
  }

  private completarGrupos(grupos: FonteGrupo[]): FonteGrupo[] {
    const tiposExistentes = new Set(grupos.map((g) => g.tipo));
    const faltando = this.GRUPOS_EXTRAS.filter((g) => !tiposExistentes.has(g.tipo));
    const completos = [...grupos, ...structuredClone(faltando)];
    return completos.map((g) => this.completarSubItens(g));
  }

  private completarSubItens(grupo: FonteGrupo): FonteGrupo {
    if (grupo.tipo === 'temporizador-item') {
      const antigo = grupo.subItens.find((s) => s.subId === 'default');
      const base = antigo?.font || grupo.subItens[0]?.font || {
        family: this.FAMILIA_PADRAO_VISUAL, size: 48, weight: '600', color: '#FFFFFF', style: 'normal',
      };
      const itens = [
        { subId: 'cronometro-1', label: 'Cronômetro 1' },
        { subId: 'cronometro-2', label: 'Cronômetro 2' },
        { subId: 'cronometro-3', label: 'Cronômetro 3' },
        { subId: 'cronometro-4', label: 'Cronômetro 4' },
        { subId: 'relogio', label: 'Hora (relógio)' },
        { subId: 'data', label: 'Data' },
      ];
      const subItens = itens.map((item) => {
        const existente = grupo.subItens.find((s) => s.subId === item.subId);
        return existente || { ...item, font: structuredClone(base) };
      });
      return { ...grupo, label: 'Tempo e Data', subItens };
    }

    if (grupo.tipo === 'tribuna' && !grupo.subItens.some((s) => s.subId === 'materia')) {
      const base = grupo.subItens.find((s) => s.subId === 'orador')?.font;
      return {
        ...grupo,
        subItens: [
          ...grupo.subItens,
          {
            subId: 'materia',
            label: 'Tema em discussão',
            font: {
              family: base?.family || this.FAMILIA_PADRAO_VISUAL,
              size: base?.size || 24,
              weight: 'normal',
              color: '#FFFFFF',
              style: 'normal',
            },
          },
        ],
      };
    }

    return grupo;
  }


  private readonly CORES_DA_PALETA: { tipo: ComponenteTipo; subId: string; cor: string }[] = [
    { tipo: 'titulo', subId: 'titulo-texto', cor: 'Cor_Titulo' },
    { tipo: 'subtitulo', subId: 'subtitulo-texto', cor: 'Cor_NomeItem' },
    { tipo: 'descricao', subId: 'descricao-texto', cor: 'Cor_Ementa' },
    { tipo: 'resultado-votacao', subId: 'resultado-texto', cor: 'Cor_Resultado' },
    { tipo: 'temporizador-item', subId: 'cronometro-1', cor: 'Cor_Cronometro_1' },
    { tipo: 'temporizador-item', subId: 'cronometro-2', cor: 'Cor_Cronometro_2' },
    { tipo: 'temporizador-item', subId: 'cronometro-3', cor: 'Cor_Cronometro_3' },
    { tipo: 'temporizador-item', subId: 'cronometro-4', cor: 'Cor_Cronometro_4' },
    { tipo: 'temporizador-item', subId: 'relogio', cor: 'Cor_Relogio' },
    { tipo: 'temporizador-item', subId: 'data', cor: 'Cor_Relogio' },
  ];

  private ultimaPaletaAplicada = '';

  aplicarCoresDaPaleta(paleta: Record<string, string>): void {
    const chave = JSON.stringify(paleta);
    if (!paleta || chave === this.ultimaPaletaAplicada) return;
    this.ultimaPaletaAplicada = chave;

    this._grupos.update((grupos) =>
      grupos.map((grupo) => ({
        ...grupo,
        subItens: grupo.subItens.map((sub) => {
          const regra = this.CORES_DA_PALETA.find(
            (r) => r.tipo === grupo.tipo && r.subId === sub.subId,
          );
          const cor = regra ? paleta[regra.cor] : '';
          return cor ? { ...sub, font: { ...sub.font, color: cor } } : sub;
        }),
      })),
    );
  }
}
