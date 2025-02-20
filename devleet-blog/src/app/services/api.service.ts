import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = 'https://gocqije9g1.execute-api.eu-north-1.amazonaws.com/dev/blog-v1';

  constructor(private http: HttpClient, private authService: AuthService) {}

  checkIfAuthor(postId: number): Observable<{ isOwner: boolean }> {
    return from(this.authService.getHeaders()).pipe(
      switchMap((headers) => {
        return this.http.get<{ isOwner: boolean }>(`${this.apiUrl}/check-author/${postId}`, { headers }).pipe(
          catchError((error) => {
            console.error('Error checking if the user is the author:', error);
            return throwError(() => new Error('Failed to check if the user is the author'));
          })
        );
      })
    );
  }

  uploadImage(imageData: string, fileExtension: string): Observable<{ imageUrl: string }> {
    return from(this.authService.getHeaders()).pipe(
      switchMap((headers) => {
        return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/upload-image`, { imageData, fileExtension }, { headers }).pipe(
          catchError((error) => {
            console.error('Error uploading image:', error);
            return throwError(() => new Error('Failed to upload image'));
          })
        );
      })
    );
  }
}