import { environment } from '../../environments/environment';


export interface RuntimeConfig {
  backendUrl: string;
  authUsername: string;
  authPassword: string;
  caminhoImagens: string;
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


export function urlImagemFundo(nomeArquivo?: string): string {
  const nome = (nomeArquivo || '').trim();
  if (!nome) return '';
  if (/^(https?:|data:|blob:|\/)/i.test(nome)) return nome;
  const pasta = (runtimeConfig.caminhoImagens || 'assets/fundos/').replace(/\/?$/, '/');

  return `${pasta}${encodeURIComponent(nome)}?v=${CARREGADO_EM}`;
}

export const previasDeFundo = new Map<string, string>();

const imagensJaVerificadas = new Set<string>();

export function verificarImagemFundo(url: string, aoFaltar: (url: string) => void): void {
  if (!url || url.startsWith('blob:') || url.startsWith('data:') || imagensJaVerificadas.has(url)) return;
  imagensJaVerificadas.add(url);
  const img = new Image();
  img.onerror = () => aoFaltar(url);
  img.src = url;
}

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

  if (new URLSearchParams(window.location.search).get('debug') === '1') {
    runtimeConfig.debug = true;
  }

  runtimeConfig.backendUrl = (runtimeConfig.backendUrl || '').replace(/\/+$/, '');

  if (runtimeConfig.debug) {
    console.log(`[Config] Backend: ${runtimeConfig.backendUrl}`);
  }
}