import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowRepoInfoDialogComponent } from './show-repo-info-dialog.component';

describe('ShowRepoInfoDialogComponent', () => {
  let component: ShowRepoInfoDialogComponent;
  let fixture: ComponentFixture<ShowRepoInfoDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowRepoInfoDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowRepoInfoDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
