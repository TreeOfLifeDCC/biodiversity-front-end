import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule as MatButtonModule} from "@angular/material/button";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatTooltipModule as MatTooltipModule} from "@angular/material/tooltip";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatListModule as MatListModule} from "@angular/material/list";
import {MatCardModule as MatCardModule} from "@angular/material/card";
import {MatDividerModule} from "@angular/material/divider";
import {MatChipsModule as MatChipsModule} from "@angular/material/chips";
import {MatBadgeModule} from "@angular/material/badge";
import {MatProgressSpinnerModule as MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatTableModule as MatTableModule} from "@angular/material/table";
import {MatSortModule} from "@angular/material/sort";
import {MatPaginatorModule as MatPaginatorModule} from "@angular/material/paginator";
import {MatFormFieldModule as MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule as MatInputModule} from "@angular/material/input";
import {MatTabsModule as MatTabsModule} from "@angular/material/tabs";
import {MatDialogModule as MatDialogModule} from "@angular/material/dialog";


@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatGridListModule,
        MatTooltipModule,
        MatSidenavModule,
        MatListModule,
        MatCardModule,
        MatDividerModule,
        MatChipsModule,
        MatBadgeModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatTabsModule,
        MatDialogModule
    ],
    exports: [
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatGridListModule,
        MatTooltipModule,
        MatSidenavModule,
        MatListModule,
        MatCardModule,
        MatDividerModule,
        MatChipsModule,
        MatBadgeModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
        MatFormFieldModule,
        MatInputModule,
        MatTabsModule,
        MatDialogModule
    ]
})
export class MaterialModule {
}
