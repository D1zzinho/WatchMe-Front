import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  loggedIn = false;

  constructor(private router: Router, private auth: AuthService) {
    this.loggedIn = this.auth.isLoggedIn();
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.loggedIn;
  }


}

