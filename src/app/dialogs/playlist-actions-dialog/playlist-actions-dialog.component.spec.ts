import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistActionsDialogComponent } from './playlist-actions-dialog.component';

describe('PlaylistActionsDialogComponent', () => {
  let component: PlaylistActionsDialogComponent;
  let fixture: ComponentFixture<PlaylistActionsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlaylistActionsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlaylistActionsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
