import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';

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

  _id: String = '';
  title: String = '';
  description: String = '';
  tags: Array<String> = new Array();
  path: String = '';
  cover: String = '';
  thumb: String = '';
  visits: Number = 0;
  thup: Number = 0;
  thdown: Number = 0;
  stat: Number = 1;
  
  playbackRate: Number = 1;
  volume: Number = 0.5;

  constructor(private http: HttpClient, private currentRoute: ActivatedRoute, private titleService: Title) { }

  ngOnInit(): void {
    this.currentRoute.queryParams.subscribe(params => {
      this.http.get<any>(this.VIDEOS_URL + '/' + params.vid).subscribe(res => {
        this._id = res._id
        this.title = res.title
        this.description = res.desc
        this.tags = res.tags.split(',')
        this.path = res.path
        this.cover = res.cover
        this.thumb = res.thumb
        this.visits = res.visits
        this.thup = res.thup
        this.thdown = res.thdown
        this.stat = res.stat
      });
    })
  }

  
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initPlayer(this._id)
      this.titleService.setTitle(this.title + ' - WatchMe')
    }, 1000)
  }


    private initPlayer(vid: String) {
        const video = this.videoElement?.nativeElement

        video.load()
    
        
        const shDescBtn = document.getElementById("sh_desc")
        const desc = this.descriptionDiv.nativeElement
        shDescBtn.addEventListener('click', () => {
            if (desc.style.height === "auto") {
                desc.removeAttribute("style");
                shDescBtn.innerHTML = "Pokaż więcej";
            }
            else {
                desc.style.height = "auto";
                shDescBtn.innerHTML = "Pokaż mniej";
            } 
        })

        video.addEventListener('loadedmetadata', () => {
        const player = this.playerElement.nativeElement
        const progress = this.progressSection.nativeElement
        const progressFilled = this.progressBar.nativeElement
        const toggle = this.playButton.nativeElement
        const fullscrbtn = this.fullScreenBtn.nativeElement
        const controls = this.playerControls.nativeElement
        const currentTime = this.timeHolder.nativeElement
        let ranges = document.querySelectorAll('.player-slider')
        
        // Logic
        function togglePlay() {
            const playState = video.paused ? 'play' : 'pause';
            video[playState](); // Call play or paused method
        }

        function updateButton() {
            const togglePlayBtn = toggle

            if(this.paused) {
            togglePlayBtn.innerHTML = `<i class="fa fa-play"></i>`;
            } else {
            togglePlayBtn.innerHTML = `<i class="fa fa-pause"></i>`;
            }
        }

        // function skip() {
        //   video.currentTime += parseFloat(this.dataset.skip);
        // }
        document.onclick = function() {
            video.muted = false;
        }


        function rangeUpdate() {
            video[this.name] = this.value;
            
            if (this.name == 'volume') {
                localStorage.setItem("volume", this.value)
                if (this.value == 0) {
                    document.getElementById("vol").innerHTML = '<i class="fa fa-volume-off"></i>';
                }
                else if (this.value > 0 && this.value < 0.6) {
                    document.getElementById("vol").innerHTML = '<i class="fa fa-volume-down"></i>';
                }
                else {
                    document.getElementById("vol").innerHTML = '<i class="fa fa-volume-up"></i>';
                }
            }
            else if (this.name == 'playbackRate') {
                localStorage.setItem("playbackRate", this.value)

                document.getElementById("playbackRate_value").innerHTML = 'x' + this.value
            }
        }


        function progressUpdate() {
            localStorage.setItem(String(vid), String(parseInt(video.currentTime)))


            const percent = (video.currentTime / video.duration) * 100;
            progressFilled.style.flexBasis = `${percent}%`;
        }


        function currentTimeUpdate() {
            convertTime(Math.round(video.currentTime));
        }

        function convertTime(seconds) {
            var min = Math.floor(seconds / 60);
            var sec = seconds % 60;
                    
                let mins = (min < 10) ? "0" + min : min;
                let secs = (sec < 10) ? "0" + sec : sec;
            currentTime.textContent = mins + ":" + secs;
                    
            totalTime(Math.round(video.duration));
        }
                
        function totalTime(seconds) {
            var min = Math.floor(seconds / 60);
            var sec = seconds % 60;
                    
                let mins = (min < 10) ? "0" + min : min;
                let secs = (sec < 10) ? "0" + sec : sec;
            currentTime.textContent += " / " + mins + ":" + secs;
        }


        function scrub(e) {
            const scrubTime = (e.offsetX / progress.offsetWidth) * video.duration;
            video.currentTime = scrubTime;
        }

        function toggleFullScreen() {
            if (!document.fullscreenElement) {
                document.getElementById("full-screen").innerHTML = '<i class="fa fa-compress"></i>';
                if(player.requestFullScreen) {
                    player.requestFullScreen();
                } 
                else if(player.webkitRequestFullScreen) {
                    player.webkitRequestFullScreen();
                } 
                else if(player.mozRequestFullScreen){
                    player.mozRequestFullScreen();
                }
                else if(player.msRequestFullscreen) {
                    player.msRequestFullscreen();
                }
            }
            else {
                document.getElementById("full-screen").innerHTML = '<i class="fa fa-expand"></i>';
                if (document.exitFullscreen) {
                    document.exitFullscreen(); 
                }
                
            }
        }


        if ('orientation' in screen) {
            screen.orientation.addEventListener('change', function() {
                if (screen.orientation.type.startsWith('landscape')) {
                    if (!video.paused) {
                        if (!document.fullscreenElement) {
                            if(player.requestFullScreen) {
                                player.requestFullScreen();
                            } 
                            else if(player.webkitRequestFullScreen) {
                                player.webkitRequestFullScreen();
                            } 
                            else if(player.mozRequestFullScreen){
                                player.mozRequestFullScreen();
                            }
                            else if(player.msRequestFullscreen) {
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


        //controls show or hide on mousemove or click
        var timeout = 0;
        var timeout2 = 0;
        player.addEventListener('mousemove', function() {
            controls.style.transform = "translateY(0)";
            player.style.cursor = "default";

            if (timeout2 == 0) {
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    controls.removeAttribute("style");
                    player.style.cursor = "none";
                    timeout = 0;
                }, 5000);
            }
        });

        player.addEventListener('click', function() {
            controls.style.transform = "translateY(0)";
            player.style.cursor = "default";
            clearTimeout(timeout2);
            timeout2 = setTimeout(function() {
                controls.removeAttribute("style");
                player.style.cursor = "none";
                timeout2 = 0;
            }, 5000);
        });

        player.addEventListener('mouseout', function() {
            controls.removeAttribute("style");
            player.style.cursor = "default";
            clearTimeout(timeout);
            timeout = 0;
            clearTimeout(timeout2);
            timeout2 = 0;
        });


        //events on mobile browser
        var tout;
        var lastTap = 0;
        video.addEventListener('touchend', function(event) {
            var currentTime = new Date().getTime();
            var tapLength = currentTime - lastTap;
            clearTimeout(tout);
            if (tapLength < 200 && tapLength > 0) {
                toggleFullScreen();
                if (video.paused) {
                    togglePlay;
                }
                else {
                    togglePlay;
                }
                event.preventDefault();
            } 
            else {
                togglePlay;
                timeout = setTimeout(function() {
                    clearTimeout(tout);
                }, 300);
            }
            lastTap = currentTime;
        });


        
            var sp = this.speedIcon.nativeElement
            var pbr = this.speedSlider.nativeElement
            var pbrv = this.speedValue.nativeElement
            if (window.innerWidth < 768) {
                sp.style.display = "none";
                pbr.style.display = "none";
                pbrv.style.display = "none";
            }
            else {
                sp.removeAttribute("style");
                pbr.removeAttribute("style");
                pbrv.removeAttribute("style");
            }
            window.addEventListener('resize', () => {
                if (window.innerWidth < 768) {
                    sp.style.display = "none";
                    pbr.style.display = "none";
                    pbrv.style.display = "none";
                }
                else {
                    sp.removeAttribute("style");
                    pbr.removeAttribute("style");
                    pbrv.removeAttribute("style");
                }
            });
        



        const vd = video.duration;

        
        video.addEventListener('timeupdate', () => {
            var range = 0;
            var bf = video.buffered;
            var time = video.currentTime;

            while (!(bf.start(range) <= time && time <= bf.end(range))) {
                range += 1;
            }

            var loadEndPercentage = 100 * (bf.end(range) / vd);

            this.bufferProgressBar.nativeElement.style.width = `${loadEndPercentage}%`;
        })
    


        
        document.onkeydown = function(e) {
            if (e.keyCode == 37) {
                video.currentTime -= 10;
            }
            else if (e.keyCode == 39) {
                video.currentTime += 10;
            }
            else if (e.keyCode == 80) {
                if (video.paused) {
                    video.play();
                }
                else {
                    video.pause();
                }
            }
            else if (e.keyCode == 77) {
                if (video.muted) {
                    video.muted = false;
                }
                else {
                    video.muted = true;
                }
            }
        }



        const duration = video.duration

        const videodata = localStorage.getItem(String(vid))
        if (videodata !== undefined) {
            if (videodata != "") {
                var videotime = Number(videodata)
                //var videodur = videodata.dr;
  
                if (videotime == parseInt(duration)) {
                    video.currentTime = 0;
                    console.log("Replay for " + vid);
                } 
                else if (videotime == 0) {
                    console.log("No saved videotime for " + vid + "!");
                } 
                else {
                    video.currentTime = videotime;
                    console.log("Saved videotime for " + vid + ": " + videotime);
                }
            }
        }
        else {
            console.log("No saved data for " + vid + "!");
        }
    

        const mute = localStorage.getItem("volume");
        if (mute != undefined) {
            if (Number(mute) == 0) {
                video.volume = mute;
                this.volumeSlider.nativeElement.value = mute;
                console.log("Last video was muted!");
            } 
            else {
                video.volume = mute;
                this.volumeSlider.nativeElement.value = mute;
                console.log("Last video was unmuted at volume = " + mute + "!");
            }
        } 
        else {
            localStorage.setItem("volume", String(0.5))
            console.log("No saved status for sound!");
            this.volumeSlider.nativeElement.value = 0.5;
            video.volume = 0.5;
        }

        
        const vplaybackrate = localStorage.getItem("playbackRate");
        if (vplaybackrate != undefined) {
            video.playbackRate = vplaybackrate;
            this.speedSlider.nativeElement.value = vplaybackrate;
            this.speedValue.nativeElement.innerHTML =
                "x" + vplaybackrate;
            console.log("Video playbackRate = " + vplaybackrate);
        } 
        else {
            console.log("No saved rate for video playback!");
            localStorage.setItem("playbackRate", String(1))
            this.speedSlider.nativeElement.value = 1;
            this.speedValue.nativeElement.innerHTML = "x" + 1;
        }
 
        video.play()
      })
  }

}
