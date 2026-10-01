import { runtimeConfig } from '../config/runtime-config';

/**
 * Mensagens no console (F12) com um padrão só: "[Área] mensagem".
 *
 * - info: detalhes do funcionamento; só aparecem com "debug": true no
 *   assets/config.json, ou abrindo a página com ?debug=1 no endereço.
 * - aviso / erro: sempre aparecem.
 */
export const log = {
  info(area: string, mensagem: string, ...dados: unknown[]): void {
    if (runtimeConfig.debug) console.log(`[${area}] ${mensagem}`, ...dados);
  },
  aviso(area: string, mensagem: string, ...dados: unknown[]): void {
    console.warn(`[${area}] ${mensagem}`, ...dados);
  },
  erro(area: string, mensagem: string, ...dados: unknown[]): void {
    console.error(`[${area}] ${mensagem}`, ...dados);
  },
};
