import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelogioComponent } from './relogio.component';

describe('RelogioComponent', () => {
  let component: RelogioComponent;
  let fixture: ComponentFixture<RelogioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelogioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelogioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
