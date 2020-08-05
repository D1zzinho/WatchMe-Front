import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { TopNavigationComponent } from './top-navigation/top-navigation.component';
import { VideosComponent } from './videos/videos.component';
import { FinderComponent } from './finder/finder.component';
import { PlayerComponent } from './player/player.component';


@NgModule({
  declarations: [
    AppComponent,
    VideosComponent,
    FinderComponent,
    PlayerComponent
  ],
  imports: [
    BrowserModule,
    TopNavigationComponent,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
