const video = document.getElementById("video");
video.load()

video.addEventListener('loadedmetadata', () => {

const player = document.querySelector('.player');
const progress = player.querySelector('.progress');
const progressFilled = player.querySelector('.filled-progress');
const toggle = player.querySelector('.toggle-play');
const ranges = player.querySelectorAll('.player-slider');
const fullscrbtn = document.querySelector("#full-screen");
const controls = player.querySelector(".player-controls");
const currentTime = player.querySelector(".time");

// Logic
function togglePlay() {
  const playState = video.paused ? 'play' : 'pause';
  video[playState](); // Call play or paused method
}

function updateButton() {
  const togglePlayBtn = document.querySelector('.toggle-play');

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
    localStorage.setItem(localStorage.getItem("currentVideo"), String(parseInt(video.currentTime)))


  const percent = (video.currentTime / video.duration) * 100;
  progressFilled.style.flexBasis = `${percent}%`;
}


function currentTimeUpdate() {
    convertTime(Math.round(video.currentTime));
}

function convertTime(seconds) {
    var min = Math.floor(seconds / 60);
    var sec = seconds % 60;
            
        min = (min < 10) ? "0" + min : min;
        sec = (sec < 10) ? "0" + sec : sec;
    currentTime.textContent = min + ":" + sec;
            
    totalTime(Math.round(video.duration));
}
        
function totalTime(seconds) {
    var min = Math.floor(seconds / 60);
    var sec = seconds % 60;
            
        min = (min < 10) ? "0" + min : min;
        sec = (sec < 10) ? "0" + sec : sec;
    currentTime.textContent += " / " + min + ":" + sec;
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
        else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } 
        else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } 
        else if (document.msExitFullscreen) {
            document.msExitFullscreen();
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


//responsive controls
window.addEventListener('load', () => {
    var sp = document.querySelector(".speed");
    var pbr = document.querySelector("#playbackRate");
    var pbrv = document.querySelector("#playbackRate_value");
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
});



    var vd = video.duration;

    video.ontimeupdate = function() {
        var range = 0;
        var bf = this.buffered;
        var time = this.currentTime;

        while (!(bf.start(range) <= time && time <= bf.end(range))) {
            range += 1;
        }

        var loadEndPercentage = 100 * (bf.end(range) / vd);

        document.querySelector(
            ".filled-buffer-progress"
        ).style.width = `${loadEndPercentage}%`;
    };



    
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

const videodata = localStorage.getItem(localStorage.getItem("currentVideo"))
        if (videodata !== undefined) {
            if (videodata != "") {
                var videotime = Number(videodata)
                //var videodur = videodata.dr;
                console.log(duration)
                if (videotime == parseInt(duration)) {
                    video.currentTime = 0;
                    console.log("Replay for " + localStorage.getItem("currentVideo"));
                } 
                else if (videotime == 0) {
                    console.log("No saved videotime for " + localStorage.getItem("currentVideo") + "!");
                } 
                else {
                    video.currentTime = videotime;
                    console.log("Saved videotime for " + localStorage.getItem("currentVideo") + ": " + videotime);
                }
            }
        }
        else {
            console.log("No saved data for " + localStorage.getItem("currentVideo") + "!");
        }
    

        const mute = localStorage.getItem("volume");
        if (mute != undefined) {
            if (mute == 0) {
                video.volume = mute;
                document.getElementById("volume").value = mute;
                console.log("Last video was muted!");
            } 
            else {
                video.volume = mute;
                document.getElementById("volume").value = mute;
                console.log("Last video was unmuted at volume = " + mute + "!");
            }
        } 
        else {
            localStorage.setItem("volume", String(0.5))
            console.log("No saved status for sound!");
            document.getElementById("volume").value = 0.5;
            video.volume = 0.5;
        }

        
        const vplaybackrate = localStorage.getItem("playbackRate");
        if (vplaybackrate != undefined) {
            video.playbackRate = vplaybackrate;
            document.getElementById("playbackRate").value = vplaybackrate;
            document.getElementById("playbackRate_value").innerHTML =
                "x" + vplaybackrate;
            console.log("Video playbackRate = " + vplaybackrate);
        } 
        else {
            console.log("No saved rate for video playback!");
            localStorage.setItem("playbackRate", String(1))
            document.getElementById("playbackRate").value = 1;
            document.getElementById("playbackRate_value").innerHTML = "x" + 1;
        }
 

        video.play()

    })