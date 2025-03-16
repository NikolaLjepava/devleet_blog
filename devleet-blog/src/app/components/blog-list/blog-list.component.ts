import { Component, OnInit, OnDestroy } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit, OnDestroy {
  posts: any[] = [];
  loading: boolean = true;
  error: string = '';
  private postsSubscription: Subscription;

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.fetchPosts();
  }

  // Fetch blog posts
  fetchPosts() {
    this.postsSubscription = this.blogService.getPosts().subscribe({
      next: (data) => {
        // Each post has a 'createdAt' field used for sorting
        this.posts = data.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Sort by createdAt (newest to oldest)
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching posts:', err);
        this.error = 'Error loading posts. Please try again later.';
        this.loading = false;
      }
    });
  }

  // Cleanup to prevent memory leaks when the component is destroyed
  ngOnDestroy() {
    if (this.postsSubscription) {
      this.postsSubscription.unsubscribe();
    }
  }
}