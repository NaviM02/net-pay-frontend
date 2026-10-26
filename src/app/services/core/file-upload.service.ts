import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FileUploadResponse } from '../../model/app.model';

@Injectable({ providedIn: 'root' })
export class FileUploadService {
  private readonly endpoint = `${environment.baseUrl}/files/upload`;

  constructor(private http: HttpClient) {}

  upload(file: File): Observable<FileUploadResponse> {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<FileUploadResponse>(this.endpoint, body);
  }
}
