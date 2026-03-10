/**
 * Responsive viewport helpers for testing at different screen sizes.
 * Tailwind breakpoints: sm=640, md=768, lg=1024, xl=1280
 */
export const VIEWPORTS = {
  mobile: 375,    // iPhone SE
  mobileLg: 428,  // iPhone 14 Pro Max
  tablet: 768,    // iPad
  desktop: 1280,  // Standard desktop
} as const;

export function setViewport(width: number) {
  Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: width });
  Object.defineProperty(window, "innerHeight", { writable: true, configurable: true, value: width < 768 ? 667 : 1024 });
  window.matchMedia = jest.fn().mockImplementation((query: string) => {
    const minWidth = query.match(/min-width:\s*(\d+)px/);
    const matches = minWidth ? width >= parseInt(minWidth[1]) : false;
    return { matches, media: query, onchange: null, addListener: jest.fn(), removeListener: jest.fn(), addEventListener: jest.fn(), removeEventListener: jest.fn(), dispatchEvent: jest.fn() };
  });
  window.dispatchEvent(new Event("resize"));
}
