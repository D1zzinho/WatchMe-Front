import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditCommentDialogComponent } from './edit-comment-dialog.component';

describe('EditCommentDialogComponent', () => {
  let component: EditCommentDialogComponent;
  let fixture: ComponentFixture<EditCommentDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCommentDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCommentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
