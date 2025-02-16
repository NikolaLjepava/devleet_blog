import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.signOut().then(() => {
      // After logout, redirect to login page or home page
      this.router.navigate(['/login']);
    }).catch(error => {
      console.error('Logout error:', error);
    });
  }
}
