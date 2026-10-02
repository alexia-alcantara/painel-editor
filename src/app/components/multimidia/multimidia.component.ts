import { AfterViewInit, Component, ElementRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { log } from '../../utils/log';

/**
 * Bloco Multimídia: mostra a câmera (ou placa de captura) ligada no PC do painel.
 *
 * - No EDITOR não liga a câmera: mostra só um quadro de exemplo para posicionar o bloco.
 * - No DISPLAY liga a câmera padrão do computador e mostra o vídeo ocupando o bloco.
 *
 * Importante: o navegador só libera a câmera em página segura (https ou localhost).
 * Acessando o display por http + IP, o Chrome bloqueia e o bloco fica preto.
 */
@Component({
  selector: 'app-multimidia',
  standalone: true,
  templateUrl: './multimidia.component.html',
  styleUrl: './multimidia.component.css',
})
export class MultimidiaComponent implements AfterViewInit, OnDestroy {
  @Input() modoEditor = false;

  @ViewChild('video') videoRef?: ElementRef<HTMLVideoElement>;

  private stream: MediaStream | null = null;
  private destruido = false;

  async ngAfterViewInit(): Promise<void> {
    if (this.modoEditor) return;

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      log.aviso('Multimídia', 'Câmera bloqueada: o navegador só libera em https ou localhost');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (this.destruido) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      this.stream = stream;
      if (this.videoRef) {
        this.videoRef.nativeElement.srcObject = stream;
      }
      log.info('Multimídia', 'Câmera ligada');
    } catch (erro) {
      log.aviso('Multimídia', 'Erro ao ligar a câmera:', erro);
    }
  }

  ngOnDestroy(): void {
    this.destruido = true;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
  }
}
