import {Component, OnDestroy, OnInit} from '@angular/core';
import {Title} from "@angular/platform-browser";
import {NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public categories = [
    {
      title: 'Data Portal',
      description: 'Data Portal has the Organism and Species data for all Biodiversity projects.',
      link: '/data_portal',
      key: 'data',
      label: 'DataPortal'
    },
    {
      title: 'Tracking System',
      description: 'Tracking System has data for statuses of all Organism and Species for all Biodiversity projects.',
      link: '/tracking',
      key: 'tracking',
      label: 'TrackingSystem'
    },
    {
      title: 'Sampling Map',
      description: 'Sampling Map has data for statuses of all Organism and Species for all Biodiversity projects.',
      link: '/gis',
      key: 'gis',
      label: 'GisComponent'
    }
  ];
  constructor(
      private titleService: Title
  ) {


  }

  ngOnInit(): void {
    this.titleService.setTitle('Home');
  }
}
