import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-update-blog',
  templateUrl: './update-blog.component.html',
  styleUrls: ['./update-blog.component.css']
})
export class UpdateBlogComponent implements OnInit {
  id: number;
  title: string = '';
  content: string = '';
  post: any;
  isOwner: boolean = false;

  constructor(
    private router: Router,
    private blogService: BlogService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
  }

  onSubmit() {
    const updatedPost = {
      id: this.id,
      title: this.title,
      content: this.content,
    };
  
    this.blogService.updatePost(updatedPost).pipe(
      tap(() => {
        alert('Post updated successfully!');
        this.router.navigate(['/blogs']);
      }),
      catchError((error) => {
        console.error('Error updating post:', error);
        alert('Failed to update post.');
        return of(null);
      })
    ).subscribe();
  }
  
}
