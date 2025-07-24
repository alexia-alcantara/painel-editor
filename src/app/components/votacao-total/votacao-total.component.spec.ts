import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotacaoTotalComponent } from './votacao-total.component';

describe('VotacaoTotalComponent', () => {
  let component: VotacaoTotalComponent;
  let fixture: ComponentFixture<VotacaoTotalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VotacaoTotalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotacaoTotalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
