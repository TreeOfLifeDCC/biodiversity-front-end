import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DataPortalComponent} from "./data-portal/data-portal.component";
import {DataPortalDetailsComponent} from "./data-portal/data-portal-details/data-portal-details.component";
import {TrackingSystemComponent} from "./tracking-system/tracking-system/tracking-system.component";
import {HomeComponent} from "./home/home.component";

const routes: Routes = [

    {
        path: 'tracking', component: TrackingSystemComponent
    },
    {    path: '',
        component: HomeComponent,
        pathMatch: 'full'
    },
    {path: 'data_portal', component: DataPortalComponent},
    {path: 'data_portal/:organismId', component: DataPortalDetailsComponent},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
