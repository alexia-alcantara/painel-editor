import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultadoVotacaoComponent } from './resultado-votacao.component';

describe('ResultadoVotacaoComponent', () => {
  let component: ResultadoVotacaoComponent;
  let fixture: ComponentFixture<ResultadoVotacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultadoVotacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultadoVotacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
