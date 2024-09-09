/**
 * Copyright (C) 2006-2021 EMBL - European Bioinformatics Institute
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an AS IS BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

import { PaginatorComponent } from './paginator.component';

describe('PaginationComponent', () => {
  let component: PaginatorComponent;
  let fixture: ComponentFixture<PaginatorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PaginatorComponent ],
      imports: [
        CommonModule,
        FormsModule,
        MatSelectModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should visualize correct page information', () => {
    component.pageSizeOptions = [15, 50, 100];
    component.pageSize = 15;
    component.pageIndex = 0;
    component.length = 1500;
    fixture.detectChanges();

    // Unfortunately the compenents is initialized with the page size options configured, but the options GUI is not visualized
    // const optionsEl = fixture.debugElement.queryAll(By.css('div.mat-select-panel-wrap mat-option'));
    // expect(optionsEl.length).toBe(3);

    const pageIndexEl = fixture.debugElement.query(By.css('div.pages-navigation-pane input')).nativeNode;
    expect(pageIndexEl.value).toContain(1);
    const previousEl = fixture.debugElement.query(By.css('div.pages-navigation-pane button.previous')).nativeNode;
    expect(previousEl.disabled).toBeTrue();
    const nextEl = fixture.debugElement.query(By.css('div.pages-navigation-pane button.next')).nativeNode;
    expect(nextEl.disabled).toBeFalse();
  });
});
