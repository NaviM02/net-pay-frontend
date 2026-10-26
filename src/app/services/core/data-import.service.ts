import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ImportResource, ImportResult } from '../../model/data-import.model';

@Injectable({ providedIn: 'root' })
export class DataImportService {
  private baseUrl = `${environment.baseUrl}/imports`;

  constructor(private http: HttpClient) {}

  upload(resource: ImportResource, file: File, dryRun: boolean, delimiter: string, roleHashId?: string): Observable<ImportResult> {
    const body = new FormData();
    body.append('file', file);

    const params: Record<string, string | boolean> = { dryRun, delimiter };
    if (resource === 'users' && roleHashId) params['roleHashId'] = roleHashId;

    return this.http.post<ImportResult>(`${this.baseUrl}/${resource}`, body, {
      params,
    });
  }
}
