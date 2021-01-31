import {Component, Inject, OnInit} from '@angular/core';
import {SnackBarComponent} from '../../snack-bar/snack-bar.component';
import {AuthService} from '../../auth.service';
import {environment} from '../../../environments/environment';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {MatSelectionListChange} from '@angular/material/list';

@Component({
  selector: 'app-playlist-actions-dialog',
  templateUrl: './playlist-actions-dialog.component.html',
  styleUrls: ['./playlist-actions-dialog.component.css']
})
export class PlaylistActionsDialogComponent implements OnInit {

  readonly PLAYLISTS_URL = `${environment.baseUrl}/playlist`;
  readonly VIDEOS_URL = `${environment.baseUrl}/videos`;
  readonly durationInSeconds = 5;

  playlists: Array<any>;
  video: any;

  saveVideoInForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private router: Router,
    private currentRoute: ActivatedRoute,
    private location: Location,
    private snackBar: MatSnackBar,
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<PlaylistActionsDialogComponent>
  ) {}


  ngOnInit(): void {
    this.data.playlists.forEach(playlist => {
      const isAdded = playlist.videos.findIndex(video => {
        return video._id === this.data.video._id;
      });

      playlist.hasCurrentVideo = isAdded !== -1;
    });

    this.playlists = this.data.playlists;
    this.video = this.data.video;

    this.saveVideoInForm = this.formBuilder.group({
      playlist: new FormControl('', Validators.required)
    });
  }


  createAutoPlaylist(): void {
    this.authService.postResource(`${this.PLAYLISTS_URL}/auto`, { video: this.video._id }).subscribe(res => {
      if (res.created) {
        this.data.playlists.push(res.playlist);
        this.location.replaceState(`/player`, `?vid=${this.video._id}&list=${res.playlist._id}`);
        this.data.playlist = res.playlist;
        this.dialogRef.close(res.playlist);

        this.openSnackBar(res.message, 'success');
      }
    }, err => {
      this.openSnackBar(err.message, 'error');
    });
  }


  saveVideoInPlaylist(event: MatSelectionListChange): void {
    event.options.forEach(option => {
      if (option.selected) {
        this.saveVideoInPlaylistRequest(option.value);
      }
      else {
        this.deleteVideoFromPlaylistRequest(option.value);
      }
    });
  }


  private saveVideoInPlaylistRequest(playlistId: string): void {
    this.authService.patchResource(`${this.PLAYLISTS_URL}/${playlistId}`, { videoId: this.video._id }).subscribe(res => {
      if (res.added) {
        if (this.data.playlist != null) {
          if (this.data.playlist._id === playlistId) {
            this.data.playlist.videos.push(res.addedVideo);
            this.data.playlist.hasCurrentVideo = true;
          }
        }

        const playlistIndex = this.data.playlists.findIndex(playlist => {
          return playlist._id === playlistId;
        });
        this.data.playlists[playlistIndex].videos.push(res.addedVideo);
        this.data.playlists[playlistIndex].hasCurrentVideo = true;

        this.openSnackBar(res.message, 'success');
      }
      else {
        this.openSnackBar(res.message, 'error');
      }
    }, err => {
      this.openSnackBar(err.message, 'error');
    });
  }


  private deleteVideoFromPlaylistRequest(playlistId: string): void {
    this.authService.patchResource(`${this.PLAYLISTS_URL}/deleteFrom/${playlistId}`, { videoId: this.video._id }).subscribe(res => {
      if (res.deleted) {
        if (this.data.playlist != null) {
          if (this.data.playlist._id === playlistId) {
            const index = this.data.playlist.videos.findIndex(video => {
              return video._id === res.deletedVideo;
            });

            this.data.playlist.videos.splice(index, 1);
            this.data.playlist.hasCurrentVideo = false;
          }
        }

        const playlistIndex = this.data.playlists.findIndex(playlist => {
          return playlist._id === playlistId;
        });

        const videoIndex = this.data.playlists[playlistIndex].videos.findIndex(video => {
          return video._id === this.data.video._id;
        });

        this.data.playlists[playlistIndex].videos.splice(videoIndex, 1);
        this.data.playlists[playlistIndex].hasCurrentVideo = false;

        this.openSnackBar(res.message, 'success');
      }
      else {
        this.openSnackBar(res.message, 'error');
      }
    }, err => {
      this.openSnackBar(err.message, 'error');
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
