import { Component, OnInit } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-update-blog',
  templateUrl: './update-blog.component.html',
  styleUrls: ['./update-blog.component.css']
})
export class UpdateBlogComponent implements OnInit {
  id: number = 0;
  title: string = '';
  content: string = '';
  message: string = '';

  constructor(
    private blogService: BlogService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;  // Get post ID from URL
    this.blogService.getPost(this.id).then(observable => {
      observable.subscribe({
        next: (data) => {
          this.title = data.title;
          this.content = data.content;
        },
        error: (err) => {
          this.message = 'Error loading post';
        }
      });
    });
  }

  onSubmit(): void {
    const post = { title: this.title, content: this.content };

    this.blogService.updatePost(this.id, post).then(observable => {
      observable.subscribe({
        next: (data) => {
          this.message = 'Post updated successfully!';
        },
        error: (err) => {
          this.message = 'Error updating post';
        }
      });
    });
  }
}
