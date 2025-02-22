import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CopyCalendarUrlButtonComponent } from "./copy-calendar-url-button.component";

describe("CopyCalendarUrlButtonComponent", () => {
    let component: CopyCalendarUrlButtonComponent;
    let fixture: ComponentFixture<CopyCalendarUrlButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CopyCalendarUrlButtonComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(CopyCalendarUrlButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
