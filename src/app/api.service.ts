import {Injectable} from '@angular/core';
import { HttpClient } from "@angular/common/http";
import {Observable, throwError} from 'rxjs';
import {catchError, retry} from 'rxjs/operators';
import {Constants} from "./projects";

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient) {
    }

    getData(pageIndex: number, pageSize: number, searchValue: string, sortActive: string, sortDirection: string,
            filterValue: string[], currentClass: string, phylogenyFilters: string[], indexName: string) {

        const projectNames = ['DToL', 'ASG', 'ERGA',
            'Anopheles Reference Genomes Project (Data and assemblies)', 'DNA Zoo'];
        const offset = pageIndex * pageSize;
       let url = `http://localhost:8000/${indexName}?limit=${pageSize}&offset=${offset}`;
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
                if (isPresent || projectNames.indexOf(filterValue[i]) !== -1) {
                   filterItem = `project_name:${filterValue[i]}`;
                } else if (filterValue[i].includes('-') && !filterValue[i].startsWith('experimentType')) {
                    if (filterValue[i].startsWith('symbionts') || filterValue[i].startsWith('metagenomes')){
                        filterItem = filterValue[i].replace('-', ':');
                    } else {
                        filterItem = filterValue[i].split(' - ')[0].toLowerCase().split(' ').join('_');
                        if (filterItem === 'assemblies') {
                            filterItem = 'assemblies_status:Done';
                        } else
                            filterItem = `${filterItem}:Done`;
                    }
                } else if (filterValue[i].includes('_') && filterValue[i].startsWith('experimentType')) {
                    filterItem = filterValue[i].replace('_', ':');

                } else {
                    filterItem = `${currentClass}:${filterValue[i]}`;
                }
                filterStr === '&filter=' ? filterStr += `${filterItem}` : filterStr += `,${filterItem}`;

            }
            url += filterStr;
        }
        if (phylogenyFilters.length !== 0) {
            let filterStr = '&phylogeny_filters=';
            for (let i = 0; i < phylogenyFilters.length; i++) {
                filterStr === '&phylogeny_filters=' ? filterStr += `${phylogenyFilters[i]}` : filterStr += `-${phylogenyFilters[i]}`;
            }

            url += filterStr;
        }

        url += `&current_class=${currentClass}`;

        return this.http.get<any>(url);
    }

    getDetailsData(organismName: any, indexName = 'data_portal') {
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
                } else if (filterValue[i].includes('-') && !filterValue[i].startsWith('experimentType')) {
                    filterItem = filterValue[i].split(' - ')[0].toLowerCase().split(' ').join('_');
                    if (filterItem === 'assemblies') {
                        filterItem = 'assemblies_status:Done';
                    } else
                        filterItem = `${filterItem}:Done`;
                }
                else if (filterValue[i].includes('_') && filterValue[i].startsWith('experimentType')) {
                    filterItem = filterValue[i].replace('_', ':');

                }else {
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


    downloadData(downloadOption: string, pageIndex: number, pageSize: number, searchValue: string, sortActive: string, sortDirection: string,
                 filterValue: string[], currentClass: string, phylogeny_filters: string[], index_name: string) {

        let url = `http://127.0.0.1:8000/data-download`;

        // phylogeny
        let phylogenyStr = phylogeny_filters.length ? phylogeny_filters.join('-') : '';

        // filter string
        let filterStr = '';
        if (filterValue.length !== 0) {
            const allowedProjects = ['DToL', 'ASG', 'ERGA', 'Anopheles Reference Genomes Project (Data and assemblies)', 'DNA Zoo'];

            filterStr = filterValue.map((filterItem) => {
                if (Constants.projects.some(el => el.title === filterItem) || allowedProjects.includes(filterItem)) {
                    return `project_name:${filterItem}`;
                } else if (filterItem.includes('-')) {
                    if (filterItem.startsWith('symbionts_') || filterItem.startsWith('metagenomes_')) {
                        return filterItem.replace('-', ':');
                    } else {
                        let formattedFilter = filterItem.split(' - ')[0].toLowerCase().split(' ').join('_');
                        return formattedFilter === 'assemblies' ? 'assemblies_status:Done' : `${formattedFilter}:Done`;
                    }
                } else {
                    return `${currentClass}:${filterItem}`;
                }
            }).join(',');
        }
        if (!sortActive) {
            sortActive= `rank`;
        }
        const payload = {
            pageIndex,
            pageSize,
            searchValue,
            sortValue: `${sortActive}:${sortDirection}`,
            filterValue: filterStr,
            currentClass,
            phylogeny_filters: phylogenyStr,
            index_name,
            downloadOption
        };
        return this.http.post(url, payload, { responseType: 'blob' });
    }
}
