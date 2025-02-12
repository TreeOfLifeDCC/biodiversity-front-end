import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TolQcLinksComponent } from './tol-qc-links.component';

describe('TolQcLinksComponent', () => {
  let component: TolQcLinksComponent;
  let fixture: ComponentFixture<TolQcLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TolQcLinksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TolQcLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
