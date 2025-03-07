import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  @Input() postId: number;
  comments: any[] = [];
  newCommentContent: string = '';
  isOwner: boolean = false;
  replyContent: string = '';
  replyingToCommentId: string | null = null; // Track which comment is being replied to

  constructor(
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {

    this.fetchComments();
  }

  fetchComments(): void {
    this.apiService.listComments(this.postId.toString()).subscribe({
      next: (data) => {
        this.comments = data.map(comment => ({
          ...comment,
          repliesVisible: false,  // Add repliesVisible for toggling visibility
          children: comment.children || []  // Ensure children array is initialized
        }));
        console.log('Fetched structured comments:', this.comments);
      },
      error: (error) => {
        console.error('Error fetching comments:', error);
      }
    });
  }
  
  

  createComment() {
    if (this.newCommentContent.trim()) {
      this.apiService.createComment(this.newCommentContent, this.postId.toString(), null).subscribe({
        next: (data) => {
          this.comments.push(data);
          this.newCommentContent = '';
        },
        error: (error) => {
          console.error('Error creating comment:', error);
        }
      });
    }
  }
  

  deleteComment(commentId: string) {
    this.apiService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(comment => comment.id !== commentId);
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
      }
    });
  }

  updateComment(commentId: string, content: string) {
    this.apiService.updateComment(commentId, content).subscribe({
      next: (updatedComment) => {
        const index = this.comments.findIndex(comment => comment.id === commentId);
        if (index !== -1) {
          this.comments[index] = updatedComment;
        }
      },
      error: (error) => {
        console.error('Error updating comment:', error);
      }
    });
  }

  replyToComment(commentId: string) {
    this.replyingToCommentId = commentId;
    this.replyContent = ''; // Reset the reply content
  }

 submitReply() {
  if (this.replyContent.trim() && this.replyingToCommentId) {
    this.apiService.createComment(this.replyContent, this.postId.toString(), this.replyingToCommentId).subscribe({
      next: (data) => {
        const addReplyToParent = (comments: any[]) => {
          for (let comment of comments) {
            if (comment.id === this.replyingToCommentId) {
              if (!comment.replies) {
                comment.replies = [];
              }
              comment.replies.push(data);
              return true; // Stop recursion once added
            } else if (comment.replies) {
              if (addReplyToParent(comment.replies)) {
                return true; // Stop recursion once added
              }
            }
          }
          return false;
        };

        addReplyToParent(this.comments);

        // Reset reply input
        this.replyContent = '';
        this.replyingToCommentId = null;
      },
      error: (error) => {
        console.error('Error submitting reply:', error);
      }
    });
  }
}

  upvoteComment(commentId: string) {
    this.apiService.upvoteComment(commentId).subscribe({
      next: (updatedComment) => {
        const index = this.comments.findIndex(comment => comment.id === commentId);
        if (index !== -1) {
          // Update the comment with the latest upvote score
          this.comments[index] = updatedComment;
        }
      },
      error: (error) => {
        console.error('Error upvoting comment:', error);
      }
    });
  }

  downvoteComment(commentId: string) {
    this.apiService.downvoteComment(commentId).subscribe({
      next: (updatedComment) => {
        const index = this.comments.findIndex(comment => comment.id === commentId);
        if (index !== -1) {
          // Update the comment with the latest downvote score
          this.comments[index] = updatedComment;
        }
      },
      error: (error) => {
        console.error('Error downvoting comment:', error);
      }
    });
  }
}
