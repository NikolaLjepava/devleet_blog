import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

// this service is used for communicating with comments and image uploads
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'https://gocqije9g1.execute-api.eu-north-1.amazonaws.com/dev';

  constructor(private http: HttpClient, private authService: AuthService) {}

  uploadImage(imageData: string, fileExtension: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.authService.getAccessToken()
    });
  
    return this.http.post(`${this.apiUrl}/upload-image`, 
      { imageData, fileExtension },
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Full error:', error);
        return throwError(() => new Error('Upload failed'));
      })
    );
  }

  createComment(content: string, postId: string, parentId: string | null = null, userEmail: string): Observable<any> {
    const url = `${this.apiUrl}/comments`;
    const body = { postId, content, parentId, userEmail };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    console.log('Creating comment:', { postId, content, parentId, userEmail });
  
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
  
  buildCommentTree(comments: any[]): any[] {
    const commentMap = {};
    const rootComments = [];
  
    // First pass: create map and calculate scores
    comments.forEach(comment => {
      commentMap[comment.id] = {
        ...comment,
        voteScore: (comment.upvotes || 0) - (comment.downvotes || 0),
        children: comment.children || [] // Preserve existing children
      };
    });
  
    // Second pass: build hierarchy
    comments.forEach(comment => {
      if (comment.parentId && commentMap[comment.parentId]) {
        commentMap[comment.parentId].children.push(commentMap[comment.id]);
        // Sort children after update
        commentMap[comment.parentId].children.sort((a, b) => 
          b.voteScore - a.voteScore
        );
      } else if (!comment.parentId) {
        rootComments.push(commentMap[comment.id]);
      }
    });
  
    // Sort root comments
    return rootComments.sort((a, b) => b.voteScore - a.voteScore);
  }
  
  deleteComment(commentId: string, userEmail: string, postId: string): Observable<any> {
    const url = `${this.apiUrl}/comments/${commentId}?userEmail=${encodeURIComponent(userEmail)}&postId=${encodeURIComponent(postId)}`;
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

  upvoteComment(commentId: string, postId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/comments/${commentId}/vote`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, { voteType: 'upvote', postId: postId, userId: userId }, { headers }).pipe(
      catchError((error) => {
        console.error('Error upvoting comment:', error);
        return throwError(() => new Error('Failed to upvote comment'));
      })
    );
  }
  
  downvoteComment(commentId: string, postId: string, userId: string): Observable<any> {
    const url = `${this.apiUrl}/comments/${commentId}/vote`;
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(url, { voteType: 'downvote', postId: postId, userId: userId }, { headers }).pipe(
      catchError((error) => {
        console.error('Error downvoting comment:', error);
        return throwError(() => new Error('Failed to downvote comment'));
      })
    );
  }
}