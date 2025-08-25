import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControleVisibilidadeComponent } from './controle-visibilidade.component';

describe('ControleVisibilidadeComponent', () => {
  let component: ControleVisibilidadeComponent;
  let fixture: ComponentFixture<ControleVisibilidadeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControleVisibilidadeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControleVisibilidadeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
