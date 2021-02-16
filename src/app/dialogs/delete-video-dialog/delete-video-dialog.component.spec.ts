import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DeleteVideoDialogComponent } from './delete-video-dialog.component';

describe('DeleteVideoDialogComponent', () => {
  let component: DeleteVideoDialogComponent;
  let fixture: ComponentFixture<DeleteVideoDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteVideoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteVideoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
