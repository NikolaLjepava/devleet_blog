import { Component } from '@angular/core';
import { BlogService } from '../../services/blog.service';

@Component({
  selector: 'app-create-blog',
  templateUrl: './create-blog.component.html',
  styleUrls: ['./create-blog.component.css']
})
export class CreateBlogComponent {
  title: string = '';
  content: string = '';
  message: string = '';

  constructor(private blogService: BlogService) {}

  onSubmit(): void {
    const post = { title: this.title, content: this.content };

    this.blogService.createPost(post).then(observable => {
      observable.subscribe({
        next: (data) => {
          this.message = 'Post created successfully!';
          this.title = '';
          this.content = '';
        },
        error: (err) => {
          this.message = 'Error creating post';
        }
      });
    });
  }
}
