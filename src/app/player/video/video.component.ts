import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone, OnChanges,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as Plyr from 'plyr';
import {environment} from '../../../environments/environment';
import {Router} from '@angular/router';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import {AuthService} from '../../auth.service';


@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class VideoComponent implements OnInit, AfterViewInit, OnDestroy {

  readonly baseUrl = environment.baseUrl;

  @ViewChild('videoHolder', { static: true }) videoHolder: ElementRef;

  @Input() video: any;
  @Output() videoReady: EventEmitter<any> = new EventEmitter<any>();

  @Input() similarVideos: any;
  @Input() list: any;

  videoBlobSource: SafeUrl;
  // src$ = new BehaviorSubject(this.videoBlobSource);
  // dataUrl$ = this.src$.pipe(
  //   switchMap(url => this.authService.getStreamResource(`${this.baseUrl}/videos/${this.video._id}/stream`).pipe(map(e => this.sanitization.bypassSecurityTrustUrl(URL.createObjectURL(e)))))
  // );
  videoBlobPoster: SafeUrl;
  options: any;
  player: any;
  muted = true;
  sources = new Array<any>();

  interval: any;
  timeout: any;

  @ViewChild('video') videoElement: ElementRef;
  @ViewChild('source') sourceElement: ElementRef;


  constructor(
    private zone: NgZone,
    private router: Router,
    private authService: AuthService,
    private sanitization: DomSanitizer
  ) {
  }


  ngOnInit(): void {
    if (this.player) {
      this.player.destroy();
    }

    const token = localStorage.getItem('token');
    this.videoBlobSource = `${this.baseUrl}/videos/${this.video._id}/source/stream?token=${token}`;
    this.videoBlobPoster = `${this.baseUrl}/videos/${this.video._id}/poster?token=${token}`;

    this.sources.push({
      src: this.videoBlobSource,
      type: 'video/mp4',
      size: this.video.height
    });
    if (this.video.sources) {
      if (this.video.sources.length > 0) {
        this.sources.push({
          src: `${this.baseUrl}/videos/${this.video._id}/360/stream?token=${token}`,
          type: 'video/mp4',
          size: 360
        });
        if (this.video.sources[1]) {
          this.sources.push({
            src: `${this.baseUrl}/videos/${this.video._id}/480/stream?token=${token}`,
            type: 'video/mp4',
            size: 480
          });
        }
        if (this.video.sources[2]) {
          this.sources.push({
            src: `${this.baseUrl}/videos/${this.video._id}/720/stream?token=${token}`,
            type: 'video/mp4',
            size: 720
          });
        }
        if (this.video.sources[3]) {
          this.sources.push({
            src: `${this.baseUrl}/videos/${this.video._id}/1080/stream?token=${token}`,
            type: 'video/mp4',
            size: 1080
          });
        }
      }
    }

    // this.videoBlobSource = `${this.baseUrl}/${this.video.path}`;
    // this.videoBlobPoster = `${this.baseUrl}/${this.video.cover}`;
    // this.authService.getStreamResource(`${environment.baseUrl}/videos/${this.video._id}/stream`).subscribe(videoStream => {
    //   this.videoBlobSource = this.sanitization.bypassSecurityTrustUrl(URL.createObjectURL(videoStream.body));
    // }, err => {
    //   console.log(err.message);
    // });
    //
    // this.authService.getStreamResource(`${environment.baseUrl}/videos/${this.video._id}/poster`).subscribe(videoPoster => {
    //   console.log(videoPoster);
    //   this.videoBlobPoster = this.sanitization.bypassSecurityTrustUrl(URL.createObjectURL(videoPoster.body));
    // }, err => {
    //   console.log(err.message);
    // });
    //
    // this.options = {
    //   fluid: true,
    //   muted: false,
    //   poster: this.baseUrl + '/' + this.video.cover,
    //   autoplay: true,
    //   controls: true,
    //   sources: [
    //     { src: this.baseUrl + '/' + this.video.path, type: 'video/mp4' }
    //   ],
    //   playbackRates: [0.5, 1, 1.5, 2, 4, 8, 16],
    //   preload: 'metadata'
    // };
    // this.player = videojs(this.target.nativeElement, this.options);
  }


  ngOnDestroy(): void {
    if (this.player.media !== null) {
      this.player.destroy();

      if (this.player.pip) {
        this.player.pip = false;
      }
    }

    if (this.interval) {
      clearInterval(this.interval);
    }

    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }


  ngAfterViewInit(): void {
    this.player = new Plyr('#player', {
      muted: true,
      volume: 0.5,
      ratio: '16:9',
      keyboard: { focused: false, global: true }
    });

    this.player.source = {
      type: 'video',
      title: this.video.title,
      sources: this.sources,
      poster: this.videoBlobPoster
    };

    // if ('MediaSource' in window && MediaSource.isTypeSupported(this.mimeType)) {
    //   console.log('supported');
    //   const mediaSource = new MediaSource();
    //   this.sourceElement.nativeElement.src = URL.createObjectURL(mediaSource);
    //   mediaSource.addEventListener('sourceopen', () => this.sourceOpen(mediaSource));
    // } else {
    //   console.error('Unsupported MIME type or codec: ', this.mimeType);
    // }

    this.player.on('loadedmetadata', () => {
      this.initPlayer();
    });
  }


  private initPlayer(): void {
    this.loadMediaSessionData();
    this.watchedVideosListener();
    this.localStorageSetOrGetTimeVolumeAndPlayRate();
    this.preventDefaultKeyAction();
    this.videoReady.emit(true);

    try {
      this.player.play();
    } catch (err) {
      console.log(err);
    }
    // if (this.player.muted) {
    //
    // }
    // else {
    //   //const video = document.getElementById('player') as HTMLVideoElement;
    //
    // }
    // this.player.ready(() => {
    //   if (this.list !== null) {
    //     const playlist = new Array<any>();
    //
    //     this.list.videos.forEach(one => {
    //       playlist.push({
    //         _id: one._id,
    //         sources: [{
    //           src: this.baseUrl + '/' + one.path,
    //           type: 'video/mp4'
    //         }],
    //         poster: this.baseUrl + '/' + one.cover,
    //         name: one.title,
    //         thumbnail: [
    //           {
    //             src: this.baseUrl + '/' + one.cover
    //           }]
    //       });
    //     });
    //
    //     const current = playlist.findIndex(src => {
    //       return src.name === this.video.title;
    //     });
    //
    //     if (current !== -1) {
    //       this.currentItemOnPlaylist = true;
    //       this.player.playlist(playlist);
    //       this.player.playlist.currentItem(current);
    //     }
    //   }
    //
    //   this.localStorageSetOrGetTimeVolumeAndPlayRate();
    //   this.volumeOrSpeedChange();
    //   this.loadMediaSessionData();
    //
    this.player.on('ended', () => {
        if (this.similarVideos.length > 0 || this.list !== null) {
          const autoPlayNext = localStorage.getItem('autoNext') === 'true';
          if (this.list === null) {
            this.playNextVideo(autoPlayNext, this.similarVideos[0]);
          }
          else {
            const index = this.list.videos.findIndex(video => {
              return video._id === this.video._id;
            });

            const next = (index + 1) % this.list.videos.length;
            this.playNextVideo(autoPlayNext, this.list.videos[next]);
          }
        }
      });
    //
    //   this.videoReady.emit(true);
    // });
  }

  private watchedVideosListener(): { watchedVideos: Array<{ vid: string, vct: number }>, result: number } {
    const vid = this.video._id;
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


  private localStorageSetOrGetTimeVolumeAndPlayRate(): void {
    const duration = this.player.duration;
    const vid = this.video._id;

    const { watchedVideos, result } = this.watchedVideosListener();

    if (watchedVideos.length > 0 && result !== -1) {
      const videoTime = watchedVideos[result].vct;

      if (videoTime === Math.floor(duration)) {
        this.player.currentTime = 0;
        // console.log('Replay for ' + vid);
      }
      else if (videoTime === 0) {
        // console.log('No saved time for ' + vid + '!');
      }
      else {
        this.player.currentTime = videoTime;
        // console.log('Saved time for ' + vid + ': ' + videoTime);
      }
    }
    else {
      // console.log('No saved data for ' + vid + '!');
    }

    // const mute = localStorage.getItem('volume');
    // if (mute !== null) {
    //   if (Number(mute) === 0) {
    //     this.player.volume(Number(mute));
    //     console.log('Last video was muted!');
    //   }
    //   else {
    //     this.player.volume(Number(mute));
    //     console.log('Last video was not muted at volume = ' + mute + '!');
    //   }
    // }
    // else {
    //   localStorage.setItem('volume', String(0.5));
    //   console.log('No saved status for sound!');
    //   this.player.volume(0.5);
    // }
    //
    //
    // const playbackRate = localStorage.getItem('playbackRate');
    // if (playbackRate !== null) {
    //   this.player.playbackRate(Number(playbackRate));
    //   console.log('Video playbackRate = ' + playbackRate);
    // }
    // else {
    //   console.log('No saved rate for video playback!');
    //   localStorage.setItem('playbackRate', String(1));
    //   this.player.playbackRate(Number(1));
    // }

    let newResult;
    if (localStorage.getItem('watchedVideos') !== null) {
      if (result === -1) {
        newResult = watchedVideos.findIndex(v => v.vid === this.video._id);
      } else {
        newResult = result;
      }
    }

    // this.target.nativeElement.addEventListener('loadedmetadata', () => {
    this.player.on('timeupdate', () => {
      watchedVideos[newResult].vct = Math.floor(this.player.currentTime);
      localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));
    });
    // });
  }


  private preventDefaultKeyAction(): void {
    this.videoHolder.nativeElement.addEventListener('keydown', (e) => {
      if (e.target !== document.body) {
        if (e.key === ' ' || e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
        }
      }
      else {
        e.stopPropagation();
      }
    });
  }


  private loadMediaSessionData(): void {
    const token = localStorage.getItem('token');
    const artwork = `${environment.baseUrl}/videos/${this.video._id}/poster?token=${token}`;

    if ('mediaSession' in window.navigator) {

      navigator.mediaSession.metadata = new MediaMetadata({
        title: this.video.title,
        artist: this.video.author.username,
        artwork: [
          { src: artwork, sizes: '96x96',   type: 'image/png' },
          { src: artwork, sizes: '128x128', type: 'image/png' },
          { src: artwork, sizes: '192x192', type: 'image/png' },
          { src: artwork, sizes: '256x256', type: 'image/png' },
          { src: artwork, sizes: '384x384', type: 'image/png' },
          { src: artwork, sizes: '512x512', type: 'image/png' },
        ]
      });

      navigator.mediaSession.setActionHandler('play', () => { this.player.play(); });
      navigator.mediaSession.setActionHandler('pause', () => { this.player.pause(); });
      navigator.mediaSession.setActionHandler('seekbackward', () => { this.player.currentTime -= 10; });
      navigator.mediaSession.setActionHandler('seekforward', () => { this.player.currentTime += 10; });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.zone.run(() => {
          if (this.list === null) {
            this.play(this.similarVideos[0]._id);
          }
          else {
            const index = this.list.videos.findIndex(v => {
              return v._id === this.video._id;
            });
            const next = (index + 1) % this.list.videos.length;
            this.play(this.list.videos[next]._id);
          }
        });
      });
    }
  }


  play(id: string): void {
    if (this.list !== null) {
      this.router.navigate(['/player'], { queryParams: { vid: id, list: this.list._id }});
    }
    else {
      this.router.navigate(['/player'], {queryParams: { vid: id }});
    }
  }


  private playNextVideo(autoPlayNext: boolean, video: any): void {
    const height = document.querySelector('video').offsetHeight;
    this.player.destroy();
    document.querySelector('video').remove();

    const token = localStorage.getItem('token');
    const info = document.createElement('h2');
    const image = document.createElement('img');
    const div = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '0';
    info.style.left = '0';
    info.style.zIndex = '3';
    div.style.width = '100%';
    div.style.position = 'relative';
    div.style.textAlign = 'center';
    div.style.background = 'rgba(0,0,0,0.7)';
    image.style.position = 'relative';
    image.style.maxHeight = `${height}px`;
    image.src = `${environment.baseUrl}/videos/${video._id}/poster?token=${token}`;
    image.onclick = () => { this.play(video._id); };
    info.innerText = `Next video: ${video.title} in 5 seconds`;
    div.appendChild(info);
    div.appendChild(image);
    this.videoHolder.nativeElement.appendChild(div);

    if (autoPlayNext) {
      let time = 5;
      this.interval = setInterval(() => {
        time--;
        info.innerText = `Next video: ${video.title} in ${time} seconds`;
      }, 1000);

      this.timeout = setTimeout((): void => {
        this.play(video._id);
      }, 5000);
    }
    else {
      info.innerText = `Click to play next video: ${video.title}`;
    }
  }

  //
  // private sourceOpen(mediaSource): Subscription {
  //   const sourceBuffer = mediaSource.addSourceBuffer(this.mimeType);
  //   return this.authService.getStreamResource(`${this.baseUrl}/videos/${this.video._id}/stream`)
  //     .subscribe(uInt8Array => {
  //       console.log(uInt8Array);
  //       const blob = new Blob([uInt8Array], {
  //         type: 'video/mp4'
  //       });
  //       blob.arrayBuffer().then(x => sourceBuffer.appendBuffer(x));
  //     });
  //     //   sourceBuffer.addEventListener('updateend', () => {
  //     //     mediaSource.endOfStream();
  //     //     this.player.play();
  //     //   });
  //     //   blob.arrayBuffer().then(x => sourceBuffer.appendBuffer(x));
  //     // });
  // }

  //
  // private writeToFile(fileEntry, blob): void {
  //   // Create a FileWriter object for fileEntry
  //   fileEntry.createWriter(function(fileWriter) {
  //     fileWriter.onwriteend = function() {
  //       // read from file
  //       readFromFile(fileEntry.fullPath);
  //     };
  //     fileWriter.onerror = function(e) {
  //     };
  //     // Create a new Blob and write it to file
  //     fileWriter.write(blob);
  //   }, handleError);
  // }
  //
  //
  // private readFromFile(fullPath): void {
  //   window.fileSystem.root.getFile(fullPath, {}, function(fileEntry) {
  //     // Get a File object representing the file
  //     // then use FileReader to read its contents
  //     fileEntry.file(function(file) {
  //       var reader = new FileReader();
  //       reader.onloadend = function() {
  //         // video.src = this.result;
  //         video.src = URL.createObjectURL(new Blob([this.result]));
  //       };
  //       // reader.readAsDataURL(file);
  //       reader.readAsArrayBuffer(file);
  //     }, handleError);
  //   }, handleError);
  // }
  //
  //
  //

}
