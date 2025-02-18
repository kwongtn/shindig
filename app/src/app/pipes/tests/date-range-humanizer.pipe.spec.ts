import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";

import { DateRangeHumanizerPipe } from "../date-range-humanizer.pipe";

describe("DateRangeHumanizerPipe", () => {
  let platformId: Object;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: "browser" }],
    });

    platformId = TestBed.inject(PLATFORM_ID);
  });

  it("create an instance", () => {
    const pipe = new DateRangeHumanizerPipe(platformId);
    expect(pipe).toBeTruthy();
  });
});
