import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenarioDialogComponent } from './cenario-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('CenarioDialogComponent', () => {
  let component: CenarioDialogComponent;
  let fixture: ComponentFixture<CenarioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenarioDialogComponent],
      providers: [
        {provide: MatDialogRef, useValue: {}},
        {provide: MAT_DIALOG_DATA, useValue: {}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CenarioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
