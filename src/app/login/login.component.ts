import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {UploadVideoDto} from '../models/UploadVideoDto';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  private readonly SERVER_URL = 'http://192.168.100.2:3000/auth';

  constructor(private formBuilder: FormBuilder, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  onSubmit(): void {
    const user = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.http.post<any>(`${this.SERVER_URL}/login`, user).subscribe(
      (res) => {
        if (res.user !== null && res.token !== null) {
          localStorage.setItem('user', JSON.stringify(res.user));
          localStorage.setItem('token', res.token);

          setTimeout(() => {
            this.router.navigate(['/videos']);
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

}
