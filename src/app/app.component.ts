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
    isDashboardsMenuOpen = false;
    isDashboardsMenuDismissed = false;

    openDashboardsMenu(): void {
        this.isDashboardsMenuDismissed = false;
        this.isDashboardsMenuOpen = true;
    }

    closeDashboardsMenu(): void {
        this.isDashboardsMenuOpen = false;
        this.isDashboardsMenuDismissed = true;
    }

    resetDashboardsMenu(): void {
        this.isDashboardsMenuOpen = false;
        this.isDashboardsMenuDismissed = false;
    }

    selectDashboardMenu(event: MouseEvent): void {
        this.closeDashboardsMenu();
        (event.currentTarget as HTMLElement).blur();
    }

    showDashboardsMenu(event: MouseEvent): void {
        event.stopPropagation();
        this.isDashboardsMenuOpen = true;
    }
}
