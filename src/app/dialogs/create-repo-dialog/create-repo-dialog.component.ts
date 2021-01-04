import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SnackBarComponent} from '../../snack-bar/snack-bar.component';
import {MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-create-repo-dialog',
  templateUrl: './create-repo-dialog.component.html',
  styleUrls: ['./create-repo-dialog.component.css']
})
export class CreateRepoDialogComponent implements OnInit {

  readonly durationInSeconds = 5;

  createRepoForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CreateRepoDialogComponent>,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.createRepoForm = this.formBuilder.group({
      repoName: new FormControl('', [Validators.required, Validators.maxLength(200), Validators.minLength(10)])
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onCreateRepoSubmit(): void {
    const newRepo = {
      name: this.createRepoForm.value.repoName
    };

    this.authService.postResource(`${environment.baseUrl}/users/github/repos`, newRepo).subscribe(result => {
      this.openSnackBar(`Repository ${result.name} successfully created!`, 'success');
      this.dialogRef.close();
    }, error => {
      this.openSnackBar(error.message, 'error');
      throw new Error(error.message);
    });
  }

  private openSnackBar(message: string, type: string): void {
    this.snackBar.openFromComponent(SnackBarComponent, {
      data: { message, type },
      duration: this.durationInSeconds * 1000,
      panelClass: ['darkBar']
    });
  }
}
