import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelParlamentaresComponent } from './painel-parlamentares.component';

describe('PainelParlamentaresComponent', () => {
  let component: PainelParlamentaresComponent;
  let fixture: ComponentFixture<PainelParlamentaresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelParlamentaresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelParlamentaresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
