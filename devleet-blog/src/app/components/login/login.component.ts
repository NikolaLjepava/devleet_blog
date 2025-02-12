import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  async login() {
    try {
      await this.authService.signIn(this.email, this.password);
      
      // Show success message using MatSnackBar
      this.snackBar.open('Login successful!', 'Close', {
        duration: 2000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['success-snackbar'],
      });

      // Redirect to home page after showing the success message
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 2000); // Wait for 2 seconds before redirecting

    } catch (error) {
      console.error('Login error:', error);
    }
  }

  // Navigate to the signup page
  goToSignup() {
    this.router.navigate(['/signup']);
  }
}
