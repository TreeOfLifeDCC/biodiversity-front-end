import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {ApiService} from "../api.service";
import { MatCard, MatCardTitle, MatCardActions } from '@angular/material/card';


@Component({
    selector: 'app-specimen-details',
    templateUrl: './specimen-details.component.html',
    styleUrls: ['./specimen-details.component.css'],
    standalone: true,
    imports: [MatCard, MatCardTitle, MatCardActions]
})
export class SpecimenDetailsComponent implements OnInit {
  data: any;

  constructor(private route: ActivatedRoute, private _apiService: ApiService) { }

  ngOnInit(): void {
    const routeParams = this.route.snapshot.paramMap;
    const specimenId = routeParams.get('specimenId');
    this._apiService.getDetailsData(specimenId, 'specimens_test_index').subscribe(
      data => {
        this.data = data['results'][0]['_source'];
      }
    );
  }

}
