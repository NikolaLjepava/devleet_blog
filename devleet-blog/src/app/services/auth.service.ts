import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Auth } from '@aws-amplify/auth';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

//This service is used for authentication of the users and it is provided by Amplify
@Injectable({
  providedIn: 'root',
})
export class AuthService {

  // Checks if a user is logged in and returns its details
  getCurrentUser(): Observable<any> {
    return from(Auth.currentAuthenticatedUser()).pipe(
      catchError((error) => {
        console.error('Error fetching current user:', error);
        return of(null);
      })
    );
  }

  getHeaders(): Observable<HttpHeaders> {
    return from(this.getAccessToken()).pipe(
      map((token) => {
        return new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        });
      }),
      catchError((error) => {
        console.error('Error creating headers:', error);
        return throwError(() => new Error('Failed to create headers'));
      })
    );
  }

  signUp(email: string, password: string): Observable<any> {
    return from(
      Auth.signUp({
        username: email,
        password,
        attributes: { email },
      })
    ).pipe(
      map(response => response),
      catchError((error) => {
        if (error.code === 'UsernameExistsException') {
          return throwError(() => new Error('This email is already registered. Please use a different email.'));
        }
        return throwError(() => error);
      })
    );
  }

  confirmSignUp(email: string, code: string): Observable<any> {
    return from(Auth.confirmSignUp(email, code)).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  signIn(email: string, password: string): Observable<any> {
    return from(Auth.signIn(email, password)).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  signOut(): Observable<any> {
    return from(Auth.signOut()).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  // check if user is logged in with simple true or false
  isAuthenticated(): Observable<boolean> {
    return from(Auth.currentAuthenticatedUser()).pipe(
      map(() => true),
      catchError(() => {
        return of(false);
      })
    );
  }

  // this ensures the token is always fresh
  getAccessToken(): Observable<string> {
    return from(Auth.currentSession()).pipe(
      switchMap((session) => {
        // If session is retrieved, extract the JWT token
        return of(session.getIdToken().getJwtToken());
      }),
      catchError((error) => {
        console.error('Error fetching access token:', error);
        return throwError(() => error); // Propagate the error
      })
    );
  }
}
