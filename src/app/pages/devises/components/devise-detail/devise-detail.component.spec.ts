import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeviseDetailComponent } from './devise-detail.component';

describe('DeviseDetailComponent', () => {
  let component: DeviseDetailComponent;
  let fixture: ComponentFixture<DeviseDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeviseDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeviseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
