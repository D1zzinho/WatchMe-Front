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
  commits: Array<any> = new Array<any>();

  constructor(@Inject(MAT_DIALOG_DATA) public repo: string, private authService: AuthService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.loadedCommits = Promise.resolve(false);

    this.authService.getResource(`${this.baseUrl}/users/github/${this.repo}/commits`).subscribe(commits => {
      const withFormattedDate = new Array<any>();

      commits.forEach(commit => {
        withFormattedDate.push({
          date: new Date(commit.date).toDateString(),
          commits: commit.commits
        });
      });
console.log(withFormattedDate)
      this.commits = withFormattedDate;

      this.loadedCommits = Promise.resolve(true);
    });
  }

}
