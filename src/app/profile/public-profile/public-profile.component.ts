import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {environment} from '../../../environments/environment';
import {VideoDto} from '../../models/VideoDto';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatMenuTrigger} from '@angular/material/menu';
import {AuthService} from '../../auth.service';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {ToastrService} from 'ngx-toastr';
import {EditVideoDialogComponent} from '../../dialogs/edit-video-dialog/edit-video-dialog.component';
import {DeleteVideoDialogComponent} from '../../dialogs/delete-video-dialog/delete-video-dialog.component';
import {CreatePlaylistDialogComponent} from '../../dialogs/create-playlist-dialog/create-playlist-dialog.component';
import {EditPlaylistDialogComponent} from '../../dialogs/edit-playlist-dialog/edit-playlist-dialog.component';
import {CreateRepoDialogComponent} from '../../dialogs/create-repo-dialog/create-repo-dialog.component';
import {ShowRepoInfoDialogComponent} from '../../dialogs/show-repo-info-dialog/show-repo-info-dialog.component';
import {SaveInPlaylistDialogComponent} from '../../dialogs/save-in-playlist-dialog/save-in-playlist-dialog.component';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {PlaylistActionsDialogComponent} from '../../dialogs/playlist-actions-dialog/playlist-actions-dialog.component';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['../profile.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class PublicProfileComponent implements OnInit {

  baseUrl = environment.baseUrl;
  pageEvent: void;
  dataLoaded = Promise.resolve(false);

  @Input() uid: string;
  @Input() currentUser: any;

  username = '';
  avatar = '';
  publicProfile = '';

  userProfileData = {};
  userProfileVideos = new Array<VideoDto>();
  userProfilePlaylists = [];
  // userProfileRepos = [];
  userType = '';

  videosOnPage: Array<VideoDto> = new Array<VideoDto>();
  videosLength = 0;
  currentPage = 0;
  videosPerPage = 10;
  pageSizeOptions: number[] = [5, 10, 15, 20, 40];
  displayedColumns: string[] = ['name', 'description', 'status', 'commits', 'external_link'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  tableLoaded = Promise.resolve(false);

  private playlistPaginator: MatPaginator;
  playlistsDisplayedColumns: string[] = ['name', 'videos', 'actions'];
  playlistsDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  expandedElement: any;

  token: string;

  @ViewChild('playlistsPaginator') set playlistMatPaginator(plp: MatPaginator) {
    this.playlistPaginator = plp;
    this.playlistsDataSource.paginator = this.playlistPaginator;
  }

  @ViewChild('repoPaginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;


  constructor(
    private authService: AuthService,
    private router: Router,
    public dialog: MatDialog,
    private toastService: ToastrService
  ) { }


  ngOnInit(): void {
    this.token = localStorage.getItem('token');

    if (this.uid !== '') {
      this.authService.getResource(`${this.baseUrl}/users/${this.uid}/profile`).subscribe(res => {
        if (res.playlists.length > 0) {
          this.userProfilePlaylists = res.playlists;
          this.playlistsDataSource = new MatTableDataSource(res.playlists);
        }
        if (res.videos.length > 0) {
          this.userProfileVideos = res.videos.sort((a, b) => {
            return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
          });
          this.iterator();
        }

        if (res.userType === 'GITHUB_USER') {
          this.userType = 'github';
          this.username = res.username;
          this.avatar = res.avatar;

          this.authService.getResource(`${this.baseUrl}/gitHubUsers/username/${res.username}`).subscribe(ghu => {
            this.publicProfile = ghu.html_url;
            this.userProfileData = ghu;
          }, err => {
            throw new Error(err.error.message);
          });

          //
          // this.authService.getResource(`${environment.baseUrl}/gitHubUsers/repos`).subscribe(repos => {
          //   this.currentUserRepos = repos;
          //
          //   this.dataSource = new MatTableDataSource(repos);
          //   this.dataSource.paginator = this.paginator;
          //   this.dataSource.sort = this.sort;
          //
          //   this.tableLoaded = Promise.resolve(true);
          // });

          this.dataLoaded = Promise.resolve(true);
        }
        else if (res.userType === 'REGISTERED_USER') {
          this.userType = 'system';
          this.username = res.username;
          this.avatar = res.avatar;
          this.publicProfile = `/profile?uid=${res._id}`;

          this.userProfileData = res;
          this.dataLoaded = Promise.resolve(true);
        }
      }, err => {
        throw new Error(err.message);
      });
    }
  }


  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  handlePage(e: PageEvent): void {
    this.currentPage = e.pageIndex;
    this.videosPerPage = e.pageSize;

    this.iterator();
  }


  openEditVideoDialog(video: VideoDto): void {
    const dialogRef = this.dialog.open(EditVideoDialogComponent, {
      data: video,
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe(() => {
      this.menuTrigger.focus();
    });
  }


  openDeleteVideoDialog(video: VideoDto): void {
    const dialogRef = this.dialog.open(DeleteVideoDialogComponent, {
      data: video,
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe(() => {
      this.menuTrigger.focus();
    });
  }


  openCreatePlaylistDialog(): void {
    const dialogRef = this.dialog.open(CreatePlaylistDialogComponent, {
      data: { playlists: this.userProfilePlaylists },
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.created) {
        this.playlistsDataSource = new MatTableDataSource(this.userProfilePlaylists);
      }
    });
  }


  openEditPlaylistDialog(playlist: any): void {
    const dialogRef = this.dialog.open(EditPlaylistDialogComponent, {
      data: playlist
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.deleted) {
        const index = this.userProfilePlaylists.findIndex(pl => {
          return pl._id === playlist._id;
        });

        if (index !== -1) {
          this.userProfilePlaylists.splice(index, 1);
          this.playlistsDataSource = new MatTableDataSource(this.userProfilePlaylists);
        }
      }
    });
  }


  openCreateRepoDialog(): void {
    this.dialog.open(CreateRepoDialogComponent, {
      restoreFocus: false
    });
  }


  openShowCommitsDialog(name: string, owner: string, isPrivate: boolean): void {
    this.dialog.open(ShowRepoInfoDialogComponent, {
      data: { name, owner, isPrivate },
      restoreFocus: false
    });
  }


  playFromPlaylist(videoId: string, listId: string): void {
    this.router.navigate(['/player'], { queryParams: { vid: videoId, list: listId }});
  }


  deleteVideoFromPlaylist(playlistId: string, videoId: string): void {
    this.authService.patchResource(`${this.baseUrl}/playlist/deleteFrom/${playlistId}`, { videoId }).subscribe(res => {
      if (res.deleted) {
        const playlistIndex = this.userProfilePlaylists.findIndex(pl => {
          return pl._id === playlistId;
        });

        if (playlistIndex !== -1) {
          const videoIndex = this.userProfilePlaylists[playlistIndex].videos.findIndex(video => {
            return video._id === res.deletedVideo;
          });

          this.userProfilePlaylists[playlistIndex].videos.splice(videoIndex, 1);

          this.toastService.success(res.message);
        }
        else {
          this.toastService.error(res.message);
        }
      }
      else {
        this.toastService.error(res.message);
      }
    }, err => {
      this.toastService.error(err.error.message);
    });
  }


  openSaveVideoInPlaylistDialog(video): void {
    this.dialog.open(PlaylistActionsDialogComponent, {
      data: { playlists: this.currentUser.playlists, video },
      restoreFocus: false
    });
  }


  openGitHubProfile(): void {
    if (this.userType === 'github') { window.open(this.publicProfile, '_blank'); }
  }


  private iterator(): void {
    const end = (this.currentPage + 1) * this.videosPerPage;
    const start = this.currentPage * this.videosPerPage;
    this.videosOnPage = this.userProfileVideos.slice(start, end);
  }

}
