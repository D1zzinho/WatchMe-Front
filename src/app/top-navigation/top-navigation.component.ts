import {Component, OnInit} from '@angular/core';
import {AuthService} from '../auth.service';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {map, startWith} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-top-navigation',
  templateUrl: './top-navigation.component.html',
  styleUrls: ['./top-navigation.component.css']
})
export class TopNavigationComponent implements OnInit {

  searchControl: FormControl = new FormControl();

  username = '';
  collapsed = true;
  isLoggedIn: boolean;
  isAdmin = false;
  isLogging: Promise<boolean>;
  isSearch: Promise<boolean> = Promise.resolve(false);


  constructor(private authService: AuthService, private titleService: Title, private router: Router, private currentRoute: ActivatedRoute) {
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
      // this.authService.getResource(`${environment.baseUrl}/videos/mostUsedTags`).subscribe(res => {
      //   if (res.found) {
      //     this.searchOptions = res.options;
      //   }
      // }, err => {
      //   console.log(err);
      // });
      this.authService.getUser().subscribe(res => {
        if (res.login) {
          this.username = res.login;
        } else if (res.username) {
          this.username = res.username;
        }
      });
    }

    this.currentRoute.queryParams.subscribe(param => {
      if (param.token) {
        this.isLogging = Promise.resolve(true);
      }
      else {
        this.isLogging = Promise.resolve(false);
      }
    });

    setTimeout(() => {
      this.isAdmin = this.authService.isAdmin();
    }, 100);
  }


  private getTitle(state, parent): Array<any> {
    this.isSearch = Promise.resolve(false);

    const data = new Array<any>();
    if (parent && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    }

    if (state && parent) {
      data.push(... this.getTitle(state, state.firstChild(parent)));
    }

    if (state && state.snapshot.url.includes('/finder')) {
      this.isSearch = Promise.resolve(true);
    }

    return data;
  }

}





