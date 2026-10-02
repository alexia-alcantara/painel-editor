import { environment } from '../../environments/environment';

/**
 * Configuração lida depois do build, do arquivo assets/config.json.
 * Campo vazio no config.json = usa o valor do environment.
 */
export interface RuntimeConfig {
  backendUrl: string;
  authUsername: string;
  authPassword: string;
  /**
   * Endereço da pasta no servidor onde ficam as imagens de fundo dos cenários
   * (ex.: http://10.1.70.116/legiswall/imagens/). O cenário guarda só o nome do arquivo.
   * Vazio = usa a pasta assets/fundos/ do próprio legiswall.
   */
  caminhoImagens: string;
  /** Mostra as mensagens de detalhe (info) no console. */
  debug: boolean;
}

export const runtimeConfig: RuntimeConfig = {
  backendUrl: environment.backendUrl,
  authUsername: environment.authUsername,
  authPassword: environment.authPassword,
  caminhoImagens: '',
  debug: false,
};

const CAMPOS_TEXTO: ('backendUrl' | 'authUsername' | 'authPassword' | 'caminhoImagens')[] = [
  'backendUrl',
  'authUsername',
  'authPassword',
  'caminhoImagens',
];

/**
 * Monta o endereço da imagem de fundo a partir do nome do arquivo salvo no cenário
 * (mesma ideia do VsWebWall: o cenário guarda o nome, a pasta vem da configuração).
 */
export function urlImagemFundo(nomeArquivo?: string): string {
  const nome = (nomeArquivo || '').trim();
  if (!nome) return '';
  // Se já vier um endereço completo, usa como está
  if (/^(https?:|data:|blob:|\/)/i.test(nome)) return nome;
  const pasta = (runtimeConfig.caminhoImagens || 'assets/fundos/').replace(/\/?$/, '/');
  // ?v= muda a cada F5: se alguém substituir a imagem no servidor com o mesmo nome,
  // o navegador busca a nova em vez de mostrar a antiga do cache
  return `${pasta}${encodeURIComponent(nome)}?v=${CARREGADO_EM}`;
}

/** Momento em que a página foi aberta (usado pra não pegar imagem velha do cache). */
const CARREGADO_EM = Date.now();

export async function carregarRuntimeConfig(): Promise<void> {
  try {
    const resp = await fetch(`assets/config.json?v=${Date.now()}`, { cache: 'no-store' });

    if (!resp.ok) {
      console.warn(`[Config] config.json não encontrado (${resp.status}), usando o environment`);
    } else {
      const json = await resp.json();
      for (const campo of CAMPOS_TEXTO) {
        const valor = json?.[campo];
        if (typeof valor === 'string' && valor.trim()) {
          runtimeConfig[campo] = valor.trim();
        }
      }
      runtimeConfig.debug = json?.debug === true;
    }
  } catch (err) {
    console.warn('[Config] Erro ao ler o config.json, usando o environment:', err);
  }

  // ?debug=1 no endereço liga as mensagens de detalhe sem mexer no config.json
  if (new URLSearchParams(window.location.search).get('debug') === '1') {
    runtimeConfig.debug = true;
  }

  runtimeConfig.backendUrl = (runtimeConfig.backendUrl || '').replace(/\/+$/, '');

  if (runtimeConfig.debug) {
    console.log(`[Config] Backend: ${runtimeConfig.backendUrl}`);
  }
}
