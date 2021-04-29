import {Component, Inject, OnInit} from '@angular/core';
import {AuthService} from '../../auth.service';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {environment} from '../../../environments/environment';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-create-playlist-dialog',
  templateUrl: './create-playlist-dialog.component.html',
  styleUrls: ['./create-playlist-dialog.component.css']
})
export class CreatePlaylistDialogComponent implements OnInit {

  readonly PLAYLISTS_URL = `${environment.baseUrl}/playlist`;

  playlists: Array<any>;

  createPlaylistForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private toastService: ToastrService,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CreatePlaylistDialogComponent>
  ) { }


  ngOnInit(): void {
    this.playlists = this.data.playlists;

    this.createPlaylistForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]),
      isPrivate: new FormControl(false, Validators.required)
    });
  }


  createPlaylist(): void {
    const body = {
      name: this.createPlaylistForm.value.name,
      isPrivate: this.createPlaylistForm.value.isPrivate
    };

    this.authService.postResource(`${this.PLAYLISTS_URL}`, body).subscribe(res => {
      if (res.created) {
        const playlist = res.playlist;
        playlist.author = this.authService.getUsernameFromToken();

        this.data.playlists.push(playlist);
        this.dialogRef.close(res);

        this.toastService.success(res.message);
      }
      else {
        this.toastService.warning(res.message);
      }
    }, err => {
      this.toastService.error(err.error.message);
    });
  }

}
