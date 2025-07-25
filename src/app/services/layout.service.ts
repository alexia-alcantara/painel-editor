import { Injectable } from "@angular/core";
import { ComponenteEditor } from "../models/components.model";

@Injectable({ providedIn: 'root' })
export class LayoutService {
 salvarLayout(layout: any[]) {
  localStorage.setItem('layout_editor', JSON.stringify(layout));
}

carregarLayout(): any[] {
  const layoutString = localStorage.getItem('layout_editor');
  return layoutString ? JSON.parse(layoutString) : [];
}
}
