import { VideosComponent } from '../videos/videos.component'

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router'; // CLI imports router
import { PlayerComponent } from '../player/player.component';
import { FinderComponent } from '../finder/finder.component';

const routes: Routes = [
  { path: 'videos', component: VideosComponent },
  { path: 'player', component: PlayerComponent },
  { path: 'finder', component: FinderComponent }
]; // sets up routes constant where you define your routes

// configures NgModule imports and exports
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class TopNavigationComponent { }