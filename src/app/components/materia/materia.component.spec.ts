import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MateriaComponent } from './materia.component';

describe('MateriaComponent', () => {
  let fixture: ComponentFixture<MateriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MateriaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MateriaComponent);
  });

  it('deve criar', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
