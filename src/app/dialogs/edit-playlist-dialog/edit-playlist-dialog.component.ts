import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AuthService} from '../../auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {FormBuilder} from '@angular/forms';
import {environment} from '../../../environments/environment';
import {SnackBarComponent} from '../../snack-bar/snack-bar.component';

@Component({
  selector: 'app-edit-playlist-dialog',
  templateUrl: './edit-playlist-dialog.component.html',
  styleUrls: ['./edit-playlist-dialog.component.css']
})
export class EditPlaylistDialogComponent implements OnInit {

  readonly PLAYLISTS_URL = `${environment.baseUrl}/playlist`;
  readonly durationInSeconds = 5;

  constructor(
    @Inject(MAT_DIALOG_DATA) public playlist: any,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditPlaylistDialogComponent>
  ) { }


  ngOnInit(): void {
  }


  delete(): void {
    this.authService.deleteResource(`${this.PLAYLISTS_URL}/${this.playlist._id}`).subscribe(res => {
      if (!res.deleted) {
        this.openSnackBar('There was an error when deleting playlist! Message: ' + res.message, 'error');
      }
      else {
        this.dialogRef.close({ deleted: res.deleted });
        this.openSnackBar(res.message, 'success');
      }
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
