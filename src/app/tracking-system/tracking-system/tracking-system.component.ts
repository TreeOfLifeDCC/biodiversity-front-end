import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
// @ts-ignore
import {ApiService} from "../../api.service";
import { PageEvent} from "@angular/material/paginator";
import {MatSort} from "@angular/material/sort";
import {merge, of as observableOf} from "rxjs";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {Subject} from "rxjs";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
@Component({
    selector: 'app-status-tracking',
    templateUrl: './tracking-system.component.html',
    styleUrls: ['./tracking-system.component.css']
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

    preventSimpleClick = false;

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
        const queryParamMap = this.activatedRoute.snapshot['queryParamMap'];
        // @ts-ignore
        const params = queryParamMap['params'];
        if (Object.keys(params).length != 0) {
            for (let key in params) {
                if (key === 'phylogeny_filters') {
                    this.phylogenyFilters = params[key];
                }else if(key === 'currentClass'){
                    this.currentClass = params[key];
                }else if (key === 'phylogeny') {
                    this.isFilterSelected = true;
                    this.selectedFilterValue = params[key];
                    this.appendActiveFilters(key, params);
                }else {
                    this.appendActiveFilters(key, params);
                }

            }
        }
    }
    // @ts-ignore
    appendActiveFilters(key, params) {
        // @ts-ignore
        this.urlAppendFilterArray.push({ "name": key, "value": params[key] });
        this.activeFilters.push(params[key]);

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

                    // @ts-ignore
                    return data.results;
                }),
            )
            .subscribe(data => (this.data = data));
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
    convertProjectNameKey(data: string) {
        if (data === 'DToL') {
            return 'Darwin Tree of Life';
        } else if(data=='ASG'){
            return 'The Aquatic Symbiosis Project';
        }else if(data=='ERGA'){
            return 'European Reference Genome Atlas';
        } else if (data.startsWith('symbionts_')){
            return 'Symbionts-' + data.split('-')[1]
        } else if (data.startsWith('metagenomes_')){
            return 'Metagenomes-' + data.split('-')[1]
        } else{
            return data;
        }
    }
    onFilterClick(filterName:string, filterValue: string) {

        this.preventSimpleClick = true;
        clearTimeout(this.timer);

        if (filterName.startsWith('symbionts_') || filterName.startsWith('metagenomes_')){
            filterValue = `${filterName}-${filterValue}`;
        }
        const index = this.activeFilters.indexOf(this.convertProjectNameKey(filterValue));
        if (index !== -1) {
            this.removeFilter(filterValue);
        } else {
            this.activeFilters.push(filterValue);

            if (filterName === 'phylogeny') {
                this.isFilterSelected = true;
                this.selectedFilterValue = filterValue;
            }
            // @ts-ignore
            this.selectedFilterArray(filterName, filterValue);
            this.updateActiveRouteParams();
        }
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

    changeCurrentClass(filterValue: string) {

        let delay = 200;
        this.preventSimpleClick = false;
        this.timer = setTimeout(() => {
            if (!this.preventSimpleClick) {
                this.phylogenyFilters.push(`${this.currentClass}:${filterValue}`);
                const index = this.classes.indexOf(this.currentClass) + 1;
                this.currentClass = this.classes[index];

                this.filterChanged.emit();
            }
        }, delay);
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
        this.filterChanged.emit();
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
    removeFilter(filter: string) {
        if (filter !== undefined) {
            const filterIndex = this.activeFilters.indexOf(filter);
            this.activeFilters.splice(filterIndex, 1);
            this.updateDomForRemovedFilter(filter);
            this.updateActiveRouteParams();
        }
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
