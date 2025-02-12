import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatNoDataRow, MatRow, MatRowDef, MatTable, MatTableDataSource} from '@angular/material/table';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {Title} from '@angular/platform-browser';
import {NgxSpinnerService} from 'ngx-spinner';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';

import { catchError, map, merge, startWith, switchMap } from 'rxjs';
import { ApiService } from '../api.service';
import {NgClass} from "@angular/common";
import {MatTableExporterModule} from "mat-table-exporter";
import {MatCard, MatCardActions, MatCardTitle} from "@angular/material/card";
import {MatDivider} from "@angular/material/divider";
import {MatLine} from "@angular/material/core";
import {MatList, MatListItem} from "@angular/material/list";
import {MatChip, MatChipSet} from "@angular/material/chips";
import {MatIcon} from "@angular/material/icon";
import {MatInput} from "@angular/material/input";
import {ReactiveFormsModule} from "@angular/forms";
import {PaginatorComponent} from "../paginator/paginator.component";

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.css'],
  standalone : true,
  imports: [

    MatTable,
    MatSort,
    MatHeaderCellDef,
    RouterLink,
    MatHeaderCell,
    MatCell,

    MatColumnDef,
    MatPaginator,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    MatCellDef,
    MatSortHeader,
    MatExpansionModule,
    MatCheckboxModule,
    MatTableExporterModule,
    MatCard,
    MatCardActions,
    MatCardTitle,
    MatDivider,
    MatLine,
    MatList,
    MatListItem,
    MatChip,
    MatIcon,
    ReactiveFormsModule,
    MatChipSet,
    PaginatorComponent
  ]
})
export class PublicationsComponent implements OnInit, AfterViewInit, OnDestroy {

  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
  filterChanged = new EventEmitter<any>();
  data: any;
  dataCount = 0;
  @Input()
  pageIndex: number = 0;
  @Input()
      // @ts-ignore
  pageSizeOptions: number[] = [15,30,50,100];

  @Input()
      // @ts-ignore
  pageSize: number = 15;
  @Output()
  // @ts-ignore
  readonly page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();
  urlAppendFilterArray:any[] = []
  activeFilters = new Array<string>();
  columns = ['title', 'journal_name', 'year', 'organism_name', 'study_id'];
  journalNameFilters:any[] = [];
  publicationYearFilters :any[] = [];
  articleTypeFilters :any[] = [];
  isLoadingResults: boolean | undefined;
  isRateLimitReached: boolean | undefined;
  aggregations: any;
  resultsLength: any;
  timer: any;
  constructor(private titleService: Title,
              private spinner: NgxSpinnerService,
              private _apiService: ApiService,
              private activatedRoute: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.titleService.setTitle('Publications');
    const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
    // @ts-ignore
      const params = queryParamMap['params'];
    if (Object.keys(params).length !== 0) {
      this.resetFilter();
      for (const key in params) {
        // @ts-ignore
          this.urlAppendFilterArray.push({name: key, value: params[key]});
        this.activeFilters.push(params[key]);
      }
    }
    // this.getAllPublications(0, this.pagesize, this.sort.active, this.sort.direction);
  }

  ngAfterViewInit() {
    // If the user changes the metadataSort order, reset back to the first page.
    // @ts-ignore
    this.sort.sortChange.subscribe(() => (this.pageIndex = 0));
    this.filterChanged.subscribe(() => (this.pageIndex = 0));
    // @ts-ignore
      merge(this.page, this.sort.sortChange,this.filterChanged)
        .pipe(
            startWith({}),
            switchMap(() => {
              this.isLoadingResults = true;
              return  this._apiService.getAllPublications(this.pageIndex, this.pageSize, this.activeFilters)
              .pipe(catchError(() => observableOf(null)));
            }),
            map(data => {
              // Flip flag to show that loading has finished.
              this.isLoadingResults = false;
              this.isRateLimitReached = data === null;

              if (data === null) {
                return [];
              }
              this.resultsLength = data.count;
              this.aggregations = data.aggregations;
    
              
              this.dataSource = data.results;
              this.dataCount = data.count;
              this.publicationYearFilters = data.aggregations.pubYear?.buckets;

              this.journalNameFilters = data.aggregations.journalTitle?.buckets;
              this.articleTypeFilters = data.aggregations.articleType?.buckets;

              this.router.navigate([], {
                relativeTo: this.activatedRoute, queryParams:this.activeFilters,queryParamsHandling: 'merge'
              })
              return data.results;
            }),
        )
        .subscribe(data => (this.data = data));
  }

  // getAllPublications(offset, limit, sortColumn?, sortOrder?): void {
  //   this.spinner.show();
  //   this.getDataService.getAllPublications(offset, limit, this.activeFilters).subscribe(
  //       data => {
  //         this.dataSource = data.results;
  //         this.dataCount = data.count;
  //         this.publicationYearFilters = data.aggregations.pubYear?.buckets;
  //         this.journalNameFilters = data.aggregations.journalTitle?.buckets;
  //         this.articleTypeFilters = data.aggregations.articleType?.buckets;
  //         this.spinner.hide();
  //       }
  //   );
  // }

  getJournalName(data: any): string {
    if (data.journalTitle !== undefined) {
      return data.journalTitle;
    } else {
      return 'Wellcome Open Res';
    }
  }

  getYear(data: any): string {
    if (data.pubYear !== undefined) {
      return data.pubYear;
    } else {
      return '2022';
    }
  }

  // pageChanged(event: any): void {
  //   const offset = event.pageIndex * event.pageSize;
  //   this.getAllPublications(offset, event.pageSize);
  // }


  hasActiveFilters(): boolean {
    if (typeof this.activeFilters === 'undefined') {
      return false;
    }
    for (const key of Object.keys(this.activeFilters)) {
      // @ts-ignore
        if (this.activeFilters[key].length !== 0) {
        return true;
      }
    }
    return false;
  }
  // @ts-ignore
    checkFilterIsActive = (filterValue: string) => {
      if (this.activeFilters.includes(filterValue)) {
        if(filterValue.length > 50){
          return 'background-color: cornflowerblue; color: white;height: 80px;';
        }else {
          return 'background-color: cornflowerblue; color: white;'
        }
      } else {
        if (filterValue.length > 50) {
          return 'cursor: pointer;height: 60px;';
        } else {
          return 'cursor: pointer;'
        }
      }
  }
  onFilterClick(filterValue: string) {
    clearTimeout(this.timer);
    const index = this.activeFilters.indexOf(filterValue);
    index !== -1 ? this.activeFilters.splice(index, 1) : this.activeFilters.push(filterValue);
    this.filterChanged.emit();
  }


  removeFilter(): void {
    this.resetFilter();
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
      this.router.navigate([currentUrl.split('?')[0]] );
      this.spinner.show();
      setTimeout(() => {
        this.spinner.hide();
      }, 800);
    });
  }

  resetFilter(): void {
    for (const key of Object.keys(this.activeFilters)) {
      // @ts-ignore
        this.activeFilters[key] = [];
    }
    this.activeFilters = [];
    this.urlAppendFilterArray = [];

  }

  ngOnDestroy(): void {
    this.resetFilter();
  }

  refreshPage() {

    this.activeFilters = [];
    this.filterChanged.emit();
    this.router.navigate([]);
  }

  public changePage(pageEvent: PageEvent): void {
    const previousPageIndex = this.pageIndex;
    if (this.pageSize !== pageEvent.pageSize) {
      this.pageIndex = 0;
      this.pageSize = pageEvent.pageSize;
    } else {
      this.pageIndex = pageEvent.pageIndex;
    }
    this.page.emit({
      previousPageIndex,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      length: this.resultsLength
    });
  }


}



function observableOf(arg0: null): any {
  throw new Error('Function not implemented.');
}

