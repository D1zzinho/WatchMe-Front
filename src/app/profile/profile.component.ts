import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {AuthService} from '../auth.service';
import {environment} from '../../environments/environment';
import {VideoDto} from '../models/VideoDto';
import {PageEvent} from '@angular/material/paginator';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {EditVideoDialogComponent} from '../dialogs/edit-video-dialog/edit-video-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {MatMenuTrigger} from '@angular/material/menu';
import {CreateRepoDialogComponent} from '../dialogs/create-repo-dialog/create-repo-dialog.component';
import {DeleteVideoDialogComponent} from '../dialogs/delete-video-dialog/delete-video-dialog.component';
import {ShowRepoInfoDialogComponent} from '../dialogs/show-repo-info-dialog/show-repo-info-dialog.component';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {ActivatedRoute, Router} from '@angular/router';
import {EditPlaylistDialogComponent} from '../dialogs/edit-playlist-dialog/edit-playlist-dialog.component';
import {CreatePlaylistDialogComponent} from '../dialogs/create-playlist-dialog/create-playlist-dialog.component';
import {ToastrService} from 'ngx-toastr';
import {SaveInPlaylistDialogComponent} from '../dialogs/save-in-playlist-dialog/save-in-playlist-dialog.component';


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class ProfileComponent implements OnInit, AfterViewInit {

  baseUrl = environment.baseUrl;
  pageEvent: void;
  dataLoaded = Promise.resolve(false);

  username = '';
  avatar = '';
  publicProfile = '';

  currentUserData = {};
  currentUserVideos = new Array<VideoDto>();
  currentUserPlaylists = [];
  currentUserRepos = [];
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
  playlistsDisplayedColumns: string[] = ['name', 'status', 'videos', 'actions'];
  playlistsDataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  expandedElement: any;

  authenticatedUserId = '';
  currentUser: Promise<boolean> = Promise.resolve(false);
  uid = '';

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
    private toastService: ToastrService,
    private currentRoute: ActivatedRoute
  ) { }


  ngOnInit(): void {
    this.token = localStorage.getItem('token');

    this.currentRoute.queryParams.subscribe(params => {
      if (params.uid && params.uid !== '') {
        this.uid = params.uid;
      }
      else {
        this.currentUser = Promise.resolve(true);
      }
    });

    this.loadCurrentUserProfileData();
  }


  private loadCurrentUserProfileData(): void {
    this.authService.getUser().subscribe(res => {
      this.currentUserData = res;

      if (res.login) {
        this.userType = 'github';
        this.username = res.login;
        this.avatar = res.avatar_url;
        this.publicProfile = res.html_url;

        this.authService.getResource(`${this.baseUrl}/gitHubUsers/me`).subscribe(ghu => {
          this.authenticatedUserId = ghu._id;
          if (ghu.playlists.length > 0) {
            this.currentUserPlaylists = ghu.playlists;
            this.playlistsDataSource = new MatTableDataSource(ghu.playlists);
          }

          this.videosLength = ghu.videos.length;
          if (ghu.videos.length > 0) {
            this.currentUserVideos = ghu.videos.sort((a, b) => {
              return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
            });

            this.iterator();
          }
        });

        this.authService.getResource(`${environment.baseUrl}/gitHubUsers/repos`).subscribe(repos => {
          this.currentUserRepos = repos;

          this.dataSource = new MatTableDataSource(repos);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          this.tableLoaded = Promise.resolve(true);
        });

        this.dataLoaded = Promise.resolve(true);
      }
      else if (res.username) {
        this.userType = 'system';
        this.username = res.username;
        this.avatar = res.avatar;
        this.publicProfile = `/profile/${res.username}`;
        this.authenticatedUserId = res._id;

        if (res.playlists.length > 0) {
          this.currentUserPlaylists = res.playlists;
          this.playlistsDataSource = new MatTableDataSource<any>(res.playlists);
        }

        this.videosLength = res.videos.length;
        if (res.videos.length > 0) {
          this.currentUserVideos = res.videos.sort((a, b) => {
            return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
          });
          this.iterator();
        }


        this.dataLoaded = Promise.resolve(true);
      }
    }, err => {
      throw new Error(err.message);
    });
  }

  ngAfterViewInit(): void {
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
      data: { playlists: this.currentUserPlaylists },
      restoreFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.created) {
        this.playlistsDataSource = new MatTableDataSource(this.currentUserPlaylists);
      }
    });
  }


  openEditPlaylistDialog(playlist: any): void {
    const dialogRef = this.dialog.open(EditPlaylistDialogComponent, {
      data: playlist
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.deleted) {
        const index = this.currentUserPlaylists.findIndex(pl => {
          return pl._id === playlist._id;
        });

        if (index !== -1) {
          this.currentUserPlaylists.splice(index, 1);
          this.playlistsDataSource = new MatTableDataSource(this.currentUserPlaylists);
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
        const playlistIndex = this.currentUserPlaylists.findIndex(pl => {
          return pl._id === playlistId;
        });

        if (playlistIndex !== -1) {
          const videoIndex = this.currentUserPlaylists[playlistIndex].videos.findIndex(video => {
            return video._id === res.deletedVideo;
          });

          this.currentUserPlaylists[playlistIndex].videos.splice(videoIndex, 1);

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
    this.dialog.open(SaveInPlaylistDialogComponent, {
      data: { playlists: this.currentUserPlaylists, video },
      restoreFocus: false
    });
  }


  showPublicProfile(): void {
    window.open(`/profile?uid=${this.authenticatedUserId}`, '_blank');
  }


  private iterator(): void {
    const end = (this.currentPage + 1) * this.videosPerPage;
    const start = this.currentPage * this.videosPerPage;
    this.videosOnPage = this.currentUserVideos.slice(start, end);
  }

}
