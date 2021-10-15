import {Component, OnDestroy, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {VideoDto} from '../models/VideoDto';
import {environment} from '../../environments/environment';
import {PageEvent} from '@angular/material/paginator';
import {Subscription} from 'rxjs';
import {Location} from '@angular/common';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css']
})
export class VideosComponent implements OnInit, OnDestroy {

  readonly VIDEOS_URL = `${environment.baseUrl}/videos`;
  readonly baseUrl: string = environment.baseUrl;
  pageEvent: void;

  queryParamsSub: Subscription;

  videosLoaded: Promise<boolean>;

  videos: Array<VideoDto> = new Array<VideoDto>();
  videosTemp: Array<VideoDto> = new Array<VideoDto>();
  videosOnPage: Array<VideoDto> = new Array<VideoDto>();
  videosLength = 0;
  currentPage = 0;
  videosPerPage = 20;
  pageSizeOptions: number[] = [5, 10, 15, 25, 50, 70];

  loading = true;
  noVideos = false;

  token: string;

  constructor(
    private http: HttpClient,
    private currentRoute: ActivatedRoute,
    private location: Location,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.token = localStorage.getItem('token');

    this.queryParamsSub = this.currentRoute.queryParams.subscribe(params => {
      if (params.limit) {
        if (params.limit < 0) {
          this.videosPerPage = 1;
        }
        else if (params.limit > 500) {
          this.videosPerPage = 64;
        }
        else {
          this.videosPerPage = params.limit;
        }
      }

      if (params.page) {
        this.currentPage = Number(params.page);
      }

      this.iterator();
    });

    this.showVideos();
    // this.currentRoute.queryParams.subscribe(params => {
    //   this.loading = true;
    //   this.currentPage = params.page;

      // const page = params.page;
      // this.authService.getResource(`${this.VIDEOS_URL}?page=${page}`)
      //   .subscribe(res => {
      //     this.pages = res.pages;
      //     this.videos = res.videosOnPage;
      //
      //     this.loading = false;
      //
      //     if (res.videosOnPage.length === 0) {
      //       this.noVideos = true;
      //     }
      //     }, err => {
      //       if (err.statusText === 'Unauthorized') {
      //         this.authService.logout();
      //       }
      //   });
    // });
  }


  ngOnDestroy(): void {
    this.queryParamsSub.unsubscribe();
  }


  private showVideos(): void {
    this.http.get(`http://watchme.test/api/videos/public`).subscribe(videos => console.log(videos));

    this.authService.getResource(`${this.VIDEOS_URL}/`).subscribe(videos => {
      this.videos = videos;
      this.videosLength = videos.length;

      if (videos.length > 0) {
        this.currentRoute.queryParams.subscribe(params => {
          if (params.sort) {
            switch (params.sort) {
              case 'title-asc': {
                this.sortVideosByTitle(true);
                break;
              }
              case 'title-desc': {
                this.sortVideosByTitle(false);
                break;
              }
              case 'views-asc': {
                this.sortVideosByViews(true);
                break;
              }
              case 'views-desc': {
                this.sortVideosByViews(false);
                break;
              }
              case 'date-asc': {
                this.sortVideosByUploadDate(true);
                break;
              }
              case 'date-desc': {
                this.sortVideosByUploadDate(false);
                break;
              }
              default: throw new Error('Wrong sort param provided!');
            }
          }
        });

        this.iterator();
        // this.currentRoute.queryParams.subscribe(params => {
        //   const page = params.page || 1;
        // });

        // this.currentPage = this.pageEvent.pageIndex;
        // this.videosPerPage = this.pageEvent.pageSize;
      }
      else {
        this.noVideos = true;
      }

      this.videosLoaded = Promise.resolve(true);
    });
  }


  handlePage(e: PageEvent): void {
    this.currentPage = e.pageIndex;
    this.videosPerPage = e.pageSize;

    this.router.navigate([], {
      relativeTo: this.currentRoute,
      queryParams: {
        limit: e.pageSize,
        page: e.pageIndex
      },
      queryParamsHandling: 'merge'
    });

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


  sortVideosByTitle(asc: boolean): void {
    let sortType: string;
    if (asc) {
      sortType = 'title-asc';
    }
    else {
      sortType = 'title-desc';
    }

    this.router.navigate([], {
      relativeTo: this.currentRoute,
      queryParams: {
        sort: sortType
      },
      queryParamsHandling: 'merge'
    });

    this.videos.sort((a, b) => {
      if (asc) {
        return a.title.localeCompare(b.title);
      }
      else {
        return b.title.localeCompare(a.title);
      }
    });

    this.iterator();
  }


  sortVideosByViews(asc: boolean): void {
    let sortType: string;
    if (asc) {
      sortType = 'views-asc';
    }
    else {
      sortType = 'views-desc';
    }

    this.router.navigate([], {
      relativeTo: this.currentRoute,
      queryParams: {
        sort: sortType
      },
      queryParamsHandling: 'merge'
    });

    this.videos.sort((a, b) => {
      if (asc) {
        return a.visits - b.visits;
      }
      else {
        return b.visits - a.visits;
      }
    });

    this.iterator();
  }


  sortVideosByUploadDate(asc: boolean): void {
    let sortType: string;
    if (asc) {
      sortType = 'date-asc';
    }
    else {
      sortType = 'date-desc';
    }

    this.router.navigate([], {
      relativeTo: this.currentRoute,
      queryParams: {
        sort: sortType
      },
      queryParamsHandling: 'merge'
    });

    this.videos.sort((a, b) => {
      if (asc) {
        return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      }
      else {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
    });

    this.iterator();
  }

}
