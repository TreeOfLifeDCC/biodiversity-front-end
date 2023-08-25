import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class StatusesService {

    private API_BASE_URL = 'http://45.88.81.74/biodiversity/api';
    // private API_BASE_URL = 'http://45.88.81.97/backend';
    // private API_BASE_URL = 'http://localhost:8080';

    constructor(private http: HttpClient) {
    }

    public getAllStatuses(offset: any, limit: any, sortColumn?: undefined, sortOrder?: any): Observable<any> {
        let requestParams = `?offset=${offset}&limit=${limit}`
        if (sortColumn != undefined) {
            requestParams = requestParams + `&sortColumn=${sortColumn}&sortOrder=${sortOrder}`
        }
        return this.http.get(`${this.API_BASE_URL}/statuses${requestParams}`);
    }

    public getBiosampleByOrganism(organism: string | undefined): Observable<any> {
        return this.http.get(`${this.API_BASE_URL}/statuses/detail/${organism}`);
    }

    public getStatusesFilters(): Observable<any> {
        return this.http.get(`${this.API_BASE_URL}/statuses/filters`);
    }

    public getSearchResults(search: any, sortColumn?: string | undefined, sortOrder?: string, from?: any, size?: any): Observable<any> {
        let requestURL = `${this.API_BASE_URL}/statuses/search?filter=${search}&from=${from}&size=${size}`;
        if (sortColumn != undefined) {
            requestURL = requestURL + `&sortColumn=${sortColumn}&sortOrder=${sortOrder}`
        }
        return this.http.get(`${requestURL}`);
    }

    public getFilterResults(filter: any, sortColumn?: string | undefined, sortOrder?: string, from?: number, size?: number, taxonomyFilter?: any[] | undefined): Observable<any> {
        let requestURL = `${this.API_BASE_URL}/statuses/filter/results?from=${from}&size=${size}`;
        if (sortColumn != undefined) {
            requestURL = requestURL + `&sortColumn=${sortColumn}&sortOrder=${sortOrder}`;
        }
        if (taxonomyFilter != undefined) {
            let taxa = encodeURIComponent(JSON.stringify(taxonomyFilter[0]));
            requestURL = requestURL + `&taxonomyFilter=${taxa}`
        }
        return this.http.post(`${requestURL}`, filter);
    }

    public findBioSampleByOrganismName(name: any, sortColumn?: string | undefined, sortOrder?: string, from?: any, size?: any): Observable<any> {
        let requestURL = `${this.API_BASE_URL}/statuses/organism?name=${name}&from=${from}&size=${size}`;
        if (sortColumn != undefined) {
            requestURL = requestURL + `&sortColumn=${sortColumn}&sortOrder=${sortOrder}`
        }
        return this.http.get(`${requestURL}`);
    }

}
