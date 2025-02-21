import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-delete-blog',
  templateUrl: './delete-blog.component.html',
  styleUrls: ['./delete-blog.component.css']
})
export class DeleteBlogComponent implements OnInit {
  id: number = 0;
  message: string = '';

  constructor(
    private blogService: BlogService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;  // Get post ID from URL
  }

  onDelete(): void {
    this.blogService.deletePost(this.id).pipe(
      catchError((error) => {
        this.message = 'Error deleting post';
        console.error('Error deleting post:', error);
        return of(null);
      })
    ).subscribe((response) => {
      if (response) {
        this.message = 'Post deleted successfully!';
        setTimeout(() => {
          this.router.navigate(['/blogs']);
        }, 2000);
      } else {
        this.message = 'Failed to delete post.';
      }
    });
  }
}
