import { icons } from "./icons-provider";

describe('IconsProvider', () => {
  it('should have icons defined', () => {
    expect(icons).toBeDefined();
    expect(icons.length).toBeGreaterThan(0);
  });

  it('should contain specific icons', () => {
    expect(icons).toContain(jasmine.any(Function));
  });
});
