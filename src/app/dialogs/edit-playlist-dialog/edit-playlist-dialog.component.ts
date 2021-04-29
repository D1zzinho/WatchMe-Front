import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AuthService} from '../../auth.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {environment} from '../../../environments/environment';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-edit-playlist-dialog',
  templateUrl: './edit-playlist-dialog.component.html',
  styleUrls: ['./edit-playlist-dialog.component.css']
})
export class EditPlaylistDialogComponent implements OnInit {

  readonly PLAYLISTS_URL = `${environment.baseUrl}/playlist`;

  editPlaylistNameForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public playlist: any,
    private authService: AuthService,
    private toastService: ToastrService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditPlaylistDialogComponent>
  ) { }


  ngOnInit(): void {
    this.editPlaylistNameForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(50)])
    });
  }


  editName(): void {
    const body = {
      name: this.editPlaylistNameForm.value.name
    };

    if (body.name !== this.playlist.name) {
      this.authService.patchResource(`${this.PLAYLISTS_URL}/${this.playlist._id}/name`, body).subscribe(res => {
        if (res.edited) {
          this.playlist.name = body.name;
          this.toastService.success(res.message);
        }
        else {
          this.toastService.error('There was an error when editing playlist name! Message: ' + res.message);
        }
      }, err => {
        this.toastService.error('There was an error: ' + err.error.message);
      });
    }
    else {
      this.toastService.warning('New name cannot be same as current!');
    }
  }


  editPrivateStatus(): void {
    const body = { isPrivate : !this.playlist.isPrivate };

    this.authService.patchResource(`${this.PLAYLISTS_URL}/${this.playlist._id}/private`, body).subscribe(res => {
      if (res.edited) {
        this.playlist.isPrivate = body.isPrivate;
        this.toastService.success(res.message);
      }
      else {
        this.toastService.error('There was an error: ' + res.message);
      }
    }, err => {
      this.toastService.error('There was an error: ' + err.error.message);
    });
  }


  delete(): void {
    this.authService.deleteResource(`${this.PLAYLISTS_URL}/${this.playlist._id}`).subscribe(res => {
      if (!res.deleted) {
        this.toastService.error('There was an error when deleting playlist! Message: ' + res.message);
      }
      else {
        this.dialogRef.close({ deleted: res.deleted });
        this.toastService.success(res.message);
      }
    }, err => {
      this.toastService.error(err.error.message);
    });
  }

}
