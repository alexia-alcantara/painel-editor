import { Routes } from '@angular/router';
import { EditorComponent } from './components/editor/editor.component';
import { DisplayComponent } from './components/display/display.component';

export const routes: Routes = [
  { path: '', redirectTo: 'editor', pathMatch: 'full' },
  // Novo cenário
  { path: 'editor', component: EditorComponent },
  // Editar um cenário salvo
  { path: 'editor/:id', component: EditorComponent },
  // Tela do painel (TV / LED)
  { path: 'display/:id', component: DisplayComponent },
];
