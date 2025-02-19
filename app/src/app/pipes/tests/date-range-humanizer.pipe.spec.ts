import { DateRangeHumanizerPipe } from "../date-range-humanizer.pipe";

describe('DateRangeHumanizerPipe', () => {
  it('create an instance', () => {
    const pipe = new DateRangeHumanizerPipe();
    expect(pipe).toBeTruthy();
  });
});
