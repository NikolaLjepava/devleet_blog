import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { AuthService } from '../../services/auth.service';  // Inject AuthService

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
    private authService: AuthService,  // Inject AuthService to access current user
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    this.fetchPost();
    console.log("This is the this.id from the route snapshot", this.id);
  }

  async fetchPost() {
    try {
      this.post = await this.blogService.getPostById(this.id);
      const currentUser = await this.authService.getCurrentUser();
      console.log("This is the post.owner", this.post.owner);
      console.log("This is the currentUser.username", currentUser.username);
      // Instead of userId, try fetching the owner field
      this.isOwner = this.post.owner === currentUser.username; 
    } catch (error) {
      console.error('Error fetching post:', error);
    }
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
