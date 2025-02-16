import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';  // Make sure this import exists

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  isLoginMode = false;
  user: any = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.router.events.subscribe(() => {
      // Check if the current path is "/login" or "/signup"
      if (this.router.url === '/login') {
        this.isLoginMode = true;
      } else if (this.router.url === '/signup') {
        this.isLoginMode = false;
      }
    });

    this.authService.getCurrentUser().then((user) => {
      this.user = user;
    }).catch((err) => {
      console.error('User not authenticated', err);
    });
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  logout() {
    this.authService.signOut().then(() => {
      this.user = null;
      this.router.navigate(['/login']);  // Redirect after logout
    }).catch((err) => {
      console.error('Logout failed', err);
    });
  }
}
