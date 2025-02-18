import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

import { AuthService } from "../../services/auth.service";
import { EventQueries } from "../event-queries";

describe("EventQueries", () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, Router],
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it("should create an instance", () => {
    expect(new EventQueries(authService, router)).toBeTruthy();
  });
});
