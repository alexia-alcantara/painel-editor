import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderReuniaoComponent } from './header-reuniao.component';

describe('HeaderReuniaoComponent', () => {
  let component: HeaderReuniaoComponent;
  let fixture: ComponentFixture<HeaderReuniaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderReuniaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderReuniaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
