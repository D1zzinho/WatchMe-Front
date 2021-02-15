import {AfterContentInit, Component, ElementRef, HostListener, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {VideoDto} from '../models/VideoDto';
import {AuthService} from '../auth.service';
import {environment} from '../../environments/environment';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {CommentDto} from '../models/CommentDto';
import {ThemePalette} from '@angular/material/core';
import {MatSlideToggleChange} from '@angular/material/slide-toggle';
import {MatSnackBar} from '@angular/material/snack-bar';
import {SnackBarComponent} from '../snack-bar/snack-bar.component';
import {MatDialog} from '@angular/material/dialog';
import {MatMenuTrigger} from '@angular/material/menu';
import {EditCommentDialogComponent} from '../dialogs/edit-comment-dialog/edit-comment-dialog.component';
import {EditVideoDialogComponent} from '../dialogs/edit-video-dialog/edit-video-dialog.component';
import {PlaylistActionsDialogComponent} from '../dialogs/playlist-actions-dialog/playlist-actions-dialog.component';
import {Location} from '@angular/common';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit, AfterContentInit, OnDestroy {

  readonly VIDEOS_URL: string = `${environment.baseUrl}/videos`;
  readonly COMMENTS_URL: string = `${environment.baseUrl}/comments`;
  readonly baseUrl: string = environment.baseUrl;
  videoLoaded: Promise<boolean>;
  error: string = null;

  video: any = null;
  id = '';
  title = '';
  description = '';
  tags: Array<string> = new Array<string>();
  path = '';
  cover = '';
  thumb = '';
  visits = 0;
  // thUp = 0;
  // thDown = 0;
  stat = 1;
  author = '';
  authorAvatar = '';
  uploadDate = '';

  playbackRate = 1;
  volume = 0.5;
  videoIsMuted = true;

  similarVideos: Array<VideoDto> = new Array<VideoDto>();
  similarOnPage = 11;
  similarVideosColumnLimit = 21;

  playlists: Array<any>;
  playlistLoaded: Promise<boolean>;
  playlist = null;

  isAdmin = false;
  isOwner = false;
  currentUser = '';
  userAvatar = '';

  comments: Array<CommentDto> = new Array<CommentDto>();
  commentForm: FormGroup;

  autoPlayNext: boolean;
  color: ThemePalette = 'accent';
  timeoutEnded: boolean;

  @ViewChild('player', { static: false }) playerElement: ElementRef;
  @ViewChild('playerVideo', { static: false }) videoElement: ElementRef<HTMLVideoElement>;
  @ViewChild('playerSource', { static: false }) videoSource: ElementRef<HTMLSourceElement>;
  @ViewChild('playerControls', { static: false }) playerControls: ElementRef;
  @ViewChild('progress', { static: false }) progressSection: ElementRef;
  @ViewChild('filledProgress', { static: false }) progressBar: ElementRef;
  @ViewChild('filledBufferProgress', { static: false }) bufferProgressBar: ElementRef;
  @ViewChild('playPauseBtn', { static: false }) playPauseBtn: ElementRef;
  @ViewChild('togglePlay', { static: false }) playButton: ElementRef;
  @ViewChild('sliders', { static: false }) slidersSection: ElementRef;
  @ViewChild('volumeIcon', { static: false }) volumeIcon: ElementRef;
  @ViewChild('volumeSlider', { static: false }) volumeSlider: ElementRef;
  @ViewChild('speedIcon', { static: false }) speedIcon: ElementRef;
  @ViewChild('speedSlider', { static: false }) speedSlider: ElementRef;
  @ViewChild('speedValue', { static: false }) speedValue: ElementRef;
  @ViewChild('timeHolder', { static: false }) timeHolder: ElementRef;
  @ViewChild('fullScreenBtn', { static: false }) fullScreenBtn: ElementRef;
  @ViewChild('descriptionDiv', { static: false }) descriptionDiv: ElementRef;
  @ViewChild('showDescLink', { static: false }) showDescLink: ElementRef;
  @ViewChild('editPanel', { static: false }) editPanel: ElementRef;
  @ViewChild('commentInput', { static: false }) commentInput: ElementRef<HTMLTextAreaElement>;
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private currentRoute: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private location: Location
  ) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => {
      return false;
    };
  }


  ngOnInit(): void {
    console.log('Testing init event');

    this.commentForm = this.formBuilder.group({
      text: new FormControl('',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(500),
          this.noWhitespaceValidator
        ]
      )
    });

    this.currentRoute.queryParams.subscribe(params => {
      const videoId = params.vid;

      this.authService.getResource(`${this.VIDEOS_URL}/${videoId}`).subscribe(res => {
        if (res !== null) {
          if (res.err) {
            this.error = 'Video not found!';
            // throw new Error(res.err);
          }
          else {
            this.videoLoaded = Promise.resolve(true);
            this.video = res;
            this.video._id = res.id;

            this.id = res?.id;
            this.title = res?.title;
            this.description = res?.desc;
            this.tags = res?.tags;
            this.path = res?.path;
            this.cover = res?.cover;
            this.thumb = res?.thumb;
            this.visits = res?.visits;
            // this.thUp = res.thUp;
            // this.thDown = res.thDown;
            this.stat = res?.stat;
            this.author = res?.author;
            this.authorAvatar = res?.authorAvatar;

            const date = new Date(res?.uploadDate);
            this.uploadDate = `${date.toDateString()}`;

            if (this.author === this.authService.getUsernameFromToken()) {
              this.isOwner = true;
            }

            this.authService.getResource(`${this.COMMENTS_URL}/${res.id}`).subscribe(result => {
              if (result.comments !== undefined) {
                this.comments = result?.comments;
              }
              else {
                this.comments = null;
              }
            });

            this.authService.getResource(`${this.baseUrl}/playlist/user`).subscribe(playlists => {
              this.playlists = playlists.userPlaylists.playlists;
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

                this.similarVideos = videos;
              });
            }

            if (this.error === null) {
              if (localStorage.getItem('token') !== null && localStorage.getItem('user') !== null) {
                const watchedVideos = JSON.parse(localStorage.getItem('watchedVideos'));
                if (watchedVideos !== null) {
                  const result = watchedVideos.findIndex(v => v.vid === this.id);

                  if (result === -1) {
                    this.authService.patchResource(
                      `${this.VIDEOS_URL}/${videoId}/views`,
                      null
                    ).subscribe(updated => { if (updated.updated) { this.visits += 1; } });
                  }
                }
                else {
                  this.authService.patchResource(
                    `${this.VIDEOS_URL}/${videoId}/views`,
                    null
                  ).subscribe(updated => { if (updated.updated) { this.visits += 1; } });
                }
              }
            }

            this.titleService.setTitle(res.title + ' - WatchMe');
          }
        }
        else {
          this.error = 'Video not found!';
          throw new Error('Video not found!');
        }
      });


      if (params.list !== undefined && params.list !== null) {
        this.playlistLoaded = Promise.resolve(false);

        this.authService.getResource(`${this.baseUrl}/playlist/${params.list}`).subscribe(res => {
          if (res.playlist !== null) {
            this.playlistLoaded = Promise.resolve(true);
            this.playlist = res.playlist;
          }
        }, err => {
          console.log(err.message);
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
    });
  }


  ngAfterContentInit(): void {
    this.timeoutEnded = false;

    setTimeout(() => {
      if (this.error === null) {
        if (this.similarVideos.length > 0 || this.playlist !== null) {

          if (localStorage.getItem('autoNext') !== null) {
            this.autoPlayNext = (localStorage.getItem('autoNext') === 'true');
          }
          else {
            localStorage.setItem('autoNext', 'true');
            this.autoPlayNext = true;
          }

          if (this.playlist === null) {
            const autoplayVideo = document.getElementById('autoplayVideo');
            if (this.autoPlayNext) {
              autoplayVideo.style.backgroundColor = '#69f0aaaa';
            }
            else {
              autoplayVideo.removeAttribute('style');
            }
          }
        }

        this.loadPlayer();
      }
    }, 2000);
  }


  private loadPlayer(): void {
      this.initPlayer();
      this.loadMediaSessionData();
      this.timeoutEnded = true;
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


  play(id: string): void {
    if (this.playlist !== null) {
      // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      //   this.router.navigate(['/player'], { queryParams: { vid: id, list: this.playlist._id }});
      // });
      // this.router.navigate(['/player'], { queryParams: { vid: id, list: this.playlist._id }});
      // window.location.href = `/player?vid=${id}&list=${this.playlist._id}`;
    }
    else {
      // this.router.onSameUrlNavigation = 'reload';
      // this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      //   this.router.navigate(['/player'], { queryParams: { vid: id }});
      // });
      this.router.navigate(['/player'], { queryParams: { vid: id }}).then(() => console.log(this.video));
      // window.location.href = `/player?vid=${id}`;
      // this.location.go(`/player?vid=${id}`);

    }
  }


  videoEnded(): void {
    console.log(this.videoElement.nativeElement.played);
  }


  deleteCurrentVideo(): void {
    if (this.authService.isAdmin() || this.isOwner) {
      const c = confirm('Do you want to delete ' + this.title + '?');

      if (c) {
        this.authService.deleteResource(`${this.VIDEOS_URL}/${this.id}`).subscribe(result => {
          if (!result.deleteVideo.deleted) {
            console.log('There was an error when deleting video! Message: ' + result.message);
          }
          else {
            window.location.href = '/videos';
          }
        });
      }
    }
  }


  async editTitle(title: string): Promise<void> {
    try {
      const editTitle = await this.authService.patchResource(`${this.VIDEOS_URL}/${this.id}/title`, {title}).toPromise();

      if (editTitle.updated) {
        window.location.reload();
      }
      else {
        console.log(editTitle.message);
      }
    }
    catch (err) {
      console.log(err.message);
    }
  }


  async editDesc(desc: string): Promise<void> {
    try {
      const editDesc = await this.authService.patchResource(`${this.VIDEOS_URL}/${this.id}/desc`, {desc}).toPromise();

      if (editDesc.updated) {
        window.location.reload();
      }
      else {
        console.log(editDesc.message);
      }
    }
    catch (err) {
      console.log(err.message);
    }
  }


  async editTags(tags: string): Promise<void> {
    try {
      const editTags = await this.authService.patchResource(`${this.VIDEOS_URL}/${this.id}/tags`, {tags}).toPromise();

      if (editTags.updated) {
        window.location.reload();
      }
      else {
        console.log(editTags.message);
      }
    }
    catch (err) {
      console.log(err.message);
    }
  }


  async editStat(): Promise<void> {
    try {
      const editStat = await this.authService.patchResource(`${this.VIDEOS_URL}/${this.id}/stat`, {id: this.id}).toPromise();

      if (editStat.updated) {
        window.location.reload();
      }
      else {
        console.log(editStat.message);
      }
    }
    catch (err) {
      console.log(err.message);
    }
  }


  private async getSimilarVideos(): Promise<Array<VideoDto>> {
    return await this.authService.getResource(`${this.VIDEOS_URL}/${this.id}/similar`).toPromise();
  }


  private initPlayer(): void {
    const video = this.videoElement.nativeElement;

    video.load();

    video.addEventListener('loadedmetadata', () => {
      const progress = this.progressSection.nativeElement;
      const toggle = this.playButton.nativeElement;
      const fullscreenButton = this.fullScreenBtn.nativeElement;
      const fullScreenState = localStorage.getItem('fullScreenState');

      let watchedVideos;
      let result;

      const watchedVideosResult = this.watchedVideosListener();
      watchedVideos = watchedVideosResult.watchedVideos;
      result = watchedVideosResult.result;

      video.addEventListener('play', () => this.updateButton());
      video.addEventListener('pause', () => this.updateButton());
      video.addEventListener('timeupdate', () => this.progressUpdate(result, watchedVideos));
      video.addEventListener('timeupdate', () => this.currentTimeUpdate());
      video.addEventListener('dblclick', () => this.toggleFullscreen());
      fullscreenButton.addEventListener('click', () => this.toggleFullscreen());

      toggle.addEventListener('click', async () => await this.togglePlay());

      let mousedown = false;
      progress.addEventListener('click', (e: MouseEvent) => this.moveTimeProgress(e));
      progress.addEventListener('mousemove', (e: MouseEvent) => mousedown && this.moveTimeProgress(e));
      progress.addEventListener('mousedown', () => mousedown = true);
      progress.addEventListener('mouseup', () => mousedown = false);

      window.addEventListener('resize', () => {
        this.windowResizeToChangeViewListener();
      });
      this.windowResizeToChangeViewListener();
      this.rangeUpdate();
      this.orientationListener();
      this.showCustomControlsListeners();
      this.windowResizeToChangeViewListener();
      this.bufferProgressListener();
      this.detectKeyDownWhenPlayerFocused();
      this.showMoreOrLessOfVideoDescription();
      this.localStorageSetOrGetTimeVolumeAndPlayRate(watchedVideosResult);
      this.videoPlayOrMute();


      // if (fullScreenState !== null) {
      //   if (fullScreenState === 'true') {
      //     this.toggleFullscreen();
      //   }
      // }


      video.addEventListener('ended', () => {
        if (this.similarVideos.length > 0) {
          if (localStorage.getItem('autoNext')) {
            this.playFirstFromOthers(localStorage.getItem('autoNext') === 'true');
          }
          else {
            this.playFirstFromOthers(false);
          }
        }
      });
    });
  }


  private progressUpdate(result: number, watchedVideos: Array<{ vid: string, vct: number }>): void {
    const video = this.videoElement.nativeElement;
    const progressFilled = this.progressBar.nativeElement;
    const vid = this.id;

    if (localStorage.getItem('watchedVideos') !== null) {
      if (result === -1) {
        result = watchedVideos.findIndex(v => v.vid === vid);
      }

      watchedVideos[result].vct = Math.floor(video.currentTime);
      localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));
    }

    const percent = (video.currentTime / video.duration) * 100;
    progressFilled.style.flexBasis = `${percent}%`;
  }


  private currentTimeUpdate(): void {
    const video = this.videoElement.nativeElement;

    this.convertTime(video, Math.round(video.currentTime));
  }


  private convertTime(video: HTMLVideoElement, seconds: number): void {
    const currentTime = this.timeHolder.nativeElement;
    let videoCurrentTime: string;

    if (Math.round(video.duration) >= 3600) {
      videoCurrentTime = new Date(seconds * 1000).toISOString().substr(11, 8);
    }
    else {
      videoCurrentTime = new Date(seconds * 1000).toISOString().substr(14, 5);
    }

    currentTime.textContent = videoCurrentTime;


    if (Math.round(video.duration) >= 3600) {
      currentTime.textContent += ' / ' + new Date(Math.round(video.duration) * 1000).toISOString().substr(11, 8);
    }
    else {
      currentTime.textContent += ' / ' + new Date(Math.round(video.duration) * 1000).toISOString().substr(14, 5);
    }
  }


  private moveTimeProgress(e: MouseEvent): void {
    const video = this.videoElement.nativeElement;
    const progress = this.progressSection.nativeElement;

    video.currentTime = (e.offsetX / progress.offsetWidth) * video.duration;

    // const canvas = document.getElementById('thumbnail') as HTMLCanvasElement;
    // canvas.width = video.videoWidth * 0.25;
    // canvas.height = video.videoHeight * 0.25;
    // canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
  }

  private rangeUpdate(): void {
    const video = this.videoElement.nativeElement;
    const ranges = document.querySelectorAll('.player-slider');

    function update(): void {
      video[this.name] = this.value;

      if (this.name === 'volume') {
        localStorage.setItem('volume', this.value);
        if (Number(this.value) === 0) {
          document.getElementById('vol').innerHTML = '<i class="fa fa-volume-off"></i>';
        } else if (Number(this.value) > 0 && Number(this.value) < 0.6) {
          document.getElementById('vol').innerHTML = '<i class="fa fa-volume-down"></i>';
        } else {
          document.getElementById('vol').innerHTML = '<i class="fa fa-volume-up"></i>';
        }
      } else if (this.name === 'playbackRate') {
        localStorage.setItem('playbackRate', this.value);

        document.getElementById('playbackRate_value').innerHTML = 'x' + this.value;
      }
    }

    ranges.forEach(range => range.addEventListener('change', update));
    ranges.forEach(range => range.addEventListener('mousemove', update));
  }


  private updateButton(): void {
    const video = this.videoElement.nativeElement;
    const togglePlayBtn = this.playButton.nativeElement;

    if (video.paused) {
      togglePlayBtn.innerHTML = `<i class="fa fa-play"></i>`;
    }
    else {
      togglePlayBtn.innerHTML = `<i class="fa fa-pause"></i>`;
    }
  }


  private togglePlay(): Promise<void> | void {
    const video = this.videoElement.nativeElement;
    const playState = video.paused ? 'play' : 'pause';
    return video[playState]();
  }


  private toggleFullscreen(): void {
    const player = this.playerElement.nativeElement;

    if (!document.fullscreenElement) {
      document.getElementById('full-screen').innerHTML = '<i class="fa fa-compress"></i>';
      // localStorage.setItem('fullScreenState', 'true');
      if (player.requestFullScreen) {
        player.requestFullScreen();
      }
      else if (player.webkitRequestFullScreen) {
        player.webkitRequestFullScreen();
      }
      else if (player.mozRequestFullScreen){
        player.mozRequestFullScreen();
      }
      else if (player.msRequestFullscreen) {
        player.msRequestFullscreen();
      }
    }
    else {
      document.getElementById('full-screen').innerHTML = '<i class="fa fa-expand"></i>';
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          // localStorage.setItem('fullScreenState', 'false');
        });
      }
    }
  }


  private orientationListener(): void {
    const video = this.videoElement.nativeElement;
    const player = this.playerElement.nativeElement;

    if ('orientation' in screen) {
      screen.orientation.addEventListener('change', () => {
        if (screen.orientation.type.startsWith('landscape')) {
          if (!video.paused) {
            if (!document.fullscreenElement) {
              if (player.requestFullScreen) {
                player.requestFullScreen();
              }
              else if (player.webkitRequestFullScreen) {
                player.webkitRequestFullScreen();
              }
              else if (player.mozRequestFullScreen){
                player.mozRequestFullScreen();
              }
              else if (player.msRequestFullscreen) {
                player.msRequestFullscreen();
              }
            }
          }
        }
        else if (document.fullscreenElement) {
          document.exitFullscreen().then();
        }
      });
    }
  }


  private showCustomControlsListeners(): void {
    const player = this.playerElement.nativeElement;
    const video = this.videoElement.nativeElement;
    const controls = this.playerControls.nativeElement;
    const progress = this.progressSection.nativeElement;

    let timeout = 0;
    let timeout2 = 0;
    player.addEventListener('mousemove', () => {
      controls.style.transform = 'translateY(0)';
      player.style.cursor = 'default';

      if (timeout2 === 0) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          controls.removeAttribute('style');
          player.style.cursor = 'none';
          timeout = 0;
        }, 5000);
      }
    });

    player.addEventListener('click', () => {
      controls.style.transform = 'translateY(0)';
      player.style.cursor = 'default';
      clearTimeout(timeout2);
      timeout2 = setTimeout(() => {
        controls.removeAttribute('style');
        player.style.cursor = 'none';
        timeout2 = 0;
      }, 5000);
    });

    player.addEventListener('mouseout', () => {
      controls.removeAttribute('style');
      player.style.cursor = 'default';
      clearTimeout(timeout);
      timeout = 0;
      clearTimeout(timeout2);
      timeout2 = 0;
    });

    progress.addEventListener('mouseover', () => {
      controls.style.transform = 'translateY(0)';
      player.style.cursor = 'default';
    });

    const tout = null;
    let lastTap = 0;
    video.addEventListener('touchend', (event) => {
      const cTime = new Date().getTime();
      const tapLength = cTime - lastTap;
      clearTimeout(tout);
      if (tapLength < 200 && tapLength > 0) {
        this.toggleFullscreen();
        if (video.paused) {
          this.togglePlay();
        }
        else {
          this.togglePlay();
        }
        event.preventDefault();
      }
      else {
        this.togglePlay();
        timeout = setTimeout(() => {
          clearTimeout(tout);
        }, 300);
      }
      lastTap = new Date().getTime();
    });
  }


  private windowResizeToChangeViewListener(): void {
    if (window.innerWidth < 768) {
      this.speedIcon.nativeElement.style.display = 'none';
      this.speedSlider.nativeElement.style.display = 'none';
      this.speedValue.nativeElement.style.display = 'none';
    }
    else {
      this.speedIcon.nativeElement.removeAttribute('style');
      this.speedSlider.nativeElement.removeAttribute('style');
      this.speedValue.nativeElement.removeAttribute('style');
    }
  }


  private bufferProgressListener(): void {
    const video = this.videoElement.nativeElement;
    const videoDuration = video.duration;

    video.addEventListener('progress', () => {
      if (videoDuration > 0) {
        for (let i = 0; i < video.buffered.length; i++) {
          if (video.buffered.start(video.buffered.length - 1 - i) < video.currentTime) {
            this.bufferProgressBar.nativeElement.style.width = (video.buffered.end(video.buffered.length - 1 - i) / videoDuration) * 100 + '%';
            break;
          }
        }
      }
    });
  }


  private watchedVideosListener(): { watchedVideos: Array<{ vid: string, vct: number }>, result: number } {
    const vid = this.id;
    let watchedVideos: Array<{ vid: string, vct: number }>;
    let result: number;

    if (localStorage.getItem('watchedVideos') === null) {
      watchedVideos = new Array<{ vid: string, vct: number }>();
      result = 0;
      watchedVideos.push({ vid, vct: 0 });

      localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));
    }
    else {
      watchedVideos = JSON.parse(localStorage.getItem('watchedVideos'));
      result = watchedVideos.findIndex(v => v.vid === vid);

      if (result === -1) {
        watchedVideos.push({ vid, vct: 0 });

        localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));
      }
    }

    return { watchedVideos, result };
  }


  private localStorageSetOrGetTimeVolumeAndPlayRate(
    watchedVideosListener: { watchedVideos: Array<{ vid: string, vct: number }>, result: number }
    ): void {
    const video = this.videoElement.nativeElement;
    const videoDuration = video.duration;
    const vid = this.id;

    if (watchedVideosListener.watchedVideos.length > 0 && watchedVideosListener.result !== -1) {
      const videoTime = watchedVideosListener.watchedVideos[watchedVideosListener.result].vct;

      if (videoTime === Math.floor(videoDuration)) {
        video.currentTime = 0;
        console.log('Replay for ' + vid);
      }
      else if (videoTime === 0) {
        console.log('No saved time for ' + vid + '!');
      }
      else {
        video.currentTime = videoTime;
        console.log('Saved time for ' + vid + ': ' + videoTime);
      }
    }
    else {
      console.log('No saved data for ' + vid + '!');
    }

    setTimeout(() => {
      const mute = localStorage.getItem('volume');
      if (mute !== null) {
        if (Number(mute) === 0) {
          video.volume = Number(mute);
          this.volumeSlider.nativeElement.value = mute;
          console.log('Last video was muted!');
        }
        else {
          video.volume = Number(mute);
          this.volumeSlider.nativeElement.value = mute;
          console.log('Last video was not muted at volume = ' + mute + '!');
        }
      }
      else {
        localStorage.setItem('volume', String(0.5));
        console.log('No saved status for sound!');
        this.volumeSlider.nativeElement.value = 0.5;
        video.volume = 0.5;
      }
    }, 100);


    const playbackRate = localStorage.getItem('playbackRate');
    if (playbackRate !== null) {
      video.playbackRate = Number(playbackRate);
      this.speedSlider.nativeElement.value = playbackRate;
      this.speedValue.nativeElement.innerHTML =
        'x' + playbackRate;
      console.log('Video playbackRate = ' + playbackRate);
    }
    else {
      console.log('No saved rate for video playback!');
      localStorage.setItem('playbackRate', String(1));
      this.speedSlider.nativeElement.value = 1;
      this.speedValue.nativeElement.innerHTML = 'x' + 1;
    }
  }


  private showMoreOrLessOfVideoDescription(): void {
    const showDescBtn = this.showDescLink.nativeElement;
    const desc = this.descriptionDiv.nativeElement;

    showDescBtn.addEventListener('click', () => {
      if (desc.style.height === 'auto') {
        desc.removeAttribute('style');
        showDescBtn.innerHTML = 'Show more';
      }
      else {
        desc.style.height = 'auto';
        showDescBtn.innerHTML = 'Show less';
      }
    });
  }


  private videoPlayOrMute(): void {
    const video = this.videoElement.nativeElement;

    video.oncanplay = () => {
      const promise = video.play();

      if (promise !== undefined) {
        promise.catch((error) => {
          console.log(error);
          video.muted = true;
          this.videoIsMuted = true;
          video.play().then();
        });
      }
    };
  }


  private detectKeyDownWhenPlayerFocused(): void {
    const video = this.videoElement.nativeElement;

    document.addEventListener('keydown', (e) => {
      // if (this.playerElement.nativeElement === document.activeElement) {
        if (e.key === 'ArrowLeft') {
          video.currentTime -= 10;
        }
        else if (e.key === 'ArrowRight') {
          video.currentTime += 10;
        }
        else if (e.key === 'p') {
          if (video.paused) {
            video.play().then();
          }
          else {
            video.pause();
          }
        }
        else if (e.key === 'm') {
          video.muted = !video.muted;
        }
      // }
    });
  }


  private loadMediaSessionData(): void {
    const video = this.videoElement.nativeElement;
    const artwork = `${environment.baseUrl}/${this.cover}`;

    video.addEventListener('loadedmetadata', () => {
      if ('mediaSession' in window.navigator) {

        navigator.mediaSession.metadata = new MediaMetadata({
          title: this.title,
          artist: this.author,
          artwork: [
            { src: artwork, sizes: '96x96',   type: 'image/png' },
            { src: artwork, sizes: '128x128', type: 'image/png' },
            { src: artwork, sizes: '192x192', type: 'image/png' },
            { src: artwork, sizes: '256x256', type: 'image/png' },
            { src: artwork, sizes: '384x384', type: 'image/png' },
            { src: artwork, sizes: '512x512', type: 'image/png' },
          ]
        });

        navigator.mediaSession.setActionHandler('play', () => { video.play().then(); });
        navigator.mediaSession.setActionHandler('pause', () => { video.pause(); });
        navigator.mediaSession.setActionHandler('seekbackward', () => { video.currentTime -= 10; });
        navigator.mediaSession.setActionHandler('seekforward', () => { video.currentTime += 10; });
        navigator.mediaSession.setActionHandler('nexttrack', () => { window.location.href = `/player?vid=${this.similarVideos[0].id}`; });
      }
    });
  }


  playFirstFromOthers(autoPlayNext: boolean): void {
    if (this.playlist === null) {
      this.playNextVideo(autoPlayNext, this.similarVideos[0]);
    }
    else {
      const index = this.playlist.videos.findIndex(video => {
        return video._id === this.video._id;
      });

      const next = (index + 1) % this.playlist.videos.length;
      this.playNextVideo(autoPlayNext, this.playlist.videos[next]);
    }
  }


  ngOnDestroy(): void {
    console.log('Testing destroy event');
  }


  onAutoPlayToggle(event: MatSlideToggleChange): void {
    localStorage.setItem('autoNext', String(event.checked));

    if (this.playlist === null) {
      const autoplayVideo = document.getElementById('autoplayVideo');
      if (event.checked) {
        autoplayVideo.style.backgroundColor = '#69f0aaaa';
      }
      else {
        autoplayVideo.removeAttribute('style');
      }
    }
  }


  addComment(): void {
    this.authService.postResource(`${this.COMMENTS_URL}/${this.id}`, { text: this.commentForm.value.text }).subscribe(res => {
      if (res.added) {
        this.commentInput.nativeElement.value = '';
        this.commentInput.nativeElement.style.height = '45px';
        this.comments.unshift(res.comment);

        this.snackBar.openFromComponent(SnackBarComponent, {
          data: { message: 'Comment successfully added!', type: 'success' },
          duration: 4 * 1000,
          panelClass: ['darkBar']
        });
      }
      else {
        this.snackBar.openFromComponent(SnackBarComponent, {
          data: { message: res.message, type: 'error' },
          duration: 4 * 1000,
          panelClass: ['darkBar']
        });
      }
    });
  }


  deleteComment(commentId: string): void {
    this.authService.deleteResource(`${this.COMMENTS_URL}/${commentId}`).subscribe(res => {
      if (res.deleted) {
        const index = this.comments.findIndex(comment => comment.id === commentId);

        if (index > -1) {
          this.comments.splice(index, 1);
        }

        this.snackBar.openFromComponent(SnackBarComponent, {
          data: { message: res.message, type: 'success' },
          duration: 4 * 1000,
          panelClass: ['darkBar']
        });
      }
      else {
        this.snackBar.openFromComponent(SnackBarComponent, {
          data: { message: res.message, type: 'error' },
          duration: 4 * 1000,
          panelClass: ['darkBar']
        });
      }
    }, err => {
      this.snackBar.openFromComponent(SnackBarComponent, {
        data: { message: err.message, type: 'error' },
        duration: 4 * 1000,
        panelClass: ['darkBar']
      });
    });
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


  openEditCommentDialog(comment: CommentDto): void {
    const dialogRef = this.dialog.open(EditCommentDialogComponent, {
      data: comment,
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe(() => {
      this.menuTrigger.focus();
    });
  }


  openEditVideoDialog(video: VideoDto): void {
    this.dialog.open(EditVideoDialogComponent, {
      data: video,
      restoreFocus: false
    });

    // dialogRef.afterClosed().subscribe(() => {
    // });
  }

  private noWhitespaceValidator(control: FormControl): any {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }


  private playNextVideo(autoPlayNext: boolean, video: any): void {
    const info = document.createElement('h2');
    const image = document.createElement('img');
    info.style.position = 'absolute';
    info.style.top = '0';
    info.style.left = '0';
    info.style.zIndex = '3';
    image.style.position = 'absolute';
    image.style.top = '0';
    image.style.left = '0';
    image.style.width = '100%';
    image.src = `${environment.baseUrl}/${video.cover}`;
    image.onclick = () => { this.play(video._id); };
    info.innerText = `Next video: ${video.title} in 5 seconds`;
    this.playerElement.nativeElement.appendChild(info);
    this.playerElement.nativeElement.appendChild(image);

    if (autoPlayNext) {
      let time = 5;
      setInterval(() => {
        time--;
        info.innerText = `Next video: ${video.title} in ${time} seconds`;
      }, 1000);

      setTimeout((): void => {
        this.play(video._id);
      }, 5000);
    }
    else {
      info.innerText = `Click to play next video: ${video.title}`;
    }
  }

}
