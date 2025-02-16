import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

// This service is responsible for handling all communication between the Angular frontend
// and the AWS REST API. It uses HTTP requests to fetch, create, update, and delete blog posts.

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private apiUrl = 'https://gocqije9g1.execute-api.eu-north-1.amazonaws.com/dev/blog-v1';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private async getHeaders(): Promise<any> {
    const currentUser = await this.authService.getCurrentUser();
    const token = currentUser ? currentUser.signInUserSession.idToken.jwtToken : null;

    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '', // if token exists, it adds it as a Bearer token in auth header
      }),
    };
  }

  // Get all blog posts
  async getPosts(): Promise<Observable<any>> {
    const headers = await this.getHeaders();  // Await the headers
    return this.http.get(`${this.apiUrl}/objects`, headers);  // Pass the headers
  }

  // Get a single blog post by ID
  async getPost(id: number): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.get(`${this.apiUrl}/object/${id}`, headers);
  }

  // Create a new blog post
  async createPost(post: { title: string; content: string }): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.post(`${this.apiUrl}/object`, post, headers);
  }

  // Update a blog post
  async updatePost(id: number, post: { title: string; content: string }): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.put(`${this.apiUrl}/object/${id}`, post, headers);
  }

  // Delete a blog post
  async deletePost(id: number): Promise<Observable<any>> {
    const headers = await this.getHeaders();
    return this.http.delete(`${this.apiUrl}/object/${id}`, headers);
  }
}
