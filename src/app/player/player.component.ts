import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {VideoDto} from '../models/VideoDto';
import {AuthService} from '../auth.service';
import {environment} from '../../environments/environment';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    private http: HttpClient,
    private currentRoute: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private authService: AuthService
  ) {}

  readonly VIDEOS_URL: string = `${environment.baseUrl}/videos`;
  error: string = null;
  visible: boolean;

  @ViewChild('player') playerElement: ElementRef;
  @ViewChild('playerVideo') videoElement: ElementRef<HTMLVideoElement>;
  @ViewChild('playerSource') videoSource: ElementRef;
  @ViewChild('playerControls') playerControls: ElementRef;
  @ViewChild('progress') progressSection: ElementRef;
  @ViewChild('filledProgress') progressBar: ElementRef;
  @ViewChild('filledBufferProgress') bufferProgressBar: ElementRef;
  @ViewChild('playPauseBtn') playPauseBtn: ElementRef;
  @ViewChild('togglePlay') playButton: ElementRef;
  @ViewChild('sliders') slidersSection: ElementRef;
  @ViewChild('volumeIcon') volumeIcon: ElementRef;
  @ViewChild('volumeSlider') volumeSlider: ElementRef;
  @ViewChild('speedIcon') speedIcon: ElementRef;
  @ViewChild('speedSlider') speedSlider: ElementRef;
  @ViewChild('speedValue') speedValue: ElementRef;
  @ViewChild('timeHolder') timeHolder: ElementRef;
  @ViewChild('fullScreenBtn') fullScreenBtn: ElementRef;
  @ViewChild('descriptionDiv') descriptionDiv: ElementRef;
  @ViewChild('editPanel') editPanel: ElementRef;

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
  // comments: Array<CommentDto> = new Array<CommentDto>();
  stat = 1;
  author = '';

  playbackRate = 1;
  volume = 0.5;
  videoIsMuted = false;

  similarVideos: Array<VideoDto> = new Array<VideoDto>();
  similarOnPage = 10;
  similarVideosColumnLimit = 20;

  isAdmin = false;
  isOwner = false;


  ngOnInit(): void {
    this.currentRoute.queryParams.subscribe(params => {
      this.authService.getResource(`${this.VIDEOS_URL}/${params.vid}`).subscribe(res => {
        if (res !== null) {
          if (res.err) {
            this.error = 'Video not found!';
            throw new Error(res.err);
          }
          else {
            this.visible = true;
            this.id = res.id;
            this.title = res.title;
            this.description = res.desc;
            this.tags = res.tags;
            this.path = res.path;
            this.cover = res.cover;
            this.thumb = res.thumb;
            this.visits = res.visits;
            // this.thUp = res.thUp;
            // this.thDown = res.thDown;
            this.stat = res.stat;
            this.author = res.author;
          }
        }
        else {
          this.error = 'Video not found!';
          throw new Error('Video not found!');
        }
      });


      setTimeout(() => {
        if (this.error === null) {
          if (localStorage.getItem('token') !== null && localStorage.getItem('user') !== null) {
            const watchedVideos = JSON.parse(localStorage.getItem('watchedVideos'));
            if (watchedVideos !== null) {
              const result = watchedVideos.findIndex(v => v.vid === this.id);
              if (result === -1) {
                this.authService.patchResource(
                  `${this.VIDEOS_URL}/${params.vid}/views`,
                  null
                ).subscribe(updated => { if (updated.updated) { this.visits += 1; } });
              }
            }
            else {
              this.authService.patchResource(
                `${this.VIDEOS_URL}/${params.vid}/views`,
                null
              ).subscribe(updated => { if (updated.updated) { this.visits += 1; } });
            }
          }

          if (this.id !== '') {
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
        }
        }, 200);
    });

    this.isAdmin = this.authService.isAdmin();

    if (this.author === this.authService.getUserFromToken()) {
      this.isOwner = true;
    }
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createVideoElement();

      if (this.error === null) {
          this.initPlayer(this.id);
          this.titleService.setTitle(this.title + ' - WatchMe');
          this.loadMediaSessionData();
        }
      }, 500);
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


  // loadVideo(id): void {
  //   this.http.get<any>(`${this.VIDEOS_URL}/${id}`).subscribe(res => {
  //     this.id = res._id;
  //     this.title = res.title;
  //     this.description = res.desc;
  //     this.tags = res.tags;
  //     this.path = res.path;
  //     this.cover = res.cover;
  //     this.thumb = res.thumb;
  //     this.visits = res.visits;
  //     this.thup = res.thup;
  //     this.thdown = res.thdown;
  //     this.stat = res.stat;
  //   });
  //
  //
  //   setTimeout(() => {
  //     this.http.post<any>(`${this.VIDEOS_URL}/similar`, { tags: this.tags }).subscribe(res => {
  //       this.similarVideos = res;
  //     });
  //   }, 200);
  //
  //   setTimeout(() => {
  //     this.initPlayer(this.id);
  //     this.titleService.setTitle(this.title + ' - WatchMe');
  //   }, 1000);
  // }


    play(id: string): void {
      window.location.href = `/player?vid=${id}`;
    }


  private async getSimilarVideos(): Promise<Array<VideoDto>> {
    return await this.authService.getResource(`${this.VIDEOS_URL}/${this.id}/similar`).toPromise();
  }


    private initPlayer(vid: string): void {
        const video = this.videoElement?.nativeElement;

        video.load();

        const shDescBtn = document.getElementById('sh_desc');
        const desc = this.descriptionDiv.nativeElement;
        shDescBtn.addEventListener('click', () => {
            if (desc.style.height === 'auto') {
                desc.removeAttribute('style');
                shDescBtn.innerHTML = 'Show more';
            }
            else {
                desc.style.height = 'auto';
                shDescBtn.innerHTML = 'Show less';
            }
        });

        video.addEventListener('loadedmetadata', () => {
        const player = this.playerElement.nativeElement;
        const progress = this.progressSection.nativeElement;
        const progressFilled = this.progressBar.nativeElement;
        const toggle = this.playButton.nativeElement;
        const fullscreenButton = this.fullScreenBtn.nativeElement;
        const controls = this.playerControls.nativeElement;
        const currentTime = this.timeHolder.nativeElement;
        const ranges = document.querySelectorAll('.player-slider');

        // Logic
        function togglePlay(): any {
            const playState = video.paused ? 'play' : 'pause';
            return video[playState](); // Call play or paused method
        }

        function updateButton(): void {
            const togglePlayBtn = toggle;

            if (this.paused) {
            togglePlayBtn.innerHTML = `<i class="fa fa-play"></i>`;
            } else {
            togglePlayBtn.innerHTML = `<i class="fa fa-pause"></i>`;
            }
        }

        function rangeUpdate(): void {
            video[this.name] = this.value;

            if (this.name === 'volume') {
                localStorage.setItem('volume', this.value);
                if (Number(this.value) === 0) {
                    document.getElementById('vol').innerHTML = '<i class="fa fa-volume-off"></i>';
                }
                else if (Number(this.value) > 0 && Number(this.value) < 0.6) {
                    document.getElementById('vol').innerHTML = '<i class="fa fa-volume-down"></i>';
                }
                else {
                    document.getElementById('vol').innerHTML = '<i class="fa fa-volume-up"></i>';
                }
            }
            else if (this.name === 'playbackRate') {
                localStorage.setItem('playbackRate', this.value);

                document.getElementById('playbackRate_value').innerHTML = 'x' + this.value;
            }
        }

        let watchedVideos;
        let result;
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

        function progressUpdate(): void {
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


        function currentTimeUpdate(): void {
            convertTime(Math.round(video.currentTime));
        }

        function convertTime(seconds): void {
            const min = Math.floor(seconds / 60);
            const sec = seconds % 60;

            const mins = (min < 10) ? '0' + min : min;
            const secs = (sec < 10) ? '0' + sec : sec;
            currentTime.textContent = mins + ':' + secs;

            totalTime(Math.round(video.duration));
        }

        function totalTime(seconds): void {
            const min = Math.floor(seconds / 60);
            const sec = seconds % 60;

            const mins = (min < 10) ? '0' + min : min;
            const secs = (sec < 10) ? '0' + sec : sec;
            currentTime.textContent += ' / ' + mins + ':' + secs;
        }

        function scrub(e): void {
          video.currentTime = (e.offsetX / progress.offsetWidth) * video.duration;
        }

        function toggleFullScreen(): void {
            if (!document.fullscreenElement) {
                document.getElementById('full-screen').innerHTML = '<i class="fa fa-compress"></i>';
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
                    document.exitFullscreen().then();
                }

            }
        }

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

        // Event listeners
        // video.addEventListener('click', togglePlay);
        video.addEventListener('play', updateButton);
        video.addEventListener('pause', updateButton);
        video.addEventListener('timeupdate', progressUpdate);
        video.addEventListener('timeupdate', currentTimeUpdate);
        video.addEventListener('dblclick', toggleFullScreen);
        fullscreenButton.addEventListener('click', toggleFullScreen);

        toggle.addEventListener('click', togglePlay);
        ranges.forEach(range => range.addEventListener('change', rangeUpdate));
        ranges.forEach(range => range.addEventListener('mousemove', rangeUpdate));

        let mousedown = false;
        progress.addEventListener('click', scrub);
        progress.addEventListener('mousemove', (e) => mousedown && scrub(e));
        progress.addEventListener('mousedown', () => mousedown = true);
        progress.addEventListener('mouseup', () => mousedown = false);

        // controls show or hide on mousemove or click
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

        // events on mobile browser
        const tout = null;
        let lastTap = 0;
        video.addEventListener('touchend', (event) => {
            const cTime = new Date().getTime();
            const tapLength = cTime - lastTap;
            clearTimeout(tout);
            if (tapLength < 200 && tapLength > 0) {
                toggleFullScreen();
                if (video.paused) {
                    togglePlay();
                }
                else {
                    togglePlay();
                }
                event.preventDefault();
            }
            else {
                togglePlay();
                timeout = setTimeout(() => {
                    clearTimeout(tout);
                }, 300);
            }
            lastTap = currentTime;
        });

        const speedIcon = this.speedIcon.nativeElement;
        const playbackRateSlider = this.speedSlider.nativeElement;
        const playbackRateSpeedValue = this.speedValue.nativeElement;

        function resize(): void {
          if (window.innerWidth < 768) {
            speedIcon.style.display = 'none';
            playbackRateSlider.style.display = 'none';
            playbackRateSpeedValue.style.display = 'none';
          }
          else {
            speedIcon.removeAttribute('style');
            playbackRateSlider.removeAttribute('style');
            playbackRateSpeedValue.removeAttribute('style');
          }
        }
        resize();

        window.addEventListener('resize', () => {
          resize();
        });

        const vd = video.duration;

        video.addEventListener('timeupdate', () => {
            let range = 0;
            const bf = video.buffered;
            const time = video.currentTime;

            while (!(bf.start(range) <= time && time <= bf.end(range))) {
                range += 1;
            }

            const loadEndPercentage = 100 * (bf.end(range) / vd);

            this.bufferProgressBar.nativeElement.style.width = `${loadEndPercentage}%`;
        });

        document.onkeydown = (e) => {
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
        };

        const duration = video.duration;

        if (watchedVideos.length > 0 && result !== -1) {
          const videoTime = watchedVideos[result].vct;

          if (videoTime === Math.floor(duration)) {
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

        video.oncanplay = () => {
            const promise = video.play();

            if (promise !== undefined) {
              promise.then(() => {

              }).catch((error) => {
                console.log(error);
                video.muted = true;
                this.videoIsMuted = true;
                video.play().then();
              });
            }
          };

      });

  }


  showEditPanel(): void {
    if (this.editPanel.nativeElement.style.display === 'none') {
      this.editPanel.nativeElement.removeAttribute('style');
    }
    else {
      this.editPanel.nativeElement.style.display = 'none';
    }
  }


  deleteCurrentVideo(): void {
    if (this.authService.isAdmin()) {
      const c = confirm('Do you want to delete ' + this.title + '?');

      if (c) {
        this.authService.deleteResource(`${this.VIDEOS_URL}/${this.id}`).subscribe(result => {
          if (!result.deleteVideo.deleted) {
            console.log('There was an error when deleting video! Message: ' + result.message);
          } else {
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


  loadMediaSessionData(): void {
    const video = document.getElementById('video') as HTMLVideoElement;
    const artwork = `http://localhost:3000/${this.cover}`;

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
      }
    });
  }


  private createVideoElement(): void {
    const video = document.createElement('video');
    video.muted = this.videoIsMuted;
    video.id = 'video';
    video.poster = `http://localhost:3000/${this.cover}`;
    video.src = `http://localhost:3000/${this.path}`;

    this.videoElement.nativeElement.appendChild(video);
  }


  ngOnDestroy(): void {
    if (!this.router.isActive('/player', true)) {
      window.location.reload();
    }
  }

}
