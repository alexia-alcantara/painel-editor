import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CampoDisponivel } from '../../models/campos';

const normalizarTexto = (texto: string) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

@Component({
  selector: 'app-adicionar-campo',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './adicionar-campo.component.html',
  styleUrl: './adicionar-campo.component.css',
})
export class AdicionarCampoComponent {
  @Input() campos: CampoDisponivel[] = [];
  @Output() adicionar = new EventEmitter<string>();

  @ViewChild('campoBusca') campoBusca?: ElementRef<HTMLInputElement>;

  aberto = false;
  busca = '';

  private host = inject(ElementRef<HTMLElement>);

  get camposFiltrados(): CampoDisponivel[] {
    const termo = normalizarTexto(this.busca.trim());
    if (!termo) return this.campos;
    return this.campos.filter((campo) => normalizarTexto(campo.rotulo).includes(termo));
  }

  alternar(): void {
    this.aberto = !this.aberto;
    this.busca = '';
    if (this.aberto) setTimeout(() => this.campoBusca?.nativeElement.focus());
  }

  escolher(campo: CampoDisponivel): void {
    this.adicionar.emit(campo.id);
  }

  adicionarPrimeiro(): void {
    const primeiro = this.camposFiltrados[0];
    if (!primeiro) return;
    this.escolher(primeiro);
    this.busca = '';
  }

  @HostListener('document:mousedown', ['$event'])
  fecharAoClicarFora(event: MouseEvent): void {
    if (this.aberto && !this.host.nativeElement.contains(event.target as Node)) {
      this.aberto = false;
    }
  }

  @HostListener('document:keydown.escape')
  fecharAoApertarEsc(): void {
    this.aberto = false;
  }
}
