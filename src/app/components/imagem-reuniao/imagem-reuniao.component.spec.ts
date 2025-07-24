import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagemReuniaoComponent } from './imagem-reuniao.component';

describe('ImagemReuniaoComponent', () => {
  let component: ImagemReuniaoComponent;
  let fixture: ComponentFixture<ImagemReuniaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImagemReuniaoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImagemReuniaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
