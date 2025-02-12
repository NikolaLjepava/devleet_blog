import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // AuthService to check login status

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  user: any;

  constructor(private authService: AuthService) {}

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
}
