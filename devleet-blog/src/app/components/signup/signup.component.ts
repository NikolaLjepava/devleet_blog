import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  email: string = '';
  password: string = '';
  code: string = '';
  showVerification: boolean = false;
  errorMessage: string = '';  // Add a variable to store the error message

  constructor(private authService: AuthService, private router: Router) {}

  async signUp() {
    this.errorMessage = '';  // Reset the error message before each attempt
    try {
      await this.authService.signUp(this.email, this.password);
      this.showVerification = true;
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'UsernameExistsException') {
        this.errorMessage = 'This email is already registered. Please use a different one.';
      } else {
        this.errorMessage = 'An error occurred. Please try again later.';
      }
    }
  }

  async confirmSignUp() {
    try {
      await this.authService.confirmSignUp(this.email, this.code);
      alert('Registration successful! You can now log in.');
      await this.authService.signIn(this.email, this.password);
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Verification error:', error);
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
