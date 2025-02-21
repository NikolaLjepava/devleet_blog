import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  code: string = '';
  showVerification: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  signUp() {
    this.errorMessage = '';
    this.authService.signUp(this.email, this.password).pipe(
      tap(() => {
        this.showVerification = true;
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        if (error.code === 'UsernameExistsException') {
          this.errorMessage = 'This email is already registered. Please use a different one.';
        } else {
          this.errorMessage = 'An error occurred. Please try again later.';
        }
        return of(null);
      })
    ).subscribe();
  }

  confirmSignUp() {
    this.authService.confirmSignUp(this.email, this.code).pipe(
      tap(() => {
        alert('Registration successful! You can now log in.');
      }),
      switchMap(() => {
        return this.authService.signIn(this.email, this.password);
      }),
      tap(() => {
        this.router.navigate(['/home']);
      }),
      catchError((error) => {
        console.error('Verification error:', error);
        return of(null);
      })
    ).subscribe();
  }
  

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
