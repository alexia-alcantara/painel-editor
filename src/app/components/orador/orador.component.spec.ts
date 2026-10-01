import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OradorComponent } from './orador.component';

describe('OradorComponent', () => {
  let fixture: ComponentFixture<OradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OradorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OradorComponent);
  });

  it('deve criar', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
