import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://gocqije9g1.execute-api.eu-north-1.amazonaws.com/dev';

  constructor(private http: HttpClient) {}

  uploadImage(imageData: string, fileExtension: string): Observable<any> {
    const url = `${this.apiUrl}/upload-image`;
    const body = { imageData, fileExtension };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    console.log('Uploading image with body:', body);

    return this.http.post(url, body, { headers }).pipe(
      catchError((error) => {
        console.error('Error uploading image:', error);
        return throwError(() => new Error('Failed to upload image'));
      })
    );
  }
}