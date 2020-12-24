import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {VideoDto} from '../models/VideoDto';
import {environment} from '../../environments/environment';
import {PageEvent} from '@angular/material/paginator';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.css']
})
export class VideosComponent implements OnInit {

  readonly VIDEOS_URL = `${environment.baseUrl}/videos`;
  readonly baseUrl: string = environment.baseUrl;
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

  constructor(
    private http: HttpClient,
    private currentRoute: ActivatedRoute,
    private router: Router,
    private authService: AuthService) {}

  ngOnInit(): void {
    this.loading = true;

    this.currentRoute.queryParams.subscribe(params => {
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


  private showVideos(): void {
    this.authService.getResource(`${this.VIDEOS_URL}/all`).subscribe(videos => {
      this.videos = videos;
      this.videosLength = videos.length;

      if (videos.length > 0) {
        this.iterator();
        // this.randomizePreviews();
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

    this.router.navigate(['/videos'], { queryParams: { limit: e.pageSize, page: e.pageIndex } });

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


  // randomizePreviews(): void {
  //   const shortPreview = document.getElementById('shortPreviewVideo') as HTMLVideoElement;
  //   const videos = this.videos;
  //   function startRandom(): void {
  //     const randomVideo = videos[Math.floor(Math.random() * videos.length)];
  //     shortPreview.src = `${environment.baseUrl}/${randomVideo.thumb}`;
  //     shortPreview.muted = true;
  //     shortPreview.load();
  //     shortPreview.onloadedmetadata = () => {
  //       shortPreview.playbackRate = 2;
  //       shortPreview.currentTime = Math.ceil(shortPreview.duration * 0.5);
  //       shortPreview.play();
  //     };
  //   }
  //   startRandom();
  //   setInterval(() => {
  //     startRandom();
  //   }, 5000);
  // }

}
