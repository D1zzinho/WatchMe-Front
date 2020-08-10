import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-finder',
  templateUrl: './finder.component.html',
  styleUrls: ['./finder.component.css']
})
export class FinderComponent implements OnInit {

  readonly VIDEOS_URL = 'http://192.168.100.2:3000/videos/search';

  videos: any = [];
  pages: any = {};
  message: String = '';
  q: String = '';

  constructor(private http: HttpClient, private currentRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.currentRoute.queryParams.subscribe(params => {
      this.q = params.q
      this.http.get<any>(this.VIDEOS_URL + '?query=' + params.q + '&page=' + params.page).subscribe(res => {
        this.pages = res.pages
        this.videos = res.videosOnPage
        this.message = res.message
      });
    })
  }

}
