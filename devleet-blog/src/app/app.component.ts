import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  user: any = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Track user authentication state
    this.authService.getCurrentUser().then((user) => {
      this.user = user;
    }).catch((err) => {
      console.error('User not authenticated', err);
      this.user = null; // Ensure user is set to null if not authenticated
    });
  }

  logout() {
    this.authService.signOut().then(() => {
      this.user = null;
      this.router.navigate(['/login']);
    }).catch((err) => {
      console.error('Logout failed', err);
    });
  }
}
