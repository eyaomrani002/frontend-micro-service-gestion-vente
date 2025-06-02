import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviseFormComponent } from './devise-form.component';

describe('DeviseFormComponent', () => {
  let component: DeviseFormComponent;
  let fixture: ComponentFixture<DeviseFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviseFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviseFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
