import {
    AfterViewInit,
    Component,
    OnInit,
    ViewChild,
    EventEmitter,
    Input,
    Output
} from '@angular/core';
import {ApiService} from "../api.service";
import {MatSort} from "@angular/material/sort";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {merge, of as observableOf} from "rxjs";
import {MatMenuTrigger} from "@angular/material/menu";
import { PageEvent } from '@angular/material/paginator';
import {Subject} from "rxjs";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
    selector: 'app-data-portal',
    templateUrl: './data-portal.component.html',
    styleUrls: ['./data-portal.component.scss']
})
export class DataPortalComponent implements OnInit, AfterViewInit {
    codes = {
        m: 'mammals',
        d: 'dicots',
        i: 'insects',
        u: 'algae',
        p: 'protists',
        x: 'molluscs',
        t: 'other-animal-phyla',
        q: 'arthropods',
        k: 'chordates',
        f: 'fish',
        a: 'amphibians',
        b: 'birds',
        e: 'echinoderms',
        w: 'annelids',
        j: 'jellyfish',
        h: 'platyhelminths',
        n: 'nematodes',
        v: 'vascular-plants',
        l: 'monocots',
        c: 'non-vascular-plants',
        g: 'fungi',
        o: 'sponges',
        r: 'reptiles',
        s: 'sharks',
        y: 'bacteria',
        z: 'archea'
    };
    public isScrollBarPresent: boolean | undefined;
    displayedColumns: string[] = ['organism', 'commonName','commonNameSource',  'currentStatus', 'externalReferences'];
    dataColumnsDefination = [{name: 'Organism', label: 'organism', selected: true}, {
        name: 'Common Name',
        label: 'commonName',
        selected: true
    }, {name: 'Common Name Source', label: 'commonNameSource', selected: true},
        {name: 'Current Status', label: 'currentStatus', selected: true}, {
        name: 'External references',
        label: 'externalReferences',
        selected: true
    },
        {name: 'Submitted to Biosamples', label: 'biosamples', selected: false}, {
            name: 'Raw data submitted to ENA',
            label: 'raw_data',
            selected: false
        }, {name: 'Assemblies submitted to ENA', label: 'assemblies_status', selected: false}, {
            name: 'Annotation complete',
            label: 'annotation_complete',
            selected: false
        },
        {name: 'Annotation submitted to ENA', label: 'annotation_status', selected: false}]

    data: any;

    searchValue: string | undefined;
    searchChanged = new EventEmitter<any>();
    filterChanged = new EventEmitter<any>();

    resultsLength = 0;
    isLoadingResults = true;
    isRateLimitReached = false;
    aggregations: any;

    activeFilters = new Array<string>();
    urlAppendFilterArray = new Array<string>();
    isSelected: boolean | false | undefined;

    currentClass = 'kingdom';
    classes = ["superkingdom", "kingdom", "subkingdom", "superphylum", "phylum", "subphylum", "superclass", "class",
        "subclass", "infraclass", "cohort", "subcohort", "superorder", "order", "suborder", "infraorder", "parvorder",
        "section", "subsection", "superfamily", "family", " subfamily", " tribe", "subtribe", "genus", "series", "subgenus",
        "species_group", "species_subgroup", "species", "subspecies", "varietas", "forma"];
    timer: any;
    phylogenyFilters: string[] = [];

    preventSimpleClick = false;
    searchUpdate = new Subject<string>();
    // @ts-ignore
    @ViewChild(MatSort) sort: MatSort;

    @ViewChild(MatMenuTrigger)
    // @ts-ignore
    public columnsManagerMenuTrigger: MatMenuTrigger;
    @Input()
        // @ts-ignore
    pageIndex: number = 0;

    @Input()
        // @ts-ignore
    pageSizeOptions: number[] = [10,20,50,100];

    @Input()
        // @ts-ignore
    pageSize: number = 10;

    isFilterSelected = false;
    selectedFilterValue = '';
    @Output()
    // @ts-ignore
    readonly page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();


    constructor(private _apiService: ApiService,private activatedRoute: ActivatedRoute, private router: Router ) {
        this.searchUpdate.pipe(
            debounceTime(500),
            distinctUntilChanged()).subscribe(
            value => {
                this.searchChanged.emit();
            }
        );
    }


    isOpen = false;

    ngOnInit(): void {
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
                        this.currentClass, this.phylogenyFilters, 'data_portal_index'
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
                    this.resultsLength = data.count;
                    this.aggregations = data.aggregations;
                    return data.results;
                }),
            )
            .subscribe(data => {
            this.data = data;
        });
    }

    expanded() {
    }

    showSelectedColumn(selectedColumn: any, checked: any) {
        let index = this.dataColumnsDefination.indexOf(selectedColumn);
        let item = this.dataColumnsDefination[index];
        item.selected = checked.currentTarget.checked;
        this.dataColumnsDefination[index] = item;
        this.getDisplayedColumns();
        // this.updateActiveRouteParams();
        this.filterChanged.emit();
    }




    getDisplayedColumns() {
        this.displayedColumns = [];
        this.dataColumnsDefination.forEach(obj => {
            if (obj.selected) {
                // @ts-ignore
                this.displayedColumns.push(obj.label)
            }
        });
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



    onFilterClick(filterName:String , filterValue: string) {
        console.log('double click');
        this.preventSimpleClick = true;
        clearTimeout(this.timer);
        const index = this.activeFilters.indexOf(filterValue);
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
        // this.filterChanged.emit();
    }

    changeCurrentClass(filterValue: string) {
        console.log('single click');
        let delay = 200;
        this.preventSimpleClick = false;
        this.timer = setTimeout(() => {
            if (!this.preventSimpleClick) {
                this.phylogenyFilters.push(`${this.currentClass}:${filterValue}`);
                const index = this.classes.indexOf(this.currentClass) + 1;
                this.currentClass = this.classes[index];
                console.log(this.phylogenyFilters);
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

    getStyle(status: string) {
        if (status === 'Annotation Complete') {
            return 'background-color: limegreen; color: black';
        } else {
            return 'background-color: yellow; color: black';
        }

    }

    getStatusClass(status: string) {
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

    getCommonNameSourceStyle(source: string) {
        if (source === 'UKSI') {
            return 'background-color: yellow; color: black';
        } else {
            return 'background-color: cornflowerblue; color: white';
        }
    }

    // @ts-ignore
    generateTolidLink(data: any) {
        const organismName = data.organism.split(' ').join('_');
        if (typeof (data.tolid) === 'string') {
            const firstChar: string = data.tolid[0].charAt(0);
            const clade = this.codes[firstChar as keyof typeof this.codes];
            return `https://tolqc.cog.sanger.ac.uk/darwin/${clade}/${organismName}`;

        } else {
            if (data.tolid.length > 0) {
                const firstChar: string = data.tolid[0].charAt(0);
                const clade = this.codes[firstChar as keyof typeof this.codes];
                return `https://tolqc.cog.sanger.ac.uk/darwin/${clade}/${organismName}`;
            }
        }
    }

    checkGenomeNotes(data: any) {
        if (data.genome_notes && data.genome_notes.length !== 0) {
            return true;
        } else {
            return false;
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
    checkStyle(filterValue: string) {
        if (this.activeFilters.includes(filterValue)) {
            return 'background-color: cornflowerblue; color: white;';
        } else {
            return '';
        }
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

        }else if(key.toLowerCase() == 'phylogeny'){
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

}
