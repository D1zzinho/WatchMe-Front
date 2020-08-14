import {Component, EventEmitter, OnInit, ViewChild} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css']
})
export class VideosComponent implements OnInit {

  readonly VIDEOS_URL = 'http://192.168.100.2:3000/videos';

  videos: any = [];
  pages: any = {};

  constructor(private http: HttpClient, private currentRoute: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    if (token !== null) {
      this.currentRoute.queryParams.subscribe(params => {
        this.http.get<any>(this.VIDEOS_URL + '?page=' + params.page,
          {headers: {authorization: `Bearer ${localStorage.getItem('token')}`}}
        ).subscribe(res => {
          this.pages = res.pages;
          this.videos = res.videosOnPage;
        });
      });
    }
    else {
      this.router.navigate(['/login']);
    }
  }

  private loadPreview(event: any): void {
    event.path[0].muted = true;
    event.path[0].loop = true;
    event.path[0].download = false;
    event.path[0].play();
  }

  private unloadPreview(event: any): void {
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
