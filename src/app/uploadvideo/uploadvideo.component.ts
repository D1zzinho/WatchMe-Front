import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {UploadVideoDto} from '../models/UploadVideoDto';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-uploadvideo',
  templateUrl: './uploadvideo.component.html',
  styleUrls: ['./uploadvideo.component.css']
})
export class UploadvideoComponent implements OnInit {

  private readonly SERVER_URL = 'http://192.168.100.2:3000/videos/upload';
  uploadForm: FormGroup;
  selectedFile: File;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.uploadForm = this.formBuilder.group({
      file: new FormControl(null, Validators.required),
      title: new FormControl('', [Validators.required, Validators.maxLength(200)]),
      desc: new FormControl('', Validators.maxLength(300)),
      tags: new FormControl('')
    });
  }

  onFileSelect(event): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.selectedFile = file;

      this.uploadForm.get('file').setValue(file);
    }
  }

  onSubmit(): void {
    const videoBody: UploadVideoDto = {
      cover: `uploads/${this.selectedFile.name.slice(0, -4)}.png`,
      desc: this.uploadForm.value.desc,
      path: `uploads/${this.selectedFile.name}`,
      stat: 1,
      tags: this.uploadForm.value.tags,
      thumb: `uploads/${this.selectedFile.name.slice(0, -4)}_preview.webm`,
      title: this.uploadForm.value.title,
      visits: 0
    };

    const formData = new FormData();
    formData.append('file', this.uploadForm.get('file').value);
    formData.append('video', JSON.stringify(videoBody));

    this.authService.postResource(this.SERVER_URL, formData).subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  }

}
