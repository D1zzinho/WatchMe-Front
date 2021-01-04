import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateRepoDialogComponent } from './create-repo-dialog.component';

describe('CreateRepoDialogComponent', () => {
  let component: CreateRepoDialogComponent;
  let fixture: ComponentFixture<CreateRepoDialogComponent>;

  beforeEach(async(() => {
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
