import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';

import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map, catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FindingFalconService {

  server = environment.APIEndpoint;
  urls = {
    getPlanets: this.server + '/planets',
    getVehicles: this.server + '/vehicles',
    getToken: this.server + '/token',
    findFalcone: this.server + '/find',

  };
  headerData = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  private dataSource = new BehaviorSubject({});
  getSelectedValues = this.dataSource.asObservable();


  constructor(private http: HttpClient) { }

  httpGetRequest(url: string) {
    return this.http.get(url, { headers: this.headerData })
    .pipe(
      map((response) => {
        return response;
      }),
      catchError(err => {
        throw err;
      })
    );
  }

  getPlanets(): any {
    return this.httpGetRequest(this.urls.getPlanets);
  }

  getVehicles(): any {
    return this.httpGetRequest(this.urls.getVehicles);
  }

  getToken(): any {
    return this.http.post(this.urls.getToken, null, { headers: this.headerData });
  }

  findFalcone(requestData: any): any {
    return this.http.post(this.urls.findFalcone, requestData, { headers: this.headerData });
  }

  setSelectedValues(data: any) {
    this.dataSource.next(data);
  }
}
