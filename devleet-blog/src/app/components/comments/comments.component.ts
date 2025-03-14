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
        // Build structured comments with sorting
        const structuredComments = this.apiService.buildCommentTree(data);
        
        // Map to preserve UI state
        this.comments = structuredComments.map(comment => 
          this.addUIStateToComment(comment)
        );
      },
      error: (error) => {
        console.error('Error fetching comments:', error);
      }
    });
  }
  
  private addUIStateToComment(comment: any): any {
    return {
      ...comment,
      repliesVisible: comment.repliesVisible || false,
      children: (comment.children || []).map(child => 
        this.addUIStateToComment(child)
      )
    };
  }
  
  createComment() {
    if (this.newCommentContent.trim()) {
      this.authService.getUserEmail().subscribe({
        next: (userEmail) => {
          this.apiService.createComment(this.newCommentContent, String(this.postId), null, userEmail).subscribe({
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
          this.apiService.createComment(replyContent, String(this.postId), commentId, userEmail)
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
    console.log('Attempting to upvote comment:', commentId);
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        const userId = user.attributes.email;
        const comment = this.findCommentById(this.comments, commentId);
        console.log('Found comment for voting:', comment);
        if (comment) {
          const postId = String(comment.postId);
          this.apiService.upvoteComment(commentId, postId, userId).subscribe({
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
          const postId = String(comment.postId);
          this.apiService.downvoteComment(commentId, postId, userId).subscribe({
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
    // 1. Create a working copy
    const commentsCopy = JSON.parse(JSON.stringify(this.comments));
    
    // 2. Update the comment in the copy
    const updateRecursively = (comments: any[]): boolean => {
      return comments.some((comment, index) => {
        if (comment.id === commentId) {
          comments[index] = {
            ...updatedComment,
            voteScore: updatedComment.upvotes - updatedComment.downvotes,
            repliesVisible: comment.repliesVisible, // Preserve visibility
            children: comment.children // Preserve child structure
          };
          return true;
        }
        return comment.children && updateRecursively(comment.children);
      });
    };
  
    if (updateRecursively(commentsCopy)) {
      // 3. Re-sort while preserving UI state
      const sortedComments = this.apiService.buildCommentTree(commentsCopy)
        .map(comment => this.addUIStateToComment(comment));
        
      // 4. Update component state
      this.comments = sortedComments;
    }
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