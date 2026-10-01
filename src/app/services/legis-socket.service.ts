import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { runtimeConfig } from '../config/runtime-config';
import { log } from '../utils/log';

@Injectable({ providedIn: 'root' })
export class LegisSocketService {
  private socket: WebSocket | null = null;
  private identificadorAtual: string | null = null;
  private tentativasReconexao = 0;
  private timerReconexao: any = null;
  private encerradoManualmente = false;

  private readonly avisosSubject = new Subject<any>();

  readonly avisos$: Observable<any> = this.avisosSubject.asObservable();

  conectar(identificador: string): void {
    this.encerradoManualmente = false;
    this.identificadorAtual = identificador;

    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const url = this.montarUrl(identificador);

    try {
      this.socket = new WebSocket(url);
    } catch (e) {
      log.aviso('WebSocket', `Não foi possível conectar em ${url}.`, e);
      this.agendarReconexao();
      return;
    }

    this.socket.onopen = () => {
      this.tentativasReconexao = 0;
      log.info('WebSocket', `Conectado em ${url}.`);
    };

    this.socket.onmessage = (evento) => {
      let mensagem: any = evento.data;
      try {
        mensagem = JSON.parse(evento.data);
      } catch {
    
      }
      log.info('WebSocket', 'Aviso recebido.', mensagem);
      this.avisosSubject.next(mensagem);
    };

    this.socket.onclose = (evento) => {
      if (this.encerradoManualmente) return;
      log.aviso('WebSocket', `Conexão fechada (código ${evento.code}). Reconectando.`);
      this.agendarReconexao();
    };

    this.socket.onerror = () => {
    };
  }

  desconectar(): void {
    this.encerradoManualmente = true;
    this.identificadorAtual = null;
    if (this.timerReconexao) {
      clearTimeout(this.timerReconexao);
      this.timerReconexao = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  estaConectado(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }


  private montarUrl(identificador: string): string {
    const base = runtimeConfig.backendUrl.replace(/^http/i, 'ws');
    return `${base}/ws/${encodeURIComponent(identificador)}`;
  }

  private agendarReconexao(): void {
    this.socket = null;
    if (this.timerReconexao || !this.identificadorAtual || this.encerradoManualmente) return;

    const atraso = Math.min(1000 * 2 ** this.tentativasReconexao, 60000);
    this.tentativasReconexao++;

    this.timerReconexao = setTimeout(() => {
      this.timerReconexao = null;
      if (this.identificadorAtual) this.conectar(this.identificadorAtual);
    }, atraso);
  }
}