import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {MatListModule} from "@angular/material/list";
import {MatCardModule} from "@angular/material/card";
import {MatChipsModule} from "@angular/material/chips";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatTableModule} from "@angular/material/table";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatInputModule} from "@angular/material/input";
import {DataPortalComponent} from "./data-portal/data-portal.component";
import {DataPortalDetailsComponent} from "./data-portal/data-portal-details/data-portal-details.component";
import {MatTabsModule} from "@angular/material/tabs";
import {MatSortModule} from "@angular/material/sort";
import {MaterialModule} from "./material.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {NgxSpinnerModule} from "ngx-spinner";
import {CommonModule} from "@angular/common";
import {TrackingSystemComponent} from "./tracking-system/tracking-system/tracking-system.component";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatSelectModule} from "@angular/material/select";
import {MatMenuModule} from "@angular/material/menu";
import {FormsModule} from "@angular/forms";
import {PaginatorComponent} from "./paginator/paginator.component";
import {HomeComponent} from "./home/home.component";
import {MatTableExporterModule} from "mat-table-exporter";


@NgModule({
    declarations: [
        AppComponent,
        DataPortalComponent,
        DataPortalDetailsComponent,
        TrackingSystemComponent,
        PaginatorComponent,
        HomeComponent

    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        MatListModule,
        MatCardModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatTableModule,
        MatPaginatorModule,
        MatInputModule,
        MatTabsModule,
        MatSortModule,
        MaterialModule,
        BrowserModule,
        BrowserAnimationsModule,
        MatListModule,
        MatTableModule,
        NgxSpinnerModule,
        MatFormFieldModule,
        MatPaginatorModule,
        CommonModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatMenuModule,
        MatSelectModule,
        FormsModule,
        MatTableExporterModule,


    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
