import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistribuirParlamentaresComponent } from './distribuir-parlamentares.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DistribuirParlamentaresComponent', () => {
  let component: DistribuirParlamentaresComponent;
  let fixture: ComponentFixture<DistribuirParlamentaresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistribuirParlamentaresComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DistribuirParlamentaresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
