import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import * as moment from 'moment';
import * as jwt_decode from 'jwt-decode';
import {Observable, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  err: string = null;
  private readonly SERVER_URL = 'http://localhost:3000/auth';
  private isLogged = new Subject<boolean>();

  constructor(protected http: HttpClient, protected router: Router, private activatedRoute: ActivatedRoute) {
    if (localStorage.getItem('token') !== null && localStorage.getItem('user') !== null) {
      if (moment().isBefore(this.getExpiration())) {
        this.postResource(
          `${this.SERVER_URL}/checkToken`,
          {
            user: jwt_decode(this.getAccessToken()).username,
            permission: jwt_decode(this.getAccessToken()).permissions
          }
          ).subscribe(res => {
            if (res) {
              this.isLoggedIn();
            }
        }, err => {
            console.log(err)
            this.logout();
        });
      }
    }
  }


  register(user): void {
    this.http.post<any>(`${this.SERVER_URL}/register`, user).subscribe(
      (res) => {
        if (res.user !== null && res.token !== null) {
          localStorage.setItem('user', JSON.stringify(res.user));
          localStorage.setItem('token', res.token);
          localStorage.setItem(
            'expires_at',
            String((this.getDecodedAccessToken(localStorage.getItem('token')) * 1000))
          );

          setTimeout(() => {
            window.location.href = '/';
          }, 100);
        }
      },
      (err) => {
        this.err = err.error.message;
        throw new Error(err.error.message);
      }
    );
  }


  login(user): void {
    this.http.post<any>(`${this.SERVER_URL}/login`, user).subscribe(
      (res) => {
        if (res.user !== null && res.token !== null) {
          localStorage.setItem('user', JSON.stringify(res.user));
          localStorage.setItem('token', res.token);
          localStorage.setItem(
            'expires_at',
            String((this.getDecodedAccessToken(localStorage.getItem('token')) * 1000))
          );

          this.activatedRoute.queryParams.subscribe(params => {
            if (params.requested === 'videos') {
              setTimeout(() => {
                window.location.href = '/videos';
              }, 100);
            }
            else {
              setTimeout(() => {
                window.location.href = '/';
              }, 100);
            }
          });
        }
      },
      (err) => {
        this.err = err.error.message;
        throw new Error(err.error.message);
      }
    );
  }


  async checkCredentials(email: string, username: string): Promise<{ usernameExists: boolean, emailExists: boolean }> {
    try {
      return await this.http.post<any>(`${this.SERVER_URL}/checkCredentials`, { email, username }).toPromise();
    }
    catch (err) {
      throw new Error(err.error.message);
    }
  }


  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expires_at');

    this.router.navigate(['/']);
    window.location.href = '/';
  }


  public isLoggedIn(): boolean {
    if (localStorage.getItem('token') === null || moment().isAfter(this.getExpiration())) {
      this.isLogged.next(false);
      return false;
    }

    this.isLogged.next(true);
    return true;
  }


  getLoginStatus(): Observable<boolean> {
    return this.isLogged.asObservable();
  }


  isLoggedOut(): boolean {
    return !this.isLoggedIn();
  }


  isAdmin(): boolean {
    if (localStorage.getItem('token') !== null) {
      const tokenInfo = jwt_decode(this.getAccessToken());
      const permissions = tokenInfo.permissions;

      if (permissions === 0) {
        return true;
      }
    }

    return false;
  }


  getExpiration(): moment.Moment {
    const expiration = JSON.parse(localStorage.getItem('expires_at'));

    return moment(expiration);
  }


  private getAccessToken(): string {
    return localStorage.getItem('token');
  }


  getResource(resourceUrl: string, httpHeader = new HttpHeaders()): Observable<any> {
    let newHeaders = httpHeader;
    newHeaders.append('Content-type', 'application/x-www-form-urlencoded; charset=utf-8');
    if (this.isLoggedIn()) {
      newHeaders = newHeaders.append('Authorization', 'Bearer ' + this.getAccessToken());
    }

    return this.http.get(resourceUrl, {headers: newHeaders});
  }


  deleteResource(resourceUrl: string, httpHeader = new HttpHeaders()): Observable<any> {
    const newHeaders = httpHeader
      .append('Content-type', 'application/x-www-form-urlencoded; charset=utf-8')
      .append('Authorization', 'Bearer ' + this.getAccessToken());

    return this.http.delete(resourceUrl, {headers: newHeaders});
  }


  postResource(resourceUrl: string, body: any, httpHeader = new HttpHeaders()): Observable<any> {
    const newHeaders = httpHeader
      // .append('Content-type', 'application/json')
      // .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.getAccessToken());
    return this.http.post(resourceUrl, body, {headers: newHeaders});
  }


  patchResource(resourceUrl: string, body: any, httpHeader = new HttpHeaders()): Observable<any> {
    const newHeaders = httpHeader
      .append('Content-type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + this.getAccessToken());
    return this.http.patch(resourceUrl, body, {headers: newHeaders});
  }


  putResource(resourceUrl: string, body: any, httpHeader = new HttpHeaders()): Observable<any> {
    const newHeaders = httpHeader
      .append('Content-type', 'application/x-www-form-urlencoded; charset=utf-8')
      .append('Authorization', 'Bearer ' + this.getAccessToken());

    return this.http.put(resourceUrl, body, {headers: newHeaders});
  }


  getUserFromToken(token: string = localStorage.getItem('token')): string {
    try {
      const tokenInfo = jwt_decode(token);
      const username = tokenInfo.username;

      return username;
    }
    catch (error) {
      return null;
    }
  }


  private getDecodedAccessToken(token: string): any {
    try {
      const tokenInfo = jwt_decode(token);
      const expireDate = tokenInfo.exp;

      return expireDate;
    }
    catch (error) {
      return null;
    }
  }

}
