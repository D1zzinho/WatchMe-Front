import {AfterContentInit, Component, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import {VideoDto} from '../models/VideoDto';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterContentInit {

  limit = 12;
  latestVideos: Array<VideoDto>;
  isLoggedIn = false;
  videosExist: boolean;

  constructor(private authService: AuthService) {
  }


  ngOnInit(): void {
      this.isLoggedIn = this.authService.isLoggedIn();
  }


  ngAfterContentInit(): void {
    setTimeout(() => {
      if (this.isLoggedIn) {
        this.authService.getResource(`${environment.baseUrl}/videos/latest?limit=${this.limit}`).subscribe(res => {
          if (res.message) {
            this.videosExist = false;
          }
          else {
            this.videosExist = true;
          }

          this.latestVideos = res;
        });
      }
    }, 200);
  }


  loadPreview(event: any): void {
    const video = event.target.nextSibling;
    video.muted = true;
    video.loop = true;
    video.download = false;
    video.play();
  }


  unloadPreview(event: any): void {
    const video = event.target.nextSibling;
    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        video.load();
      }).catch(err => {
        console.log(err);
      });
    }
  }

}
