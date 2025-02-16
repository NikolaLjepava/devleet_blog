import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.css']
})
export class BlogListComponent implements OnInit {
  posts: any[] = [];
  loading: boolean = true;
  error: string = '';

  constructor(private blogService: BlogService) {}

  ngOnInit(): void {
    this.blogService.getPosts().then(observable => {
      observable.subscribe({
        next: (data) => {
          this.posts = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error loading posts';
          this.loading = false;
        }
      });
    });
  }
}
