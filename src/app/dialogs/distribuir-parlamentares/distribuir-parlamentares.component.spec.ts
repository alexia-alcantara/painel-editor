import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistribuirParlamentaresComponent } from './distribuir-parlamentares.component';

describe('DistribuirParlamentaresComponent', () => {
  let component: DistribuirParlamentaresComponent;
  let fixture: ComponentFixture<DistribuirParlamentaresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistribuirParlamentaresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DistribuirParlamentaresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
