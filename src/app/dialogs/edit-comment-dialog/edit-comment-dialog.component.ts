import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AuthService} from '../../auth.service';
import {environment} from '../../../environments/environment';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-edit-comment-dialog',
  templateUrl: './edit-comment-dialog.component.html',
  styleUrls: ['./edit-comment-dialog.component.css']
})
export class EditCommentDialogComponent implements OnInit {

  readonly COMMENTS_URL: string = `${environment.baseUrl}/comments`;

  editCommentForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public comment: any,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditCommentDialogComponent>,
    private authService: AuthService,
    private toastService: ToastrService
  ) {}

  ngOnInit(): void {
    this.editCommentForm = this.formBuilder.group({
      text: new FormControl(this.comment.text, [Validators.required, Validators.minLength(5), Validators.maxLength(500)])
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  edit(): void {
    const editBody = {
      newMessage: this.editCommentForm.value.text
    };

    if (editBody.newMessage !== this.comment.text) {
      this.authService.patchResource(`${this.COMMENTS_URL}/${this.comment._id}`, editBody).subscribe(res => {
        if (res.edited) {
          this.toastService.success(res.message);
          this.comment.text = editBody.newMessage;
          this.dialogRef.close();
        }
        else {
          this.toastService.error(res.message);
        }
      }, err => {
        this.toastService.error(err.error.message);
      });
    }
    else {
      this.toastService.warning('Edited message cannot be same as current!');
    }
  }

}
