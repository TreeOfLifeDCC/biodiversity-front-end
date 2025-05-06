import {AfterViewInit, Component, OnInit,  ViewChild, ChangeDetectorRef} from '@angular/core';
import { ActivatedRoute, RouterLink } from "@angular/router";
import {ApiService} from "../../api.service";
import { MatTableDataSource as MatTableDataSource, MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef,
    MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow } from "@angular/material/table";
import { MatSort, MatSortHeader } from "@angular/material/sort";
import {MatPaginator as MatPaginator} from "@angular/material/paginator";
import { MatCard, MatCardTitle, MatCardActions } from '@angular/material/card';
import {NgClass, NgStyle, NgTemplateOutlet} from '@angular/common';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatInput } from '@angular/material/input';
import { MatTableExporterModule } from 'mat-table-exporter';
import { MatAnchor } from '@angular/material/button';
import {MatChip, MatChipSet} from '@angular/material/chips';
import { MatExpansionPanel, MatExpansionPanelHeader } from '@angular/material/expansion';
import {MapClusterComponent} from "../../map-cluster/map-cluster.component";
import {DomSanitizer, SafeHtml, SafeResourceUrl} from "@angular/platform-browser";
import {MatIcon} from "@angular/material/icon";
import {MatDivider} from "@angular/material/divider";
import {MatLine} from "@angular/material/core";
import {MatList, MatListItem} from "@angular/material/list";
import {FormsModule} from "@angular/forms";


@Component({
    selector: 'app-data-portal-details',
    templateUrl: './data-portal-details.component.html',
    styleUrls: ['./data-portal-details.component.css'],
    standalone: true,
    imports: [MatCard, MatCardTitle, MatCardActions, MatTabGroup, MatTab, MatProgressSpinner, MatInput, MatTable,
        MatSort, MatTableExporterModule, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatSortHeader, MatCellDef,
        MatCell, MatAnchor, RouterLink, MatChip, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatNoDataRow,
        MatPaginator, MatExpansionPanel, MatExpansionPanelHeader, NgStyle, MapClusterComponent, NgTemplateOutlet, NgClass, MatIcon, MatDivider, MatLine, MatList, MatListItem, MatChipSet, FormsModule]
})
export class DataPortalDetailsComponent implements OnInit, AfterViewInit {
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
    organismData: any;
    metadataDisplayedColumns: string[] = ['accession', 'organism', 'commonName', 'sex', 'organismPart', 'trackingSystem'];
    annotationsDisplayedColumns: string[] = ['species', 'accession', 'annotation_gtf', 'annotation_gff3', 'proteins',
        'transcripts', 'softmasked_genome', 'repeat_library', 'other_data', 'view_in_browser']
    assembliesDisplayedColumns: string[] = ['accession', 'version', 'assembly_name', 'description'];
    filesDisplayedColumns: string[] = ['study_accession', 'sample_accession', 'experiment_accession', 'run_accession',
        'tax_id', 'scientific_name', 'fastq_ftp', 'submitted_ftp', 'sra_ftp', 'library_construction_protocol']
    goatDisplayedColumns: string[] = ['name', 'value', 'count', 'aggregation_method', 'aggregation_source'];

    humanReadableColumns = {
        study_accession: 'Study Accession',
        sample_accession: 'Sample Accession',
        experiment_accession: 'Experiment Accession',
        run_accession: 'Run Accession',
        tax_id: 'Tax ID',
        scientific_name: 'Scientific Name',
        fastq_ftp: 'FASTQ FTP',
        submitted_ftp: 'Submitted FTP',
        sra_ftp: 'SRA FTP',
        library_construction_protocol: 'Library Construction Protocol'
    };

    specialColumns = ['fastq_ftp', 'submitted_ftp', 'sra_ftp']

    metadataData: any;
    metadataDataLength: number | undefined;
    annotationData: any;
    annotationDataLength: number | undefined;
    assembliesData: any;
    assembliesDataLength: number | undefined;
    filesData: any;
    filesDataLength: number | undefined;
    goatData: any;
    goatDataLength: number | undefined;
    goatDataLink: string | undefined;

    resultsLength = 0;
    isLoadingResults = true;
    isRateLimitReached = false;
    popupImage: string | null = null;
    showMetadata = false;
    showData = false;
    showGenomeNote = false;
    aggregations : any;
    activeFilters:any = [];
    searchText = '';
    searchSymbiontsText = '';
    searchRelatedmetaGenomesText='';
    filters = {
        sex: {},
        trackingSystem: {},
        organismPart: {}
    };

    showAllFilters = {
        metadataTab: {
            sex: false,
            organismPart: false,
            trackingSystem: false,
        },
        symbiontsTab: {
            sex: false,
            organismPart: false,
            trackingSystem: false,
        },
        metagenomesTab: {
            sex: false,
            organismPart: false,
            trackingSystem: false,
        }
    };

    metadataSexFilters: any = [];
    metadataTrackingSystemFilters: any  = [];
    metadataOrganismPartFilters: any= [];

    symbiontsSexFilters: any = [];
    symbiontsTrackingSystemFilters: any = [];
    symbiontsOrganismPartFilters: any = [];

    metagenomesSexFilters: any = [];
    metagenomesTrackingSystemFilters: any = [];
    metagenomesOrganismPartFilters: any = [];

    filterJson = {
        sex: '',
        organismPart: '',
        trackingSystem: '',
        search: ''
    };
    geoLocation: boolean = false;
    orgGeoList: any;
    specGeoList: any;
    nbnatlas: any = [];
    nbnatlasMapUrl: string = '';
    url: SafeResourceUrl = '';
    height = 200;
    width = 200;
    loader = '../../assets/200.gif';
    isLoading: boolean = true;


    @ViewChild("tabgroup", { static: false }) tabgroup: MatTabGroup = <MatTabGroup>{};
    @ViewChild('metadataPaginator') metadataPaginator: MatPaginator | undefined;
    @ViewChild('metadataSort') metadataSort: MatSort | undefined;
    @ViewChild('annotationPaginator') annotationPaginator: MatPaginator | undefined;
    @ViewChild('annotationSort') annotationSort: MatSort | undefined;
    @ViewChild('assembliesPaginator') assembliesPaginator: MatPaginator | undefined;
    @ViewChild('assembliesSort') assembliesSort: MatSort | undefined;
    @ViewChild('filesPaginator') filesPaginator: MatPaginator | undefined;
    @ViewChild('filesSort') filesSort: MatSort  | undefined;
    @ViewChild(MapClusterComponent) mapComponent!: MapClusterComponent;

    specSymbiontsTotalCount: number | undefined;
    dataSourceSymbiontsAssembliesCount: number | undefined;
    dataSourceSymbiontsAssemblies: any;
    displayedColumnsAssemblies = ['accession', 'assembly_name', 'description', 'version'];
    dataSourceMetagenomesAssembliesCount: any;
    dataSourceMetagenomesAssemblies: any;
    dataSourceSymbiontsRecords: any;
    metagenomesRecordsTotalCount: number | undefined;
    dataSourceMetagenomesRecords: any;

    @ViewChild('metagenomesRecordsPaginator') metPaginator: MatPaginator  | undefined;
    @ViewChild('metagenomesRecordsSort') metSort: MatSort  | undefined;
    @ViewChild('assembliesMetagenomesPaginator') assembliesMetPaginator: MatPaginator  | undefined;
    @ViewChild('assembliesMetagenomesSort') assembliesMetSort: MatSort | undefined;

    specDisplayedColumns = ['accession', 'organism', 'commonName', 'sex', 'organismPart', 'trackingSystem'];

    @ViewChild('relatedSymbiontsPaginator') symPaginator: MatPaginator  | undefined;
    @ViewChild('assembliesSymbiontsPaginator') asSymPaginator: MatPaginator  | undefined;
    @ViewChild('relatedSymbiontsSort') relatedSymbiontsSort: MatSort  | undefined;
    @ViewChild('assembliesSymbiontsSort') assembliesSymbiontsSort: MatSort  | undefined;


    constructor(private route: ActivatedRoute,
                private _apiService: ApiService,
                private sanitizer: DomSanitizer,
                private changeDetectorRef: ChangeDetectorRef) {
        this.isLoading = true;
    }

    ngOnInit(): void {
        this.geoLocation = false;
    }

    ngAfterViewInit() {
        const routeParams = this.route.snapshot.paramMap;
        const organismId = routeParams.get('organismId');

        this._apiService.getDetailsData(organismId).subscribe(data => {
                this.isLoadingResults = false;
                this.isRateLimitReached = data === null;
                this.aggregations = data.aggregations;
                this.organismData = data.results[0]['_source'];
                this.getFilters();
                // Geo Location maps
                this.orgGeoList = this.organismData.orgGeoList;
                this.specGeoList = this.organismData.specGeoList;

                if (this.orgGeoList && this.orgGeoList.length > 0) {
                    this.geoLocation = true;
                }

                // NBN Atlas
                this.nbnatlas = this.organismData?.nbnatlas;
                if (this.nbnatlas != null) {
                    const imgUrl = 'https://easymap.nbnatlas.org/Image?tvk=' + this.nbnatlas.split('/')[4] +
                        '&ref=0&w=400&h=600&b0fill=6ecc39&title=0' ;
                    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(imgUrl);
                    this.nbnatlasMapUrl = 'https://records.nbnatlas.org/occurrences/search?q=lsid:' +
                        this.nbnatlas.split('/')[4] +
                        '+&nbn_loading=true&fq=-occurrence_status%3A%22absent%22#tab_mapView';
                }

                this.metadataData = new MatTableDataSource(data.results[0]['_source']['records']);

                this.metadataDataLength = data.results[0]['_source']['records'] ? data.results[0]['_source']['records'].length : 0;

                this.annotationData = new MatTableDataSource(data.results[0]['_source']['annotation']);
                this.annotationDataLength = data.results[0]['_source']['annotation']  ? data.results[0]['_source']['annotation'].length : 0;

                this.assembliesData = new MatTableDataSource(data.results[0]['_source']['assemblies']);
                this.assembliesDataLength = data.results[0]['_source']['assemblies']  ? data.results[0]['_source']['assemblies'].length : 0;

                this.filesData = new MatTableDataSource(data.results[0]['_source']['experiment']);
                this.filesDataLength = data.results[0]['_source']['experiment']  ? data.results[0]['_source']['experiment'].length :0 ;
                if (data.results[0]['_source']['goat_info'] !== undefined){
                    this.goatData = new MatTableDataSource(data.results[0]['_source']['goat_info']['attributes'] )
                    this.goatDataLength = data.results[0]['_source']['goat_info']['attributes'] ? data.results[0]['_source']['goat_info']['attributes'].length : 0 ;
                    this.goatDataLink = data.results[0]['_source']['goat_info']['url'];
                }else {
                    this.goatData = new MatTableDataSource(data.results[0]['_source']['goat_info'] == undefined ? null: data.results[0]['_source']['goat_info']['attributes'])
                    this.goatDataLength = 0;
                    this.goatDataLink ="";
                }

                if (data.results[0]['_source']['metagenomes_records']!== undefined && data.results[0]['_source']['metagenomes_records'].length) {
                    this.dataSourceMetagenomesRecords = new MatTableDataSource<any>(data.results[0]['_source']['metagenomes_records']);
                    this.metagenomesRecordsTotalCount = data.results[0]['_source']['metagenomes_records'] ? data.results[0]['_source']['metagenomes_records'].length : 0;

                } else {
                    this.dataSourceMetagenomesRecords = new MatTableDataSource();
                    this.metagenomesRecordsTotalCount = 0;
                }


                if (data.results[0]['_source']['symbionts_records']!== undefined && data.results[0]['_source']['symbionts_records'].length) {
                    this.dataSourceSymbiontsRecords = new MatTableDataSource<any>(data.results[0]['_source']['symbionts_records']);
                    this.specSymbiontsTotalCount = data.results[0]['_source']['symbionts_records'] ? data.results[0]['_source']['symbionts_records'].length : 0;
                } else {
                    this.dataSourceSymbiontsRecords = new MatTableDataSource();
                    this.specSymbiontsTotalCount = 0;
                }


                if (data.results[0]['_source']['symbionts_assemblies']!== undefined && data.results[0]['_source']['symbionts_assemblies'].length) {
                    this.dataSourceSymbiontsAssemblies = new MatTableDataSource<any>(data.results[0]['_source']['symbionts_assemblies']);
                    this.dataSourceSymbiontsAssembliesCount = data.results[0]['_source']['symbionts_assemblies'] ? data.results[0]['_source']['symbionts_assemblies'].length : 0;
                } else {
                    this.dataSourceSymbiontsAssemblies = new MatTableDataSource();
                    this.dataSourceSymbiontsAssembliesCount = 0;
                }
                if (data.results[0]['_source']['metagenomes_assemblies']!== undefined && data.results[0]['_source']['metagenomes_assemblies'].length) {
                    this.dataSourceMetagenomesAssemblies = new MatTableDataSource<any>(data.results[0]['_source']['metagenomes_assemblies']);
                    this.dataSourceMetagenomesAssembliesCount = data.results[0]['_source']['metagenomes_assemblies'] ? data.results[0]['_source']['metagenomes_assemblies'].length : 0;

                } else {
                    this.dataSourceMetagenomesAssemblies = new MatTableDataSource();
                    this.dataSourceMetagenomesAssembliesCount = 0;
                }

                if (data.results[0]['_source']['records'] && data.results[0]['_source']['records'].length > 0) {
                    this.showMetadata = true;
                }
                if (data.results[0]['_source']['annotation'] && data.results[0]['_source']['annotation'].length > 0 ||
                    data.results[0]['_source']['assemblies'].length > 0 || data.results[0]['_source']['experiment'].length > 0) {
                    this.showData = true;
                }
                if (data.results[0]['_source']['genome_notes'] && data.results[0]['_source']['genome_notes'].length !== 0) {
                    this.showGenomeNote = true;
                }

                setTimeout(() => {
                    this.assembliesData.paginator = this.assembliesPaginator;
                    this.assembliesData.sort = this.assembliesSort;
                    this.filesData.paginator = this.filesPaginator;
                    this.filesData.sort = this.filesSort;

                    this.dataSourceMetagenomesAssemblies.paginator = this.assembliesMetPaginator;
                    this.dataSourceMetagenomesAssemblies.sort = this.assembliesMetSort;
                    this.dataSourceMetagenomesRecords.paginator = this.metPaginator;
                    this.dataSourceMetagenomesRecords.sort = this.metSort;

                    this.metadataData.paginator = this.metadataPaginator;
                    this.metadataData.sort = this.metadataSort;
                    this.annotationData.paginator = this.annotationPaginator;
                    this.annotationData.sort = this.annotationSort;
                }, 50)
            }
        );

        this.tabgroup.selectedTabChange.subscribe(event => {
            if (event.index === 4) {
                setTimeout(() => this.triggerMapInit(), 300);
            }
        });
    }


    triggerMapInit() {
        if (this.mapComponent) {
            this.mapComponent.initMap();
        }
    }

    applyFilter(label: string, filterValue: string, dataSource: MatTableDataSource<any>, tabName: string): void {
        // reset showAllFilters
        this.showAllFilters = {
            metadataTab: { sex: false, organismPart: false, trackingSystem: false },
            symbiontsTab: { sex: false, organismPart: false, trackingSystem: false },
            metagenomesTab: { sex: false, organismPart: false, trackingSystem: false }
        };

        // @ts-ignore
        const index = this.activeFilters.indexOf(filterValue);
        this.createFilterJson(label, filterValue, dataSource);
        if (index !== -1) {
            this.removeFilter(filterValue, dataSource, tabName);
        } else {
            if (label !== 'search') {
                // @ts-ignore
                this.activeFilters.push(filterValue);
            }

            dataSource.filter = JSON.stringify(this.filterJson);
            if (tabName === 'metadataTab') {
                this.generateFilters(dataSource.filteredData, 'metadata');
            } else if (tabName === 'symbiontsTab') {
                this.generateFilters(dataSource.filteredData, 'symbionts');
            } else if (tabName === 'metagenomesTab') {
                this.generateFilters(dataSource.filteredData, 'metagenomes');
            }
        }
    }

    getHumanReadableName(key: string) {
        return this.humanReadableColumns[key as keyof typeof this.humanReadableColumns];
    }

    keyInSpecialColumns(key: string) {
        return this.specialColumns.indexOf(key) !== -1;
    }

    getKeyFromSpecialColumns(key: string) {
        if (key) {
            const length = key.split("/").length;
            return key.split("/")[length - 1];
        } else {
            return null;
        }
    }

    getStudyLink(study_id: string) {
        return `https://www.ebi.ac.uk/ena/browser/view/${study_id}`;
    }

    generateUrl(link: string){
        if (!link.startsWith('http')) {
            return "https://" + link;
        }
        return link;
    }
    getGenomeNoteData(data: any, key: string) {
        if (data && data.length !== 0) {
            return data[0][key];
        }
    }

    generateTolidLink(data: any) {
        const organismName = data.organism.split(' ').join('_');
        const firstChar: string = data.tolid.charAt(0);
        const clade = this.codes[firstChar as keyof typeof this.codes];
        return `https://tolqc.cog.sanger.ac.uk/darwin/${clade}/${organismName}`;
    }
    typeofTol(tolid: any) {
        if (typeof(tolid) === 'string'){
            return tolid;
        }else{
            return tolid.join(', ');
        }
    }

    getStyle(status: string) {
        if (status === 'Annotation Complete') {
            return 'background-color: limegreen; color: black';
        } else {
            return 'background-color: yellow; color: black';
        }
    }

    hideLoader(){
        this.isLoading = false;
    }

    sanitizeHTML(content: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(content);
    }

    openPopup(imageUrl: string) {
        this.popupImage = imageUrl;
    }

    closePopup() {
        this.popupImage = null;
    }

    removeFilter(filter: string, dataSource: MatTableDataSource<any>, tabName: string) {
        if (filter !== undefined) {
            // @ts-ignore
            const filterIndex = this.activeFilters.indexOf(filter);
            if (this.activeFilters.length !== 0) {
                this.spliceFilterArray(filter);
                this.activeFilters.splice(filterIndex, 1);
                dataSource.filter = JSON.stringify(this.filterJson);
                if (tabName === 'metadataTab') {
                    this.generateFilters(dataSource.filteredData, 'metadata');
                } else if (tabName === 'symbiontsTab') {
                    this.generateFilters(dataSource.filteredData, 'symbionts');
                }else if (tabName === 'metagenomesTab') {
                        this.generateFilters(dataSource.filteredData, 'metagenomes');
                    }

            } else {
                this.filterJson.sex = '';
                this.filterJson.organismPart = '';
                this.filterJson.trackingSystem = '';
                dataSource.filter = JSON.stringify(this.filterJson);
                // this.getBiosampleById();
            }
        }
    }

    spliceFilterArray(filter: string) {
        if (this.filterJson.sex === filter) {
            this.filterJson.sex = '';
        } else if (this.filterJson.organismPart === filter) {
            this.filterJson.organismPart = '';
        } else if (this.filterJson.trackingSystem === filter) {
            this.filterJson.trackingSystem = '';
        }
    }

    getFilters() {
        this.metadataSexFilters = this.aggregations.metadata_filters.sex_filter.buckets;
        this.metadataTrackingSystemFilters = this.aggregations.metadata_filters.tracking_status_filter.buckets;
        this.metadataOrganismPartFilters = this.aggregations.metadata_filters.organism_part_filter.buckets;

        this.symbiontsSexFilters = this.aggregations.symbionts_filters.sex_filter.buckets;
        this.symbiontsTrackingSystemFilters = this.aggregations.symbionts_filters.tracking_status_filter.buckets;
        this.symbiontsOrganismPartFilters = this.aggregations.symbionts_filters.organism_part_filter.buckets;

        this.metagenomesSexFilters = this.aggregations.metagenomes_filters.sex_filter.buckets;
        this.metagenomesTrackingSystemFilters = this.aggregations.metagenomes_filters.tracking_status_filter.buckets;
        this.metagenomesOrganismPartFilters = this.aggregations.metagenomes_filters.
            organism_part_filter.buckets;
    }


    generateFilters(data: any, filterType: string) {
        const filters = {
            sex: {},
            trackingSystem: {},
            organismPart: {},
        };

        // @ts-ignore
        this[`${filterType}SexFilters`] = [];
        // @ts-ignore
        this[`${filterType}TrackingSystemFilters`] = [];
        // @ts-ignore
        this[`${filterType}OrganismPartFilters`] = [];

        // generate filter counts
        for (const item of data) {
            if (item.sex != null) {
                // @ts-ignore
                filters.sex[item.sex] = (filters.sex[item.sex] || 0) + 1;
            }
            if (item.trackingSystem != null) {
                // @ts-ignore
                filters.trackingSystem[item.trackingSystem] = (filters.trackingSystem[item.trackingSystem] || 0) + 1;
            }
            if (item.organismPart != null) {
                // @ts-ignore
                filters.organismPart[item.organismPart] = (filters.organismPart[item.organismPart] || 0) + 1;
            }
        }

        const createFilterArray = (filterObj: { [s: string]: unknown; } | ArrayLike<unknown>) =>
            Object.entries(filterObj).map(([key, doc_count]) => ({key, doc_count}));

        // @ts-ignore
        this[`${filterType}SexFilters`] = createFilterArray(filters.sex);
        // @ts-ignore
        this[`${filterType}TrackingSystemFilters`] = createFilterArray(filters.trackingSystem);
        // @ts-ignore
        this[`${filterType}OrganismPartFilters`] = createFilterArray(filters.organismPart);
    }



    createFilterJson(key:any, value:any, dataSource:any) {
        if (key === 'sex') {
            this.filterJson.sex = value;
        } else if (key === 'organismPart') {
            this.filterJson.organismPart = value;
        } else if (key === 'trackingSystem') {
            this.filterJson.trackingSystem = value;
        } else if (key === 'search') {
            this.filterJson.search = value.toLowerCase();
        }

        dataSource.filterPredicate = (data:any, filter:any): boolean => {
            const filterObj: {
                sex: string,
                organismPart: string,
                trackingSystem: string,
                search: string
            } = JSON.parse(filter);

            const sex = !filterObj.sex || data.sex === filterObj.sex;
            const organismPart = !filterObj.organismPart || data.organismPart === filterObj.organismPart;
            const trackingSystem = !filterObj.trackingSystem || data.trackingSystem === filterObj.trackingSystem;

            // apply text search on fields
            const searchText = filterObj.search?.toLowerCase() || '';
            const searchMatch = !searchText ||
                data.sex?.toLowerCase().includes(searchText) ||
                data.organismPart?.toLowerCase().includes(searchText) ||
                data.trackingSystem?.toLowerCase().includes(searchText) ||
                data.accession?.toLowerCase().includes(searchText) ||
                data.commonName?.toLowerCase().includes(searchText);

            return sex && organismPart && trackingSystem && searchMatch;
        };
    }


    toggleFilter(key1: string, key2: string): void {
        // @ts-ignore
        this.showAllFilters[key1][key2] = !this.showAllFilters[key1][key2];
    }

    // @ts-ignore
    checkFilterIsActive(filter: string) {
        // @ts-ignore
        if (this.activeFilters.indexOf(filter) !== -1) {
            return 'background-color: cornflowerblue; color: white;';
            ;
        }
    }

    filesSearch(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.filesData.filter = filterValue.trim().toLowerCase();
    }

    assembliesSearch(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.assembliesData.filter = filterValue.trim().toLowerCase();
    }

    annotationSearch(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.annotationData.filter = filterValue.trim().toLowerCase();
    }

    getSearchResults(dataType: string) {

        if (dataType === 'relatedOrganisms') {
            this.applyFilter('search', this.searchText, this.metadataData, 'metadataTab');
        }

        if (dataType === 'relatedSymbionts') {
            this.applyFilter('search', this.searchSymbiontsText, this.dataSourceSymbiontsRecords, 'symbiontsTab');
        }
        if (dataType === 'relatedMetaGenomes') {
            this.applyFilter('search', this.searchRelatedmetaGenomesText, this.dataSourceMetagenomesRecords, 'metagenomesTab');
        }

    }

    resetDataset(tabName: string){
        this.activeFilters = [];
        this.searchText = '';
        this.searchSymbiontsText = '';
        this.searchRelatedmetaGenomesText = '';
        this.filterJson = {
            sex: '',
            organismPart: '',
            trackingSystem: '',
            search: ''
        };
        if (tabName === 'metadataTab' || tabName== 'Metadata') {
            this.metadataData.filterPredicate = (data: any, filter: any) => true;
            this.metadataData.filter = '';
            this.generateFilters(this.metadataData.filteredData, 'metadata' );
        } else if (tabName === 'symbiontsTab' || tabName== 'Symbionts') {
            this.dataSourceSymbiontsRecords.filterPredicate = (data: any, filter:any) => true;
            this.dataSourceSymbiontsRecords.filter = '';
            this.generateFilters(this.dataSourceSymbiontsRecords.filteredData, 'symbionts');
        } else if (tabName === 'metagenomesTab' || tabName== 'Metagenomes') {
            this.dataSourceMetagenomesRecords.filterPredicate = (data: any, filter:any) => true;
            this.dataSourceMetagenomesRecords.filter = '';
            this.generateFilters(this.dataSourceMetagenomesRecords.filteredData, 'metagenomes');
        }
    }

    tabClick({$event}: { $event: any }) {
        this.resetDataset($event.tab.textLabel);
    }

    symbiontsAssembliesSearch(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceSymbiontsAssemblies.filter = filterValue.trim().toLowerCase();
    }

    metagenomesAssembliesSearch(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceMetagenomesAssemblies.filter = filterValue.trim().toLowerCase();
    }

}
