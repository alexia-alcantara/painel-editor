import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TituloReuniaoComponent } from './titulo-reuniao.component';

describe('TituloReuniaoComponent', () => {
  let component: TituloReuniaoComponent;
  let fixture: ComponentFixture<TituloReuniaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TituloReuniaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TituloReuniaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
