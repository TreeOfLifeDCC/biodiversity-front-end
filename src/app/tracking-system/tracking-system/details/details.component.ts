// import {Component, OnInit, ViewChild} from '@angular/core';
// import {ActivatedRoute} from '@angular/router';
// import {MatSort} from '@angular/material/sort';
// import {MatPaginator} from '@angular/material/paginator';
// import {MatTableDataSource} from '@angular/material/table';
// import {StatusesService} from '../../services/statuses.service';
// import {Sample} from "../../model/tracking-system.model";
//
//
// @Component({
//   selector: 'app-details',
//   templateUrl: './details.component.html',
//   styleUrls: ['./details.component.css']
// })
// export class DetailsComponent implements OnInit {
//
//   bioSampleId: string | undefined;
//   bioSampleObj: {
//     annotation: any;
//     experiment: Sample[] | undefined; assemblies: any[] | undefined;
//   } | undefined;
//   dataSourceFiles: MatTableDataSource<Sample> | undefined;
//   dataSourceAssemblies: MatTableDataSource<any> | undefined;
//
//   displayedColumnsFiles = ['study_accession', 'experiment_accession', 'run_accession', 'fastq_ftp', 'submitted_ftp',
//     'instrument_platform', 'instrument_model', 'library_layout', 'library_strategy', 'library_source',
//     'library_selection'];
//   displayedColumnsAssemblies = ['accession', 'assembly_name', 'description', 'version'];
//   @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
//   @ViewChild(MatSort, {static: true}) sort: MatSort | undefined;
//
//   constructor(private route: ActivatedRoute, private statusesService: StatusesService) {
//     this.route.params.subscribe(param => this.bioSampleId = param['organism']);
//     this.getBiosamples();
//   }
//
//   // tslint:disable-next-line:typedef
//   getBiosamples() {
//     this.statusesService.getBiosampleByOrganism(this.bioSampleId)
//       .subscribe(
//         data => {
//           this.bioSampleObj = data;
//           // @ts-ignore
//           this.dataSourceFiles = new MatTableDataSource<Sample>(this.bioSampleObj.experiment);
//           // @ts-ignore
//           this.dataSourceAssemblies = new MatTableDataSource<any>(this.bioSampleObj.assemblies);
//           // @ts-ignore
//           this.dataSourceFiles.paginator = this.paginator;
//           // @ts-ignore
//           this.dataSourceFiles.sort = this.sort;
//         },
//         err => console.log(err)
//       );
//   }
//
//   ngOnInit(): void {
//   }
//
//   // tslint:disable-next-line:typedef
//   applyFilter(event: Event) {
//     const filterValue = (event.target as HTMLInputElement).value;
//     // @ts-ignore
//     this.dataSourceFiles.filter = filterValue.trim().toLowerCase();
//   }
//
// }
