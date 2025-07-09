import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhylogenyComponent } from './phylogeny.component';

describe('PhylogenyComponent', () => {
  let component: PhylogenyComponent;
  let fixture: ComponentFixture<PhylogenyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhylogenyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhylogenyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
