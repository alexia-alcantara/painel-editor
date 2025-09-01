import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EditorComponent } from './components/editor/editor.component';
import { PainelComponent } from './components/painel/painel.component';
import { DisplayComponent } from './components/display/display.component';

export const routes: Routes = [
 { path: '', redirectTo: `editor/cenario_${Date.now()}`, pathMatch: 'full' },
  { path: 'editor/:id', component: EditorComponent }, 
  { path: 'painel', component: PainelComponent },
  { path: 'display/:id', component: DisplayComponent }
];
