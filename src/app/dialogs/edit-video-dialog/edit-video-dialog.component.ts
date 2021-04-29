import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from '@angular/material/dialog';
import {AuthService} from '../../auth.service';
import {environment} from '../../../environments/environment';
import {SnackBarComponent} from '../../snack-bar/snack-bar.component';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';
import {DeleteVideoDialogComponent} from '../delete-video-dialog/delete-video-dialog.component';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-edit-video-dialog',
  templateUrl: './edit-video-dialog.component.html',
  styleUrls: ['./edit-video-dialog.component.css']
})
export class EditVideoDialogComponent implements OnInit {

  readonly VIDEOS_URL = `${environment.baseUrl}/videos`;

  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  tags: Array<string> = new Array<string>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public video: any,
    private authService: AuthService,
    private toastService: ToastrService,
    private dialog: MatDialog
  ) {
    this.tags = video.tags;
  }

  ngOnInit(): void {
  }

  async editTitle(title: string): Promise<void> {
    if (title !== '') {
      if (this.video.title !== title) {
        try {
          const editTitle = await this.authService.patchResource(`${this.VIDEOS_URL}/${this.video._id}/title`, {title}).toPromise();
          if (editTitle.edited) {
            this.video.title = title;

            this.toastService.success(editTitle.message);
          }
          else {
            this.toastService.error(editTitle.message);
          }
        }
        catch (err) {
          this.toastService.error(err.error.message);
        }
      }
      else {
        this.toastService.warning('New title cannot be same as current!');
      }
    }
    else {
      this.toastService.warning('New title cannot be null!');
    }
  }


  async editDesc(desc: string): Promise<void> {
    if (desc !== '') {
      if (this.video.desc !== desc) {
        try {
          const editDesc = await this.authService.patchResource(`${this.VIDEOS_URL}/${this.video._id}/desc`, {desc}).toPromise();

          if (editDesc.edited) {
            this.video.desc = desc;

            this.toastService.success(editDesc.message);
          }
          else {
            this.toastService.error(editDesc.message);
          }
        }
        catch (err) {
          this.toastService.error(err.error.message);
        }
      }
      else {
        this.toastService.warning('New description cannot be same as current!');
      }
    }
    else {
      this.toastService.warning('New description cannot be null!');
    }
  }


  async editTags(): Promise<void> {
    if (this.tags.length > 0) {
      try {
        const editTags = await this.authService.patchResource(`${this.VIDEOS_URL}/${this.video._id}/tags`, {tags: this.tags}).toPromise();

        if (editTags.edited) {
          this.video.tags = this.tags;

          this.toastService.success(editTags.message);
        }
        else {
          this.toastService.error(editTags.message);
        }
      }
      catch (err) {
        this.toastService.error(err.error.message);
      }
    }
    else {
      this.toastService.warning('You have to specify at least 1 tag!');
    }
  }


  async editStat(): Promise<void> {
    try {
      const editStat = await this.authService.patchResource(`${this.VIDEOS_URL}/${this.video._id}/stat`, {id: this.video._id}).toPromise();

      if (editStat.edited) {
        this.video.stat = this.video.stat === 0 ? 1 : 0;

        this.toastService.success(editStat.message);
      }
      else {
        this.toastService.error(editStat.message);
      }
    }
    catch (err) {
      this.toastService.error(err.error.message);
    }
  }


  deleteVideo(): void {
    this.dialog.open(DeleteVideoDialogComponent, {
      data: this.video
    });
  }


  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      if (!this.tags.includes(value)) {
        this.tags.push(value.trim());
      }
    }

    if (input) {
      input.value = '';
    }
  }

  remove(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }
}
