import {
  AfterContentInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {VideoDto} from '../models/VideoDto';
import {AuthService} from '../auth.service';
import {environment} from '../../environments/environment';
import {FormBuilder} from '@angular/forms';
import {CommentDto} from '../models/CommentDto';
import {ThemePalette} from '@angular/material/core';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {MatDialog} from '@angular/material/dialog';
import {MatMenuTrigger} from '@angular/material/menu';
import {EditVideoDialogComponent} from '../dialogs/edit-video-dialog/edit-video-dialog.component';
import {PlaylistActionsDialogComponent} from '../dialogs/playlist-actions-dialog/playlist-actions-dialog.component';
import {Subscription} from 'rxjs';
import {SaveInPlaylistDialogComponent} from '../dialogs/save-in-playlist-dialog/save-in-playlist-dialog.component';
import {SimilarVideo} from './model/SimilarVideo';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit, AfterContentInit, OnDestroy {

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private currentRoute: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private authService: AuthService,
    public dialog: MatDialog
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }

  readonly VIDEOS_URL: string = `${environment.baseUrl}/videos`;
  readonly baseUrl: string = environment.baseUrl;
  videoLoaded: Promise<boolean>;
  error: string = null;
  videoSub: Subscription;

  video: any = null;
  author = '';
  authorAvatar = '';
  uploadDate = '';

  similarVideos: Array<SimilarVideo> = new Array<SimilarVideo>();
  similarOnPage = 11;
  similarVideosColumnLimit = 21;

  playlists: Array<any>;
  playlistLoaded: Promise<boolean>;
  playlist = null;

  isAdmin = false;
  isOwner = false;
  currentUserAvatar: HTMLImageElement = new Image();
  currentUserAvatarLoaded = false;
  currentUser = '';
  userAvatar = '';

  comments: Array<CommentDto> = new Array<CommentDto>();

  autoPlayNext: boolean;
  color: ThemePalette = 'accent';

  videoReady = false;
  fullDescription = false;

  token: string;

  @ViewChild('player', { static: false }) playerElement: ElementRef;
  @ViewChild('nextVideo', { static: false }) nextVideo: ElementRef;
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  ngOnInit(): void {
    this.token = localStorage.getItem('token');

    this.currentRoute.queryParams.subscribe(params => {
      const videoId = params.vid;

      this.videoSub = this.authService.getResource(`${this.VIDEOS_URL}/${videoId}`).subscribe(async res => {
        console.log(res);
        if (res !== null) {
          if (res.err) {
            this.error = 'Video not found!';
          }
          else {
            this.video = res;

            // this.title = res?.title;
            // this.description = res?.desc;
            // this.tags = res?.tags;
            // this.path = res?.path;
            // this.cover = res?.cover;
            // this.thumb = res?.thumb;
            // this.visits = res?.visits;
            // // this.thUp = res.thUp;
            // // this.thDown = res.thDown;
            // this.stat = res?.stat;
            this.author = res?.author;
            this.authorAvatar = res?.authorAvatar;

            const date = new Date(res?.uploadDate);
            this.uploadDate = `${date.toDateString()}`;

            if (this.author === this.authService.getUsernameFromToken()) {
              this.isOwner = true;
            }
            else {
              if (res.stat === 0 && !this.authService.isAdmin()) {
                this.error = 'This video is private!';
                throw new Error('This video is private!');
                // this.router.navigate(['/videos'], { queryParams: { error: 'private' } });
              }
            }

            // this.authService.getResource(`${this.COMMENTS_URL}/${res._id}`).subscribe(result => {
            //   if (result.comments !== undefined) {
            //     this.comments = result?.comments;
            //   }
            //   else {
            //     this.comments = null;
            //   }
            // });

            this.comments = res.comments.sort((a, b) => {
              return new Date(b.date).getTime() - new Date(a.date).getTime();
            });

            this.authService.getResource(`${this.baseUrl}/playlist/user`).subscribe(playlists => {
              this.playlists = playlists;
            });

            if (res.id !== '') {
              this.getSimilarVideos().then(videos => {
                let currentIndex = videos.length;
                let temporaryValue;
                let randomIndex;

                // While there remain elements to shuffle...
                while (0 !== currentIndex) {
                  // Pick a remaining element...
                  randomIndex = Math.floor(Math.random() * currentIndex);
                  currentIndex -= 1;

                  // And swap it with the current element.
                  temporaryValue = videos[currentIndex];
                  videos[currentIndex] = videos[randomIndex];
                  videos[randomIndex] = temporaryValue;
                }

                if (videos.length > 0) {
                  if (localStorage.getItem('autoNext') !== null) {
                    this.autoPlayNext = localStorage.getItem('autoNext') === 'true';
                  }
                  else {
                    localStorage.setItem('autoNext', 'true');
                    this.autoPlayNext = true;
                  }
                }

                this.similarVideos = (videos as Array<SimilarVideo>);
              });
            }

            if (this.error === null) {
              if (localStorage.getItem('token') !== null && localStorage.getItem('user') !== null) {
                const watchedVideos = JSON.parse(localStorage.getItem('watchedVideos'));
                if (watchedVideos !== null) {
                  const result = watchedVideos.findIndex(v => v.vid === this.video._id);

                  if (result === -1) {
                    await this.authService.patchResource(
                      `${this.VIDEOS_URL}/${videoId}/views`,
                      null
                    ).toPromise();
                  }
                }
                else {
                  await this.authService.patchResource(
                    `${this.VIDEOS_URL}/${videoId}/views`,
                    null
                  ).toPromise();
                }
              }
            }

            this.titleService.setTitle(res.title + ' - WatchMe');
            this.videoLoaded = Promise.resolve(true);
          }
        }
        else {
          this.error = 'Video not found!';
          throw new Error('Video not found!');
        }
      }, err => {
        this.error = err.error.message;
      });


      if (params.list !== undefined && params.list !== null) {
        this.playlistLoaded = Promise.resolve(false);

        this.authService.getResource(`${this.baseUrl}/playlist/${params.list}`).subscribe(res => {
          if (res.playlist !== null) {
            this.playlist = res;
            this.playlistLoaded = Promise.resolve(true);
          }
        }, err => {
          console.log(err.error.message);
        });
      }
    });

    this.isAdmin = this.authService.isAdmin();

    this.authService.getUser().subscribe(result => {
      if (result.avatar_url) {
        this.userAvatar = result.avatar_url;
        this.currentUser = result.login;
      }
      else {
        this.userAvatar = result.avatar;
        this.currentUser = result.username;
      }

      this.currentUserAvatar.src = this.userAvatar;
      this.currentUserAvatar.onload = () => { this.currentUserAvatarLoaded = true; };
    });
  }


  ngAfterContentInit(): void {
  }


  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    if (this.error === null) {
      const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;

      if (document.documentElement.scrollTop === max) {
        if (this.similarOnPage < this.similarVideosColumnLimit) {
          this.similarOnPage += 2;
        }
      }
    }
  }


  loadSimilarVideoThumb(id: string): void {
    const videoIndex = this.similarVideos.findIndex(v => {
      return v._id === id;
    });

    this.similarVideos[videoIndex].loaded = true;
  }


  play(id: string): void {
    if (this.playlist !== null) {
      this.router.navigate(['/player'], { queryParams: { vid: id, list: this.playlist._id }}).then();
    }
    else {
      this.router.navigate(['/player'], { queryParams: { vid: id } }).then();
    }
  }


  private async getSimilarVideos(): Promise<Array<VideoDto>> {
    return await this.authService.getResource(`${this.VIDEOS_URL}/${this.video._id}/similar`).toPromise();
  }


  ngOnDestroy(): void {
    this.videoSub.unsubscribe();
    this.dialog.closeAll();
  }


  onAutoPlayToggle(event: MatSlideToggleChange): void {
    localStorage.setItem('autoNext', String(event.checked));

    if (this.playlist === null) {
      this.autoPlayNext = event.checked;
    }
  }


  notInterested(id: string): void {
    const videoIndex = this.similarVideos.findIndex(video => {
      return video._id === id;
    });

    this.similarVideos.splice(videoIndex, 1);
  }


  openPlaylistActionsDialog(): void {
    const dialogRef = this.dialog.open(PlaylistActionsDialogComponent, {
      data: { playlists: this.playlists, video: this.video, playlist: this.playlist },
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        this.playlist = res;
        this.playlistLoaded = Promise.resolve(true);
      }
    });
  }


  openSaveSimilarVideoInPlaylist(video): void {
    this.dialog.open(SaveInPlaylistDialogComponent, {
      data: { playlists: this.playlists, video, playlist: this.playlist },
      restoreFocus: false
    });
  }


  openEditVideoDialog(video: VideoDto): void {
    this.dialog.open(EditVideoDialogComponent, {
      data: video,
      restoreFocus: false
    });
  }

}
