import { Component } from '@angular/core';
import { BlogService } from '../../services/blog.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-delete-blog',
  templateUrl: './delete-blog.component.html',
  styleUrls: ['./delete-blog.component.css']
})
export class DeleteBlogComponent {
  id: number = 0;
  message: string = '';

  constructor(
    private blogService: BlogService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;  // Get post ID from URL
  }

  onDelete(): void {
    this.blogService.deletePost(this.id).then(observable => {
      observable.subscribe({
        next: (data) => {
          this.message = 'Post deleted successfully!';
        },
        error: (err) => {
          this.message = 'Error deleting post';
        }
      });
    });
  }
}
