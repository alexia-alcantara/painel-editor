import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TribunaComponent } from './tribuna.component';

describe('TribunaComponent', () => {
  let component: TribunaComponent;
  let fixture: ComponentFixture<TribunaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TribunaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TribunaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
