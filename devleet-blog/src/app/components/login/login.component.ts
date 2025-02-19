import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  login() {
    this.authService.signIn(this.email, this.password).pipe(
      tap(() => {
        this.snackBar.open('Login successful!', 'Close', {
          duration: 2000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar'],
        });
          setTimeout(() => {
          this.router.navigate(['/home']);
        }, 2000); // Wait for 2 seconds before redirecting
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return of(null);
      })
    ).subscribe();
  }
  
  // Navigate to the signup page
  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
