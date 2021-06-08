import {AfterContentInit, Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {UploadVideoDto} from '../models/UploadVideoDto';
import {AuthService} from '../auth.service';
import {environment} from '../../environments/environment';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';

@Component({
  selector: 'app-upload-video',
  templateUrl: './upload-video.component.html',
  styleUrls: ['./upload-video.component.css']
})
export class UploadVideoComponent implements OnInit, AfterContentInit {

  private readonly SERVER_URL = `${environment.baseUrl}/videos/upload`;
  baseUrl = environment.baseUrl;
  uploadForm: FormGroup;
  selectedFile: File;
  error: string;
  uploadResponse = '';

  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  tags: Array<string> = new Array<string>();

  newImageLoaded: Promise<boolean>;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private authService: AuthService) { }

  ngOnInit(): void {
    this.uploadForm = this.formBuilder.group({
      file: new FormControl(null, Validators.required),
      title: new FormControl('', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]),
      desc: new FormControl('', [Validators.minLength(10), Validators.maxLength(300)]),
      tags: new FormControl('', Validators.required)
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
      desc: this.uploadForm.value.desc,
      tags: this.tags,
      title: this.uploadForm.value.title
    };

    const formData = new FormData();
    formData.append('file', this.uploadForm.get('file').value);
    formData.append('video', JSON.stringify(videoBody));

    this.authService.uploadResource(this.SERVER_URL, formData).subscribe(
      (res) => {
        this.uploadResponse = res;
        if (res) {
          if (res.video) {
            (document.querySelector('.drop-zone') as HTMLDivElement).style.display = 'none';
            this.newImageLoaded = Promise.resolve(false);

            setTimeout(() => {
              this.newImageLoaded = Promise.resolve(true);

              setTimeout(() => {
                (document.getElementById('newVideoThumbnail') as HTMLImageElement).src = `${this.baseUrl}/videos/${res.video._id}/poster?token=` + localStorage.getItem('token');
              }, 100);

            }, 5000);
          }
        }
      },
      (err) => {
        this.error = err.message;
        console.log(err.message);
      }
    );
  }

  add(event: MatChipInputEvent): void {
    const input = event.chipInput;
    const value = event.value;

    if ((value || '').trim()) {
      if (!this.tags.includes(value)) {
        this.tags.push(value.trim());
      }
    }

    if (input) {
      input.inputElement.value = '';
    }
  }

  remove(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

}
