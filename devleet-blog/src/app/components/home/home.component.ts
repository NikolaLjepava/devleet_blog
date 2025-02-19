import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  user: any;

  constructor(private authService: AuthService, private router: Router) {}
  
  ngOnInit(): void {
    this.checkUser();
  }

  async checkUser() {
    try {
      this.user = await this.authService.getCurrentUser();
    } catch (error) {
      console.log('No user logged in');
      this.user = null;
    }
  }
  logout() {
    this.authService.signOut().then(() => {
      this.router.navigate(['/login']);
    }).catch((error) => {
      console.error('Error logging out:', error);
    });
  }
}
