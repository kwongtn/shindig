import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ExtractWebpageBarComponent } from "./extract-webpage-bar.component";

describe("ExtractWebpageBarComponent", () => {
    let component: ExtractWebpageBarComponent;
    let fixture: ComponentFixture<ExtractWebpageBarComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ExtractWebpageBarComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ExtractWebpageBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });
});
