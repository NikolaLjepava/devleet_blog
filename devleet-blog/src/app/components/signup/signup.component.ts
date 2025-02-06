import { Component } from '@angular/core';
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

  constructor(private authService: AuthService) {}

  async signUp() {
    try {
      await this.authService.signUp(this.email, this.password);
      this.showVerification = true;
    } catch (error) {
      console.error('Signup error:', error);
    }
  }

  async confirmSignUp() {
    try {
      await this.authService.confirmSignUp(this.email, this.code);
      alert('Signup successful! You can now log in.');
    } catch (error) {
      console.error('Verification error:', error);
    }
  }
}
