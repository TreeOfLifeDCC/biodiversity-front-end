import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkDownloadsComponent } from './bulk-downloads.component';

describe('BulkDownloadsComponent', () => {
  let component: BulkDownloadsComponent;
  let fixture: ComponentFixture<BulkDownloadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkDownloadsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BulkDownloadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
