import {Component, Inject, OnInit} from '@angular/core';
import {MatSelectionListChange} from '@angular/material/list';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AuthService} from '../../auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Location} from '@angular/common';
import {ToastrService} from 'ngx-toastr';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-save-in-playlist-dialog',
  templateUrl: './save-in-playlist-dialog.component.html',
  styleUrls: ['./save-in-playlist-dialog.component.css']
})
export class SaveInPlaylistDialogComponent implements OnInit {

  readonly PLAYLISTS_URL = `${environment.baseUrl}/playlist`;

  playlists: Array<any>;
  noPlaylists: Promise<boolean> = Promise.resolve(false);
  video: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthService,
    private router: Router,
    private currentRoute: ActivatedRoute,
    private location: Location,
    private toastService: ToastrService,
    public dialogRef: MatDialogRef<SaveInPlaylistDialogComponent>
  ) { }


  ngOnInit(): void {
    if (this.data.playlists.length > 0) {
      this.data.playlists.forEach(playlist => {
        const isAdded = playlist.videos.findIndex(video => {
          return video._id === this.data.video._id;
        });

        playlist.hasSelectedVideo = isAdded !== -1;
      });

      this.playlists = this.data.playlists;
      this.video = this.data.video;
    }
    else {
      this.noPlaylists = Promise.resolve(true);
    }
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
      if (res.addedVideo) {
        if (this.data.playlist != null) {
          if (this.data.playlist._id === playlistId) {
            this.data.playlist.videos.push(res.addedVideo);
          }
        }

        const playlistIndex = this.data.playlists.findIndex(playlist => {
          return playlist._id === playlistId;
        });

        const videoIndex = this.data.playlists[playlistIndex].videos.findIndex(video => {
          return video._id === res.addedVideo._id;
        });
        if (videoIndex === -1) {
          this.data.playlists[playlistIndex].videos.push(res.addedVideo);
        }


        this.toastService.success(res.message);
      }
    }, err => {
      this.toastService.error(err.error.message);
    });
  }


  private deleteVideoFromPlaylistRequest(playlistId: string): void {
    this.authService.patchResource(`${this.PLAYLISTS_URL}/deleteFrom/${playlistId}`, { videoId: this.video._id }).subscribe(res => {
      if (this.data.playlist != null) {
        if (this.data.playlist._id === playlistId) {
          const index = this.data.playlist.videos.findIndex(video => {
            return video._id === res.deletedVideo;
          });

          this.data.playlist.videos.splice(index, 1);
        }
      }

      const playlistIndex = this.data.playlists.findIndex(playlist => {
        return playlist._id === playlistId;
      });

      const videoIndex = this.data.playlists[playlistIndex].videos.findIndex(video => {
        return video._id === this.data.video._id;
      });

      if (videoIndex !== -1) {
        this.data.playlists[playlistIndex].videos.splice(videoIndex, 1);
      }


      this.toastService.success(res.message);
    }, err => {
      this.toastService.error(err.error.message);
    });
  }

}
