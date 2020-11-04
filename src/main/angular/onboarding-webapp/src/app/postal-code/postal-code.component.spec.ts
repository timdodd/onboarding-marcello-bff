import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostalCodeComponent } from './postal-code.component';

describe('PostalCodeComponent', () => {
  let component: PostalCodeComponent;
  let fixture: ComponentFixture<PostalCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostalCodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostalCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
