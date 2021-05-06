import { Injectable } from '@angular/core';
import { Observable, forkJoin, throwError, of } from 'rxjs';
import { HttpClient, HttpParams, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, map, timeout, mergeMap, concatMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

const { sasString, sas, account, accountKey, APIURL } = environment;

@Injectable({
    providedIn: 'root'
  })
  export class TriggerService {
    public url: string;

    constructor(private httpClient: HttpClient) {
        this.url = APIURL + 'trigger';

    }

    PostTriggerPDF(filename: string) {
       const headers = { 'content-type': 'application/json'};
       let body = {
            'fileURL': 'https://'+ account +'.blob.core.windows.net/upload-pdf/'+ filename
        };
       return  this.httpClient.post<any>(this.url, body)
       .pipe(
        map((data) => {
         console.log(data);
       }),
       catchError((err) => {
         console.error(err);
         throw err;
       }
     ));
         
    }
    PostTriggerXLSX(filename: string){
        let body = {
            'fileURL': 'https://'+ account +'.blob.core.windows.net/upload-xlsx/'+ filename
        };
        return this.httpClient.post<any>(this.url, body)
        .pipe(
            map((data) => {
             console.log(data);
           }),
           catchError((err) => {
             console.error(err);
             throw err;
           }
         ));
    }
  }
