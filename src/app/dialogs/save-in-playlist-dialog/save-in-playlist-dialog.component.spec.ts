import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveInPlaylistDialogComponent } from './save-in-playlist-dialog.component';

describe('SaveInPlaylistDialogComponent', () => {
  let component: SaveInPlaylistDialogComponent;
  let fixture: ComponentFixture<SaveInPlaylistDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveInPlaylistDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveInPlaylistDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
