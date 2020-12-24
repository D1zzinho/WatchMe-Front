import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router
import { PlayerComponent } from './player/player.component';
import { FinderComponent } from './finder/finder.component';
import { UploadVideoComponent } from './uploadvideo/upload-video.component';
import { VideosComponent } from './videos/videos.component';
import { HomeComponent } from './home/home.component';
import {LoginComponent} from './login/login.component';
import {AuthGuardService} from './auth-guard.service';
import {ProfileComponent} from './profile/profile.component';

const routes: Routes = [
  { path: '', component: HomeComponent, data: { title: 'WatchMe' } },
  { path: 'videos', component: VideosComponent, data: { title: 'Videos - WatchMe' }, children: [{
    component: VideosComponent,
    path: 'viewed', data: { title: 'Most viewed videos - WatchMe' }
  }], canActivate: [AuthGuardService] },
  { path: 'player', component: PlayerComponent, data: { title: 'Player - WatchMe' }, canActivate: [AuthGuardService] },
  { path: 'finder', component: FinderComponent, data: { title: 'Search - WatchMe' }, canActivate: [AuthGuardService] },
  { path: 'uploadVideo', component: UploadVideoComponent, data: { title: 'Upload new video - WatchMe' }, canActivate: [AuthGuardService] },
  { path: 'profile', component: ProfileComponent, data: { title: 'Profile - WatchMe' }, canActivate: [AuthGuardService] },
  { path: 'login', component: LoginComponent, data: { title: 'Login - WatchMe' } }
]; // sets up routes constant where you define your routes

// configures NgModule imports and exports
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
