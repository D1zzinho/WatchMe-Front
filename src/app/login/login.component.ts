import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../auth.service';
import {environment} from '../../environments/environment';
import * as jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

  baseUrl = environment.baseUrl;

  loginForm: FormGroup;
  registerForm: FormGroup;
  error: Array<string> = new Array<string>();

  oAuthLoginResponse: string;
  redirecting = Promise.resolve(false);
  redirectingSuccess = Promise.resolve(false);

  @ViewChild('ERROR') ERROR: ElementRef;
  @ViewChild('username') usernameInput: ElementRef;
  @ViewChild('password') passwordInput: ElementRef;
  @ViewChild('repeatPassword') repeatPasswordInput: ElementRef;
  @ViewChild('email') emailInput: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {}


  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
    else {
      this.activatedRoute.queryParams.subscribe(params => {
        if (params.token) {
          this.redirecting = Promise.resolve(true);

          if (params.error) {
            this.oAuthLoginResponse = `Login failed!`;
            this.error.push(params.error);
          }
          else {
            try {
              const token = jwt_decode(params.token);

              this.authService.checkOAuthLogin(token).subscribe(result => {
                if (result.login) {
                  localStorage.setItem('user', result.login);
                  localStorage.setItem('token', params.token);
                  localStorage.setItem(
                    'expires_at',
                    String((token.exp * 1000))
                  );

                  this.oAuthLoginResponse = `You are successfully logged in, ${result.login}! Redirecting...`;
                  this.redirectingSuccess = Promise.resolve(true);

                  setTimeout(() => { window.location.href = '/'; }, 2000);
                }
              }, err => {
                this.oAuthLoginResponse = 'Login failed!';
                this.error.push(err.message);
              });
            }
            catch (err) {
              this.oAuthLoginResponse = 'Login failed!';
              this.error.push(err.message);
            }
          }

        }
      });
    }

    this.loginForm = this.formBuilder.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    this.registerForm = this.formBuilder.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      repeatPassword: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      $('.message a').on('click', () => {
        $('form').animate({height: 'toggle', opacity: 'toggle'}, 'slow');
      });
    }, 500);
  }


  async onRegisterSubmit(): Promise<void> {
    if (this.error.length > 0) {
      this.error = new Array<string>();
      if (this.ERROR.nativeElement.style.display === 'none') {
        this.ERROR.nativeElement.removeAttribute('style');
      }
    }

    const { usernameExists, emailExists } = await this.authService.checkCredentials(
      this.registerForm.value.email,
      this.registerForm.value.username
    );

    if (usernameExists) {
      this.usernameInput.nativeElement.style.border = '1px solid';
      this.usernameInput.nativeElement.style.borderColor = 'rgba(255,0,0,0.75)';
      this.error.push('Username already exists!');
    }
    else {
      if (this.usernameInput.nativeElement.hasAttribute('style')) {
        this.usernameInput.nativeElement.removeAttribute('style');
      }
    }

    if (emailExists) {
      this.emailInput.nativeElement.style.border = '1px solid';
      this.emailInput.nativeElement.style.borderColor = 'rgba(255,0,0,0.75)';
      this.error.push('E-mail already exists!');
    }
    else {
      if (this.emailInput.nativeElement.hasAttribute('style')) {
        this.emailInput.nativeElement.removeAttribute('style');
      }
    }

    if (this.passwordInput.nativeElement.hasAttribute('style')) {
      this.passwordInput.nativeElement.removeAttribute('style');
    }
    if (this.repeatPasswordInput.nativeElement.hasAttribute('style')) {
      this.repeatPasswordInput.nativeElement.removeAttribute('style');
    }

    if (this.registerForm.value.password !== this.registerForm.value.repeatPassword) {
      this.passwordInput.nativeElement.style.border = this.repeatPasswordInput.nativeElement.style.border = '1px solid';
      this.passwordInput.nativeElement.style.borderColor = this.repeatPasswordInput.nativeElement.style.borderColor = 'rgba(255,0,0,0.75)';
      this.error.push('Passwords don\'t match each other!');
    }
    else {
      const user = {
        username: this.registerForm.value.username,
        password: this.registerForm.value.password,
        email: this.registerForm.value.email
      };

      this.authService.register(user).subscribe(
        (res) => {
          if (res.user !== null && res.token !== null) {
            localStorage.setItem('user', JSON.stringify(res.user));
            localStorage.setItem('token', res.token);
            localStorage.setItem(
              'expires_at',
              String((AuthService.getDecodedAccessToken(localStorage.getItem('token')) * 1000))
            );

            setTimeout(() => {
              window.location.href = '/';
            }, 100);
          }
        },
        (err) => {
          throw new Error(err.error.message);
        }
      );
    }
  }


  onLoginSubmit(): void {
    if (this.error.length > 0) {
      this.error = new Array<string>();
    }

    const user = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };


    this.authService.login(user).subscribe(
      (res) => {
        if (res.user !== null && res.token !== null) {
          localStorage.setItem('user', JSON.stringify(res.user));
          localStorage.setItem('token', res.token);
          localStorage.setItem(
            'expires_at',
            String((AuthService.getDecodedAccessToken(localStorage.getItem('token')) * 1000))
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
        if (this.ERROR.nativeElement.style.display === 'none') {
          this.ERROR.nativeElement.removeAttribute('style');
        }
        this.error.push(err.error.message);
      }
    );
  }


  gitHubLogin(): void {
    window.location.href = `${this.baseUrl}/auth/github`;
  }
}
