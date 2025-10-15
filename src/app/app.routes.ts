import { Routes } from '@angular/router';
import { EditorComponent } from './components/editor/editor.component';
import { PainelComponent } from './components/painel/painel.component';
import { DisplayComponent } from './components/display/display.component';

export const routes: Routes = [
   { path: '', redirectTo: 'editor', pathMatch: 'full' }, 
   // 2. Rota para criar um NOVO cenário
  { path: 'editor', component: EditorComponent }, 
  // 3. Rota para EDITAR um cenário existente 
  { path: 'editor/:id', component: EditorComponent },  
  
  { path: 'painel', component: PainelComponent },
  { path: 'display/:id', component: DisplayComponent }
];
