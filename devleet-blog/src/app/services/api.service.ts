import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
// this service is used for communicating with comments and image uploads
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

  createComment(content: string, postId: string, parentId: string | null = null): Observable<any> {
    const url = `${this.apiUrl}/comments`;
    const body = { postId, content, parentId, userEmail: 'user@example.com' };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    console.log('Creating comment:', { postId, content, parentId });

    return this.http.post(url, body, { headers }).pipe(
      catchError((error) => {
        console.error('Error creating comment:', error);
        return throwError(() => new Error('Failed to create comment'));
      })
    );
  }
  
  listComments(parentId: string) {
    const url = `${this.apiUrl}/comments/${parentId}`;
    return this.http.get(url).pipe(
      map((comments: any[]) => comments.map(comment => ({ ...comment, replies: [] }))), // Initialize empty replies
      catchError((error) => {
        console.error('Error listing comments:', error);
        return throwError(() => new Error('Failed to list comments'));
      })
    );
  }
  
  buildCommentTree(comments: any[]) {
    let commentMap = {};
    let rootComments = [];
  
    comments.forEach(comment => {
      comment.children = comment.children || [];
      comment.repliesVisible = false;  // Initialize replies visibility
      commentMap[comment.id] = comment;
    });
  
    comments.forEach(comment => {
      if (comment.parentId) {
        let parent = commentMap[comment.parentId];
        if (parent) {
          parent.children.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    });
  
    return rootComments;
  }  
  
  deleteComment(commentId: string): Observable<any> {
    const url = `${this.apiUrl}/comments/${commentId}`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.delete(url, { headers }).pipe(
      catchError((error) => {
        console.error('Error deleting comment:', error);
        return throwError(() => new Error('Failed to delete comment'));
      })
    );
  }

  updateComment(commentId: string, content: string): Observable<any> {
    const url = `${this.apiUrl}/comments/${commentId}`;
    const body = { content };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put(url, body, { headers }).pipe(
      catchError((error) => {
        console.error('Error updating comment:', error);
        return throwError(() => new Error('Failed to update comment'));
      })
    );
  }

  upvoteComment(commentId: string): Observable<any> {
    const url = `${this.apiUrl}/comments/${commentId}/vote`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    return this.http.post(url, { voteType: 'upvote' }, { headers }).pipe(
      catchError((error) => {
        console.error('Error upvoting comment:', error);
        return throwError(() => new Error('Failed to upvote comment'));
      })
    );
  }
  
  downvoteComment(commentId: string): Observable<any> {
    const url = `${this.apiUrl}/comments/${commentId}/vote`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
  
    return this.http.post(url, { voteType: 'downvote' }, { headers }).pipe(
      catchError((error) => {
        console.error('Error downvoting comment:', error);
        return throwError(() => new Error('Failed to downvote comment'));
      })
    );
  }  
}