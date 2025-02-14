import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute, RouterLink } from "@angular/router";
import {ApiService} from "../api.service";
import {MatPaginator as MatPaginator} from "@angular/material/paginator";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import { MatTableDataSource as MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell,
    MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow } from "@angular/material/table";
import { MatCard, MatCardTitle, MatCardActions } from '@angular/material/card';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatInput } from '@angular/material/input';
import { MatAnchor } from '@angular/material/button';
import {ImageSliderComponent} from "../image-slider/image-slider.component";

@Component({
    selector: 'app-organism-details',
    templateUrl: './organism-details.component.html',
    styleUrls: ['./organism-details.component.css'],
    standalone: true,
    imports: [MatCard, MatCardTitle, MatCardActions, MatProgressSpinner, MatInput, MatTable, MatSort, MatColumnDef,
        MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatAnchor, RouterLink,
        MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow, MatPaginator, ImageSliderComponent]
})
export class OrganismDetailsComponent implements OnInit, AfterViewInit {
  data: any;
  specimensData: any;
  specimensDataLength: number | undefined;
  dataSourceRecords: any;
  specDisplayedColumns: string[] = ['source', 'type', 'target'];
  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  pageIndex: number = 0;
  slides: any[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;

  constructor(private route: ActivatedRoute, private _apiService: ApiService) { }

  ngOnInit(): void {
  }


    ngAfterViewInit() {
    const routeParams = this.route.snapshot.paramMap;
    const organismId = routeParams.get('organismId');
    this._apiService.getDetailsData(organismId, 'specimens').subscribe(
      data => {
        this.data = data['results'][0]['_source'];
        this.isLoadingResults = false;
        this.isRateLimitReached = data === null;

        this.specimensData = new MatTableDataSource(this.data['relationships']);
        if (this.data['relationships']) {
          this.specimensDataLength = this.data['relationships'].length;
        } else {
          this.specimensDataLength = 0;
        }
        this.specimensData.paginator = this.paginator;
        this.specimensData.sort = this.sort;
        this.dataSourceRecords = new MatTableDataSource<any>(this.data?.relationships ?? []);
          setTimeout(() => {
              this.dataSourceRecords.paginator = this.paginator;
              this.dataSourceRecords.sort = this.sort;
          });

          this.slides = this.generateSlides(this.data);
      }
    );
  }

    generateSlides(bioSampleObj: any){
        console.log(bioSampleObj);
        const output = [];
        const arr = bioSampleObj.images;
        if (arr!== undefined) {
            for (let i = 0; i < arr.length; i++) {
                const obj = {url: encodeURI(arr[i])
                        .replace('(', '%28')
                        .replace(')', '%29')};
                output.push(obj);
            }
        }
        return output;
    }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.specimensData.filter = filterValue.trim().toLowerCase();
    if (this.specimensData.paginator) {
      this.specimensData.paginator.firstPage();
    }
  }

}
