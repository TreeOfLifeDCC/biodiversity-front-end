import { enableProdMode, importProvidersFrom } from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';


import {environment} from './environments/environment';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { MatCardModule as MatCardModule } from '@angular/material/card';
import { MatChipsModule as MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule as MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule as MatInputModule } from '@angular/material/input';
import { MatTabsModule as MatTabsModule } from '@angular/material/tabs';
import { MatSortModule } from '@angular/material/sort';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatListModule as MatListModule } from '@angular/material/list';
import { MatTableModule as MatTableModule } from '@angular/material/table';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MatFormFieldModule as MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule as MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMenuModule as MatMenuModule } from '@angular/material/menu';
import { MatSelectModule as MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MatRadioModule as MatRadioModule } from '@angular/material/radio';
import { MatAutocompleteModule as MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgcCookieConsentModule, NgcCookieConsentConfig } from 'ngx-cookieconsent';
import { AppComponent } from './app/app.component';

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



if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        importProvidersFrom(BrowserModule, AppRoutingModule, MatCardModule, MatChipsModule, MatProgressSpinnerModule, MatIconModule, MatPaginatorModule, MatInputModule, MatTabsModule, MatSortModule, BrowserModule, MatListModule, MatTableModule, NgxSpinnerModule, MatFormFieldModule, CommonModule, MatCheckboxModule, MatExpansionModule, MatMenuModule, MatSelectModule, FormsModule, MatTableExporterModule, MatRadioModule, MatAutocompleteModule, NgcCookieConsentModule.forRoot(cookieConfig)),
        provideHttpClient(withInterceptorsFromDi()),
        provideAnimations()
    ]
})
    .catch(err => console.error(err));
