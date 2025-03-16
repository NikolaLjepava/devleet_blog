import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { BlogService } from '../services/blog.service';

//used for checking if the user is the owner of the post when manually entering the url as a backup guard
@Injectable({
  providedIn: 'root',
})
export class OwnershipGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private blogService: BlogService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    const postId = +route.paramMap.get('id');
  
    return this.blogService.getPost(postId).pipe(
      switchMap((post) =>
        this.authService.getCurrentUser().pipe(
          map((currentUser) => {
            // Check if the user is the owner
            if (post.owner === currentUser.username) {
              return true;
            } else {
              this.router.navigate(['/blogs']);
              return false;
            }
          })
        )
      ),
      catchError((error) => {
        console.error('Error checking ownership:', error);
        this.router.navigate(['/blogs']);
        return of(false);
      })
    );
  }
  
}
