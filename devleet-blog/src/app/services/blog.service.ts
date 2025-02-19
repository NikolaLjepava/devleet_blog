import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = 'https://gocqije9g1.execute-api.eu-north-1.amazonaws.com/dev/blog-v1';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): Promise<HttpHeaders> {
    return new Promise((resolve, reject) => {
      this.authService.getCurrentUser()
        .then((currentUser) => {
          const token = currentUser ? currentUser.signInUserSession.idToken.jwtToken : null;
          const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          });
          resolve(headers);
        })
        .catch((error) => {
          console.error('Error fetching auth token:', error);
          reject(error);
        });
    });
  }

  // Get all blog posts
  getPosts(): Observable<any> {
    return from(this.getHeaders()).pipe(
      switchMap((headers) => {
        return this.http.get(`${this.apiUrl}`, { headers }).pipe(
          tap(response => console.log('API Response:', response))
        );
      }),
      catchError((error) => {
        console.error('Error fetching posts:', error);
        return throwError(() => new Error('Failed to fetch posts'));
      })
    );
  }

  // Get a single blog post by ID
  getPost(id: number): Observable<any> {
    return from(this.getHeaders()).pipe(
      switchMap((headers) => this.http.get(`${this.apiUrl}/${id}`, { headers })),
      catchError((error) => {
        console.error(`Error fetching post with ID ${id}:`, error);
        return throwError(() => new Error(`Failed to fetch post with ID ${id}`));
      })
    );
  }

  async createPost(postData: { id: number; title: string; content: string }): Promise<any> {
    try {
      const headers = await this.getHeaders();
      const currentUser = await this.authService.getCurrentUser();
      const userId = currentUser ? currentUser.cognitoIdentityId : null;
      const postWithUserId = { 
        ...postData, 
        userId: userId 
      };
      console.log('Sending POST request with the following body:', postWithUserId);
      const response = await this.http.post(this.apiUrl, postWithUserId, { headers })
        .toPromise();
      
      console.log('Post created successfully', response);
      return response;
    } catch (error) {
      console.error('Error creating post:', error);
      return Promise.reject(new Error('Failed to create post'));
    }
  }

  async updatePost(post: { id: number; title: string; content: string }): Promise<any> {
    try {
      const headers = await this.getHeaders();
      const response = await this.http.put(this.apiUrl, post, { headers }).toPromise();
      return response;
    } catch (error) {
      console.error(`Error updating post with ID ${post.id}:`, error);
      throw new Error(`Failed to update post with ID ${post.id}`);
    }
  }

  getPostById(id: number): Promise<any> {
    console.log("this is the log from getPostById", this.http.get(`${this.apiUrl}/object/${id}`));
    return this.http.get(`${this.apiUrl}/object/${id}`).toPromise();
  }
  
  async deletePost(id: number): Promise<any> {
    try {
      const headers = await this.getHeaders();
      const response = await this.http.delete(`${this.apiUrl}/object/${id}`, { headers }).toPromise();
      console.log(`Post deleted successfully with ID ${id}`, response);
      return response;
    } catch (error) {
      console.error(`Error deleting post with ID ${id}:`, error);
      throw new Error(`Failed to delete post with ID ${id}`);
    }
  }
  
}
