import {AfterContentInit, Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {UploadVideoDto} from '../models/UploadVideoDto';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-uploadvideo',
  templateUrl: './uploadvideo.component.html',
  styleUrls: ['./uploadvideo.component.css']
})
export class UploadvideoComponent implements OnInit, AfterContentInit {

  private readonly SERVER_URL = 'http://localhost:3000/videos/upload';
  uploadForm: FormGroup;
  selectedFile: File;
  error: string;
  uploadResponse = { status: '', message: '' };

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

  ngAfterContentInit(): void {
    document.querySelectorAll('.drop-zone__input').forEach((inputElement: HTMLInputElement) => {
      const dropZoneElement = inputElement.closest('.drop-zone');

      dropZoneElement.addEventListener('click', (e: Event) => {
        inputElement.click();
      });

      inputElement.addEventListener('change', (e: Event) => {
        if (inputElement.files.length) {
          this.selectedFile = inputElement.files[0];
          this.uploadForm.get('file').setValue(inputElement.files[0]);

          updateThumbnail(dropZoneElement, inputElement.files[0]);
        }
      });

      dropZoneElement.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZoneElement.classList.add('drop-zone--over');
      });

      ['dragleave', 'dragend'].forEach((type) => {
        dropZoneElement.addEventListener(type, () => {
          dropZoneElement.classList.remove('drop-zone--over');
        });
      });

      dropZoneElement.addEventListener('drop', (e: DragEvent) => {
        e.preventDefault();

        if (e.dataTransfer.files.length) {
          inputElement.files = e.dataTransfer.files;
          this.selectedFile = inputElement.files[0];
          this.uploadForm.get('file').setValue(inputElement.files[0]);

          updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
        }

        dropZoneElement.classList.remove('drop-zone--over');
      });

    });


    function updateThumbnail(dropZoneElement, file): void {
      const textInputs = document.querySelector('.text-inputs');
      let thumbnailElement = dropZoneElement.querySelector('.drop-zone__thumb');

      if (dropZoneElement.querySelector('.drop-zone__prompt')) {
        dropZoneElement.querySelector('.drop-zone__prompt').remove();
      }

      if (!thumbnailElement) {
        thumbnailElement = document.createElement('div');
        thumbnailElement.classList.add('drop-zone__thumb');
        dropZoneElement.appendChild(thumbnailElement);
      }

      thumbnailElement.dataset.label = file.name;

      if (file.type.startsWith('video/')) {
        thumbnailElement.innerHTML = `<div class="p-2" style="word-break: break-word;">${file.name}</div>`;

        textInputs.removeAttribute('style');
      }
    }
  }

  onSubmit(): void {
    const videoBody: UploadVideoDto = {
      cover: `${this.selectedFile.name.slice(0, -4)}.png`,
      desc: this.uploadForm.value.desc,
      path: `${this.selectedFile.name}`,
      stat: 1,
      tags: this.uploadForm.value.tags,
      thumb: `${this.selectedFile.name.slice(0, -4)}_preview.webm`,
      title: this.uploadForm.value.title,
      visits: 0
    };

    const formData = new FormData();
    formData.append('file', this.uploadForm.get('file').value);
    formData.append('video', JSON.stringify(videoBody));

    this.authService.uploadResource(this.SERVER_URL, formData).subscribe(
      (res) => {
        this.uploadResponse = res;
      },
      (err) => {
        this.error = err.error.message;
      }
    );
  }

}
