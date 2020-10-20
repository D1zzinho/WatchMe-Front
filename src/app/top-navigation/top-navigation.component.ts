import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import {Title} from '@angular/platform-browser';
import {NavigationEnd, Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-top-navigation',
  templateUrl: './top-navigation.component.html',
  styleUrls: ['./top-navigation.component.css']
})
export class TopNavigationComponent implements OnInit {

  searchControl: FormControl = new FormControl();
  searchOptions: Array<string> = new Array<string>();
  filteredSearchOptions: Observable<Array<string>>;

  collapsed = true;
  isLoggedIn: boolean;
  isAdmin = false;


  constructor(private authService: AuthService, private titleService: Title, private router: Router) {
    this.authService.getLoginStatus().subscribe((status: boolean) => this.isLoggedIn = status);

    router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const title = this.getTitle(router.routerState, router.routerState.root).join('-');
        titleService.setTitle(title);
      }
    });
  }


  logout(): void {
    this.authService.logout();
  }


  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }


  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.authService.getResource(`http://localhost:3000/videos/mostUsedTags`).subscribe(res => {
        if (res.found) {
          this.searchOptions = res.options;
        }
      }, err => {
        console.log(err);
      });
    }

    setTimeout(() => {
      this.isAdmin = this.authService.isAdmin();
    }, 100);

    this.filteredSearchOptions = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }


  private _filter(value: string): Array<string> {
    const filterValue = value.toLowerCase();

    return this.searchOptions.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }


  private getTitle(state, parent): Array<any> {
    const data = new Array<any>();
    if (parent && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    }

    if (state && parent) {
      data.push(... this.getTitle(state, state.firstChild(parent)));
    }

    return data;
  }

}





