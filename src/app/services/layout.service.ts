import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private key = 'layout-editor';

  salvarLayout(layout: any[]) {
    localStorage.setItem(this.key, JSON.stringify(layout));
  }

  carregarLayout(): any[] {
    return JSON.parse(localStorage.getItem(this.key) || '[]');
  }
}
