import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { TopNavigationComponent } from './top-navigation/top-navigation.component';
import { VideosComponent } from './videos/videos.component';
import { FinderComponent } from './finder/finder.component';
import { PlayerComponent } from './player/player.component';
import { UploadvideoComponent } from './uploadvideo/uploadvideo.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import {AuthService} from './auth.service';
import {AppRoutingModule} from './app-routing.module';
import {AuthGuardService} from './auth-guard.service';


@NgModule({
  declarations: [
    AppComponent,
    TopNavigationComponent,
    VideosComponent,
    FinderComponent,
    PlayerComponent,
    UploadvideoComponent,
    HomeComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule
  ],
  providers: [AuthService, AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
