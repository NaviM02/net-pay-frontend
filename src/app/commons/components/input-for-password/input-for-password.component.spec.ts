import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputForPasswordComponent } from './input-for-password.component';

describe('InputForPasswordComponent', () => {
  let component: InputForPasswordComponent;
  let fixture: ComponentFixture<InputForPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputForPasswordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputForPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
