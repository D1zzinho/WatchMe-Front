import {AfterContentInit, AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
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


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  baseUrl = environment.baseUrl;
  pageEvent: void;
  dataLoaded = Promise.resolve(false);

  username = '';
  avatar = '';
  publicProfile = '';

  currentUserData = {};
  currentUserVideos = new Array<VideoDto>();
  currentUserComments = [];
  currentUserRepos = [];
  userType = '';

  videosOnPage: Array<VideoDto> = new Array<VideoDto>();
  videosLength = 0;
  currentPage = 0;
  lastPage = 1;
  videosPerPage = 10;
  pageSizeOptions: number[] = [5, 10, 15, 20, 40];


  displayedColumns: string[] = ['name', 'description', 'status', 'commits', 'external_link'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  tableLoaded = Promise.resolve(false);

  @ViewChild('repoPaginator') paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild('menuTrigger') menuTrigger: MatMenuTrigger;


  constructor(private authService: AuthService, public dialog: MatDialog) { }


  ngOnInit(): void {
    this.authService.getUser().subscribe(res => {
      this.currentUserData = res;

      if (res.login) {
        this.userType = 'github';
        this.username = res.login;
        this.avatar = res.avatar_url;
        this.publicProfile = res.html_url;

        this.authService.getResource(`${this.baseUrl}/users/github/videos`).subscribe(videosCommentsRes => {
          this.currentUserComments = videosCommentsRes.comments;

          this.videosLength = videosCommentsRes.videos.length;

          if (videosCommentsRes.videos.length > 0) {
            this.currentUserVideos = videosCommentsRes.videos.sort((a, b) => {
              return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
            });

            this.currentUserVideos.forEach(video => {
              video.author = videosCommentsRes.username;
            });

            this.iterator();
          }
        });

        this.authService.getResource(`${environment.baseUrl}/users/github/repos`).subscribe(repos => {
          this.currentUserRepos = repos;

          this.dataSource = new MatTableDataSource(repos);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;

          this.tableLoaded = Promise.resolve(true);
        });

        if (this.currentUserVideos !== null && this.currentUserComments !== null && this.currentUserRepos !== null) {
          this.dataLoaded = Promise.resolve(true);
        }
      }
      else if (res.username) {
        this.userType = 'system';
        this.username = res.username;
        this.avatar = res.avatar;
        this.publicProfile = `/profile/${res.username}`;

        this.videosLength = res.videos.length;

        if (res.videos.length > 0) {
          this.currentUserVideos = res.videos.sort((a, b) => {
            return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
          });
          this.iterator();
        }

        this.currentUserComments = res.comments;
        this.dataLoaded = Promise.resolve(true);
      }

    }, err => {
      throw new Error(err.message);
    });
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


  private iterator(): void {
    const end = (this.currentPage + 1) * this.videosPerPage;
    const start = this.currentPage * this.videosPerPage;
    this.videosOnPage = this.currentUserVideos.slice(start, end);
  }

}
