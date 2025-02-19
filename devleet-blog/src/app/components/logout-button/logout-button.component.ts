import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-logout-button',
  templateUrl: './logout-button.component.html',
})
export class LogoutButtonComponent implements OnInit {
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Check if the user is authenticated
    this.authService.isAuthenticated().then((isAuthenticated) => {
      this.isLoggedIn = isAuthenticated;
    });
  }

  logout() {
    this.authService.signOut().then(() => {
      this.router.navigate(['/login']); // Redirect to login page after logout
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  }
}



