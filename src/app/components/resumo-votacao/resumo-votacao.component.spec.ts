import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumoVotacaoComponent } from './resumo-votacao.component';

describe('ResumoVotacaoComponent', () => {
  let component: ResumoVotacaoComponent;
  let fixture: ComponentFixture<ResumoVotacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumoVotacaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumoVotacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
