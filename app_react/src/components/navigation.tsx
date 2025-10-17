'use client';

import { auth } from '@/utils/firebase';
import { CalendarIcon, ListBulletIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ThemeSelector from './theme-selector';

const Navigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      setIsLoginModalOpen(false);
    } catch (error) {
      console.error('Error during Google login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const menuItems = [
    {
      text: "Organizers",
      icon: <UserGroupIcon className="w-5 h-5" />,
      link: "/organizers"
    },
    {
      text: "Events",
      icon: <ListBulletIcon className="w-5 h-5" />,
      link: "/events"
    },
    {
      text: "Calendar",
      icon: <CalendarIcon className="w-5 h-5" />,
      link: "/calendar"
    }
  ];

  return (
    <header className="navbar glass p-4 sticky top-0 z-10">
      {/* Left Side - Logo and Navigation Links */}
      <div className="flex-1 flex items-center">
        <Link href="/" className="btn btn-ghost text-xl font-bold mr-4">
          Shindig
        </Link>
        <div className="hidden md:flex space-x-2">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.link}
              className="btn btn-ghost flex items-center gap-2"
            >
              {item.icon}
              <span>{item.text}</span>
            </Link>
          ))}
        </div>
        {/* Mobile menu for small screens */}
        <div className="dropdown dropdown-end md:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16"></path>
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link href={item.link} className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Side - Theme Selector and Login Button */}
      <div className="flex items-center space-x-4">
        <ThemeSelector />

        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
            onClick={() => setIsLoginModalOpen(true)}
          >
            {user ? (
              <div className="w-10 rounded-full">
                <Image
                  src={user.photoURL || "https://img.daisyui.com/images/profile/demo/yellingcat@192.webp"}
                  alt={user.displayName || "User profile"}
                  width={40}
                  height={40}
                />
              </div>
            ) : (
              <div className="w-10 rounded-full">
                <UserIcon className="w-8 h-8 text-gray-500" />
              </div>
            )}
          </div>

          {/* Login Modal */}
          {isLoginModalOpen && (
            <div className="modal modal-open">
              <div className="modal-box">
                <div className="modal-action">
                  {!user ? (
                    <div className="flex flex-col items-center w-full">
                      <h3 className="font-bold text-lg mb-4">Login to your account</h3>
                      <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="btn btn-primary w-full flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <>
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
                              <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.73 18.23 13.48 18.64 12 18.64C9.14 18.64 6.72 16.69 5.86 14.09H2.18V16.96C4 20.54 7.7 23 12 23Z" fill="#34A853" />
                              <path d="M5.86 14.09C5.63 13.39 5.49 12.7 5.49 12C5.49 11.3 5.63 10.61 5.85 9.91V7.04H2.18C1.43 8.55 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.96L5.86 14.09Z" fill="#FBBC05" />
                              <path d="M12 5.36C13.62 5.36 15.06 5.93 16.23 7.03L19.32 4.03C17.46 2.23 14.97 1 12 1C7.7 1 4 3.46 2.18 7.04L5.85 9.91C6.72 7.31 9.14 5.36 12 5.36Z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col w-full">
                      <div className="flex items-center gap-4 mb-4">
                        {user.photoURL ? (
                          <Image
                            src={user.photoURL}
                            alt={user.displayName || "User profile"}
                            width={64}
                            height={64}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                        )}
                        <div>
                          <h3 className="font-bold text-lg">{user.displayName || "User"}</h3>
                          <p className="text-sm opacity-70">{user.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <button
                          onClick={handleLogout}
                          className="btn btn-error w-full"
                        >
                          Logout
                        </button>
                        <button
                          onClick={() => setIsLoginModalOpen(false)}
                          className="btn btn-ghost w-full"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {!user && (
                  <div className="modal-action justify-center">
                    <button
                      onClick={() => setIsLoginModalOpen(false)}
                      className="btn btn-ghost"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
