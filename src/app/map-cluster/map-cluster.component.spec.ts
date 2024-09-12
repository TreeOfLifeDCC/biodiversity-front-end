import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapClusterComponent } from './map-cluster.component';

describe('MapClusterComponent', () => {
  let component: MapClusterComponent;
  let fixture: ComponentFixture<MapClusterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapClusterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapClusterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
