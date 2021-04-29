import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {environment} from '../../../environments/environment';
import {Location} from '@angular/common';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit, AfterViewInit {

  readonly baseUrl = environment.baseUrl;
  @Input() playlist: any;
  @Output() playlistChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() video: any;
  @Input() user: string;

  playlistPanelState = true;


  constructor(private location: Location) { }


  ngOnInit(): void {
    const panelState = localStorage.getItem('playlistPanelState');

    if (panelState === null) {
      this.openPlaylistPanel();
    }
    else {
      this.playlistPanelState = localStorage.getItem('playlistPanelState') === 'true';
    }
  }


  ngAfterViewInit(): void {
    const index = this.playlist.videos.findIndex(video => {
      return video._id === this.video._id;
    });

    if (index !== -1) {
      const videoItem = document.getElementById(this.video._id);
      document.getElementById('playlistVideos').scrollTop = videoItem.offsetTop - Math.ceil(videoItem.offsetHeight / 1.65);
    }
  }


  openPlaylistPanel(): void {
    this.playlistPanelState = true;
    localStorage.setItem('playlistPanelState', 'true');
  }


  closePlaylistPanel(): void {
    this.playlistPanelState = false;
    localStorage.setItem('playlistPanelState', 'false');
  }


  open(index: number): void {
    if (this.playlist.videos[index]) {
      window.location.href = `/player?vid=${this.playlist.videos[index]._id}&list=${this.playlist._id}`;
    }
  }


  close(): void {
    this.playlist = null;
    this.playlistChange.emit(null);
    this.location.replaceState(`/player`, `?vid=${this.video._id}`);
  }
}
