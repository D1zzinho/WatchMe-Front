import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {environment} from '../../../environments/environment';
import {Location} from '@angular/common';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit {

  readonly baseUrl = environment.baseUrl;
  @Input() playlist: any;
  @Output() playlistChange: EventEmitter<any> = new EventEmitter<any>();

  @Input() video: any;


  constructor(private location: Location) { }


  ngOnInit(): void {
    console.log(this.playlist);
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
