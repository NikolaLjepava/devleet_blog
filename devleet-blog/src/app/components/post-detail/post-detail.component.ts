import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {
  post: any;
  isOwner: boolean = false;
  id: number;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.fetchPost();
  }

  fetchPost() {
    this.blogService.getPost(this.id).subscribe({
      next: (data) => {
        this.post = data;
        console.log('Fetched post:', this.post);
        this.checkOwnership();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching post:', error);
        this.isLoading = false;
      }
    });
  }

  checkOwnership() {
    this.authService.getCurrentUser().subscribe({
      next: (currentUser) => {
        const userEmail = currentUser ? currentUser.attributes.email : null;
        this.isOwner = this.post.userEmail === userEmail;
      },
      error: (error) => {
        console.error('Error checking ownership:', error);
      }
    });
  }

  onUpdate() {
    if (this.isOwner) {
      this.router.navigate([`/update-blog/${this.id}`]);
    } else {
      console.error('You are not the owner of this post.');
    }
  }

  onDelete() {
    if (this.isOwner) {
      this.blogService.deletePost(this.id).pipe(
        catchError((error) => {
          console.error('Error deleting post:', error);
          return of(null);
        })
      ).subscribe((response) => {
        if (response) {
          this.router.navigate(['/blogs']);
        } else {
          console.error('Failed to delete post');
        }
      });
    } else {
      console.error('You are not the owner of this post.');
    }
  }
}