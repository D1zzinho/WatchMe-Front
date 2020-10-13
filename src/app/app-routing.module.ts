import { VideosComponent } from './videos/videos.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router
import { PlayerComponent } from './player/player.component';
import { FinderComponent } from './finder/finder.component';
import { UploadvideoComponent } from './uploadvideo/uploadvideo.component';
import { HomeComponent } from './home/home.component';
import {LoginComponent} from './login/login.component';
import {AuthGuardService} from './auth-guard.service';

const routes: Routes = [
  { path: 'videos', component: VideosComponent, data: { title: 'Videos - WatchMe' }, children: [{
    component: VideosComponent,
    path: 'viewed', data: { title: 'Most viewed videos - WatchMe' }
  }], canActivate: [AuthGuardService] },
  { path: 'player', component: PlayerComponent, data: { title: 'Player - WatchMe' }, canActivate: [AuthGuardService] },
  { path: 'finder', component: FinderComponent, data: { title: 'Search - WatchMe' }, canActivate: [AuthGuardService] },
  { path: 'uploadVideo', component: UploadvideoComponent, data: { title: 'Upload new video - WatchMe' }, canActivate: [AuthGuardService] },
  { path: 'login', component: LoginComponent, data: { title: 'Login - WatchMe' } },
  { path: '', component: HomeComponent, pathMatch: 'full', data: { title: 'WatchMe' } }
]; // sets up routes constant where you define your routes

// configures NgModule imports and exports
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
