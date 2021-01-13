import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {AuthService} from '../../auth.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-show-repo-info-dialog',
  templateUrl: './show-repo-info-dialog.component.html',
  styleUrls: ['./show-repo-info-dialog.component.css']
})
export class ShowRepoInfoDialogComponent implements OnInit {

  readonly baseUrl = environment.baseUrl;
  readonly durationInSeconds = 5;

  loadedCommits: Promise<boolean>;
  accessible: Promise<boolean>;
  commits: Array<any> = new Array<any>();
  languages: Array<any> = new Array<any>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      name: string,
      owner: string,
      isPrivate: boolean
    },
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadedCommits = Promise.resolve(false);
    this.accessible = Promise.resolve(false);

    const getRepoBody = {
      name: this.data.name,
      owner: this.data.owner
    };

    if (this.data.owner !== this.authService.getUsernameFromToken() && this.data.isPrivate) {
      this.loadedCommits = Promise.resolve(true);
    }
    else {
      this.authService.postResource(`${this.baseUrl}/users/github/commits`, getRepoBody).subscribe(commits => {
        const withFormattedDate = new Array<any>();

        commits.forEach(commit => {
          commit.commits.forEach(commitData => {
            const date = new Date(commitData.date);
            commitData.date = date.toLocaleString();
          });

          withFormattedDate.push({
            date: new Date(commit.date).toDateString(),
            commits: commit.commits
          });
        });

        this.commits = withFormattedDate;

        this.accessible = Promise.resolve(true);
        this.loadedCommits = Promise.resolve(true);
      });

      this.authService.postResource(`${this.baseUrl}/users/github/languages`, getRepoBody).subscribe(languages => {
        const languagesMap = Object.keys(languages).map((key) => [String(key), languages[key]]);

        let languageSum = 0;
        languagesMap.forEach((value, key) => {
          languageSum += value[1];
        });

        const percentArr = new Array<any>();
        languagesMap.forEach((value, key) => {
          percentArr.push([value[0], (Math.round((value[1] / languageSum) * 100) / 100) * 100 ]);
        });

        this.languages = percentArr;
      });
    }

  }

}
