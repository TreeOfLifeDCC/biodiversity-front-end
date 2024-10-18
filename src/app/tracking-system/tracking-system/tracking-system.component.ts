import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
// @ts-ignore
import {ApiService} from "../../api.service";
import { PageEvent as PageEvent} from "@angular/material/paginator";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import {merge, of as observableOf} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {Subject} from "rxjs";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import {Title} from "@angular/platform-browser";
import { MatCard, MatCardTitle, MatCardActions } from '@angular/material/card';
import { MatList, MatListItem } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';

import { MatLine } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatChipSet, MatChip } from '@angular/material/chips';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow } from '@angular/material/table';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MatAnchor } from '@angular/material/button';
import { PaginatorComponent } from '../../paginator/paginator.component';

@Component({
    selector: 'app-status-tracking',
    templateUrl: './tracking-system.component.html',
    styleUrls: ['./tracking-system.component.css'],
    standalone: true,
    imports: [MatCard, MatCardTitle, MatCardActions, MatList, MatDivider, MatListItem, MatLine, MatIcon, MatChipSet,
        MatChip, MatInput, FormsModule, MatProgressSpinner, MatTable, MatSort, MatTableExporterModule, MatColumnDef,
        MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell, MatAnchor, RouterLink, MatHeaderRowDef,
        MatHeaderRow, MatRowDef, MatRow, PaginatorComponent]
})
export class TrackingSystemComponent implements OnInit, AfterViewInit {
    displayedColumns: string[] = ['organism', 'commonName', 'biosamples', 'raw_data', 'mapped_reads', 'assemblies_status',
        'annotation_complete', 'annotation_status',];
    data: any;
    searchValue: string | undefined;
    searchChanged = new EventEmitter<any>();
    filterChanged = new EventEmitter<any>();

    resultsLength = 0;
    isLoadingResults = true;
    isRateLimitReached = false;
    aggregations: any;
    symbiontsFilters : any[] = [];
    metagenomesFilters : any[] = [];
    activeFilters = new Array<string>();

    isCollapsed = true;
    itemLimit = 5;
    @Input() isShowCount = true;
    @Input() filterSize=  5;
    currentClass = 'kingdom';
    classes = ["superkingdom", "kingdom", "subkingdom", "superphylum", "phylum", "subphylum", "superclass", "class",
        "subclass", "infraclass", "cohort", "subcohort", "superorder", "order", "suborder", "infraorder", "parvorder",
        "section", "subsection", "superfamily", "family", " subfamily", " tribe", "subtribe", "genus", "series", "subgenus",
        "species_group", "species_subgroup", "species", "subspecies", "varietas", "forma"];
    timer: any;
    phylogenyFilters: string[] = [];
    isPhylogenyFilterProcessing = false; // Flag to prevent double-clicking
    queryParams: any = {};
    lastPhylogenyVal = '';

    // @ts-ignore
    @ViewChild(MatSort) sort: MatSort;
    @Input()
        // @ts-ignore
    pageIndex: number = 0;

    @Input()
        // @ts-ignore
    pageSizeOptions: number[] = [15,50,100];

    @Input()
        // @ts-ignore
    pageSize: number = 15;
    searchUpdate = new Subject<string>();
    isFilterSelected = false;
    selectedFilterValue = '';
    urlAppendFilterArray = new Array<string>();
    @Output()
    // @ts-ignore
    readonly page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();
    constructor(private _apiService: ApiService,private activatedRoute: ActivatedRoute, private router: Router,private titleService: Title ) {
        this.searchUpdate.pipe(
            debounceTime(500),
            distinctUntilChanged()).subscribe(
            value => {
                this.searchChanged.emit();
            }
        );
    }

    ngOnInit(): void {
        this.titleService.setTitle('Status tracking');
        // get url parameters
        const queryParamMap: any = this.activatedRoute.snapshot['queryParamMap'];
        const params = queryParamMap['params'];
        if (Object.keys(params).length !== 0) {
            for (const key in params) {
                if (params.hasOwnProperty(key)) {
                    if (params[key].includes('phylogenyFilters - ')) {
                        const phylogenyFilters = params[key].split('phylogenyFilters - ')[1];
                        // Remove square brackets and split by comma
                        this.phylogenyFilters = phylogenyFilters.slice(1, -1).split(',');
                    } else if (params[key].includes('phylogenyCurrentClass - ')) {
                        const phylogenyCurrentClass = params[key].split('phylogenyCurrentClass - ')[1];
                        this.currentClass = phylogenyCurrentClass;
                    } else {
                        this.activeFilters.push(params[key]);
                    }

                }
            }
        }
    }

    ngAfterViewInit() {
        // If the user changes the metadataSort order, reset back to the first page.
        this.sort.sortChange.subscribe(() => (this.pageIndex = 0));
        this.searchChanged.subscribe(() => (this.pageIndex = 0));
        this.filterChanged.subscribe(() => (this.pageIndex = 0));
        merge(this.page, this.sort.sortChange, this.searchChanged, this.filterChanged)
            .pipe(
                startWith({}),
                switchMap(() => {
                    this.isLoadingResults = true;
                    return this._apiService.getData(this.pageIndex,
                        // @ts-ignore
                        this.pageSize, this.searchValue, this.sort.active, this.sort.direction, this.activeFilters,
                        this.currentClass, this.phylogenyFilters, 'tracking_status_index'
                    ).pipe(catchError(() => observableOf(null)));
                }),
                map(data => {
                    // Flip flag to show that loading has finished.
                    this.isLoadingResults = false;
                    this.isRateLimitReached = data === null;

                    if (data === null) {
                        return [];
                    }

                    // Only refresh the result length if there is new metadataData. In case of rate
                    // limit errors, we do not want to reset the metadataPaginator to zero, as that
                    // would prevent users from re-triggering requests.
                    // @ts-ignore
                    this.resultsLength = data.count;
                    // @ts-ignore
                    this.aggregations = data.aggregations;

                    // symbionts
                    this.symbiontsFilters = [];
                    if (this.aggregations.symbionts_biosamples_status.buckets.length > 0) {
                        this.symbiontsFilters = this.merge(this.symbiontsFilters,
                            this.aggregations.symbionts_biosamples_status.buckets,
                            'symbionts_biosamples_status');
                    }
                    if (this.aggregations.symbionts_raw_data_status.buckets.length > 0) {
                        this.symbiontsFilters = this.merge(this.symbiontsFilters,
                            this.aggregations.symbionts_raw_data_status.buckets,
                            'symbionts_raw_data_status');
                    }
                    if (this.aggregations.symbionts_assemblies_status.buckets.length > 0) {
                        this.symbiontsFilters = this.merge(this.symbiontsFilters,
                            this.aggregations.symbionts_assemblies_status.buckets,
                            'symbionts_assemblies_status');
                    }

                    // metagenomes
                    this.metagenomesFilters = [];
                    if (this.aggregations.metagenomes_biosamples_status.buckets.length > 0) {
                        this.metagenomesFilters = this.merge(this.metagenomesFilters,
                            this.aggregations.metagenomes_biosamples_status.buckets,
                            'metagenomes_biosamples_status');
                    }
                    if (this.aggregations.metagenomes_raw_data_status.buckets.length > 0) {
                        this.metagenomesFilters = this.merge(this.metagenomesFilters,
                            this.aggregations.metagenomes_raw_data_status.buckets,
                            'metagenomes_raw_data_status');
                    }
                    if (this.aggregations.metagenomes_assemblies_status.buckets.length > 0) {
                        this.metagenomesFilters = this.merge(this.metagenomesFilters,
                            this.aggregations.metagenomes_assemblies_status.buckets,
                            'metagenomes_assemblies_status');
                    }

                    console.log(this.phylogenyFilters)

                    // get last phylogeny element for filter button
                    this.lastPhylogenyVal = this.phylogenyFilters.slice(-1)[0];

                    this.queryParams = [...this.activeFilters];
                    if (this.phylogenyFilters && this.phylogenyFilters.length) {
                        const index = this.queryParams.findIndex((element: any) => element.includes('phylogenyFilters - '));
                        if (index > -1) {
                            this.queryParams[index] = `phylogenyFilters - [${this.phylogenyFilters}]`;
                        } else {
                            this.queryParams.push(`phylogenyFilters - [${this.phylogenyFilters}]`);
                        }
                    }

                    this.replaceUrlQueryParams();
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


    displayActiveFilterName(filterName: string) {
        if (filterName === 'DToL') {
            return 'Darwin Tree of Life';
        } else if(filterName=='ASG'){
            return 'The Aquatic Symbiosis Project';
        }else if(filterName=='ERGA'){
            return 'European Reference Genome Atlas';
        } else if (filterName && filterName.startsWith('symbionts_')){
            return 'Symbionts-' + filterName.split('-')[1]
        } else if (filterName && filterName.startsWith('metagenomes_')){
            return 'Metagenomes-' + filterName.split('-')[1]
        } else{
            return filterName;
        }
    }

    merge = (first: any[], second: any[], filterLabel: string) => {
        for (let i = 0; i < second.length; i++) {
            second[i].label = filterLabel;
            first.push(second[i]);
        }
        return first;
    }

    getStatusCount(data: any) {
        if (data) {
            for (let i = 0; i < data.length; ++i) {
                if (data[i]['key'] === 'Done')
                    return data[i]['doc_count'];
            }
        }
    }

    convertProjectName(data: string) {
        if (data === 'dtol') {
            return 'DToL';
        } else {
            return data;
        }
    }


    onFilterClick(filterName:String , filterValue: string, phylogenyFilter: boolean = false) {
        // phylogeney filter selection
        if (phylogenyFilter) {
            if (this.isPhylogenyFilterProcessing) {
                return;
            }
            // Set flag to prevent further clicks
            this.isPhylogenyFilterProcessing = true;

            this.phylogenyFilters.push(`${this.currentClass}:${filterValue}`);
            const index = this.classes.indexOf(this.currentClass) + 1;
            this.currentClass = this.classes[index];

            // update url with the value of the phylogeny current class
            const queryParamIndex = this.queryParams.findIndex((element: any) => element.includes('phylogenyCurrentClass - '));
            if (queryParamIndex > -1) {
                this.queryParams[queryParamIndex] = `phylogenyCurrentClass - ${this.currentClass}`;
            } else {
                this.queryParams.push(`phylogenyCurrentClass - ${this.currentClass}`);
            }
            // Replace current parameters with new parameters.
            this.replaceUrlQueryParams();
            this.filterChanged.emit();

            // Reset isPhylogenyFilterProcessing flag
            setTimeout(() => {
                this.isPhylogenyFilterProcessing = false;
            }, 500);
        } else{
            clearTimeout(this.timer);
            if (filterName.startsWith('symbionts_') || filterName.startsWith('metagenomes_')){
                filterValue = `${filterName}-${filterValue}`;
            }
            const index = this.activeFilters.indexOf(filterValue);
            console.log(index)

            index !== -1 ? this.activeFilters.splice(index, 1) : this.activeFilters.push(filterValue);
            console.log(this.activeFilters)
            this.filterChanged.emit();
        }
    }


    removePhylogenyFilters() {
        // update url with the value of the phylogeny current class
        const queryParamPhyloIndex = this.queryParams.findIndex((element: any) => element.includes('phylogenyFilters - '));
        if (queryParamPhyloIndex > -1) {
            this.queryParams.splice(queryParamPhyloIndex, 1);
        }

        const queryParamCurrentClassIndex = this.queryParams.findIndex((element: any) => element.includes('phylogenyCurrentClass - '));
        if (queryParamCurrentClassIndex > -1) {
            this.queryParams.splice(queryParamCurrentClassIndex, 1);
        }
        // Replace current url parameters with new parameters.
        this.replaceUrlQueryParams();
        // reset phylogeny variables
        this.phylogenyFilters = [];
        this.currentClass = 'kingdom';
        this.filterChanged.emit();
    }

    checkStyle(filterValue: string) {

        if (this.activeFilters.includes(filterValue)) {
            if(filterValue.length > 50){
                return 'background-color: cornflowerblue; color: white;height: 80px;';
            }else {
                return 'background-color: cornflowerblue; color: white;'
            }
        } else {
            if (filterValue.length > 50) {
                return 'cursor: pointer;height: 80px;';
            } else {
                return 'cursor: pointer;'
            }
        }
    }



    onHistoryClick() {
        this.phylogenyFilters.splice(this.phylogenyFilters.length - 1, 1);
        const previousClassIndex = this.classes.indexOf(this.currentClass) - 1;
        this.currentClass = this.classes[previousClassIndex];
        this.filterChanged.emit();
    }

    onRefreshClick() {
        this.phylogenyFilters = [];
        this.currentClass = 'kingdom';
        // remove phylogenyFilters param from url
        const index = this.queryParams.findIndex((element: any) => element.includes('phylogenyFilters - '));
        if (index > -1) {
            this.queryParams.splice(index, 1);
            // Replace current parameters with new parameters.
            this.replaceUrlQueryParams();
        }
        this.filterChanged.emit();
    }

    removeFilter() {
        clearTimeout(this.timer);
        this.activeFilters = [];
        this.phylogenyFilters = [];
        this.currentClass = 'kingdom';
        this.filterChanged.emit();
        this.router.navigate([]);
    }

    checkColor(status: string) {
        if (status === 'Done')
            return 'accent'
        else
            return '#3b6fb6'
    }

    getStyle(status: string) {
        if (status === 'Annotation Complete') {
            return 'background-color: limegreen; color: black';
        } else if (status == 'Done') {
            return 'background-color: limegreen; color: black';
        } else if (status == 'Waiting') {
            return 'background-color: yellow; color: black';
        } else if (status == 'Submitted') {
            return 'background-color: limegreen; color: black';
        } else {
            return 'background-color: yellow; color: black';
        }

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

    updateDomForRemovedFilter = (filter: string) => {
        // tslint:disable-next-line:triple-equals
        if (this.urlAppendFilterArray.length != 0) {
            let inactiveClassName: string;
            this.urlAppendFilterArray.filter(obj => {
                // @ts-ignore
                if(obj.value === filter){
                    const filterIndex = this.urlAppendFilterArray.indexOf(obj);
                    this.urlAppendFilterArray.splice(filterIndex, 1);
                }
            });
        }
    }
    selectedFilterArray(key: string, value: string) {
        let jsonObj: {};
        if (key.toLowerCase() == 'biosamples') {
            jsonObj = { "name": "biosamples", "value": value };
            // @ts-ignore
            this.urlAppendFilterArray.push(jsonObj);

        } else if (key.toLowerCase() == "raw_data") {
            jsonObj = { "name": "raw_data", "value": value };
            // @ts-ignore
            this.urlAppendFilterArray.push(jsonObj);
        }else if (key.toLowerCase() == "mapped_reads") {
            jsonObj = { "name": "mapped_reads", "value": value };
            // @ts-ignore
            this.urlAppendFilterArray.push(jsonObj);
        }   else if (key.toLowerCase() == "assemblies") {
            jsonObj = { "name": "assemblies", "value": value };
            // @ts-ignore
            this.urlAppendFilterArray.push(jsonObj);

        } else if (key.toLowerCase() == "annotation_complete") {
            jsonObj = { "name": "annotation_complete", "value": value };
            // @ts-ignore
            this.urlAppendFilterArray.push(jsonObj);

        } else if (key.toLowerCase() == "annotation") {
            jsonObj = { "name": "annotation", "value": value };
            // @ts-ignore
            this.urlAppendFilterArray.push(jsonObj);

        }
        else if (key.toLowerCase() == "project_name") {
            jsonObj = { "name": "project_name", "value": value };
            // @ts-ignore
            this.urlAppendFilterArray.push(jsonObj);

        } else if (key.toLowerCase().startsWith('symbionts_') ||
            key.toLowerCase().startsWith('metagenomes_')) {
            jsonObj = {"name": key.toLowerCase(), "value": value};
            // @ts-ignore
            this.urlAppendFilterArray.push(jsonObj);

        } else if(key.toLowerCase() == 'phylogeny'){
            jsonObj = { "name": "phylogeny_filters", "value": this.phylogenyFilters };
            let jsonObj1 = { "name": "phylogeny", "value": value };
            let jsonObj21 ={"name":"currentClass","value":this.currentClass}
            // @ts-ignore
            this.urlAppendFilterArray.push(jsonObj1);
            // @ts-ignore
            this.urlAppendFilterArray.push(jsonObj);
            // @ts-ignore
            this.urlAppendFilterArray.push(jsonObj21);
        }

    }

    updateActiveRouteParams = () => {
        const params = {};
        const currentUrl = this.router.url;
        const paramArray = this.urlAppendFilterArray.map(x => Object.assign({}, x));
        if (paramArray.length != 0) {
            for (let i = 0; i < paramArray.length; i++) {
                // @ts-ignore
                params[paramArray[i].name] = paramArray[i].value;
            }
            this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
                this.router.navigate([currentUrl.split('?')[0]], { queryParams: params } );
            });
        }
        else {
            this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => {
                this.router.navigate([currentUrl.split('?')[0]] );
            });
        }


    }
    toggleCollapse = () => {
        if (this.isCollapsed) {
            this.itemLimit = 10000;
            this.isCollapsed = false;
        } else {
            this.itemLimit = this.filterSize;
            this.isCollapsed = true;
        }
    }
}
