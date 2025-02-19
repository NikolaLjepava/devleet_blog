import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  user: any = null;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getCurrentUser().pipe(
      catchError((err) => {
        console.error('User not authenticated', err);
        this.user = null;
        return [];
      })
    ).subscribe((user) => {
      this.user = user;
    });
  }

  logout() {
    this.authService.signOut().pipe(
      catchError((err) => {
        console.error('Logout failed', err);
        return [];
      })
    ).subscribe(() => {
      this.user = null;
      this.router.navigate(['/login']);
    });
  }
}
