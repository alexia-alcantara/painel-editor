import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-multimidia',
  templateUrl: './multimidia.component.html',
  styleUrls: ['./multimidia.component.css'],
  standalone: true
})
export class MultimidiaComponent implements OnInit {
  @Input() dados: any;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  stream: MediaStream | null = null;
  
  constructor() { }

  ngOnInit() {
    this.iniciarCamera();
  }

  ngOnDestroy() {
    //Desliga a câmera quando você sai do cenário ou remove o componente
    this.pararCamera();
  }

  iniciarCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // Pede permissão para usar vídeo, sem áudio (audio: false)
      navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
          this.stream = stream;
          if (this.videoElement) {
            this.videoElement.nativeElement.srcObject = stream;
          }
        })
        .catch(error => {
          console.error("Erro ao acessar webcam:", error);
          alert("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
        });
    } else {
      console.error("Navegador não suporta acesso à mídia.");
    }
  }

  pararCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

}
