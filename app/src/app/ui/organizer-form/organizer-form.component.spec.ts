import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizerFormComponent } from './organizer-form.component';

describe('OrganizerFormComponent', () => {
  let component: OrganizerFormComponent;
  let fixture: ComponentFixture<OrganizerFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizerFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganizerFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
