const video = document.getElementById("video")

video.addEventListener('loadedmetadata', () => {
    if ('mediaSession' in window.navigator) {

        navigator.mediaSession.metadata = new MediaMetadata({
          title: document.getElementById("vtitle").innerHTML,
          artist: document.getElementById("author").innerHTML,
          album: "Best album",
          artwork: [
            { src: video.getAttribute("poster"), sizes: '96x96',   type: 'image/png' },
            { src: video.getAttribute("poster"), sizes: '128x128', type: 'image/png' },
            { src: video.getAttribute("poster"), sizes: '192x192', type: 'image/png' },
            { src: video.getAttribute("poster"), sizes: '256x256', type: 'image/png' },
            { src: video.getAttribute("poster"), sizes: '384x384', type: 'image/png' },
            { src: video.getAttribute("poster"), sizes: '512x512', type: 'image/png' },
          ]
        });

        // navigator.mediaSession.setActionHandler('play', function() {});
        // navigator.mediaSession.setActionHandler('pause', function() {});
        navigator.mediaSession.setActionHandler('seekbackward', () => { video.currentTime -= 10; });
        navigator.mediaSession.setActionHandler('seekforward', () => { video.currentTime += 10; });
        // navigator.mediaSession.setActionHandler('previoustrack', function() { video.currentTime -= 10;});
        // navigator.mediaSession.setActionHandler('nexttrack', function() { video.currentTime += 10; });
    }
})

