import { VideosComponent } from '../videos/videos.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router
import { PlayerComponent } from '../player/player.component';
import { FinderComponent } from '../finder/finder.component';
import { UploadvideoComponent } from '../uploadvideo/uploadvideo.component';
import { HomeComponent } from '../home/home.component';
import {LoginComponent} from '../login/login.component';

const routes: Routes = [
  { path: '', component: HomeComponent, data: { title: 'WatchMe' } },
  { path: 'videos', component: VideosComponent, data: { title: 'Videos - WatchMe' } },
  { path: 'player', component: PlayerComponent, data: { title: 'Player - WatchMe' } },
  { path: 'finder', component: FinderComponent, data: { title: 'Search - WatchMe' } },
  { path: 'uploadvideo', component: UploadvideoComponent, data: { title: 'Upload new video' } },
  { path: 'login', component: LoginComponent, data: { title: 'Login - WatchMe' } }
]; // sets up routes constant where you define your routes

// configures NgModule imports and exports
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class TopNavigationComponent { }
