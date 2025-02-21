import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-logout-button',
  templateUrl: './logout-button.component.html',
})
export class LogoutButtonComponent implements OnInit {
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
  }
  
  logout() {
    this.authService.signOut().pipe(
      tap(() => {
        this.router.navigate(['/login']);
      }),
      catchError((error) => {
        console.error('Error logging out:', error);
        return of(null);
      })
    ).subscribe();
  }
}