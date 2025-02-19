import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

// this service is responsible for everything regarding the blog posts such as fetching them and CRUD
@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = 'https://gocqije9g1.execute-api.eu-north-1.amazonaws.com/dev/blog-v1';

  constructor(private http: HttpClient, private authService: AuthService, private apiService: ApiService) {}

  // Get all blog posts
  getPosts(): Observable<any> {
    return from(this.authService.getHeaders()).pipe(
      switchMap((headers) => {
        return this.http.get(`${this.apiUrl}`, { headers }).pipe(
          catchError((error) => {
            console.error('Error fetching posts:', error);
            return throwError(() => new Error('Failed to fetch posts'));
          })
        );
      })
    );
  }

  // Get a single blog post by ID
  getPost(id: number): Observable<any> {
    return from(this.authService.getHeaders()).pipe(
      switchMap((headers) => this.http.get(`${this.apiUrl}/${id}`, { headers })),
      catchError((error) => {
        console.error(`Error fetching post with ID ${id}:`, error);
        return throwError(() => new Error(`Failed to fetch post with ID ${id}`));
      })
    );
  }

  createPost(postData: { id: number; title: string; content: string }): Observable<any> {
    return this.authService.getHeaders().pipe(
      switchMap((headers) => {
        return this.authService.getCurrentUser().pipe(
          switchMap((currentUser) => {
            const userId = currentUser ? currentUser.cognitoIdentityId : null;
            const postWithUserId = { 
              ...postData, 
              userId: userId 
            };
            return this.http.post(this.apiUrl, postWithUserId, { headers }).pipe(
              tap(response => console.log('Post created successfully', response)),
              catchError((error) => {
                console.error('Error creating post:', error);
                return throwError(() => new Error('Failed to create post'));
              })
            );
          })
        );
      })
    );
  }

  updatePost(post: { id: number; title: string; content: string }): Observable<any> {
    return this.authService.getHeaders().pipe(
      switchMap((headers) => {
        return this.authService.getCurrentUser().pipe(
          switchMap((currentUser) => {
            const userId = currentUser ? currentUser.cognitoIdentityId : null;
            const postWithUserId = { 
              ...post, 
              userId: userId 
            };
            return this.http.put(`${this.apiUrl}/${post.id}`, postWithUserId, { headers }).pipe(
              tap((response) => console.log('Post updated successfully', response)),
              catchError((error) => {
                console.error(`Error updating post with ID ${post.id}:`, error);
                return throwError(() => new Error('Failed to update post'));
              })
            );
          })
        );
      })
    );
  }
  
  deletePost(id: number): Observable<any> {
    return this.authService.getHeaders().pipe( // Get headers as Observable
      switchMap((headers) => {
        return this.http.delete(`${this.apiUrl}/object/${id}`, { headers }).pipe(
          tap((response) => {
            console.log(`Post deleted successfully with ID ${id}`, response);
          }),
          catchError((error) => {
            console.error(`Error deleting post with ID ${id}:`, error);
            return throwError(() => new Error(`Failed to delete post with ID ${id}`));
          })
        );
      })
    );
  }  
}
