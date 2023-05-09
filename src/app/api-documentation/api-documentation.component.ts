import { Component, OnInit } from '@angular/core';
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-api-documentation',
  templateUrl: './api-documentation.component.html',
  styleUrls: ['./api-documentation.component.css']
})
export class ApiDocumentationComponent implements OnInit {

  constructor(private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle('Api Documentation');
  }

}
