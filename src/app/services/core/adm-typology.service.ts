import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AdmTypology } from '../../model/app.model';

@Injectable({
  providedIn: 'root'
})
export class AdmTypologyService {

  private baseUrl: string = `${environment.baseUrl}/typologies`;

  constructor(private http: HttpClient) {
  }

  findByInternalId(internalId: number) {
    const params = new HttpParams();
    return this.http.get<AdmTypology>(`${this.baseUrl}/${internalId}`, { params: params });
  }

  findByParentInternalId(parentInternalId: number) {
    const params = new HttpParams();
    return this.http.get<AdmTypology[]>(`${this.baseUrl}/by-parent/${parentInternalId}`, { params: params });
  }
}
