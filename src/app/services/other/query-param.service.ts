import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class QueryParamService {
  constructor() {}

  getParams(map: Map<string, string>): HttpParams {
    let params = new HttpParams();
    map.forEach((value: string, key: string) => {
      if (value) params = params.set(key, value);
    });
    return params;
  }
}
