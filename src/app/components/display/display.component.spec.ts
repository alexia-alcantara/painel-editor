import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DisplayComponent } from './display.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { PainelService } from '../../services/painel.service';

const mockPainelService = {
  getDadosPainel: (id: string) => {
    return of({ 
      titulo: 'Painel 1', 
      dados: ['item1', 'item2']
    });
  }
};

const mockActivatedRoute = {
  snapshot: {
    paramMap: {
      get: (key: string) => '123' // Retorna um ID falso para o teste
    }
  }
}

describe('DisplayComponent', () => {
  let component: DisplayComponent;
  let fixture: ComponentFixture<DisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisplayComponent],
      providers: [
        { provide: PainelService, useValue: mockPainelService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute } 
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});