import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../environments/environment';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {VideoDto} from '../models/VideoDto';
import {Subscription} from 'rxjs';
import {PageEvent} from '@angular/material/paginator';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class HistoryComponent implements OnInit {


  BASE_URL = environment.baseUrl;
  VIDEOS_URL = '/videos';

  pageEvent: void;
  queryParamsSub: Subscription;
  videosHistory: Array<any> = new Array<any>();
  videosOnPage: Array<VideoDto> = new Array<VideoDto>();
  videosLength = 0;
  currentPage = 0;
  videosPerPage = 20;
  pageSizeOptions: number[] = [5, 10, 15, 20, 50, 70];

  token: string;

  dataLoaded: Promise<boolean>;

  isAdmin: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastService: ToastrService
  ) { }


  ngOnInit(): void {
    this.token = localStorage.getItem('token');
    this.dataLoaded = Promise.resolve(false);

    this.isAdmin = this.authService.isAdmin();

    this.queryParamsSub = this.activatedRoute.queryParams.subscribe(params => {
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


      this.authService.getResource(`${this.BASE_URL}${this.VIDEOS_URL}/watchingHistory`).subscribe(videosHistory => {
        if (videosHistory.length > 0) {
          this.videosHistory = videosHistory;
          this.videosLength = videosHistory.length;
        }

        this.iterator();
      });

      this.dataLoaded = Promise.resolve(true);
    }, err => {
      console.log(err.error.message);
      throw new Error(err.error.message);
    });
  }


  play(videoId: string): void {
    this.router.navigate(['/player'], { queryParams: { vid: videoId }});
  }


  delete(videoId: string): void {
    this.authService.deleteResource(`${this.BASE_URL}${this.VIDEOS_URL}/watchingHistory/${videoId}`).subscribe(res => {
      this.toastService.success(res.message);
      document.getElementById(videoId).remove();
    }, err => {
      this.toastService.error(err.message);
    });
  }


  handlePage(e: PageEvent): void {
    this.currentPage = e.pageIndex;
    this.videosPerPage = e.pageSize;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
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
    this.videosOnPage = this.videosHistory.slice(start, end);
  }
}
