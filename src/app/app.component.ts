import {Component} from '@angular/core';
import { NgcCookieConsentService } from 'ngx-cookieconsent';
import { RouterLink, RouterOutlet } from '@angular/router';
import { FooterComponent } from './footer/footer.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: true,
    imports: [RouterLink, RouterOutlet, FooterComponent]
})
export class AppComponent {
    title = 'biodiversity-portal-fe';
    constructor(private ccService: NgcCookieConsentService) {
    }
}
