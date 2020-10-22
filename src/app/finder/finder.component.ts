import {AfterViewInit, Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import {AuthService} from '../auth.service';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-finder',
  templateUrl: './finder.component.html',
  styleUrls: ['./finder.component.css']
})
export class FinderComponent implements OnInit {

  readonly VIDEOS_URL = `${environment.baseUrl}/videos/search`;

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
