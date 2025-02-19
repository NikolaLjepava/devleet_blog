import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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

  checkUser() {
    this.authService.getCurrentUser().pipe(
      catchError((error) => {
        console.log('No user logged in');
        this.user = null;
        return of(null);
      })
    ).subscribe((user) => {
      this.user = user;
    });
  }

  logout() {
    this.authService.signOut().pipe(
      catchError((error) => {
        console.error('Error logging out:', error);
        return of(null);
      })
    ).subscribe(() => {
      this.router.navigate(['/login']); // Redirect to login after successful logout
    });
  }
}
