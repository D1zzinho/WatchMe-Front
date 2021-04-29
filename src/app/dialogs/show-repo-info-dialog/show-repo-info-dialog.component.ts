import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {AuthService} from '../../auth.service';
import {environment} from '../../../environments/environment';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-show-repo-info-dialog',
  templateUrl: './show-repo-info-dialog.component.html',
  styleUrls: ['./show-repo-info-dialog.component.css']
})
export class ShowRepoInfoDialogComponent implements OnInit {

  readonly baseUrl = environment.baseUrl;

  loadedCommits: Promise<boolean>;
  accessible: Promise<boolean>;
  commits: Array<any> = new Array<any>();
  languages: Array<any> = new Array<any>();

  error: string;

  chartType = 'horizontalBar';
  chartDatasets: Array<any>;
  chartLabels: Array<any>;
  chartColors: Array<any>;
  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      labels: {
        fontColor: 'white'
      }
    },
    scales: {
      yAxes: [{
        ticks: {
          fontColor: 'white',
          fontSize: 15,
          stepSize: 1,
          beginAtZero: true
        }
      }],
      xAxes: [{
        ticks: {
          fontColor: 'white',
          fontSize: 12,
          stepSize: 1,
          beginAtZero: true
        }
      }]
    }
  };
  chartClicked(e: any): void { }
  chartHovered(e: any): void { }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      name: string,
      owner: string,
      isPrivate: boolean
    },
    private authService: AuthService,
    private toastService: ToastrService
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
      this.authService.postResource(`${this.baseUrl}/gitHubUsers/commits`, getRepoBody).subscribe(commits => {
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
      }, error => {
        this.error = error.error.message;
        this.loadedCommits = Promise.resolve(true);
        this.toastService.error(error.error.message);
      });

      this.authService.postResource(`${this.baseUrl}/gitHubUsers/languages`, getRepoBody).subscribe(languages => {
        const languagesMap = Object.keys(languages).map((key) => [String(key), languages[key]]);

        let languageSum = 0;
        languagesMap.forEach((value, key) => {
          languageSum += value[1];
        });

        const percentArr = new Array<any>();
        languagesMap.forEach((value, key) => {
          percentArr.push([value[0], (Math.round((value[1] / languageSum) * 100) / 100) * 100 ]);
        });

        this.chartDatasets = [];
        this.chartLabels = [];
        this.chartColors = [];
        const data = [];
        const colors = [];
        const labels = [];
        percentArr.forEach(lang => {
          data.push(Math.floor(lang[1]));
          colors.push('#' + Math.floor(Math.random() * 16777215).toString(16));
          labels.push(lang[0]);
        });
        this.chartDatasets = [{ data, label: '% of used languages' }];
        this.chartLabels = labels;
        this.chartColors = [{
          backgroundColor: colors
        }];

      }, error => {
        this.toastService.error(error.error.message);
      });
    }

  }

}
