import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-nested-comments',
  templateUrl: './nested-comments.component.html',
  styleUrls: ['./nested-comments.component.css']
})
export class NestedCommentsComponent {
  @Input() comments: any[] = [];
  @Output() reply = new EventEmitter<string>();

  replyingToCommentId: string | null = null; // Track which comment is being replied to
  replyContent: string = '';

  constructor(private apiService: ApiService) {}

  // Function to handle reply button click
  replyToComment(commentId: string) {
    this.replyingToCommentId = commentId;  // Set the comment to reply to
    this.replyContent = '';  // Reset reply content
  }

  // Function to submit the reply
  // submitReply() {
  //   if (this.replyContent.trim() && this.replyingToCommentId) {
  //     this.apiService.createComment(this.replyContent, this.replyingToCommentId).subscribe({
  //       next: (data) => {
  //         // Find the parent comment and add the reply to its children array
  //         const parentComment = this.comments.find(comment => comment.id === this.replyingToCommentId);
  //         if (parentComment) {
  //           // Ensure the children array exists
  //           if (!parentComment.children) {
  //             parentComment.children = [];  // Initialize children array if not present
  //           }
  //           parentComment.children.push(data);  // Add the new reply to the children array
  //         }
  
  //         // Reset after submitting the reply
  //         this.replyContent = '';  // Clear the reply content
  //         this.replyingToCommentId = null;  // Reset the replyingToCommentId to null
  //       },
  //       error: (error) => {
  //         console.error('Error submitting reply:', error);
  //       }
  //     });
  //   }
  // }  
}
