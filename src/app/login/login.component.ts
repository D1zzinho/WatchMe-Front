import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

  @ViewChild('ERROR') ERROR: ElementRef;
  @ViewChild('username') usernameInput: ElementRef;
  @ViewChild('password') passwordInput: ElementRef;
  @ViewChild('repeatPassword') repeatPasswordInput: ElementRef;
  @ViewChild('email') emailInput: ElementRef;

  loginForm: FormGroup;
  registerForm: FormGroup;
  error: Array<string>;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService
  ) {
    this.error = new Array<string>();
  }


  ngOnInit(): void {

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
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

      this.authService.register(user);
    }

    this.errorHandlingMessageWithAlert('register');
  }


  onLoginSubmit(): void {
    if (this.error.length > 0) {
      this.error = new Array<string>();
    }

    const user = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.authService.login(user);
    this.errorHandlingMessageWithAlert('login');
  }


  private errorHandlingMessageWithAlert(action: string): void {
    setTimeout(() => {
      if (this.authService.err !== null) {
        if (action === 'login') { this.error.push(this.authService.err); }
      }
      else {
        if (this.error.length === 0) {
          this.ERROR.nativeElement.remove();
        }
      }

      setTimeout(() => {
        if (this.authService.err !== null) {
          this.authService.err = null;
        }

        if (this.ERROR.nativeElement.style.display === 'none') {
          this.ERROR.nativeElement.removeAttribute('style');
        }}, 50);
    }, 100);
  }


}
