import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboards',
  standalone: true,
  imports: [],
  templateUrl: './dashboards.component.html',
  styleUrl: './dashboards.component.scss'
})
export class DashboardsComponent implements OnInit {

  private readonly dashboardUrls: { [key: string]: string } = {
    juan: 'https://genomes-annotations-dashboard-153439618737.europe-west2.run.app',
    koosum: 'https://python-dash-applications-153439618737.europe-west2.run.app/dashboards/?projectName=gbdp',
  };

  dashboardUrl!: SafeResourceUrl;

  constructor(
      private route: ActivatedRoute,
      private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const owner = params['owner'] || 'juan';
      const url = this.dashboardUrls[owner] || this.dashboardUrls['koosum'];
      this.dashboardUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
  }
}
