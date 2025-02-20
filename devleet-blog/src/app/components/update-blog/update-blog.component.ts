import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-update-blog',
  templateUrl: './update-blog.component.html',
  styleUrls: ['./update-blog.component.css']
})
export class UpdateBlogComponent implements OnInit {
  id: number;
  title: string = '';
  content: string = '';
  selectedFile: File = null;

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.fetchPost();
  }

  fetchPost() {
    this.blogService.getPost(this.id).subscribe({
      next: (data) => {
        this.title = data.title;
        this.content = data.content;
      },
      error: (error) => {
        console.error('Error fetching post:', error);
      }
    });
  }

  onFileSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
    }
  }

  onSubmit() {
    const updatedPost = {
      id: this.id,
      title: this.title,
      content: this.content,
    };

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result.toString().split(',')[1];
        const fileExtension = this.selectedFile.name.split('.').pop();
        this.blogService.updatePost(updatedPost, imageData, fileExtension).pipe(
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
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
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
}