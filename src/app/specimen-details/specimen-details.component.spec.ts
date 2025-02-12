import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecimenDetailsComponent } from './specimen-details.component';

describe('SpecimenDetailsComponent', () => {
  let component: SpecimenDetailsComponent;
  let fixture: ComponentFixture<SpecimenDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [SpecimenDetailsComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecimenDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
