import {Component, EventEmitter, OnInit, ViewChild} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {VideoDto} from '../models/VideoDto';
import MouseOverEvent = JQuery.MouseOverEvent;
import MouseOutEvent = JQuery.MouseOutEvent;

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css']
})
export class VideosComponent implements OnInit {

  readonly VIDEOS_URL = 'http://localhost:3000/videos';

  videos: Array<VideoDto>;
  pages: any = {};
  isLoggedIn = false;

  constructor(
    private http: HttpClient,
    private currentRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.currentRoute.queryParams.subscribe(params => {
      const page = params.page;
      this.authService.getResource(`${this.VIDEOS_URL}?page=${page}`)
        .subscribe(res => {
          this.pages = res.pages;
          this.videos = res.videosOnPage;
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
    // event.path[0].muted = true;
    // event.path[0].loop = true;
    // event.path[0].download = false;
    // event.path[0].play();
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

    // const playPromise = event.path[0].play();
    //
    // if (playPromise !== undefined) {
    //   playPromise.then(() => {
    //     event.path[0].load();
    //   }).catch(err => {
    //     console.log(err);
    //   });
    // }
  }

}
