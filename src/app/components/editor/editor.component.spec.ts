import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditorComponent } from './editor.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { LayoutService } from '../../services/layout.service';

const mockLayoutService = {
  carregarCenario: () => ({ // Simula o retorno de um cenário com a propriedade 'nome'
    nome: 'Cenário de Teste',
    componentes: []
  }),
};

describe('EditorComponent', () => {
  let component: EditorComponent;
  let fixture: ComponentFixture<EditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditorComponent],
      providers: [
        { provide: LayoutService, useValue: mockLayoutService },
        { provide: ActivatedRoute, useValue: { paramMap: of({})}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
