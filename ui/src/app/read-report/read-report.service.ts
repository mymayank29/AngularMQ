import { Injectable } from '@angular/core';
import { Observable, forkJoin, throwError, of } from 'rxjs';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, timeout, mergeMap, concatMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

const { sasString, sas, account, accountKey, APIURL } = environment;

@Injectable({
    providedIn: 'root'
  })

  export class ReportService {
    public baseurl: string;

    constructor(private httpClient: HttpClient) {
        this.baseurl = APIURL;

    }
    getReport() {
        let url = this.baseurl + 'report';
        return  this.httpClient.get<any>(url);
     }
  }