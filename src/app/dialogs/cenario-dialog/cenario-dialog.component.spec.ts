import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenarioDialogComponent } from './cenario-dialog.component';

describe('CenarioDialogComponent', () => {
  let component: CenarioDialogComponent;
  let fixture: ComponentFixture<CenarioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenarioDialogComponent]
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
