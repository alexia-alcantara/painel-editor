import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescricaoReuniaoComponent } from './descricao-reuniao.component';

describe('DescricaoReuniaoComponent', () => {
  let component: DescricaoReuniaoComponent;
  let fixture: ComponentFixture<DescricaoReuniaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescricaoReuniaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescricaoReuniaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
