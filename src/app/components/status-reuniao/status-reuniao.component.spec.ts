import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusReuniaoComponent } from './status-reuniao.component';

describe('StatusReuniaoComponent', () => {
  let component: StatusReuniaoComponent;
  let fixture: ComponentFixture<StatusReuniaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusReuniaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusReuniaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
