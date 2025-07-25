import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemporizadorItemComponent } from './temporizador-item.component';

describe('TemporizadorItemComponent', () => {
  let component: TemporizadorItemComponent;
  let fixture: ComponentFixture<TemporizadorItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemporizadorItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemporizadorItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
