import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-create-blog',
  templateUrl: './create-blog.component.html',
  styleUrls: ['./create-blog.component.css']
})
export class CreateBlogComponent {
  title = '';
  content = '';

  @Output() postCreated = new EventEmitter<void>();

  constructor(private blogService: BlogService, private router: Router) {}

  onSubmit(): void {
    const postData = {
      id: Math.floor(Math.random() * 1000000),
      title: this.title,
      content: this.content
    };

    this.blogService.createPost(postData).pipe(
      catchError((error) => {
        console.error('Error creating post:', error);
        alert('Failed to create post.');
        this.router.navigate(['/blogs']);
        return of(null);
      })
    ).subscribe((response) => {
      if (response) {
        this.router.navigate(['/blogs']);
        this.postCreated.emit();
      } else {
        console.error('Failed to create post');
      }
    });
  }
}
