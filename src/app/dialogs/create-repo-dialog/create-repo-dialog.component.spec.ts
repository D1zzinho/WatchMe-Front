import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateRepoDialogComponent } from './create-repo-dialog.component';

describe('CreateRepoDialogComponent', () => {
  let component: CreateRepoDialogComponent;
  let fixture: ComponentFixture<CreateRepoDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateRepoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRepoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
