import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteVideoDialogComponent } from './delete-video-dialog.component';

describe('DeleteVideoDialogComponent', () => {
  let component: DeleteVideoDialogComponent;
  let fixture: ComponentFixture<DeleteVideoDialogComponent>;

  beforeEach(async(() => {
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
