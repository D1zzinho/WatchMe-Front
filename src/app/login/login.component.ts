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
  loginForm: FormGroup;
  registerForm: FormGroup;
  error: string = null;

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

    this.loginForm = this.formBuilder.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });

    this.registerForm = this.formBuilder.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email])
    });
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      import('src/app/login/login.switch.js');
    }, 500);
  }


  onRegisterSubmit(): void {
    const user = {
      username: this.registerForm.value.username,
      password: this.registerForm.value.password,
      email: this.registerForm.value.email
    };

    this.authService.register(user);
    this.errorHandlingMessageWithAlert();
  }


  onLoginSubmit(): void {
    const user = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.authService.login(user);
    this.errorHandlingMessageWithAlert();
  }


  private errorHandlingMessageWithAlert(): void {
    setTimeout(() => {
      if (this.authService.err !== null) {
        this.error = this.authService.err;

        setTimeout(() => {
          if (this.ERROR.nativeElement.style.display === 'none') {
            this.ERROR.nativeElement.removeAttribute('style');
          }
        }, 50);

      }
    }, 100);
  }


}
