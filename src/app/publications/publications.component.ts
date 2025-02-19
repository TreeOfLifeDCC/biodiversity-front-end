import {AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {MatCell, MatCellDef, MatColumnDef, MatHeaderCell, MatHeaderCellDef, MatHeaderRow, MatHeaderRowDef, MatNoDataRow, MatRow, MatRowDef, MatTable, MatTableDataSource} from '@angular/material/table';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {Title} from '@angular/platform-browser';
import {NgxSpinnerService} from 'ngx-spinner';
import {ActivatedRoute, Router, RouterLink} from "@angular/router";

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';

import {catchError, map, merge, startWith, Subject, switchMap} from 'rxjs';
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
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PaginatorComponent} from "../paginator/paginator.component";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";

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
    PaginatorComponent,
    MatInput,
    FormsModule
  ]
})
export class PublicationsComponent implements OnInit, AfterViewInit, OnDestroy {

  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;


  // @ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
  searchChanged = new EventEmitter<any>();
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
  journalFilters:any[] = [];
  pubYearFilters :any[] = [];
  articleTypeFilters :any[] = [];
  queryParams: any = {};
  isLoadingResults: boolean | undefined;
  isRateLimitReached: boolean | undefined;
  aggregations: any;
  resultsLength: any;
  timer: any;
  searchValue: string = '';
  searchUpdate = new Subject<string>();

  constructor(private titleService: Title,
              private spinner: NgxSpinnerService,
              private _apiService: ApiService,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
    this.searchUpdate.pipe(
        debounceTime(500),
        distinctUntilChanged()).subscribe(
        value => {
          this.searchChanged.emit();
        }
    );
  }

  ngOnInit(): void {
    this.titleService.setTitle('Publications');
    // get url parameters
    const queryParamMap: any = this.activatedRoute.snapshot['queryParamMap'];
    const params = queryParamMap['params'];
    if (Object.keys(params).length !== 0) {
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          if (params[key].includes('searchValue - ')){
            this.searchValue = params[key].split('searchValue - ')[1];
          } else {
            this.activeFilters.push(params[key]);
          }
        }
      }
    }
    // const queryParamMap = this.activatedRoute.snapshot.queryParamMap;
    // // @ts-ignore
    //   const params = queryParamMap['params'];
    // if (Object.keys(params).length !== 0) {
    //   this.resetFilter();
    //   for (const key in params) {
    //     // @ts-ignore
    //       this.urlAppendFilterArray.push({name: key, value: params[key]});
    //     this.activeFilters.push(params[key]);
    //   }
    // }
  }

  ngAfterViewInit() {
    // If the user changes the metadataSort order, reset back to the first page.
    // @ts-ignore
    this.sort.sortChange.subscribe(() => (this.pageIndex = 0));
    this.searchChanged.subscribe(() => (this.pageIndex = 0));
    this.filterChanged.subscribe(() => (this.pageIndex = 0));
    // @ts-ignore
      merge(this.page, this.sort.sortChange, this.searchChanged, this.filterChanged)
        .pipe(
            startWith({}),
            switchMap(() => {
              this.isLoadingResults = true;

              return  this._apiService.getPublicationsData(this.pageIndex,
                  this.pageSize, this.searchValue, this.sort.active, this.sort.direction, this.activeFilters,
                  'articles')
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

              this.articleTypeFilters = [];
              if (this.aggregations.articleType.buckets.length > 0) {
                this.articleTypeFilters = this.merge(this.articleTypeFilters,
                    this.aggregations.articleType.buckets,
                    'article_type');
              }

              this.journalFilters = [];
              if (this.aggregations.journalTitle.buckets.length > 0) {
                this.journalFilters = this.merge(this.journalFilters,
                    this.aggregations.journalTitle.buckets,
                    'journal_title');
              }

              this.pubYearFilters = [];
              if (this.aggregations.pubYear.buckets.length > 0) {
                this.pubYearFilters = this.merge(this.pubYearFilters,
                    this.aggregations.pubYear.buckets,
                    'pub_year');
              }

              this.queryParams = [...this.activeFilters];

              // add search value to URL query param
              if (this.searchValue) {
                this.queryParams.push(`searchValue - ${this.searchValue}`);
              }

              this.replaceUrlQueryParams();

              this.dataSource = data.results;
              this.dataCount = data.count;
              return data.results;

            }),
        )
        .subscribe(data => (this.data = data));
  }

  replaceUrlQueryParams() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: this.queryParams,
      replaceUrl: true,
      skipLocationChange: false
    });
  }

  merge = (first: any[], second: any[], filterLabel: string) => {
    for (let i = 0; i < second.length; i++) {
      second[i].label = filterLabel;
      first.push(second[i]);
    }
    return first;
  }

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

