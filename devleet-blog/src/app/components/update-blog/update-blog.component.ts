import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service'; // Add this to get the current user

@Component({
  selector: 'app-update-blog',
  templateUrl: './update-blog.component.html',
  styleUrls: ['./update-blog.component.css']
})
export class UpdateBlogComponent implements OnInit {
  id: number;
  title: string = '';
  content: string = '';
  post: any;
  isOwner: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blogService: BlogService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id');
    this.blogService.getPost(this.id).subscribe({
      next: (data) => {
        this.post = data;
        this.title = data.title;
        this.content = data.content;

        // Get current user ID and check if they are the post owner
        this.authService.getCurrentUser().then(user => {
          if (user && user.username === data.userId) {
            this.isOwner = true;
          } else {
            this.isOwner = false;
          }
        });
      },
      error: (err) => console.error('Error fetching post:', err)
    });
  }

  async onSubmit() {
    const updatedPost = {
      id: this.id,
      title: this.title,
      content: this.content
    };

    try {
      await this.blogService.updatePost(updatedPost);
      alert('Post updated successfully!');
      this.router.navigate(['/blogs']);
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post.');
    }
  }
}
