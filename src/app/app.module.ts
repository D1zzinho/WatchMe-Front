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
import { EditVideoDialogComponent } from './dialogs/edit-video-dialog/edit-video-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { SnackBarComponent } from './snack-bar/snack-bar.component';
import { CreateRepoDialogComponent } from './dialogs/create-repo-dialog/create-repo-dialog.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatChipsModule} from '@angular/material/chips';
import { DeleteVideoDialogComponent } from './dialogs/delete-video-dialog/delete-video-dialog.component';
import { ShowRepoInfoDialogComponent } from './dialogs/show-repo-info-dialog/show-repo-info-dialog.component';
import {MatStepperModule, MatVerticalStepper} from '@angular/material/stepper';
import { EditCommentDialogComponent } from './dialogs/edit-comment-dialog/edit-comment-dialog.component';
import {MatSelectModule} from '@angular/material/select';
import { PlaylistActionsDialogComponent } from './dialogs/playlist-actions-dialog/playlist-actions-dialog.component';
import {MatListModule} from '@angular/material/list';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatGridListModule} from '@angular/material/grid-list';
import { PlaylistComponent } from './player/playlist/playlist.component';
import { CommentsComponent } from './player/comments/comments.component';


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
    FooterComponent,
    EditVideoDialogComponent,
    SnackBarComponent,
    CreateRepoDialogComponent,
    DeleteVideoDialogComponent,
    ShowRepoInfoDialogComponent,
    EditCommentDialogComponent,
    PlaylistActionsDialogComponent,
    PlaylistComponent,
    CommentsComponent
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
        MatDividerModule,
        MatDialogModule,
        MatSnackBarModule,
        MatCheckboxModule,
        MatChipsModule,
        MatStepperModule,
        MatSelectModule,
        MatListModule,
        MatGridListModule,
        MatExpansionModule
    ],
  providers: [
    AuthService,
    AuthGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

