import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditPlaylistDialogComponent } from './edit-playlist-dialog.component';

describe('EditPlaylistDialogComponent', () => {
  let component: EditPlaylistDialogComponent;
  let fixture: ComponentFixture<EditPlaylistDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditPlaylistDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPlaylistDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
