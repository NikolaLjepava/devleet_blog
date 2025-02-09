import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  user: any = null;
  message: string = '';
  error: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.checkUser(); // this part checks whether there is a logged in user upon page load
  }

  async checkUser() {
    this.user = await this.authService.getCurrentUser();
  }

  async logout() {
    try {
      await this.authService.signOut();
      this.user = null;
      this.message = 'You have logged out.';
    } catch (err) {
      this.error = 'Something went wrong. Refresh and try again.';
    }
  }
}
