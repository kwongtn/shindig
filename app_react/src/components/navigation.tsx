'use client';

import { auth } from '@/utils/firebase';
import { CalendarIcon, ListBulletIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';
import { mdiFaceManProfile } from '@mdi/js';
import Icon from '@mdi/react';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ThemeSelector from './theme-selector';

const Navigation = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error('Error during Google login:', error);
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
          className="btn btn-ghost btn-circle avatar"
          onClick={() => user ? handleLogout() : handleLogin()}
        >
          {user ? (
            <div className="w-10 rounded-full">
              <ProfileImage 
                src={user.photoURL} 
                alt={user.displayName || "User profile picture"} 
              />
            </div>
          ) : (
            <div className="w-10 rounded-full">
              <UserIcon className="text-gray-500" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
