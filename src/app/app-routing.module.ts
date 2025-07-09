import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DataPortalComponent} from "./data-portal/data-portal.component";
import {DataPortalDetailsComponent} from "./data-portal/data-portal-details/data-portal-details.component";
import {TrackingSystemComponent} from "./tracking-system/tracking-system/tracking-system.component";
import {HomeComponent} from "./home/home.component";
import {OrganismDetailsComponent} from "./organism-details/organism-details.component";
import {SpecimenDetailsComponent} from "./specimen-details/specimen-details.component";
import {ApiDocumentationComponent} from "./api-documentation/api-documentation.component";
import {HelpComponent} from "./help/help.component";
import {AboutComponent} from "./about/about.component";
import {ProjectsComponent} from "./projects/projects.component";
import {GisComponent} from "./gis/gis.component";
import  {BulkDownloadsComponent} from "./bulk-downloads/bulk-downloads.component";
import {PublicationsComponent} from "./publications/publications.component";
import {PhylogenyComponent} from "./phylogeny/phylogeny.component";
import {DashboardsComponent} from "./dashboards/dashboards.component";

const routes: Routes = [

    {
        path: 'tracking', component: TrackingSystemComponent
    },
    {    path: '',
        component: HomeComponent,
        pathMatch: 'full'
    },
    {path: 'data_portal', component: DataPortalComponent},
    { path: 'data_portal/:organismId', component: DataPortalDetailsComponent },
    { path: 'organism/:organismId', component: OrganismDetailsComponent },
    { path: 'specimen/:specimenId', component: SpecimenDetailsComponent },
    { path: 'api_documentation', component: ApiDocumentationComponent },
    { path: 'help', component: HelpComponent },
    { path: 'projects', component: ProjectsComponent },
    { path: 'about', component: AboutComponent },
    { path: 'bulk-downloads' , component: BulkDownloadsComponent},
    { path: 'publications' , component: PublicationsComponent},
    { path: 'gis', component: GisComponent},
    { path: 'phylogeny', component: PhylogenyComponent },
    { path: 'dashboards', component: DashboardsComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
