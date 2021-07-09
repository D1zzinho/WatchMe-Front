import {Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {environment} from '../../environments/environment';
import {MatPaginator} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {animate, state, style, transition, trigger} from '@angular/animations';

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

  token: string;

  dataLoaded: Promise<boolean>;
  videosHistory: Array<any>;


  constructor(
    private authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }


  ngOnInit(): void {
    this.token = localStorage.getItem('token');
    this.dataLoaded = Promise.resolve(false);

    this.authService.getResource(`${this.BASE_URL}${this.VIDEOS_URL}/watchingHistory`).subscribe(videosHistory => {
      if (videosHistory.length > 0) {
        this.videosHistory = videosHistory;
      }

      this.dataLoaded = Promise.resolve(true);
    }, err => {
      console.log(err.error.message);
      throw new Error(err.error.message);
    });
  }


  play(videoId: string): void {
    this.router.navigate(['/player'], { queryParams: { vid: videoId }});
  }

}
