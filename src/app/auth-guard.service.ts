import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  private loggedIn = false;

  // wstrzykuje zależności niezbedne servisy do działania componentu
  constructor(private router: Router, private auth: AuthService) {
    this.loggedIn = this.auth.isLoggedIn();
  }

  // metoda wywoływana gdy chcemy się dostać na jakąś strone zwracające informacje o tym czy mamy do niej dostęp czy nie
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.loggedIn;
  }


}

