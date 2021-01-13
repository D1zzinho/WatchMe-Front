import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AuthService} from '../../auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../../environments/environment';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {SnackBarComponent} from '../../snack-bar/snack-bar.component';

@Component({
  selector: 'app-edit-comment-dialog',
  templateUrl: './edit-comment-dialog.component.html',
  styleUrls: ['./edit-comment-dialog.component.css']
})
export class EditCommentDialogComponent implements OnInit {

  readonly COMMENTS_URL: string = `${environment.baseUrl}/comments`;
  readonly durationInSeconds = 5;

  editCommentForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public comment: any,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditCommentDialogComponent>,
    private authService: AuthService,
    private snackBar: MatSnackBar
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
      this.authService.patchResource(`${this.COMMENTS_URL}/${this.comment.id}`, editBody).subscribe(res => {
        if (res.edited) {
          this.openSnackBar(res.message, 'success');
          this.comment.text = res.comment;
          this.dialogRef.close();
        }
        else {
          this.openSnackBar(res.message, 'error');
        }
      }, err => {
        this.openSnackBar(err.message, 'error');
      });
    }
    else {
      this.openSnackBar('Edited message cannot be same as current!', 'warning');
    }
  }

  private openSnackBar(message: string, type: string): void {
    this.snackBar.openFromComponent(SnackBarComponent, {
      data: { message, type },
      duration: this.durationInSeconds * 1000,
      panelClass: ['darkBar']
    });
  }
}
