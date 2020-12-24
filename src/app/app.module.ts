import { BrowserModule } from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { TopNavigationComponent } from './top-navigation/top-navigation.component';
import { VideosComponent } from './videos/videos.component';
import { FinderComponent } from './finder/finder.component';
import { PlayerComponent } from './player/player.component';
import { UploadVideoComponent } from './uploadvideo/upload-video.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import {AuthService} from './auth.service';
import {AppRoutingModule} from './app-routing.module';
import {AuthGuardService} from './auth-guard.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MDBBootstrapModule} from 'angular-bootstrap-md';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { ProfileComponent } from './profile/profile.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatMenuModule} from '@angular/material/menu';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatDividerModule} from '@angular/material/divider';
import { FooterComponent } from './footer/footer.component';


@NgModule({
  declarations: [
    AppComponent,
    TopNavigationComponent,
    VideosComponent,
    FinderComponent,
    PlayerComponent,
    UploadVideoComponent,
    HomeComponent,
    LoginComponent,
    ProfileComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MDBBootstrapModule.forRoot(),
    MatPaginatorModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatDividerModule
  ],
  providers: [
    AuthService,
    AuthGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

