import {AfterViewInit, Component, ElementRef, OnInit, ViewChild, ViewChildren} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {environment} from '../../environments/environment';
import {VideoDto} from '../models/VideoDto';
import {PageEvent} from '@angular/material/paginator';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Location} from '@angular/common';

@Component({
  selector: 'app-finder',
  templateUrl: './finder.component.html',
  styleUrls: ['./finder.component.css']
})
export class FinderComponent implements OnInit, AfterViewInit {

  readonly VIDEOS_URL: string = `${environment.baseUrl}/videos/search`;
  readonly baseUrl: string = environment.baseUrl;

  message = '';
  q = '';
  pageEvent: void;

  videosLoaded: Promise<boolean>;
  pageLoaded: Promise<boolean> = Promise.resolve(false);

  videos: Array<VideoDto> = new Array<VideoDto>();
  videosOnPage: Array<VideoDto> = new Array<VideoDto>();
  videosLength = 0;
  currentPage = 0;
  lastPage = 1;
  videosPerPage = 16;
  pageSizeOptions: number[] = [4, 8, 12, 24, 48, 64];

  loading = true;
  noVideos = false;

  searchForm: FormGroup;

  @ViewChild('searchInput', { static: false }) searchInput: ElementRef<HTMLInputElement>;

  constructor(
    private http: HttpClient,
    private router: Router,
    private currentRoute: ActivatedRoute,
    private authService: AuthService,
    private location: Location,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      q: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)])
    });

    this.loading = true;

    this.currentRoute.queryParams.subscribe(params => {
      this.pageLoaded = Promise.resolve(true);
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
      if (params.q === '' || params.q === null) {
        this.noVideos = true;
        this.message = 'Query cannot be empty or blank!';
      }
      else {
        this.authService.getResource(this.VIDEOS_URL + '?query=' + params.q).subscribe(res => {
          if (res.length > 0) {
            this.videos = res;
            this.videosLength = res.length;
            this.iterator();
            this.videosLoaded = Promise.resolve(true);
          } else {
            this.noVideos = true;
          }
        }, error => {
          this.noVideos = true;
          this.message = error.error.message;
        });
      }
    });
  }


  ngAfterViewInit(): void {
    this.pageLoaded.then(loaded => {
      if (loaded) {
        this.searchInput.nativeElement.value = this.q;
      }
    });
  }


  onSubmit(): void {
    this.videos = [];
    this.videosLength = 0;
    this.videosLoaded = Promise.resolve(false);
    this.noVideos = false;

    this.q = this.searchForm.value.q;
    this.location.go(`/finder?q=${this.searchForm.value.q}`);

    this.authService.getResource(this.VIDEOS_URL + '?query=' + this.searchForm.value.q).subscribe(res => {
      this.videos = res;
      this.videosLength = res.length;
      this.videosLoaded = Promise.resolve(true);
      if (res.length > 0) {
        this.iterator();
      }
      else {
        this.noVideos = true;
      }
    }, error => {
      this.message = error.error.message;
    });
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


  // liveSearch(event: any): void {
  //   this.router.navigate([], {
  //     relativeTo: this.currentRoute,
  //     queryParams: { q: event.target.value, limit: this.videosPerPage },
  //     queryParamsHandling: 'merge'
  //   });

    // this.authService.getResource(this.VIDEOS_URL + '?query=' + event.target.value).subscribe(res => {
    //   if (res.isResult) {
    //     this.isResult = true;
    //     this.pages = res.pages;
    //     this.videos = res.videosOnPage;
    //   }
    //   this.message = res.message;
    // });
  // }


  // filter(value: string): Array<string> {
  //   const filterValue = value.toLowerCase();
  //   return this.searchOptions.filter((item: string) => item.toLowerCase().includes(filterValue));
  // }

}
