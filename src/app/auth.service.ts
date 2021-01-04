import {Injectable} from '@angular/core';
import {HttpClient, HttpEventType, HttpHeaders} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import * as moment from 'moment';
import * as jwt_decode from 'jwt-decode';
import {Observable, Subject} from 'rxjs';
import {map} from 'rxjs/operators';
import {environment} from '../environments/environment';

@Injectable()
export class AuthService {

  err = '';
  private readonly SERVER_URL = `${environment.baseUrl}/auth`;
  private isLogged = new Subject<boolean>();


  constructor(protected http: HttpClient, protected router: Router, private activatedRoute: ActivatedRoute) {
    if (localStorage.getItem('token') !== null && localStorage.getItem('user') !== null) {
      if (moment().isBefore(this.getExpiration())) {
        this.postResource(
          `${this.SERVER_URL}/checkToken`,
          {
            user: jwt_decode(AuthService.getAccessToken()).username,
            permission: jwt_decode(AuthService.getAccessToken()).permissions
          }
          ).subscribe(res => {
            if (res) {
              this.isLoggedIn();
            }
        }, err => {
            console.log(err);
            this.logout();
        });
      }
    }
  }


  static getDecodedAccessToken(token: string): any {
    try {
      const tokenInfo = jwt_decode(token);
      return tokenInfo.exp;
    }
    catch (error) {
      return null;
    }
  }


  private static getAccessToken(): string {
    return localStorage.getItem('token');
  }


  login(user: any): Observable<any> {
    return this.http.post<any>(`${this.SERVER_URL}/login`, user);
  }


  register(user: any): Observable<any> {
    return this.http.post<any>(`${this.SERVER_URL}/register`, user);
  }


  checkOAuthLogin(token: any): Observable<any> {
      return this.http.post<any>(`${environment.baseUrl}/auth/github/me`, token);
  }


  gitHubLogin(): void {
    window.location.href = `${environment.baseUrl}/auth/github`;
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


  getUser(): Observable<any> {
     if (localStorage.getItem('token') !== null) {
      const tokenInfo = jwt_decode(AuthService.getAccessToken());
      if (tokenInfo.access_token) {
        return this.http.post<any>(`${environment.baseUrl}/auth/github/me`, tokenInfo);
      }
      else {
        return this.getResource(`${environment.baseUrl}/users/me`);
      }
    }
  }


  getLoginStatus(): Observable<boolean> {
    return this.isLogged.asObservable();
  }


  // isLoggedOut(): boolean {
  //   return !this.isLoggedIn();
  // }


  isAdmin(): boolean {
    if (localStorage.getItem('token') !== null) {
      const tokenInfo = jwt_decode(AuthService.getAccessToken());
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


  getResource(resourceUrl: string, httpHeader = new HttpHeaders()): Observable<any> {
    let newHeaders = httpHeader;
    newHeaders.append('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8');
    newHeaders.append('Access-Control-Allow-Headers', 'application/json');
    if (this.isLoggedIn()) {
      newHeaders = newHeaders.append('Authorization', 'Bearer ' + AuthService.getAccessToken());
    }

    return this.http.get(resourceUrl, {headers: newHeaders});
  }


  deleteResource(resourceUrl: string, httpHeader = new HttpHeaders()): Observable<any> {
    const newHeaders = httpHeader
      .append('Accept', 'application/json')
      .append('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
      .append('Authorization', 'Bearer ' + AuthService.getAccessToken());

    return this.http.delete(resourceUrl, {headers: newHeaders});
  }


  postResource(resourceUrl: string, body: any, httpHeader = new HttpHeaders()): Observable<any> {
    const newHeaders = httpHeader
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + AuthService.getAccessToken());

    return this.http.post(resourceUrl, body, {headers: newHeaders});
  }


  patchResource(resourceUrl: string, body: any, httpHeader = new HttpHeaders()): Observable<any> {
    const newHeaders = httpHeader
      .append('Content-Type', 'application/json')
      .append('Accept', 'application/json')
      .append('Authorization', 'Bearer ' + AuthService.getAccessToken());
    return this.http.patch(resourceUrl, body, {headers: newHeaders});
  }


  putResource(resourceUrl: string, body: any, httpHeader = new HttpHeaders()): Observable<any> {
    const newHeaders = httpHeader
      .append('Content-Type', 'application/x-www-form-urlencoded; charset=utf-8')
      .append('Authorization', 'Bearer ' + AuthService.getAccessToken());

    return this.http.put(resourceUrl, body, {headers: newHeaders});
  }


  uploadResource(resourceUrl: string, body: any, httpHeader = new HttpHeaders()): Observable<any> {
    const header = httpHeader
      .append('Authorization', 'Bearer ' + AuthService.getAccessToken());

    return this.http.post<any>(resourceUrl, body, { headers: header, reportProgress: true, observe: 'events' }).pipe(map((event) => {
        if (event.type === HttpEventType.Response) {
          return event.body;
        }
        if (event.type === HttpEventType.UploadProgress) {
          const percentDone = Math.round(100 * event.loaded / event.total);
          return { status: 'progress', message: percentDone };
        }
      })
    );
  }

  getUsernameFromToken(token: string = localStorage.getItem('token')): string {
    try {
      const tokenInfo = jwt_decode(token);
      return tokenInfo.username;
    }
    catch (error) {
      return null;
    }
  }

}
