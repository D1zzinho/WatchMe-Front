import {Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {VideoDto} from '../models/VideoDto';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css']
})
export class VideosComponent implements OnInit {

  readonly VIDEOS_URL = `${environment.baseUrl}/videos`;

  videos: Array<VideoDto> = new Array<VideoDto>();
  loading = true;
  pages: any = {};
  noVideos = false;

  constructor(
    private http: HttpClient,
    private currentRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.currentRoute.queryParams.subscribe(params => {
      this.loading = true;
      const page = params.page;
      this.authService.getResource(`${this.VIDEOS_URL}?page=${page}`)
        .subscribe(res => {
          this.pages = res.pages;
          this.videos = res.videosOnPage;

          this.loading = false;

          if (res.videosOnPage.length === 0) {
            this.noVideos = true;
          }
          }, err => {
            if (err.statusText === 'Unauthorized') {
              this.authService.logout();
            }
        });
    });
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
