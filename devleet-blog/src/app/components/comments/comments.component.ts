import { Component, Input, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { map, switchMap } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
    private authService: AuthService
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
      this.authService.getUserEmail().subscribe({
        next: (userEmail) => {
          this.apiService.createComment(this.newCommentContent, this.postId.toString(), null, userEmail).subscribe({
            next: (data) => {
              this.comments.push(data);
              this.newCommentContent = '';
            },
            error: (error) => {
              console.error('Error creating comment:', error);
            }
          });
        },
        error: (err) => {
          console.error('Error fetching user email:', err);
        }
      });
    }
  }  
  
  deleteComment(commentId: string) {
    this.authService.getUserEmail().pipe(
      switchMap(userEmail => {
        const comment = this.findCommentById(this.comments, commentId);
        if (comment) {
          return this.apiService.deleteComment(commentId, userEmail, comment.postId);
        } else {
          return throwError(() => new Error("Comment not found"));
        }
      })
    ).subscribe({
      next: () => {
        this.removeCommentFromTree(commentId);
      },
      error: (error) => {
        console.error('Error deleting comment:', error);
      }
    });
  }

  updateComment(commentId: string, content: string) {
    this.apiService.updateComment(commentId, content).subscribe({
      next: (updatedComment) => {
        this.updateCommentInTree(commentId, updatedComment);
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

  submitReply(commentId: string, replyContent: string) {
    if (replyContent.trim() && commentId) {
      this.authService.getUserEmail().pipe(
        switchMap((userEmail: string) =>
          this.apiService.createComment(replyContent, this.postId.toString(), commentId, userEmail)
        )
      ).subscribe({
        next: (data) => {
          // Recursively add the reply to the correct parent comment
          const addReplyToParent = (comments: any[]): boolean => {
            for (let comment of comments) {
              if (comment.id === commentId) {
                if (!comment.replies) {
                  comment.replies = [];  // Ensure replies array exists
                }
                comment.replies.push(data);  // Add the new reply
                // Set `hasReplies` to true for the parent comment
                comment.hasReplies = true;
                return true;  // Stop recursion once added
              } else if (comment.replies) {
                if (addReplyToParent(comment.replies)) {
                  return true;
                }
              }
            }
            return false;
          };
          addReplyToParent(this.comments);
          // Reset reply input and hide the reply box
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
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        const userId = user.attributes.email;
        const comment = this.findCommentById(this.comments, commentId);
        if (comment) {
          this.apiService.upvoteComment(commentId, comment.postId, userId).subscribe({
            next: (updatedComment) => {
              this.updateCommentInTree(commentId, updatedComment);
            },
            error: (error) => {
              console.error('Error upvoting comment:', error);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error retrieving user:', err);
      }
    });
  }

  downvoteComment(commentId: string) {
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        const userId = user.attributes.email;
        const comment = this.findCommentById(this.comments, commentId);
        if (comment) {
          this.apiService.downvoteComment(commentId, comment.postId, userId).subscribe({
            next: (updatedComment) => {
              this.updateCommentInTree(commentId, updatedComment);
            },
            error: (error) => {
              console.error('Error downvoting comment:', error);
            }
          });
        }
      },
      error: (err) => {
        console.error('Error retrieving user:', err);
      }
    });
  }

  private removeCommentFromTree(commentId: string): void {
    const removeRecursively = (comments: any[]): any[] => {
      return comments.filter(comment => {
        if (comment.id === commentId) {
          return false;
        }
        if (comment.children && comment.children.length > 0) {
          comment.children = removeRecursively(comment.children);
        }
        return true;
      });
    };
    this.comments = removeRecursively(this.comments);
  }

  private updateCommentInTree(commentId: string, updatedComment: any): void {
    const updateRecursively = (comments: any[]) => {
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === commentId) {
          comments[i] = updatedComment;
          return true;
        }
        if (comments[i].children && comments[i].children.length > 0) {
          if (updateRecursively(comments[i].children)) {
            return true;
          }
        }
      }
      return false;
    };
    updateRecursively(this.comments);
  }  
  
  private findCommentById(comments: any[], commentId: string): any {
    for (let comment of comments) {
      if (comment.id === commentId) {
        return comment;
      }
      if (comment.children && comment.children.length > 0) {
        const found = this.findCommentById(comment.children, commentId);
        if (found) return found;
      }
    }
    return null;
  }
}