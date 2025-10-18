'use client';

import { auth } from '@/utils/firebase';
import { CalendarIcon, ListBulletIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import { mdiFaceManProfile } from '@mdi/js';
import Icon from '@mdi/react';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, User } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ThemeSelector from './theme-selector';
import * as Sentry from '@sentry/nextjs';
import { showToast } from '@/utils/toast';

const Navigation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Set Sentry user
      Sentry.setUser({
        email: user.email ?? undefined,
        id: user.uid,
        ip_address: '{{auto}}',
      });
      
      // Determine if new user based on metadata
      const isNewUser = !user.metadata.lastSignInTime || user.metadata.creationTime === user.metadata.lastSignInTime;
      const userString = user.displayName || user.email || 'User';
      
      if (isNewUser) {
        showToast(`Welcome, ${userString}`, 'success');
      } else {
        showToast(`Welcome back, ${userString}`, 'success');
      }
      
      setUser(user);
    } catch (error: any) {
      console.error('Error during Google login:', error);
      
      if (error.code === 'auth/popup-blocked') {
        // Handle popup blocked error by using redirect
        try {
          await signInWithRedirect(auth, new GoogleAuthProvider());
        } catch (redirectError: any) {
          console.error('Redirect error:', redirectError);
          showToast(`Error: ${redirectError.message || redirectError.code}`, 'error');
        }
      } else if (error.code === 'auth/user-disabled') {
        showToast('Your account has been banned by an administrator. If you think this is an error, please contact us at \'tungnan5636@gmail.com\'.', 'error');
      } else {
        showToast(`Error: ${error.code || error.message}`, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      
      // Unset Sentry user
      Sentry.setUser(null);
      
      showToast('Logout Successful, hope to see you again soon!', 'success');
    } catch (error: any) {
      console.error('Error during logout:', error);
      showToast(`Error: ${error.code || error.message}`, 'error');
    } finally {
      setIsLoading(false);
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

  // Profile image component with fallback
  const ProfileImage = ({ src, alt }: { src: string | null; alt: string }) => {
    const [imgError, setImgError] = useState(false);

    if (!src || imgError) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-base-200 rounded-full">
          <Icon path={mdiFaceManProfile} className="w-6 h-6 text-base-content" />
        </div>
      );
    }

    return (
      <Image
        src={src}
        alt={alt}
        width={40}
        height={40}
        onError={() => setImgError(true)}
      />
    );
  };

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

        <div
          role="button"
          className={`tooltip tooltip-left btn btn-ghost btn-circle avatar ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          data-tip={user ? "Click to logout" : "Click to login"}
          onClick={() => {
            if (isLoading) return;
            user ? handleLogout() : handleLogin();
          }}
        >
          {isLoading ? (
            <div className="w-10 rounded-full flex items-center justify-center">
              <span className="loading loading-spinner loading-md"></span>
            </div>
          ) : user ? (
            <div className="w-10 rounded-full">
              <ProfileImage 
                src={user.photoURL} 
                alt={user.displayName || "User profile picture"} 
              />
            </div>
          ) : (
            <div className="w-10 rounded-full flex items-center justify-center">
              <UserIcon className="text-gray-500 w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
