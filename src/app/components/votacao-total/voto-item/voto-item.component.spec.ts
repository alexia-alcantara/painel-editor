import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VotoItemComponent } from './voto-item.component';

describe('VotoItemComponent', () => {
  let component: VotoItemComponent;
  let fixture: ComponentFixture<VotoItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VotoItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VotoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
