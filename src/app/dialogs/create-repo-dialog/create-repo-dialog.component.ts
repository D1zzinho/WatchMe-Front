import { Component, OnInit } from '@angular/core';
import {AuthService} from '../../auth.service';
import {MatDialogRef} from '@angular/material/dialog';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../../environments/environment';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-create-repo-dialog',
  templateUrl: './create-repo-dialog.component.html',
  styleUrls: ['./create-repo-dialog.component.css']
})
export class CreateRepoDialogComponent implements OnInit {

  createRepoForm: FormGroup;

  checked = false;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CreateRepoDialogComponent>,
    private authService: AuthService,
    private toastService: ToastrService
  ) {}


  ngOnInit(): void {
    this.createRepoForm = this.formBuilder.group({
      repoName: new FormControl('', [Validators.required, Validators.maxLength(200), Validators.minLength(10)]),
      repoDescription: new FormControl('', [Validators.maxLength(200), Validators.minLength(30)])
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onCreateRepoSubmit(): void {
    const newRepo = {
      name: this.createRepoForm.value.repoName,
      description: this.createRepoForm.value.repoDescription,
      private: this.checked
    };

    this.authService.postResource(`${environment.baseUrl}/gitHubUsers/repos`, newRepo).subscribe(result => {
      this.toastService.success(`Repository ${result.name} successfully created!`);
      this.dialogRef.close();
    }, error => {
      this.toastService.error(error.message);
      throw new Error(error.message);
    });
  }

}
