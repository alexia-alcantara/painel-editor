import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'painel-angular';

  constructor(private authService: AuthService, private router: Router) {}

  get mostrarAvisoConexao(): boolean {
    return !this.authService.estaAutenticado() && !this.router.url.startsWith('/display');
  }
}