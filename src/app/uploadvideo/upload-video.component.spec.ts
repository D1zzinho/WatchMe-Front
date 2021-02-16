import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadVideoComponent } from './upload-video.component';

describe('UploadvideoComponent', () => {
  let component: UploadVideoComponent;
  let fixture: ComponentFixture<UploadVideoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
