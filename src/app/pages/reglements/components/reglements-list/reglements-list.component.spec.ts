import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReglementsListComponent } from './reglements-list.component';

describe('ReglementsListComponent', () => {
  let component: ReglementsListComponent;
  let fixture: ComponentFixture<ReglementsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReglementsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReglementsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
