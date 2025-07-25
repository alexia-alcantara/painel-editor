import { Injectable } from "@angular/core";
import { ComponenteEditor } from "../models/components.model";

@Injectable({ providedIn: 'root' })
export class LayoutService {
  salvarLayout(layout: ComponenteEditor[]) {
    localStorage.setItem('layout', JSON.stringify(layout));
  }

  carregarLayout(): ComponenteEditor[] | null {
    const layout = localStorage.getItem('layout');
    return layout ? JSON.parse(layout) : null;
  }
}
