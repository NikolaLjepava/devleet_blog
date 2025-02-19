import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';


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

  async onSubmit() {  
    const postData = {
      id: Math.floor(Math.random() * 1000000),
      title: this.title,
      content: this.content
    };
  
    try {
      await this.blogService.createPost(postData);
      this.router.navigate(['/blogs']);
      this.postCreated.emit();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post.');
      this.router.navigate(['/blogs']);
    }
}

  
}
