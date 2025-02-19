import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit {
  post: any = null;
  id: number = 0;
  isOwner: boolean = false;  // Flag to check if the logged-in user is the original poster

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.fetchPost();
  }

  fetchPost() {
    this.blogService.getPost(this.id).subscribe({
      next: (data) => {
        this.post = data;
        this.checkOwnership();
      },
      error: (error) => {
        console.error('Error fetching post:', error);
      }
    });
  }
  
  checkOwnership() {
    this.apiService.checkIfAuthor(this.id).subscribe({
      next: (response) => {
        console.log('API response:', response);
        this.isOwner = response.isOwner;
        console.log('Is owner:', this.isOwner);
      },
      error: (error) => {
        console.error('Error checking ownership:', error);
      }
    });
  }
  

  onUpdate() {
    if (this.isOwner) {
      this.router.navigate([`/update-blog/${this.id}`]);
    } else {
      console.error('You are not the owner of this post.');
    }
  }

  async onDelete() {
    if (this.isOwner) {
      try {
        await this.blogService.deletePost(this.id);
        this.router.navigate(['/blogs']);
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    } else {
      console.error('You are not the owner of this post.');
    }
  }
}
