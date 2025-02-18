import { getCurrentLocalDate, getIdealModalWidth } from "./utils";

describe('Utils', () => {
  describe('getIdealModalWidth', () => {
    it('should return "calc(100vw - 32px)" for screen sizes less than 992px', () => {
      expect(getIdealModalWidth(500)).toBe('calc(100vw - 32px)');
      expect(getIdealModalWidth(700)).toBe('calc(100vw - 32px)');
      expect(getIdealModalWidth(900)).toBe('calc(100vw - 32px)');
    });

    it('should return "calc(100vw - 128px)" for screen sizes between 992px and 1200px', () => {
      expect(getIdealModalWidth(1000)).toBe('calc(100vw - 128px)');
      expect(getIdealModalWidth(1100)).toBe('calc(100vw - 128px)');
    });

    it('should return "calc(100vw - 512px)" for screen sizes greater than or equal to 1200px', () => {
      expect(getIdealModalWidth(1200)).toBe('calc(100vw - 512px)');
      expect(getIdealModalWidth(1600)).toBe('calc(100vw - 512px)');
      expect(getIdealModalWidth(2000)).toBe('calc(100vw - 512px)');
    });
  });

  describe('getCurrentLocalDate', () => {
    it('should return a string in the format YYYY-MM-DD', () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      expect(getCurrentLocalDate()).toMatch(dateRegex);
    });
  });
});
