/**
 * Pequenas funções de estilo usadas por vários blocos do painel.
 */

export type Alinhamento = 'left' | 'center' | 'right';

/** Converte o alinhamento do texto (esquerda/centro/direita) para o valor do flexbox. */
export function alinhamentoFlex(alinhamento?: string, padrao: Alinhamento = 'center'): string {
  const valor = alinhamento || padrao;
  if (valor === 'left') return 'flex-start';
  if (valor === 'right') return 'flex-end';
  return 'center';
}

/**
 * Converte a cor que vem do Legis para o formato da web.
 * "#RRGGBB" fica igual. "$BBGGRR" é o formato do Delphi (ordem invertida: azul, verde, vermelho).
 */
export function converterCorLegis(valor: any): string {
  if (typeof valor !== 'string') return '';
  const v = valor.trim();
  if (v.startsWith('#')) return v;
  if (v.startsWith('$')) {
    const hex = v.slice(1).padStart(6, '0').slice(-6);
    const bb = hex.slice(0, 2);
    const gg = hex.slice(2, 4);
    const rr = hex.slice(4, 6);
    return `#${rr}${gg}${bb}`;
  }
  return '';
}

/** Transforma "#RRGGBB" + opacidade (0 a 100) em "rgba(r, g, b, a)". */
export function corComOpacidade(hex: string, opacidade: number): string {
  const limpo = (hex || '#334155').replace('#', '').padEnd(6, '0').slice(0, 6);
  const r = parseInt(limpo.slice(0, 2), 16) || 0;
  const g = parseInt(limpo.slice(2, 4), 16) || 0;
  const b = parseInt(limpo.slice(4, 6), 16) || 0;
  const a = Math.min(100, Math.max(0, Number(opacidade ?? 100))) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
