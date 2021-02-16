import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditVideoDialogComponent } from './edit-video-dialog.component';

describe('EditVideoDialogComponent', () => {
  let component: EditVideoDialogComponent;
  let fixture: ComponentFixture<EditVideoDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditVideoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditVideoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
