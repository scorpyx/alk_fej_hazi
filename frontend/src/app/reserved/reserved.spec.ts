import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Reserved } from './reserved';

describe('Reserved', () => {
  let component: Reserved;
  let fixture: ComponentFixture<Reserved>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reserved],
    }).compileComponents();

    fixture = TestBed.createComponent(Reserved);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
