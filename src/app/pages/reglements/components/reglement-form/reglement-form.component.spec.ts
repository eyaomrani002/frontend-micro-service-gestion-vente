import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReglementFormComponent } from './reglement-form.component';

describe('ReglementFormComponent', () => {
  let component: ReglementFormComponent;
  let fixture: ComponentFixture<ReglementFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReglementFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReglementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
