import { Component, Output, EventEmitter } from '@angular/core';
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
  selectedFile: File = null;

  @Output() postCreated = new EventEmitter<void>();

  constructor(private blogService: BlogService, private router: Router) {}

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
    }
  }

  onSubmit(): void {
    const postData = {
      id: Math.floor(Math.random() * 1000000),
      title: this.title,
      content: this.content
    };

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result.toString().split(',')[1];
        const fileExtension = this.selectedFile.name.split('.').pop();
        this.blogService.createPost(postData, imageData, fileExtension).pipe(
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
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
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
}