/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { OradorComponent } from './orador.component';

describe('OradorComponent', () => {
  let component: OradorComponent;
  let fixture: ComponentFixture<OradorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OradorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
