import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import {VideoDto} from '../models/VideoDto';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit, AfterViewInit {

  readonly VIDEOS_URL = 'http://192.168.100.2:3000/videos';

  @ViewChild('player') playerElement: ElementRef;
  @ViewChild('playerVideo') videoElement: ElementRef;
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

  id = '';
  title = '';
  description = '';
  tags: Array<string> = new Array<string>();
  path = '';
  cover = '';
  thumb = '';
  visits = 0;
  thup = 0;
  thdown = 0;
  stat = 1;

  playbackRate = 1;
  volume = 0.5;

  similarVideos: Array<VideoDto> = new Array<VideoDto>();
  similarOnPage = 8;


  constructor(private http: HttpClient, private currentRoute: ActivatedRoute, private titleService: Title) { }

  ngOnInit(): void {
    this.currentRoute.queryParams.subscribe(params => {
      this.http.get<any>(`${this.VIDEOS_URL}/${params.vid}`).subscribe(res => {
        this.id = res._id;
        this.title = res.title;
        this.description = res.desc;
        this.tags = res.tags;
        this.path = res.path;
        this.cover = res.cover;
        this.thumb = res.thumb;
        this.visits = res.visits;
        this.thup = res.thup;
        this.thdown = res.thdown;
        this.stat = res.stat;
      });
    });

    setTimeout(() => {
      this.http.post<any>(`${this.VIDEOS_URL}/similar`, { tags: this.tags }).subscribe(res => {
        this.similarVideos = res;
      });
    }, 200);
  }


  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initPlayer(this.id);
      this.titleService.setTitle(this.title + ' - WatchMe');
      import('src/app/player/mediaSession.js');
    }, 1000);
  }


  @HostListener('window:scroll', ['$event'])
  onWindowScroll(): void {
    const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;

    if (document.documentElement.scrollTop === max) {
      if (this.similarOnPage < 14) {
        this.similarOnPage += 2;
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
  //     import('src/app/player/mediaSession.js');
  //   }, 1000);
  // }

    private initPlayer(vid: string): void {
        const video = this.videoElement?.nativeElement;

        video.load();


        const shDescBtn = document.getElementById('sh_desc');
        const desc = this.descriptionDiv.nativeElement;
        shDescBtn.addEventListener('click', () => {
            if (desc.style.height === 'auto') {
                desc.removeAttribute('style');
                shDescBtn.innerHTML = 'Pokaż więcej';
            }
            else {
                desc.style.height = 'auto';
                shDescBtn.innerHTML = 'Pokaż mniej';
            }
        });

        video.addEventListener('loadedmetadata', () => {
        const player = this.playerElement.nativeElement;
        const progress = this.progressSection.nativeElement;
        const progressFilled = this.progressBar.nativeElement;
        const toggle = this.playButton.nativeElement;
        const fullscrbtn = this.fullScreenBtn.nativeElement;
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


        document.onclick = () => { video.muted = false; };


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


        function progressUpdate(): void {
            localStorage.setItem(String(vid), String(parseInt(video.currentTime, 10)));


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
            const scrubTime = (e.offsetX / progress.offsetWidth) * video.duration;
            video.currentTime = scrubTime;
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
                    document.exitFullscreen();
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
                    document.exitFullscreen();
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
        fullscrbtn.addEventListener('click', toggleFullScreen);

        toggle.addEventListener('click', togglePlay);
        // skippers.forEach(button => button.addEventListener('click', skip));
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



        const sp = this.speedIcon.nativeElement;
        const pbr = this.speedSlider.nativeElement;
        const pbrv = this.speedValue.nativeElement;
        if (window.innerWidth < 768) {
                sp.style.display = 'none';
                pbr.style.display = 'none';
                pbrv.style.display = 'none';
            }
            else {
                sp.removeAttribute('style');
                pbr.removeAttribute('style');
                pbrv.removeAttribute('style');
            }
        window.addEventListener('resize', () => {
                if (window.innerWidth < 768) {
                    sp.style.display = 'none';
                    pbr.style.display = 'none';
                    pbrv.style.display = 'none';
                }
                else {
                    sp.removeAttribute('style');
                    pbr.removeAttribute('style');
                    pbrv.removeAttribute('style');
                }
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
            if (e.keyCode === 37) {
                video.currentTime -= 10;
            }
            else if (e.keyCode === 39) {
                video.currentTime += 10;
            }
            else if (e.keyCode === 80) {
                if (video.paused) {
                    video.play();
                }
                else {
                    video.pause();
                }
            }
            else if (e.keyCode === 77) {
                if (video.muted) {
                    video.muted = false;
                }
                else {
                    video.muted = true;
                }
            }
        };



        const duration = video.duration;

        const videodata = localStorage.getItem(String(vid));
        if (videodata !== null) {
            if (videodata !== '') {
                const videotime = Number(videodata);
                // var videodur = videodata.dr;

                if (videotime === parseInt(duration, 10)) {
                    video.currentTime = 0;
                    console.log('Replay for ' + vid);
                }
                else if (videotime === 0) {
                    console.log('No saved videotime for ' + vid + '!');
                }
                else {
                    video.currentTime = videotime;
                    console.log('Saved videotime for ' + vid + ': ' + videotime);
                }
            }
        }
        else {
            console.log('No saved data for ' + vid + '!');
        }


        const mute = localStorage.getItem('volume');
        if (mute !== null) {
            if (Number(mute) === 0) {
                video.volume = mute;
                this.volumeSlider.nativeElement.value = mute;
                console.log('Last video was muted!');
            }
            else {
                video.volume = mute;
                this.volumeSlider.nativeElement.value = mute;
                console.log('Last video was unmuted at volume = ' + mute + '!');
            }
        }
        else {
            localStorage.setItem('volume', String(0.5));
            console.log('No saved status for sound!');
            this.volumeSlider.nativeElement.value = 0.5;
            video.volume = 0.5;
        }


        const vplaybackrate = localStorage.getItem('playbackRate');
        if (vplaybackrate !== null) {
            video.playbackRate = vplaybackrate;
            this.speedSlider.nativeElement.value = vplaybackrate;
            this.speedValue.nativeElement.innerHTML =
                'x' + vplaybackrate;
            console.log('Video playbackRate = ' + vplaybackrate);
        }
        else {
            console.log('No saved rate for video playback!');
            localStorage.setItem('playbackRate', String(1));
            this.speedSlider.nativeElement.value = 1;
            this.speedValue.nativeElement.innerHTML = 'x' + 1;
        }

        video.play();
      });
  }

}
