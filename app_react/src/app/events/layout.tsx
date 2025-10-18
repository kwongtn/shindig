'use client';

import { redirect } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // If the pathname is exactly '/events', redirect to '/events/upcoming/1'
  if (pathname === '/events') {
    redirect('/events/upcoming/1');
  }

  return <>{children}</>;
}