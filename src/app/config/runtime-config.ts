import { environment } from '../../environments/environment';

export interface RuntimeConfig {
  backendUrl: string;
  authUsername: string;
  authPassword: string;
}

export const runtimeConfig: RuntimeConfig = {
  backendUrl: environment.backendUrl,
  authUsername: environment.authUsername,
  authPassword: environment.authPassword,
};

const CAMPOS: (keyof RuntimeConfig)[] = ['backendUrl', 'authUsername', 'authPassword'];

export async function carregarRuntimeConfig(): Promise<void> {
  try {
    const resp = await fetch(`assets/config.json?v=${Date.now()}`, { cache: 'no-store' });

    if (!resp.ok) {
      console.warn(`[CONFIG] assets/config.json não encontrado (${resp.status}). Usando valores do environment.`);
    } else {
      const json = await resp.json();
      for (const campo of CAMPOS) {
        const valor = json?.[campo];
        if (typeof valor === 'string' && valor.trim()) {
          runtimeConfig[campo] = valor.trim();
        }
      }
      console.log('[CONFIG] Configuração carregada. Backend:', runtimeConfig.backendUrl);
    }
  } catch (err) {
    console.warn('[CONFIG] Erro ao ler assets/config.json. Usando valores do environment.', err);
  }

  runtimeConfig.backendUrl = (runtimeConfig.backendUrl || '').replace(/\/+$/, '');
}