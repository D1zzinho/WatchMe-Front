import {Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {environment} from '../../environments/environment';
import {map, startWith} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {VideoDto} from '../models/VideoDto';
import {PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'app-finder',
  templateUrl: './finder.component.html',
  styleUrls: ['./finder.component.css']
})
export class FinderComponent implements OnInit {

  readonly VIDEOS_URL: string = `${environment.baseUrl}/videos/search`;
  readonly baseUrl: string = environment.baseUrl;

  message = '';
  q = '';
  pageEvent: void;

  videosLoaded: Promise<boolean>;

  videos: Array<VideoDto> = new Array<VideoDto>();
  videosOnPage: Array<VideoDto> = new Array<VideoDto>();
  videosLength = 0;
  currentPage = 0;
  lastPage = 1;
  videosPerPage = 16;
  pageSizeOptions: number[] = [4, 8, 12, 24, 48, 64];

  loading = true;
  noVideos = false;

  // searchControl: FormControl = new FormControl();
  // searchOptions: Array<string> = new Array<string>();
  // filteredSearchOptions: Observable<Array<string>>;

  constructor(private http: HttpClient, private router: Router, private currentRoute: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.loading = true;

    this.currentRoute.queryParams.subscribe(params => {
      if (params.limit) {
        if (params.limit < 0) {
          this.videosPerPage = 1;
        } else if (params.limit > 500) {
          this.videosPerPage = 64;
        } else {
          this.videosPerPage = params.limit;
        }
      }

      this.q = params.q;
      this.authService.getResource(this.VIDEOS_URL + '?query=' + params.q).subscribe(res => {
        if (res.isResult) {
        this.videos = res.videos;
        this.videosLength = res.videos.length;

        if (res.videos.length > 0) {
          this.iterator();
        } else {
          this.noVideos = true;
        }

        this.videosLoaded = Promise.resolve(true);
        }
        else {
          this.noVideos = true;
        }

        this.message = res.message;
      });
    });


    // this.authService.getResource(`${environment.baseUrl}/videos/mostUsedTags`).subscribe(res => {
    //     if (res.found) {
    //       this.searchOptions = res.options;
    //     }
    //   }, err => {
    //     console.log(err);
    // });
    //
    // this.filteredSearchOptions = this.searchControl.valueChanges.pipe(
    //   startWith(''),
    //   map(value => this.filter(value))
    // );
  }

  handlePage(e: PageEvent): void {
    this.currentPage = e.pageIndex;
    this.videosPerPage = e.pageSize;

    this.router.navigate(['/finder'], { queryParams: { q: this.q, limit: e.pageSize } });

    this.iterator();
  }


  private iterator(): void {
    const end = (this.currentPage + 1) * this.videosPerPage;
    const start = this.currentPage * this.videosPerPage;
    this.videosOnPage = this.videos.slice(start, end);
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


  liveSearch(event: any): void {
    this.router.navigate([], {
      relativeTo: this.currentRoute,
      queryParams: { q: event.target.value, limit: this.videosPerPage },
      queryParamsHandling: 'merge'
    });

    // this.authService.getResource(this.VIDEOS_URL + '?query=' + event.target.value).subscribe(res => {
    //   if (res.isResult) {
    //     this.isResult = true;
    //     this.pages = res.pages;
    //     this.videos = res.videosOnPage;
    //   }
    //   this.message = res.message;
    // });
  }


  // filter(value: string): Array<string> {
  //   const filterValue = value.toLowerCase();
  //   return this.searchOptions.filter((item: string) => item.toLowerCase().includes(filterValue));
  // }

}
