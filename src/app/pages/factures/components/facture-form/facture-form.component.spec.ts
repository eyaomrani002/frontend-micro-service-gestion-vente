import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactureFormComponent } from './facture-form.component';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

describe('FactureFormComponent', () => {
  let component: FactureFormComponent;
  let fixture: ComponentFixture<FactureFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactureFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FactureFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
