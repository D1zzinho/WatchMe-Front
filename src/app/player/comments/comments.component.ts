import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {CommentDto} from '../../models/CommentDto';
import {EditCommentDialogComponent} from '../../dialogs/edit-comment-dialog/edit-comment-dialog.component';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {MatDialog} from '@angular/material/dialog';
import {AuthService} from '../../auth.service';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {

  readonly COMMENTS_URL: string = `${environment.baseUrl}/comments`;
  readonly baseUrl: string = environment.baseUrl;

  @Input() currentUserAvatar: HTMLImageElement;
  @Input() currentUserAvatarLoaded: boolean;
  @Input() comments: Array<any>;
  @Input() isAdmin: boolean;
  @Input() video: any;
  @Input() currentUser: string;

  timeoutEnded: boolean;

  commentForm: FormGroup;

  @ViewChild('commentInput', { static: false }) commentInput: ElementRef<HTMLTextAreaElement>;


  constructor(
    private authService: AuthService,
    private toastService: ToastrService,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
  ) { }


  private static noWhitespaceValidator(control: FormControl): any {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }


  ngOnInit(): void {
    this.commentForm = this.formBuilder.group({
      text: new FormControl('',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(500),
          CommentsComponent.noWhitespaceValidator
        ]
      )
    });
  }


  addComment(): void {
    this.authService.postResource(`${this.COMMENTS_URL}/${this.video._id}`, { text: this.commentForm.value.text }).subscribe(res => {
      if (res.added) {
        this.commentInput.nativeElement.value = '';
        this.commentInput.nativeElement.style.height = '45px';
        this.commentForm.reset();
        this.comments.unshift(res.comment);

        this.toastService.success(res.message);
      }
      else {
        this.toastService.error(res.message);
      }
    }, error => {
      this.toastService.error(error.error.message);
    });
  }


  deleteComment(commentId: string): void {
    this.authService.deleteResource(`${this.COMMENTS_URL}/${commentId}`).subscribe(res => {
      if (res.deleted) {
        const index = this.comments.findIndex(comment => comment._id === commentId);

        if (index > -1) {
          this.comments.splice(index, 1);
        }

        this.toastService.success(res.message);
      }
      else {
        this.toastService.error(res.message);
      }
    }, err => {
      this.toastService.error(err.error.message);
    });
  }


  openEditCommentDialog(comment: CommentDto): void {
    this.dialog.open(EditCommentDialogComponent, {
      data: comment,
      restoreFocus: false
    });
  }


}
