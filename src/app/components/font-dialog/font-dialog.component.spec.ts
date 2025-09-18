import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FontDialogComponent } from './font-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('FontDialogComponent', () => {
  let component: FontDialogComponent;
  let fixture: ComponentFixture<FontDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FontDialogComponent],
      providers: [
        {provide: MatDialogRef, useValue: {}},
        {provide: MAT_DIALOG_DATA, useValue: {}}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FontDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
