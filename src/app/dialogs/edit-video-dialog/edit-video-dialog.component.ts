import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {VideoDto} from '../../models/VideoDto';
import {AuthService} from '../../auth.service';
import {environment} from '../../../environments/environment';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SnackBarComponent} from '../../snack-bar/snack-bar.component';

@Component({
  selector: 'app-edit-video-dialog',
  templateUrl: './edit-video-dialog.component.html',
  styleUrls: ['./edit-video-dialog.component.css']
})
export class EditVideoDialogComponent implements OnInit {

  readonly VIDEOS_URL = `${environment.baseUrl}/videos`;
  readonly durationInSeconds = 5;

  constructor(@Inject(MAT_DIALOG_DATA) public video: any, private authService: AuthService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
  }

  async editTitle(title: string): Promise<void> {
    if (title !== '') {
      if (this.video.title !== title) {
        try {
          const editTitle = await this.authService.patchResource(`${this.VIDEOS_URL}/${this.video._id}/title`, {title}).toPromise();

          if (editTitle.updated) {
            this.video.title = title;

            this.openSnackBar(editTitle.message, 'success');
          }
          else {
            this.openSnackBar(editTitle.message, 'error');
          }
        }
        catch (err) {
          this.openSnackBar(err.message, 'error');
        }
      }
      else {
        this.openSnackBar('New title cannot be same as current!', 'warning');
      }
    }
    else {
      this.openSnackBar('New title cannot be null!', 'warning');
    }
  }


  async editDesc(desc: string): Promise<void> {
    if (desc !== '') {
      if (this.video.desc !== desc) {
        try {
          const editDesc = await this.authService.patchResource(`${this.VIDEOS_URL}/${this.video._id}/desc`, {desc}).toPromise();

          if (editDesc.updated) {
            this.video.desc = desc;

            this.openSnackBar(editDesc.message, 'success');
          }
          else {
            this.openSnackBar(editDesc.message, 'error');
          }
        }
        catch (err) {
          this.openSnackBar(err.message, 'error');
        }
      }
      else {
        this.openSnackBar('New description cannot be same as current!', 'warning');
      }
    }
    else {
      this.openSnackBar('New description cannot be null!', 'warning');
    }
  }


  async editTags(tags: string): Promise<void> {
    try {
      const editTags = await this.authService.patchResource(`${this.VIDEOS_URL}/${this.video._id}/tags`, {tags}).toPromise();

      if (editTags.updated) {
        window.location.reload();
      }
      else {
        console.log(editTags.message);
      }
    }
    catch (err) {
      console.log(err.message);
    }
  }


  async editStat(): Promise<void> {
    try {
      const editStat = await this.authService.patchResource(`${this.VIDEOS_URL}/${this.video._id}/stat`, {id: this.video._id}).toPromise();

      if (editStat.updated) {
        window.location.reload();
      }
      else {
        console.log(editStat.message);
      }
    }
    catch (err) {
      console.log(err.message);
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
