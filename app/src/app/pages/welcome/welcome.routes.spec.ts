import { WelcomeComponent } from "./welcome.component";
import { WELCOME_ROUTES } from "./welcome.routes";

describe('WelcomeRoutes', () => {
  it('should define a route to WelcomeComponent', () => {
    expect(WELCOME_ROUTES).toEqual([
      { path: '', component: WelcomeComponent }
    ]);
  });
});
