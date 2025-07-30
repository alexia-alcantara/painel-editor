import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FontDialogComponent } from './font-dialog.component';

describe('FontDialogComponent', () => {
  let component: FontDialogComponent;
  let fixture: ComponentFixture<FontDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FontDialogComponent]
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
