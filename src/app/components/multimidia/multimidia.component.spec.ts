/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MultimidiaComponent } from './multimidia.component';

describe('MultimidiaComponent', () => {
  let component: MultimidiaComponent;
  let fixture: ComponentFixture<MultimidiaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultimidiaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultimidiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
