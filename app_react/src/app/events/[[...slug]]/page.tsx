'use client';

import { ArchiveBoxIcon, CalendarDateRangeIcon, MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

const EventPage = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Check if we're at the base /events route (no slug provided), redirect to /events/upcoming/1
  React.useEffect(() => {
    if (pathname === '/events') {
      router.push('/events/upcoming/1');
    }
  }, [pathname, router]);

  // Extract slug from pathname (e.g. for /events/upcoming/1, slug would be 'upcoming')
  const pathParts = pathname?.split('/').filter(part => part) || [];
  let slug = 'upcoming'; // default

  if (pathParts.length >= 2) {
    slug = pathParts[1] || 'upcoming';
  }

  // Determine if we're on the past or upcoming events page
  const isActive = (path: string) => slug === path;

  // Don't render anything while redirecting
  if (pathname === '/events') {
    return null;
  }

  return (
    <div className="min-h-screen bg-base-200 p-4">
      {/* Search Box */}
      <div className="flex justify-center my-8">
        <div className="w-full max-w-2xl">
          <div className="flex items-center rounded-lg border border-base-300 bg-base-100 p-2">
            <MagnifyingGlassIcon className="h-5 w-5 ml-2 text-base-content/50" />
            <input
              type="text"
              placeholder="Search events..."
              className="w-full bg-transparent border-none focus:outline-none px-3 py-2"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-nowrap justify-between items-center mb-8 gap-4 px-4 overflow-x-auto">
        {/* Past/Upcoming Menu */}
        <div className="flex flex-row flex-shrink-0">
          <ul className="menu menu-horizontal bg-base-100 rounded-box p-2">
            <li>
              <Link
                href="/events/past/1"
                className={`flex items-center ${isActive('past') ? 'active bg-primary text-primary-content' : 'hover:bg-base-200'}`}
              >
                <ArchiveBoxIcon className="h-5 w-10 sm:w-5 sm:mr-2" />
                <span className="hidden sm:inline">Past Events</span>
              </Link>
            </li>
            <li>
              <Link
                href="/events/upcoming/1"
                className={`flex items-center ${isActive('upcoming') ? 'active bg-primary text-primary-content' : 'hover:bg-base-200'}`}
              >
                <CalendarDateRangeIcon className="h-5 w-10 sm:w-5 sm:mr-2" />
                <span className="hidden sm:inline">Upcoming Events</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Add Event Button */}
        <div className="flex-shrink-0">
          <button className="btn btn-primary flex items-center justify-center gap-2">
            <PlusIcon className="h-5 w-10 sm:w-5" />
            <span className="hidden sm:inline">Add Event</span>
          </button>
        </div>
      </div>

      {/* Event Cards Grid - Full width with padding */}
      <div className="px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 50 }).map((_, index) => (
            <div key={index} className="card bg-base-100 shadow-xl">
              <figure>
                <img
                  src="https://i.imgur.com/o7fH8jn.png"
                  alt={`Event ${index + 1}`}
                  className="w-full h-40 object-cover"
                  width={400}
                  height={160}
                />
              </figure>
              <div className="card-body">
                <h2 className="card-title">Event #{index + 1}</h2>
                <p>Placeholder event description</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary btn-sm">Details</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventPage;
