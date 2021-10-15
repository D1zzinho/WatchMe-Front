import {AfterContentInit, Component, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import {VideoDto} from '../models/VideoDto';
import {environment} from '../../environments/environment';
import {DomSanitizer} from '@angular/platform-browser';
import {HttpClient, HttpHeaders} from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterContentInit {

  limit = 20;
  latestVideos: Array<VideoDto> = new Array<VideoDto>();
  suggestedVideos: Array<VideoDto> = new Array<VideoDto>();
  isLoggedIn = false;
  videosExist: Promise<boolean>;
  suggestedExist: Promise<boolean>;
  readonly baseUrl: string = environment.baseUrl;

  token: string;

  constructor(private authService: AuthService, private sanitizer: DomSanitizer, private http: HttpClient, private sanitization: DomSanitizer) {
  }


  ngOnInit(): void {
    this.videosExist = Promise.resolve(false);
    this.isLoggedIn = this.authService.isLoggedIn();

    if (this.authService.isLoggedIn()) {
      this.token = localStorage.getItem('token');
      this.authService.getResource(`${environment.baseUrl}/videos/latest?limit=${this.limit}`).subscribe(res => {
        this.latestVideos = res;
        // res.forEach(video => {
        //   this.authService.getResource(`http://192.168.3.130:8081/videos/check/${video._id}`).subscribe(blob => {
        //     console.log(blob);
        //   });
        // });
        this.videosExist = Promise.resolve(true);
      });

      this.authService.getResource(`${environment.baseUrl}/videos/suggested?limit=${this.limit}`).subscribe(res => {
        this.suggestedVideos = res;
        this.suggestedExist = Promise.resolve(true);
      });
    }
  }


  ngAfterContentInit(): void {
    // nothing
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


  // randomizePreviews(): void {
  //   const shortPreview = document.getElementById('shortPreviewVideo') as HTMLVideoElement;
  //   this.authService.getResource(`${environment.baseUrl}/videos/all`).subscribe(res => {
  //     this.videosExist = !res.message;
  //
  //     const videos = res;
  //
  //     function startRandom(): void {
  //       const randomVideo = videos[Math.floor(Math.random() * videos.length)];
  //       shortPreview.src = `${environment.baseUrl}/${randomVideo.thumb}`;
  //       shortPreview.muted = true;
  //       shortPreview.load();
  //       shortPreview.onloadedmetadata = () => {
  //         shortPreview.playbackRate = 1;
  //         shortPreview.currentTime = Math.ceil(shortPreview.duration * 0.5);
  //         shortPreview.play();
  //       };
  //     }
  //
  //     startRandom();
  //     setInterval(() => {
  //       startRandom();
  //     }, 10000);
  //   });
  // }
}
