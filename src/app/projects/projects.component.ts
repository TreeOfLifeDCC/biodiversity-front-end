import { Component, OnInit } from '@angular/core';
import {Title} from "@angular/platform-browser";
import {Constants} from "../projects";
import { NgFor, NgIf } from '@angular/common';
import { MatCard } from '@angular/material/card';

@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.css'],
    standalone: true,
    imports: [NgFor, MatCard, NgIf]
})
export class ProjectsComponent implements OnInit {
  projects:any;

  constructor(
      private titleService: Title
  ) {
    this.projects = Constants.projects;
  }

  ngOnInit(): void {
    this.titleService.setTitle('Projects');
  }
}
