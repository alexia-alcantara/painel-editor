import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EditorComponent } from './components/editor/editor.component';
import { PainelComponent } from './components/painel/painel.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'editor', component: EditorComponent },
  { path: 'painel', component: PainelComponent },
];
