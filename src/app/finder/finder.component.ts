import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-finder',
  templateUrl: './finder.component.html',
  styleUrls: ['./finder.component.css']
})
export class FinderComponent implements OnInit {

  readonly VIDEOS_URL = 'http://localhost:3000/videos/search';

  videos: any = [];
  pages: any = {};
  isResult = false;
  message = '';
  q = '';

  constructor(private http: HttpClient, private currentRoute: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.currentRoute.queryParams.subscribe(params => {
      this.q = params.q;
      this.authService.getResource(this.VIDEOS_URL + '?query=' + params.q + '&page=' + params.page).subscribe(res => {
        if (res.isResult) {
          this.isResult = true;
          this.pages = res.pages;
          this.videos = res.videosOnPage;
        }
        this.message = res.message;
      });
    });
  }

  loadPreview(event: any): void {
    event.path[0].muted = true;
    event.path[0].loop = true;
    event.path[0].download = false;
    event.path[0].play();
  }

  unloadPreview(event: any): void {
    const playPromise = event.path[0].play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        event.path[0].load();
      }).catch(err => {
        console.log(err);
      });
    }

  }

}
