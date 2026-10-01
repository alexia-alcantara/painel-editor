import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PartidoComponent } from './partido.component';

describe('PartidoComponent', () => {
  let fixture: ComponentFixture<PartidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartidoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PartidoComponent);
  });

  it('deve criar', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
