import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-update-blog',
  templateUrl: './update-blog.component.html',
  styleUrls: ['./update-blog.component.css']
})
export class UpdateBlogComponent implements OnInit {
  id: number;
  title: string;
  content: string;
  selectedFile: File;

  constructor(private route: ActivatedRoute, private blogService: BlogService, private router: Router) {}

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

  onFileSelected(event: any): void {
    const fileInput = event.target;
    if (fileInput.files && fileInput.files[0]) {
      this.selectedFile = fileInput.files[0];
    }
  }

  onSubmit(): void {
    const postData = {
      id: this.id,
      title: this.title,
      content: this.content
    };

    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result.toString().split(',')[1];
        const fileExtension = this.selectedFile.name.split('.').pop();
        this.blogService.updatePost(postData, imageData, fileExtension).pipe(
          catchError((error) => {
            console.error('Error updating post:', error);
            alert('Failed to update post.');
            return of(null);
          })
        ).subscribe((response) => {
          if (response) {
            this.router.navigate(['/blogs']);
          }
        });
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.blogService.updatePost(postData).pipe(
        catchError((error) => {
          console.error('Error updating post:', error);
          alert('Failed to update post.');
          return of(null);
        })
      ).subscribe((response) => {
        if (response) {
          this.router.navigate(['/blogs']);
        }
      });
    }
  }
}