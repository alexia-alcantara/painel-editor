import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParlamentarItemComponent } from './parlamentar-item.component';

describe('ParlamentarItemComponent', () => {
  let component: ParlamentarItemComponent;
  let fixture: ComponentFixture<ParlamentarItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParlamentarItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParlamentarItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
