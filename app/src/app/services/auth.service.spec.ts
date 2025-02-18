import { of } from "rxjs";

import { PLATFORM_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Auth, User } from "@angular/fire/auth";
import { Firestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import * as Sentry from "@sentry/angular";

import { AuthService } from "./auth.service";
import { NotificationService } from "./notification.service";

describe('AuthService', () => {
  let service: AuthService;
  let auth: jasmine.SpyObj<Auth>;
  let firestore: jasmine.SpyObj<Firestore>;
  let router: jasmine.SpyObj<Router>;
  let notification: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('Auth', ['authState', 'signInWithPopup', 'signOut']);
    const firestoreSpy = jasmine.createSpyObj('Firestore', ['collection']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const notificationSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Auth, useValue: authSpy },
        { provide: Firestore, useValue: firestoreSpy },
        { provide: Router, useValue: routerSpy },
        { provide: NotificationService, useValue: notificationSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(AuthService);
    auth = TestBed.inject(Auth) as jasmine.SpyObj<Auth>;
    firestore = TestBed.inject(Firestore) as jasmine.SpyObj<Firestore>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    notification = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should call signInWithPopup and display success notification on successful login', (done) => {
      const mockUserCredential = {
        user: {
          displayName: 'Test User',
          email: 'test@example.com',
          metadata: {
            lastSignInTime: 'someTime'
          }
        } as any
      };
      (auth as any).signInWithPopup.and.returnValue(Promise.resolve(mockUserCredential));

      service.login();

      setTimeout(() => {
        expect((auth as any).signInWithPopup).toHaveBeenCalled();
        expect(notification.success).toHaveBeenCalledWith('Login Successful', 'Welcome back, Test User');
        expect(service.userData.value).toEqual(mockUserCredential.user);
        done();
      }, 0);
    });

    it('should call signInWithPopup and display error notification on failed login', (done) => {
      const mockError = { message: 'Test Error' };
      (auth as any).signInWithPopup.and.returnValue(Promise.reject(mockError));

      service.login();

      setTimeout(() => {
        expect((auth as any).signInWithPopup).toHaveBeenCalled();
        expect(notification.error).toHaveBeenCalledWith('Login Error', mockError.message);
        done();
      }, 0);
    });
  });

  describe('logout', () => {
    it('should call signOut and display success notification on successful logout', (done) => {
      auth.signOut.and.returnValue(Promise.resolve());

      service.logout();

      setTimeout(() => {
        expect(auth.signOut).toHaveBeenCalled();
        expect(notification.success).toHaveBeenCalledWith('Logout Successful', 'Hope to see you again soon!');
        expect(service.userData.value).toBeNull();
        done();
      }, 0);
    });

    it('should call signOut and display error notification on failed logout', (done) => {
      const mockError = { message: 'Test Error' };
      auth.signOut.and.returnValue(Promise.reject(mockError));

      service.logout();

      setTimeout(() => {
        expect(auth.signOut).toHaveBeenCalled();
        expect(notification.error).toHaveBeenCalledWith('Logout Error', mockError.message);
        done();
      }, 0);
    });
  });

  describe('sentrySetUser', () => {
    it('should call Sentry.setUser with user data if user is provided', () => {
      const mockUser = {
        email: 'test@example.com',
        uid: 'testUid'
      } as User;

      service.sentrySetUser(mockUser);

      expect(Sentry.setUser).toHaveBeenCalledWith({
        email: mockUser.email ?? undefined,
        id: mockUser.uid,
        ip_address: '{{auto}}'
      });
    });

    it('should call Sentry.setUser with null if user is not provided', () => {
      service.sentrySetUser(null);
      expect(Sentry.setUser).toHaveBeenCalledWith(null);
    });
  });

  describe('getIdToken', () => {
    it('should return the id token if user is logged in', () => {
      const mockUser = {
        getIdToken: jasmine.createSpy('getIdToken').and.returnValue(Promise.resolve('testIdToken'))
      } as any as User;
      service.userData.next(mockUser);

      service.getIdToken()?.then(token => {
        expect(mockUser.getIdToken).toHaveBeenCalled();
        expect(token).toBe('testIdToken');
      });
    });

    it('should return undefined if user is not logged in', () => {
      service.userData.next(null);
      expect(service.getIdToken()).toBeUndefined();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true if user is logged in', () => {
      service.userData.next({} as User);
      expect(service.isLoggedIn()).toBe(true);
    });

    it('should return false if user is not logged in', () => {
      service.userData.next(null);
      expect(service.isLoggedIn()).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('should return true if user is an admin', () => {
      service.customClaims.next({ isAdmin: true });
      expect(service.isAdmin()).toBe(true);
    });

    it('should return false if user is not an admin', () => {
      service.customClaims.next({ isAdmin: false });
      expect(service.isAdmin()).toBe(false);
    });

    it('should return false if customClaims is undefined', () => {
      service.customClaims.next(undefined);
      expect(service.isAdmin()).toBe(false);
    });
  });
});
