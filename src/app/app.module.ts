import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HttpClientModule} from "@angular/common/http";
import {MatListModule as MatListModule} from "@angular/material/list";
import {MatCardModule as MatCardModule} from "@angular/material/card";
import {MatChipsModule as MatChipsModule} from "@angular/material/chips";
import {MatProgressSpinnerModule as MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {MatIconModule} from "@angular/material/icon";
import {MatFormFieldModule as MatFormFieldModule} from "@angular/material/form-field";
import {MatTableModule as MatTableModule} from "@angular/material/table";
import {MatPaginatorModule as MatPaginatorModule} from "@angular/material/paginator";
import {MatInputModule as MatInputModule} from "@angular/material/input";
import {DataPortalComponent} from "./data-portal/data-portal.component";
import {DataPortalDetailsComponent} from "./data-portal/data-portal-details/data-portal-details.component";
import {MatTabsModule as MatTabsModule} from "@angular/material/tabs";
import {MatSortModule} from "@angular/material/sort";
import {MaterialModule} from "./material.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {NgxSpinnerModule} from "ngx-spinner";
import {CommonModule} from "@angular/common";
import {TrackingSystemComponent} from "./tracking-system/tracking-system/tracking-system.component";
import {MatCheckboxModule as MatCheckboxModule} from "@angular/material/checkbox";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatSelectModule as MatSelectModule} from "@angular/material/select";
import {MatMenuModule as MatMenuModule} from "@angular/material/menu";
import {FormsModule} from "@angular/forms";
import {PaginatorComponent} from "./paginator/paginator.component";
import {HomeComponent} from "./home/home.component";
import {MatTableExporterModule} from "mat-table-exporter";
import {OrganismDetailsComponent} from "./organism-details/organism-details.component";
import {SpecimenDetailsComponent} from "./specimen-details/specimen-details.component";
import {ApiDocumentationComponent} from "./api-documentation/api-documentation.component";
import {HelpComponent} from "./help/help.component";
import {AboutComponent} from "./about/about.component";
import {ProjectsComponent} from "./projects/projects.component";
import {GisComponent} from "./gis/gis.component";

import {MatRadioModule as MatRadioModule} from "@angular/material/radio";
import {MatAutocompleteModule as MatAutocompleteModule} from "@angular/material/autocomplete";
import {FooterComponent} from "./footer/footer.component";
import {NgcCookieConsentModule, NgcCookieConsentConfig} from 'ngx-cookieconsent';

const cookieConfig:NgcCookieConsentConfig = {
    "cookie": {
        "domain": "www.ebi.ac.uk"
    },
    "position": "bottom",
    "theme": "classic",
    "palette": {
        "popup": {
            "background": "#333",
            "text": "#ffffff",
            "link": "#ffffff"
        },
        "button": {
            "background": "#f1d600",
            "text": "#333",
            "border": "transparent"
        }
    },
    "type": "info",
    elements:{
        messagelink: `<span id="cookieconsent:desc" class="cc-message">{{message}} 
                        <a aria-label="learn more about our privacy policy" tabindex="1" class="cc-link" href="{{privacyPolicyHref}}" target="_blank" rel="noopener">{{privacyPolicyLink}}</a> and  
                        <a aria-label="learn more about our terms of service" tabindex="2" class="cc-link" href="{{tosHref}}" target="_blank" rel="noopener">{{tosLink}}</a>
                    </span>
                    `,
    },
    "content": {
        "message": "This website requires cookies, and the limited processing of your personal data in order to function. By using the site you are agreeing to this as outlined in our ",
        "dismiss": "I agree, dismiss this banner",

        privacyPolicyLink: 'Privacy Notice',
        privacyPolicyHref: 'https://www.ebi.ac.uk/data-protection/privacy-notice/embl-ebi-public-website',

        tosLink: 'Terms of Use',
        tosHref: 'https://www.ebi.ac.uk/about/terms-of-use',
    }
};



@NgModule({
    declarations: [
        AppComponent,
        DataPortalComponent,
        DataPortalDetailsComponent,
        TrackingSystemComponent,
        PaginatorComponent,
        HomeComponent,
        OrganismDetailsComponent,
        SpecimenDetailsComponent,
        ApiDocumentationComponent,
        HelpComponent,
        AboutComponent,
        ProjectsComponent,
        GisComponent,
        FooterComponent


    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        MatCardModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatIconModule,
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
        CommonModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatMenuModule,
        MatSelectModule,
        FormsModule,
        MatTableExporterModule,
        MatRadioModule,
        MatAutocompleteModule,
        NgcCookieConsentModule.forRoot(cookieConfig)
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
