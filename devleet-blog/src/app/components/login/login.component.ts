import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService) {}

  async login() {
    try {
      await this.authService.signIn(this.email, this.password);
      alert('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
    }
  }
}
