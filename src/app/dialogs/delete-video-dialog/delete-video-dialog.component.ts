import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {AuthService} from '../../auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../../environments/environment';
import {SnackBarComponent} from '../../snack-bar/snack-bar.component';

@Component({
  selector: 'app-delete-video-dialog',
  templateUrl: './delete-video-dialog.component.html',
  styleUrls: ['./delete-video-dialog.component.css']
})
export class DeleteVideoDialogComponent implements OnInit {

  readonly VIDEOS_URL: string = `${environment.baseUrl}/videos`;
  readonly durationInSeconds = 5;

  isOwner = false;

  constructor(@Inject(MAT_DIALOG_DATA) public video: any, private authService: AuthService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    if (this.video.author === this.authService.getUsernameFromToken()) {
      this.isOwner = true;
    }
  }

  delete(): void {
    if (this.authService.isAdmin() || this.isOwner) {
      this.authService.deleteResource(`${this.VIDEOS_URL}/${this.video._id}`).subscribe(result => {
        if (!result.deleteVideo.deleted) {
          this.openSnackBar('There was an error when deleting video! Message: ' + result.message, 'error');
        }
        else {
          this.openSnackBar('Video successfully deleted! Reloading page...', 'success');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      });
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
