import {Component, AfterViewInit, OnDestroy, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.markercluster';

import { NgxSpinnerService } from 'ngx-spinner';
import { FormControl } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from "../api.service";
import {merge, of as observableOf, Subject} from "rxjs";
import {catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap} from "rxjs/operators";
import {MatMenuTrigger} from "@angular/material/menu";
import {PageEvent} from "@angular/material/paginator";
import {Title} from "@angular/platform-browser";

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;


@Component({
  selector: 'app-gis',
  templateUrl: './gis.component.html',
  styleUrls: ['./gis.component.css']
})
export class GisComponent implements AfterViewInit {
// @ts-ignore
  private map;
  // @ts-ignore
  private tiles;
  // @ts-ignore
  private markers;
  toggleSpecimen = new FormControl();
  // @ts-ignore
  selectedPhylogenyFilter;
  // @ts-ignore
  unpackedData;
  phylogenyFilters: string[] = [];

  preventSimpleClick = false;
  searchUpdate = new Subject<string>();


  @ViewChild(MatMenuTrigger)
  // @ts-ignore
  public columnsManagerMenuTrigger: MatMenuTrigger;
  @Input()
      // @ts-ignore
  pageIndex: number = 0;

  @Input()
      // @ts-ignore
  pageSizeOptions: number[] = [15, 30, 50, 100];

  @Input()
      // @ts-ignore
  pageSize: number = 15;

  isFilterSelected = false;
  selectedFilterValue = '';
  @Output()
  // @ts-ignore
  readonly page: EventEmitter<PageEvent> = new EventEmitter<PageEvent>();
  myControl = new FormControl('');
  // @ts-ignore
  filteredOptions;
  radioOptions = 1;
  data: any;
  isCollapsed = true;
  itemLimit = 5;
  @Input() isShowCount = true;
  @Input() filterSize = 5;
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

  constructor(private _apiService: ApiService, private spinner: NgxSpinnerService, private activatedRoute: ActivatedRoute,
              private router: Router, private titleService: Title) {
    this.searchUpdate.pipe(
        debounceTime(500),
        distinctUntilChanged()).subscribe(
        value => {
          this.searchChanged.emit();

        }
    );
  }

  ngOnInit(): void {

    this.titleService.setTitle('Sampling Map');
    const queryParamMap = this.activatedRoute.snapshot['queryParamMap'];
    // @ts-ignore
    const params = queryParamMap['params'];
    if (Object.keys(params).length != 0) {
      for (let key in params) {
        if (key === 'phylogeny_filters') {
          this.phylogenyFilters = params[key];
          this.appendActiveFilters(key, params);
        } else if (key === 'currentClass') {
          this.currentClass = params[key];
          this.appendActiveFilters(key, params);
        } else if (key === 'phylogeny') {
          this.isFilterSelected = true;
          this.selectedFilterValue = params[key];
          this.appendActiveFilters(key, params);
        } else {
          this.appendActiveFilters(key, params);
        }


      }

    }
  }

  appendActiveFilters(key: string, params: { [x: string]: string; }) {
    // @ts-ignore
    this.urlAppendFilterArray.push({"name": key, "value": params[key]});
    if (!(key === 'phylogeny_filters' || key === 'currentClass')) {

      this.activeFilters.push(params[key]);
    }


  }



  onFilterClick(filterName:String , filterValue: string) {

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

  getStyle(status: string) {
    if (status === 'Annotation Complete') {
      return 'background-color: limegreen; color: black';
    } else {
      return 'background-color: yellow; color: black';
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
  getStatusCount(data: any) {
    if (data) {
      for (let i = 0; i < data.length; ++i) {
        if (data[i]['key'] === 'Done')
          return data[i]['doc_count'];
      }
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
    }else{
      return data;
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
  updateDomForRemovedFilter = (filter: string) => {
    // tslint:disable-next-line:triple-equals
    if (this.urlAppendFilterArray.length != 0) {
      let inactiveClassName: string;
      this.urlAppendFilterArray.filter(obj => {
        // @ts-ignore
        if(obj.value === filter && obj.name === 'phylogeny'){
          this.isFilterSelected = false;
          this.selectedFilterValue = '';
          // @ts-ignore
          const filterIndex1 = this.urlAppendFilterArray.findIndex(a => a.name === 'currentClass');
          this.urlAppendFilterArray.splice(filterIndex1, 1);
          // @ts-ignore
          const filterIndex2 = this.urlAppendFilterArray.findIndex(a => a.name === 'phylogeny_filters')
          this.urlAppendFilterArray.splice(filterIndex2, 1);
          // @ts-ignore
          const filterIndex3 =  this.urlAppendFilterArray.findIndex(a => a.name === 'phylogeny');
          this.urlAppendFilterArray.splice(filterIndex3, 1);
          // @ts-ignore
        }else if(obj.value === filter && obj.name !== 'phylogeny'){
          const filterIndex = this.urlAppendFilterArray.indexOf(obj);
          this.urlAppendFilterArray.splice(filterIndex, 1);
        }


      });
    }
  }
  toggleSpecimens() {
    // @ts-ignore
    if ( document.getElementById("speciesandSpecimens").checked) {
      // this.radioOptions = 3;
      this.spinner.show();
      this.refreshMapLayers();
      setTimeout(() => {
        this.setMarkers();
        this.getAllLatLong();
        this.map.addLayer(this.markers);
        if (this.myControl.value == ''){
          this.resetMapView();
        }
        this.spinner.hide();
      }, 50);
      // @ts-ignore
    } else  if (document.getElementById("species").checked) {
      // this.radioOptions = 1;
       this.spinner.show();
      this.refreshMapLayers();
      setTimeout(() => {
        this.setMarkers();
        this.getSpecicesLatLong();
        this.map.addLayer(this.markers);
        if (this.myControl.value == ''){
          this.resetMapView();
        }
        this.spinner.hide();
      }, 50);
    }
  }
  ngAfterViewInit() {
    // If the user changes the metadataSort order, reset back to the first page.

    this.searchChanged.subscribe(() => (this.pageIndex = 0));
    this.filterChanged.subscribe(() => (this.pageIndex = 0));

    merge(this.page, this.searchChanged, this.filterChanged)
        .pipe(
            startWith({}),
            switchMap(() => {
              this.isLoadingResults = true;
              // this.spinner.show();
              return this._apiService.getGistData( this.searchValue, this.activeFilters,
                  this.currentClass, this.phylogenyFilters
              ).pipe(catchError(() => observableOf(null)));
            }),
            map(data => {
              // Flip flag to show that loading has finished.
              this.isLoadingResults = false;
              this.isRateLimitReached = data === null;
              const unpackedData = [];
              for (const item of  data.results) {
                unpackedData.push(this.unpackData(item));
              }
              this.unpackedData = unpackedData;
              if (data === null) {
                return [];
              }
              this.resultsLength = data.count;
              this.aggregations = data.aggregations;
              this.initMap();
              this.populateMap();
              this.showCursorCoordinates();
              return data.results;
            }),
        )
        .subscribe(data => {
          this.data = data;
        });
  }

  unpackData(data: any) {
    data = data._source;
    return data;
  }

  private initMap(): void {
    this.tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 10,
      minZoom: 2,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    const latlng = L.latLng([20.0, 5.0]);

    this.map = L.map('map', {
      center: latlng,
      zoom: 3,
      layers: [this.tiles],
    });

  }

  populateMap() {
    this.setMarkers();
    this.getSpecicesLatLong();
    this.map.addLayer(this.markers);
  }

  setMarkers() {
    this.markers = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      removeOutsideVisibleBounds: false
    });

    this.markers.on('clusterclick', function(a: { layer: { _childClusters: any; spiderfy: () => void; }; }) {
      const childCluster = a.layer._childClusters;
      if (childCluster.length <= 1) {
        a.layer.spiderfy();
      }
    });
  }
  searchGisData = () => {
    this.isLoadingResults=true;
    this.getSearchData(this.searchValue)
  }

  getSearchData(search: any) {
    // @ts-ignore
    document.getElementById("species").checked= true;

    this._apiService.getGistData( this.searchValue, this.activeFilters,
        this.currentClass, this.phylogenyFilters
    ).subscribe(data => {
                  // Flip flag to show that loading has finished.
               this.isLoadingResults = false;
               this.isRateLimitReached = data === null;
               const unpackedData = [];
               this.unpackedData = [];
               // @ts-ignore
                  for (const item of data.results) {
                 unpackedData.push(this.unpackData(item));
               }
               this.resultsLength = data.count;
               this.aggregations = data.aggregations;
               this.unpackedData = unpackedData;
               this.refreshMapLayers();
               setTimeout(() => {
                 this.populateMap();
                 if (this.unpackedData.length > 0) {
                   const lat = this.unpackedData[0].organisms[0].lat;
                   const lng = this.unpackedData[0].organisms[0].lng;
                   this.map.setView([lat, lng], 9);
                 }
                 else {
                   this.resetMapView();
                 }

               }, 100);
            },
            (err: any) => {
              console.log(err);
              this.spinner.hide();
            }
        );



  }


  filterSearchResults() {

    // @ts-ignore
    if (this.searchValue != '' && this.searchValue.length > 1) {
      // @ts-ignore
      const filterValue = this.searchValue.toLowerCase();
      // @ts-ignore
      this.filteredOptions = this.unpackedData.filter((option: { id: string | undefined; }) => {
        if (option.id != undefined) {
          if (option.id.toLowerCase().includes(filterValue)) {
            return option.id;
          }
        }
      });
    }
    else {
      console.log('ddsfdsf');
      this.isLoadingResults = true;
      this.filteredOptions = [];
      this.searchGisData()
    }
  }


  getSpecicesLatLong(): any {
    const orgGeoSize = this.unpackedData.length;
    for (let i = 0; i < orgGeoSize; i++) {
      if (Object.keys(this.unpackedData[i]).length !== 0) {

        const tempArr = this.unpackedData[i].organisms;

        const tempArrSize = tempArr === undefined ? 0 : tempArr.length;

        for (let j = 0; j < tempArrSize; j++) {

          if (tempArr[j].lat != 'not collected' && tempArr[j].lat != 'not provided') {
            let llat: any;
            let llng: any;
            if (tempArr[j].lat == '67.34.07' && tempArr[j].lng == '68.07.30') {
              llat = '67.3407';
              llng = '68.0730';
            } else {
              llat = parseFloat(tempArr[j].lat.replace(',','.').replace(' ',''));
              llng = parseFloat(tempArr[j].lng.replace(',','.').replace(' ',''));
            }
            const latlng = L.latLng(llat, llng);

            let alreadyExists = false;
            if ((this.markers !== undefined && this.markers.getLayers() !== undefined)) {
              this.markers.getLayers().forEach((layer: { getLatLng: () => { (): any; new(): any; equals: { (arg0: L.LatLng): any; new(): any; }; }; options: { title: any; }; }) => {
                if (!alreadyExists && layer instanceof L.Marker && (layer.getLatLng().equals(latlng)) && layer.options.title === tempArr[j].organism) {
                  alreadyExists = true;
                }
              });
            }
            let popupcontent = '';
            if (!alreadyExists) {
              const m = L.marker(latlng);
              const organismString = encodeURIComponent(tempArr[j].organism.toString());
              const organism = `<div><a target="_blank" href=/biodiversity/data_portal/${organismString}>${tempArr[j].organism}</a></div>`;
              const commonName = tempArr[j].commonName != null ? `<div>${tempArr[j].commonName}</div>` : '';
              popupcontent = organism + commonName ;
              const popup = L.popup({
                closeOnClick: false,
                autoClose: true,
                closeButton: false
              }).setContent(popupcontent);
              m.options.title = tempArr[j].organism;
              m.bindPopup(popup);
              this.markers.addLayer(m);
              // }
              // });
            }
          }
        }
      }
    }
  }
  getAllLatLong(): any {
    const orgGeoSize = this.unpackedData.length;

    for (let i = 0; i < orgGeoSize; i++) {
      if (Object.keys(this.unpackedData[i]).length !== 0) {
        const tempArr = this.unpackedData[i].organisms;

        const tempArrSize = tempArr === undefined ? 0 : tempArr.length;
        for (let j = 0; j < tempArrSize; j++) {
          if (tempArr[j].lat != 'not collected' && tempArr[j].lat != 'not provided') {
            let llat: any;
            let llng: any;
            if (tempArr[j].lat == '67.34.07' && tempArr[j].lng == '68.07.30') {
              llat = '67.3407';
              llng = '68.0730';
            }
            else {
              llat = parseFloat(tempArr[j].lat.replace(',','.').replace(' ',''));
              llng = parseFloat(tempArr[j].lng.replace(',','.').replace(' ',''));
            }
            const latlng = L.latLng(llat, llng);
            let popupcontent = '';
            const m = L.marker(latlng);
            const organismString = encodeURIComponent(tempArr[j].organism.toString());
            const organism = `<div><a target="_blank" href=/biodiversity/data_portal/${organismString}>${tempArr[j].organism}</a></div>`;
            const commonName = tempArr[j].commonName != null ? `<div>${tempArr[j].commonName}</div>` : '';
            popupcontent = organism + commonName ;
            const popup = L.popup({
              closeOnClick: false,
              autoClose: true,
              closeButton: false
            }).setContent(popupcontent);
            m.options.title = tempArr[j].organism;
            m.bindPopup(popup);
            this.markers.addLayer(m);
            // }
            // });

          }
        }
      }
    }

    const specGeoSize = this.unpackedData.length;
    for (let i = 0; i < specGeoSize; i++) {
      if (Object.keys(this.unpackedData[i]).length != 0 ) {
        const tempspecArr = this.unpackedData[i].specimens;
        const tempspecArrSize = tempspecArr === undefined ? 0 : tempspecArr.length;
        for (let j = 0; j < tempspecArrSize; j++) {
          if (tempspecArr[j].lat != 'not collected' && tempspecArr[j].lat != 'not provided') {
            let llat: any;
            let llng: any;
            if (tempspecArr[j].lat == '67.34.07' && tempspecArr[j].lng == '68.07.30') {
              llat = '67.3407';
              llng = '68.0730';
            }
            else {
              llat = tempspecArr[j].lat;
              llng = tempspecArr[j].lng;
            }
            const latlng = L.latLng(llat, llng);
            const m = L.marker(latlng);
            const accession = `<div><a target="_blank" href=/biodiversity/specimen/${tempspecArr[j].accession}>${tempspecArr[j].accession}</a></div>`;
            const organism = tempspecArr[j].organism != null ? `<div>${tempspecArr[j].organism}</div>` : '';
            const commonName = tempspecArr[j].commonName != null ? `<div>${tempspecArr[j].commonName}</div>` : '';
            const organismPart = `<div>${tempspecArr[j].organismPart}</div>`;
            const popupcontent = accession + organism + commonName + organismPart;
            const popup = L.popup({
              closeOnClick: false,
              autoClose: true,
              closeButton: false
            }).setContent(popupcontent);
            m.bindPopup(popup);
            this.markers.addLayer(m);
          }
        }
      }
    }
  }

  showCursorCoordinates() {
    const Coordinates = L.Control.extend({
      onAdd: (map: { addEventListener: (arg0: string, arg1: (e: any) => void) => void; }) => {
        const container = L.DomUtil.create('div');
        container.style.backgroundColor = 'rgba(255,255,255,.8)';
        map.addEventListener('mousemove', e => {
          container.innerHTML = `Lat: ${e.latlng.lat.toFixed(4)} Lng: ${e.latlng.lng.toFixed(4)}`;
        });
        return container;
      }
    });
    this.map.addControl(new Coordinates({ position: 'bottomright' }));
  }

  refreshMapLayers() {
    this.map.eachLayer((layer: any) => {
      this.map.removeLayer(layer);
    });
    this.map.addLayer(this.tiles);
  }

  resetMapView = () => {
    this.map.setView([20.0, 5.0], 3);
  }




}
