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

  createPost(postData: { id: number; title: string; content: string }, imageData?: string, fileExtension?: string): Observable<any> {
    return this.authService.getHeaders().pipe(
      switchMap((headers) => {
        return this.authService.getUserEmail().pipe(
          switchMap((userEmail) => {
            const postWithUserEmail = { 
              ...postData, 
              userEmail: userEmail,
              imageUrl: ''
            };
            console.log("The user's email is: ", userEmail);
            if (imageData && fileExtension) {
              console.log('Uploading image with data:', imageData, 'and file extension:', fileExtension);
              return this.apiService.uploadImage(imageData, fileExtension).pipe(
                switchMap((uploadResponse) => {
                  console.log('Image uploaded successfully:', uploadResponse);
                  postWithUserEmail.imageUrl = uploadResponse.imageUrl;
                  return this.http.post(`${this.apiUrl}`, postWithUserEmail, { headers }).pipe(
                    catchError((error) => {
                      console.error('Error creating post:', error);
                      return throwError(() => new Error('Failed to create post'));
                    })
                  );
                })
              );
            } else {
              return this.http.post(`${this.apiUrl}`, postWithUserEmail, { headers }).pipe(
                catchError((error) => {
                  console.error('Error creating post:', error);
                  return throwError(() => new Error('Failed to create post'));
                })
              );
            }
          })
        );
      })
    );
  }

 // Get a single blog post by ID
 getPost(id: number): Observable<any> {
  return from(this.authService.getHeaders()).pipe(
    switchMap((headers) => this.http.get(`${this.apiUrl}/object/${id}`, { headers })),
    tap(response => console.log('Fetched post:', response)),
    catchError((error) => {
      console.error(`Error fetching post with ID ${id}:`, error);
      return throwError(() => new Error(`Failed to fetch post with ID ${id}`));
    })
  );
}

updatePost(post: { id: number; title: string; content: string }, imageData?: string, fileExtension?: string): Observable<any> {
  return this.authService.getHeaders().pipe(
    switchMap((headers) => {
      return this.authService.getCurrentUser().pipe(
        switchMap((currentUser) => {
          const userEmail = currentUser ? currentUser.attributes.email : null;
          const postWithUserEmail = { 
            ...post, 
            userEmail: userEmail 
          };
          if (imageData && fileExtension) {
            return this.apiService.uploadImage(imageData, fileExtension).pipe(
              switchMap((response) => {
                const imageUrl = response.imageUrl;
                const postWithImage = { ...postWithUserEmail, imageUrl };
                return this.http.put(this.apiUrl, postWithImage, { headers }).pipe(
                  tap(response => console.log('Post updated successfully with image', response)),
                  catchError((error) => {
                    console.error('Error updating post with image:', error);
                    return throwError(() => new Error('Failed to update post with image'));
                  })
                );
              })
            );
          } else {
            return this.http.put(this.apiUrl, postWithUserEmail, { headers }).pipe(
              tap(response => console.log('Post updated successfully', response)),
              catchError((error) => {
                console.error('Error updating post:', error);
                return throwError(() => new Error('Failed to update post'));
              })
            );
          }
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
