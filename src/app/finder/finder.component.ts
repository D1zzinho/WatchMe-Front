import {Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {environment} from '../../environments/environment';
import {map, startWith} from 'rxjs/operators';
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-finder',
  templateUrl: './finder.component.html',
  styleUrls: ['./finder.component.css']
})
export class FinderComponent implements OnInit {

  readonly VIDEOS_URL: string = `${environment.baseUrl}/videos/search`;
  readonly baseUrl: string = environment.baseUrl;

  videos: any = [];
  pages: any = {};
  isResult = false;
  message = '';
  q = '';

  // searchControl: FormControl = new FormControl();
  // searchOptions: Array<string> = new Array<string>();
  // filteredSearchOptions: Observable<Array<string>>;

  constructor(private http: HttpClient, private router: Router, private currentRoute: ActivatedRoute, private authService: AuthService) { }

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
      queryParams: { q: event.target.value, page: this.pages.currentPage },
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
