import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DevisesListComponent } from './devises-list.component';

describe('DevisesListComponent', () => {
  let component: DevisesListComponent;
  let fixture: ComponentFixture<DevisesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DevisesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DevisesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
