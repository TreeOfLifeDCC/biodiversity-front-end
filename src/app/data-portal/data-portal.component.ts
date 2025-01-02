import {
    AfterViewInit,
    Component,
    OnInit,
    ViewChild,
    EventEmitter,
    Input,
    Output, TemplateRef
} from '@angular/core';
import {ApiService} from "../api.service";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import {catchError, map, startWith, switchMap} from "rxjs/operators";
import {merge, of as observableOf} from "rxjs";
import {MatMenuTrigger as MatMenuTrigger} from "@angular/material/menu";
import { PageEvent as PageEvent } from '@angular/material/paginator';
import {Subject} from "rxjs";
import {debounceTime, distinctUntilChanged} from "rxjs/operators";
import {ActivatedRoute, NavigationEnd, Router, RouterLink} from "@angular/router";
import {Title} from "@angular/platform-browser";
import { MatCard, MatCardTitle, MatCardActions } from '@angular/material/card';
import { MatList, MatListItem } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';

import { MatLine } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { MatChipSet, MatChip } from '@angular/material/chips';
import {MatError, MatFormField, MatHint, MatInput} from '@angular/material/input';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';
import {
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatTableDataSource
} from '@angular/material/table';
import { MatTableExporterModule } from 'mat-table-exporter';
import {MatAnchor, MatButton} from '@angular/material/button';
import { PaginatorComponent } from '../paginator/paginator.component';
import {MatDialog, MatDialogActions, MatDialogContent} from "@angular/material/dialog";
import {FloatLabelType} from "@angular/material/form-field";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {MatProgressBar} from "@angular/material/progress-bar";

@Component({
    selector: 'app-data-portal',
    templateUrl: './data-portal.component.html',
    styleUrls: ['./data-portal.component.scss'],
    standalone: true,
    imports: [MatCard, MatCardTitle, MatCardActions, MatList, MatDivider, MatListItem, MatLine, MatIcon, MatChipSet,
        MatChip, MatInput, FormsModule, MatExpansionPanel, MatExpansionPanelHeader, MatTable, MatSort,
        MatTableExporterModule, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef, MatCell,
        MatAnchor, RouterLink, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, PaginatorComponent,
        ReactiveFormsModule, MatFormField, MatError, MatHint, MatRadioGroup, MatRadioButton, MatButton, MatDialogActions, MatDialogContent, MatProgressBar]
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

    downloadDialogTitle = '';
    dialogRef: any;
    public downloadForm!: FormGroup;
    @ViewChild('downloadTemplate') downloadTemplate = {} as TemplateRef<any>;
    readonly floatLabelControl = new FormControl('auto' as FloatLabelType);
    displayErrorMsg: boolean = false;

    data: any;
    isCollapsed = true;
    itemLimit = 5;
    @Input() isShowCount = true;
    @Input() filterSize=  5;
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
    searchUpdate = new Subject<string>();
    displayProgressBar = false;
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
    pageSizeOptions: number[] = [15,30,50,100];

    @Input()
        // @ts-ignore
    pageSize: number = 15;
    selectedFilterValue = '';
    @Output()
    // @ts-ignore
    readonly page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();


    constructor(private _apiService: ApiService,private activatedRoute: ActivatedRoute, private router: Router,
                private titleService: Title, private dialog: MatDialog ) {
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
        // reload page if user clicks on menu link
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                if (event.urlAfterRedirects === '/data_portal') {
                    this.refreshPage();
                }
            }
        });

        this.downloadForm = new FormGroup({
            downloadOption: new FormControl('', [Validators.required]),
        });

        this.titleService.setTitle('Data portal');

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
                    } else if (params[key].includes('searchValue - ')){
                        this.searchValue = params[key].split('searchValue - ')[1];
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
                        this.currentClass, this.phylogenyFilters, 'data_portal'
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

                    // add search value to URL query param
                    if (this.searchValue) {
                        this.queryParams.push(`searchValue - ${this.searchValue}`);
                    }

                    if (this.phylogenyFilters && this.phylogenyFilters.length) {
                        const index = this.queryParams.findIndex((element: any) => element.includes('phylogenyFilters - '));
                        if (index > -1) {
                            this.queryParams[index] = `phylogenyFilters - [${this.phylogenyFilters}]`;
                        } else {
                            this.queryParams.push(`phylogenyFilters - [${this.phylogenyFilters}]`);
                        }
                    }
                    // update url with the value of the phylogeny current class
                    this.updateQueryParams('phylogenyCurrentClass')

                    this.replaceUrlQueryParams();
                    return data.results;
                }),
            )
            .subscribe(data => {
            this.data = data;
        });
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
        if (filterName && filterName.startsWith('symbionts_')) {
            return 'Symbionts-' + filterName.split('-')[1];
        }
        if (filterName && filterName.startsWith('experimentType_')) {
            return  filterName.split('_')[1];
        }
        return filterName;
    }

    merge = (first: any[], second: any[], filterLabel: string) => {
        for (let i = 0; i < second.length; i++) {
            second[i].label = filterLabel;
            first.push(second[i]);
        }
        return first;
    }

    expanded() {
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
    showSelectedColumn(selectedColumn: any, checked: any) {
        let index = this.dataColumnsDefination.indexOf(selectedColumn);
        let item = this.dataColumnsDefination[index];
        item.selected = checked.currentTarget.checked;
        this.dataColumnsDefination[index] = item;
        this.getDisplayedColumns();
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

    updateQueryParams(urlParam: string){
        if (urlParam === 'phylogenyCurrentClass'){
            const queryParamIndex = this.queryParams.findIndex((element: any) => element.includes('phylogenyCurrentClass - '));
            if (queryParamIndex > -1) {
                this.queryParams[queryParamIndex] = `phylogenyCurrentClass - ${this.currentClass}`;
            } else {
                this.queryParams.push(`phylogenyCurrentClass - ${this.currentClass}`);
            }
        }
    }

    onFilterClick(filterName:String , filterValue: string, phylogenyFilter: boolean = false) {
        // phylogeny filter selection
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
            this.updateQueryParams('phylogenyCurrentClass')

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

    refreshPage() {
        clearTimeout(this.timer);
        this.activeFilters = [];
        this.phylogenyFilters = [];
        this.currentClass = 'kingdom';
        this.searchValue = '';
        this.filterChanged.emit();
        this.router.navigate([]);
    }


    openDownloadDialog(value: string) {
        this.downloadDialogTitle = `Download data`;
        this.dialogRef = this.dialog.open(this.downloadTemplate,
            { data: value, height: '300px', width: '550px' });
    }

    public displayError = (controlName: string, errorName: string) => {
        return this.downloadForm?.controls[controlName].hasError(errorName);
    }

    onDownload() {
        if (this.downloadForm?.valid && this.downloadForm?.touched) {
            this.displayProgressBar = true;
            const downloadOption = this.downloadForm.value['downloadOption']
            this.downloadFile(downloadOption, true);
        }
        this.displayErrorMsg = true;

    }

    onCancelDialog() {
        this.dialogRef.close();
    }

    downloadFile(downloadOption: string, dialog: boolean) {
        this._apiService.downloadData(downloadOption, this.pageIndex,
            this.pageSize, this.searchValue || "", this.sort.active, this.sort.direction, this.activeFilters,
            this.currentClass, this.phylogenyFilters, 'data_portal').subscribe({
            next: (response: Blob) => {
                const blobUrl = window.URL.createObjectURL(response);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = 'download.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                this.displayProgressBar = false;
                if (dialog) {
                    // close dialog box
                    setTimeout(() => {
                        this.dialogRef.close();
                    }, 500)
                }
            },
            error: error => {
                console.error('Error downloading the CSV file:', error);
            }
        });
    }

}
