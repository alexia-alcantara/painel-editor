import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtituloReuniaoComponent } from './subtitulo-reuniao.component';

describe('SubtituloReuniaoComponent', () => {
  let component: SubtituloReuniaoComponent;
  let fixture: ComponentFixture<SubtituloReuniaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtituloReuniaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtituloReuniaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
