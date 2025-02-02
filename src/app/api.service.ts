import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Constants} from "./projects";

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient) {
    }

    getData(pageIndex: number, pageSize: number, searchValue: string, sortActive: string, sortDirection: string,
            filterValue: string[], currentClass: string, phylogeny_filters: string[], index_name: string) {

       const offset = pageIndex * pageSize;
       let url = `https://www.ebi.ac.uk/biodiversity/api/${index_name}?limit=${pageSize}&offset=${offset}`;
        if (searchValue) {
            url += `&search=${searchValue}`;
        }
        if (sortActive && sortDirection) {
            url += `&sort=${sortActive}:${sortDirection}`;
        }
        if (filterValue.length !== 0) {
            let filterStr = '&filter=';
            let filterItem;
            for (let i = 0; i < filterValue.length; i++) {
                const isPresent = Constants.projects.some(function (el) {
                    return el.title === filterValue[i]
                });
                if (isPresent || (filterValue[i] === 'DToL' || filterValue[i] === 'ASG' || filterValue[i] === 'ERGA'
                    || filterValue[i] ==='Anopheles Reference Genomes Project (Data and assemblies)' ||
                    filterValue[i] === 'DNA Zoo')) {
                   filterItem = `project_name:${filterValue[i]}`;
                } else if (filterValue[i].includes('-')) {
                    if (filterValue[i].startsWith('symbionts_') || filterValue[i].startsWith('metagenomes_')){
                        filterItem = filterValue[i].replace('-', ':');
                    } else {
                        filterItem = filterValue[i].split(' - ')[0].toLowerCase().split(' ').join('_');
                        if (filterItem === 'assemblies') {
                            filterItem = 'assemblies_status:Done';
                        } else
                            filterItem = `${filterItem}:Done`;
                    }
                } else {
                    filterItem = `${currentClass}:${filterValue[i]}`;
                }
                filterStr === '&filter=' ? filterStr += `${filterItem}` : filterStr += `,${filterItem}`;

            }
            url += filterStr;
        }
        if (phylogeny_filters.length !== 0) {
            let filterStr = '&phylogeny_filters=';
            for (let i = 0; i < phylogeny_filters.length; i++) {
                filterStr === '&phylogeny_filters=' ? filterStr += `${phylogeny_filters[i]}` : filterStr += `-${phylogeny_filters[i]}`;
            }

            url += filterStr;
        }
        url += `&current_class=${currentClass}`;

        return this.http.get<any>(url);
    }

    getDetailsData(organismName: any, indexName = 'data_portal_test') {
        let url = `https://www.ebi.ac.uk/biodiversity/api/${indexName}/${organismName}`;
        return this.http.get<any>(url);
    }

    getGistData(searchValue: string | undefined,
                filterValue: string[], currentClass: string, phylogeny_filters: string[]) {

        // let url = `http://localhost:8000/${index_name}?limit=${pageSize}&offset=${offset}`;
        let url = `https://www.ebi.ac.uk/biodiversity/api/gis_filter?`
        if (searchValue) {
            url += `&search=${searchValue}`;
        }

        if (filterValue.length !== 0) {
            let filterStr = '&filter=';
            let filterItem;
            for (let i = 0; i < filterValue.length; i++) {
                const isPresent = Constants.projects.some(function (el) {
                    return el.title === filterValue[i]
                });
                if (isPresent || (filterValue[i] === 'DToL' || filterValue[i] === 'ASG' || filterValue[i] === 'ERGA' || filterValue[i] ==='Anopheles Reference Genomes Project (Data and assemblies)' || filterValue[i] === 'DNA Zoo')) {
                    filterItem = `project_name:${filterValue[i]}`;
                } else if (filterValue[i].includes('-')) {
                    filterItem = filterValue[i].split(' - ')[0].toLowerCase().split(' ').join('_');
                    if (filterItem === 'assemblies') {
                        filterItem = 'assemblies_status:Done';
                    } else
                        filterItem = `${filterItem}:Done`;
                } else {
                    filterItem = `${currentClass}:${filterValue[i]}`;
                }
                filterStr === '&filter=' ? filterStr += `${filterItem}` : filterStr += `,${filterItem}`;

            }
            url += filterStr;
        }
        if (phylogeny_filters.length !== 0) {
            let filterStr = '&phylogeny_filters=';
            for (let i = 0; i < phylogeny_filters.length; i++) {
                filterStr === '&phylogeny_filters=' ? filterStr += `${phylogeny_filters[i]}` : filterStr += `-${phylogeny_filters[i]}`;
            }

            url += filterStr;
        }
        url += `&current_class=${currentClass}`;

        return this.http.get<any>(url);
    }

}
