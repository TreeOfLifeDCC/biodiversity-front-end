import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaxanomyService {

  private API_BASE_URL = 'https://portal.aquaticsymbiosisgenomics.org/api';
  // private API_BASE_URL = 'http://45.88.81.97/backend';
  // private API_BASE_URL = 'http://localhost:8080';

  constructor(private http: HttpClient) {
  }

  public getTaxonomyFilters(taxonomy?: String): Observable<any> {
    return this.http.get(`${this.API_BASE_URL}/taxonomy/filters?taxonomy=${taxonomy}`);
  }

  public getChildTaxonomyRank(filter: string | never[], rank: String, taxonomy: String, childRank: String, taxaTree: any, type: string, searchText?: undefined): Observable<any> {
    let requestURL = `${this.API_BASE_URL}/taxonomy/${rank}/child?taxonomy=${taxonomy}&childRank=${childRank}&filter=${filter}&type=${type}`;
    if (searchText) {
      requestURL = requestURL + `&searchText=${searchText}`
    }
    return this.http.post(requestURL, taxaTree);
  }

}