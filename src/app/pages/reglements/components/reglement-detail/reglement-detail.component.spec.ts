import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReglementDetailComponent } from './reglement-detail.component';

describe('ReglementDetailComponent', () => {
  let component: ReglementDetailComponent;
  let fixture: ComponentFixture<ReglementDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReglementDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReglementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
