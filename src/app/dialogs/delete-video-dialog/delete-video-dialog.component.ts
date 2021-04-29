import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {AuthService} from '../../auth.service';
import {environment} from '../../../environments/environment';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';

@Component({
  selector: 'app-delete-video-dialog',
  templateUrl: './delete-video-dialog.component.html',
  styleUrls: ['./delete-video-dialog.component.css']
})
export class DeleteVideoDialogComponent implements OnInit {

  readonly VIDEOS_URL: string = `${environment.baseUrl}/videos`;

  isOwner = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public video: any,
    private authService: AuthService,
    private toastService: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log(this.video.author === this.authService.getUsernameFromToken())
    console.log(this.video)
    console.log(this.authService.getUsernameFromToken())
    if (this.video.author === this.authService.getUsernameFromToken()) {

      this.isOwner = true;
    }
  }

  delete(): void {
    if (this.authService.isAdmin() || this.isOwner) {
      this.authService.deleteResource(`${this.VIDEOS_URL}/${this.video._id}`).subscribe(result => {
        if (!result.deleted) {
          this.toastService.error('There was an error when deleting video! Message: ' + result.message);
        }
        else {
          this.toastService.success('Video successfully deleted!');
          setTimeout(() => {
            this.router.navigate(['/videos']);
          }, 2000);
        }
      }, error => {
        this.toastService.error(error.error.message);
      });
    }
  }

}
