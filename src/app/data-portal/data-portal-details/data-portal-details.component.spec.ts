import {ComponentFixture, TestBed} from '@angular/core/testing';

import {DataPortalDetailsComponent} from './data-portal-details.component';

describe('DataPortalDetailsComponent', () => {
    let component: DataPortalDetailsComponent;
    let fixture: ComponentFixture<DataPortalDetailsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
    imports: [DataPortalDetailsComponent]
})
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(DataPortalDetailsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
